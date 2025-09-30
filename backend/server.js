require("dotenv").config(); // Charger les variables d'environnement
const fs = require("fs");
const path = require("path");
const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const { body, validationResult } = require("express-validator");
const app = express();
const PORT = process.env.PORT || 5000;
const crypto = require("crypto");
const fetch = require("node-fetch");
const formMailRouter = require("./routes/formMail");
const http = require("http");
const { Server } = require("socket.io");
const axios = require("axios"); // Ajout de axios pour les fonctionnalités du proxy
const db = require("./db"); // Ajout du module db manquant

// Middleware pour gérer CORS et le JSON
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://daringbrusselsacademy.be"
        : "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.static(path.join(__dirname, "../public")));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 10 : 1000, // Beaucoup plus en dev
  message: { message: "Trop de tentatives, veuillez réessayer plus tard." },
});

app.use("/api/login", loginLimiter);

const settingsRouter = require("./routes/settings");
app.use("/api/settings", settingsRouter);

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // rwdmacademy-be01b.mail.protection.outlook.com
  port: +process.env.EMAIL_PORT, // 587 pour STARTTLS
  secure: false, // ne pas forcer la TLS dès la connexion
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  requireTLS: true, // réclamer le STARTTLS
  tls: {
    rejectUnauthorized: false, // accepte les certificats auto-signés si besoin
  },
});

const dbPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Clé secrète pour signer les tokens JWT à partir du .env
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token manquant" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide" });
  }
};

const ownerOrSuperAdmin = (req, res, next) => {
  const role = String(req.user.role).trim().toLowerCase();
  if (role !== "superadmin" && role !== "owner") {
    return res
      .status(403)
      .json({ message: "Accès réservé aux owners et superadmins" });
  }
  next();
};

// Configuration de la BDD MySQL à partir des variables d'environnement
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER, // Exemple : "root"
  password: process.env.DB_PASSWORD, // Exemple : "MonSuperMotDePasse"
  database: process.env.DB_NAME,
};

// Définir le chemin d'uploads en fonction de l'environnement

// Définition du dossier d'uploads
const uploadsDir = path.join(
  __dirname,
  process.env.NODE_ENV === "production" ? "../uploads" : "uploads"
);
console.log("📁 Dossier uploads configuré:", uploadsDir);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// CORRECTION: Assurez-vous que le middleware static est correctement configuré
app.use("/uploads", (req, res, next) => {
  console.log(`📂 Accès au fichier: ${req.url}`);
  express.static(uploadsDir)(req, res, (err) => {
    if (err) {
      console.error(`❌ Erreur d'accès au fichier: ${req.url}`, err);
      return res.status(404).send("Fichier non trouvé");
    }
    next();
  });
});

// AJOUTEZ cette ligne pour déboguer les requêtes d'images
app.use((req, res, next) => {
  if (req.url.startsWith("/uploads")) {
    console.log(`📄 Fichier demandé: ${req.url}`);
  }
  next();
});

// Mettre à jour multer pour utiliser ce dossier
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// ---------------------
// Endpoint de connexion
// ---------------------
app.post(
  "/api/login",
  [
    body("email").isEmail().withMessage("Email invalide"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Mot de passe trop court"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("❌ Erreur de validation:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const [rows] = await dbPool.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (rows.length === 0) {
        console.log("❌ Utilisateur introuvable:", email);
        return res.status(400).json({ message: "Utilisateur introuvable" });
      }

      const user = rows[0];

      if (!user.password) {
        console.log("❌ Erreur : le champ 'password' est NULL !");
        return res
          .status(500)
          .json({ message: "Email ou mot de passe incorrect" });
      }

      if (user.deleted && user.deleted == 1) {
        console.log("❌ Compte inactif pour l'utilisateur :", email);
        return res.status(403).json({ message: "Votre compte est inactif." });
      }

      const isValid = user
        ? await bcrypt.compare(password, user.password)
        : false;
      if (!isValid) {
        console.log("❌ Mot de passe incorrect");
        return res.status(400).json({ message: "Mot de passe incorrect" });
      }

      console.log("🔑 Génération du token JWT");
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "365d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // secure en prod, false en dev
        sameSite: "Strict",
      });

      res.json({ message: "Authentification réussie", token });
    } catch (error) {
      console.error("❌ Erreur serveur :", error);
      res.status(500).json({
        message: "Une erreur est survenue, veuillez réessayer plus tard.",
      });
    }
  }
);

// 🛡️ Endpoint pour créer un admin (réservé aux superadmins)
app.post(
  "/api/admins",
  authMiddleware,
  ownerOrSuperAdmin,
  [
    body("firstName").notEmpty(),
    body("lastName").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      firstName,
      lastName,
      email,
      password,
      function: functionTitle,
      profilePicture,
      role,
    } = req.body;

    try {
      const [existing] = await dbPool.execute(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );
      if (existing.length > 0) {
        return res.status(400).json({ message: "Cet email est déjà utilisé." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Insertion
      const [insertResult] = await dbPool.execute(
        `INSERT INTO users (
          firstName, lastName, email, password, role, \`function\`, profilePicture
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          firstName,
          lastName,
          email,
          hashedPassword,
          role || "admin",
          functionTitle || "",
          profilePicture || "",
        ]
      );

      const insertedId = insertResult.insertId;

      // Récupération de l'utilisateur créé
      const [newUserRows] = await dbPool.execute(
        "SELECT id, firstName, lastName, email, role, `function` AS function, profilePicture, createdAt FROM users WHERE id = ?",
        [insertedId]
      );

      res.status(201).json(newUserRows[0]);
    } catch (error) {
      console.error("❌ Erreur lors de la création de l'admin :", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

// Endpoint pour récupérer tous les membres admins
app.get("/api/admins", authMiddleware, async (req, res) => {
  try {
    const [rows] = await dbPool.execute(
      "SELECT * FROM users WHERE deleted IS NULL OR deleted <> 1"
    );
    res.json(rows); // Retourne tous les membres sauf ceux soft deleted
  } catch (error) {
    console.error("Erreur lors de la récupération des membres :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Endpoint pour supprimer un membre admin
app.delete(
  "/api/admins/:email",
  authMiddleware,
  ownerOrSuperAdmin,
  async (req, res) => {
    const { email } = req.params;
    try {
      const connection = await mysql.createConnection(dbConfig);
      // Soft delete : mettre à jour la colonne "deleted" à 1 ou stocker la date de suppression dans "deletedAt"
      const [result] = await connection.execute(
        "UPDATE users SET deleted = 1, deletedAt = NOW() WHERE email = ?",
        [email]
      );
      await connection.end();
      if (result.affectedRows > 0) {
        res.json({ message: "Membre supprimé (soft delete) avec succès" });
      } else {
        res.status(404).json({ message: "Membre non trouvé" });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du membre :", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);
app.patch("/api/change-password", authMiddleware, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ message: "Nouveau mot de passe requis." });
    }
    const userId = req.user.id;
    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await dbPool.execute("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);
    res.json({ message: "Mot de passe mis à jour" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du mot de passe :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
app.patch(
  "/api/admins/restore/:id",
  authMiddleware,
  ownerOrSuperAdmin,
  async (req, res) => {
    const { id } = req.params;
    try {
      const connection = await mysql.createConnection(dbConfig);
      const [result] = await connection.execute(
        "UPDATE users SET deleted = NULL, deletedAt = NULL WHERE id = ?",
        [id]
      );
      await connection.end();
      if (result.affectedRows > 0) {
        res.json({ message: "Compte réactivé avec succès" });
      } else {
        res.status(404).json({ message: "Compte non trouvé" });
      }
    } catch (error) {
      console.error("Erreur lors de la réactivation du compte :", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

// Endpoint pour récupérer les membres de l'équipe (à partir de la table "users")
app.get("/api/team-members", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute("SELECT * FROM users");
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des membres d'équipe :",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.put(
  "/api/admins/:id",
  authMiddleware,
  ownerOrSuperAdmin,
  async (req, res) => {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      password, // optionnel
      functionTitle,
      profilePicture,
      role,
      status, // on peut recevoir un statut à mettre à jour
    } = req.body;

    // Vérification des champs obligatoires...
    try {
      const connection = await mysql.createConnection(dbConfig);
      let query = "";
      let params = [];
      // Si un statut est fourni et qu'il vaut "rejected", on met rejected_at à NOW()
      const updateRejectedAt =
        status && status.toLowerCase() === "rejected"
          ? ", rejected_at = NOW()"
          : "";

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        query =
          "UPDATE users SET firstName = ?, lastName = ?, email = ?, password = ?, role = ?, `function` = ?, profilePicture = ?" +
          (status ? ", status = ?" : "") +
          updateRejectedAt +
          " WHERE id = ?";
        params = [
          firstName,
          lastName,
          email,
          hashedPassword,
          role,
          functionTitle || "",
          profilePicture || "",
        ];
        if (status) {
          params.push(status);
        }
        params.push(id);
      } else {
        query =
          "UPDATE users SET firstName = ?, lastName = ?, email = ?, role = ?, `function` = ?, profilePicture = ?" +
          (status ? ", status = ?" : "") +
          updateRejectedAt +
          " WHERE id = ?";
        params = [
          firstName,
          lastName,
          email,
          role,
          functionTitle || "",
          profilePicture || "",
        ];
        if (status) {
          params.push(status);
        }
        params.push(id);
      }
      const [result] = await connection.execute(query, params);
      await connection.end();
      if (result.affectedRows > 0) {
        res.json({ message: "Membre mis à jour avec succès" });
      } else {
        res.status(404).json({ message: "Membre non trouvé" });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du membre :", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

app.get("/api/admins", authMiddleware, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    // Retourne tous les admins, même les soft deleted, pour pouvoir afficher leurs noms
    const [rows] = await connection.execute(
      "SELECT id, firstName, lastName, email, profilePicture, `function` as functionTitle, role FROM users"
    );
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des admins :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.get("/api/all-admins", authMiddleware, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT id, firstName, lastName, email, profilePicture, `function` as functionTitle, role, deleted FROM users"
    );
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error("Erreur lors de la récupération de tous les admins :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Ajoute cette route dans ton backend (par exemple, à la fin de ton fichier)
app.get("/api/me", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await dbPool.execute(
      `SELECT 
          id, firstName, lastName, email, password, role, \`function\`, profilePicture, createdAt, reset_token, reset_expires, deleted, deletedAt,
          (SELECT COUNT(*) FROM requests WHERE assigned_to = users.id) AS assignmentsCount
       FROM users 
       WHERE id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Endpoint POST /api/requests
// Pour POST : pas besoin d'authentification
app.post("/api/requests", async (req, res) => {
  const { type, formData, assignedTo } = req.body;

  console.log("📥 Données reçues dans /api/requests :", req.body);

  if (!type || !formData) {
    console.error("❌ Données incomplètes !");
    return res.status(400).json({ error: "Données incomplètes." });
  }

  if (type === "healing-certificate") {
    const code = formData.codeDossier;

    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      `SELECT id FROM requests WHERE JSON_EXTRACT(data, '$.codeDossier') = ? AND type = 'accident-report'`,
      [code]
    );
    await connection.end();

    if (rows.length === 0) {
      return res.status(400).json({
        error:
          "Aucune déclaration d'accident correspondante trouvée pour ce code.",
      });
    }
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const query =
      "INSERT INTO requests (type, data, status, assigned_to) VALUES (?, ?, 'Nouveau', ?)";
    const [result] = await connection.execute(query, [
      type,
      JSON.stringify(formData),
      assignedTo || null,
    ]);

    // Émettre l'événement après insertion réussie
    io.emit("newRequest", {
      id: result.insertId,
      type,
      name: formData.playerLastName
        ? `${formData.playerLastName} ${formData.playerFirstName}`
        : "Inconnu",
      email: formData.email || "Non spécifié",
      date: new Date(),
      status: "new",
      details: formData,
    });

    res.status(201).json({
      message: "Demande enregistrée avec succès",
      requestId: result.insertId,
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'insertion :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get("/api/requests", authMiddleware, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const query = `
    SELECT r.id, r.type, r.data, r.status, r.created_at, r.updated_at,
           r.rejected_at, r.sent_at,
           u.id AS admin_id, u.firstName AS admin_firstName, u.lastName AS admin_lastName, u.email AS admin_email
    FROM requests r
    LEFT JOIN users u ON r.assigned_to = u.id
    ORDER BY r.created_at DESC
  `;

    const [rows] = await connection.execute(query);
    await connection.end();

    res.json(rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.delete("/api/admins/permanent/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await mysql.createConnection(dbConfig);
    // Supprime définitivement l'utilisateur de la table "users"
    const [result] = await connection.execute(
      "DELETE FROM users WHERE id = ?",
      [id]
    );
    await connection.end();

    if (result.affectedRows > 0) {
      res.json({ message: "Membre supprimé définitivement" });
    } else {
      res.status(404).json({ message: "Membre non trouvé" });
    }
  } catch (error) {
    console.error(
      "Erreur lors de la suppression définitive du membre :",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.patch("/api/requests/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { details, status, assignedTo } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);

    const columnsToUpdate = [];
    const values = [];

    if (details) {
      columnsToUpdate.push("data = ?");
      values.push(JSON.stringify(details));
    }

    if (status !== undefined) {
      columnsToUpdate.push("status = ?");
      values.push(status);
      // Ajout de rejected_at = NOW() si le nouveau statut est "Rejeté"
      if (String(status).toLowerCase() === "rejeté") {
        columnsToUpdate.push("rejected_at = NOW()");
      }
    }

    if (assignedTo !== undefined) {
      columnsToUpdate.push("assigned_to = ?");
      values.push(assignedTo === "none" ? null : assignedTo);
    }

    columnsToUpdate.push("updated_at = CURRENT_TIMESTAMP");
    const sql = `
      UPDATE requests
      SET ${columnsToUpdate.join(", ")}
      WHERE id = ?
    `;
    values.push(id);

    const [result] = await connection.execute(sql, values);
    await connection.end();

    if (result.affectedRows > 0) {
      res.json({ message: "Demande mise à jour avec succès" });
    } else {
      res.status(404).json({ error: "Demande non trouvée" });
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la demande :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Route DELETE pour supprimer une demande (request)
app.delete("/api/requests/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      "DELETE FROM requests WHERE id = ?",
      [id]
    );
    await connection.end();

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Demande supprimée avec succès." });
    } else {
      res.status(404).json({ message: "Demande non trouvée." });
    }
  } catch (error) {
    console.error("❌ Erreur lors de la suppression de la demande :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

app.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { details } = req.body;

  if (!details || typeof details !== "object") {
    return res.status(400).json({ error: "Détails invalides" });
  }

  try {
    // On stringify le JSON et on met à jour la colonne `data`
    await db.execute(
      "UPDATE requests SET data = ?, updated_at = NOW() WHERE id = ?",
      [JSON.stringify(details), id]
    );

    res.json({ message: "Mise à jour réussie" });
  } catch (err) {
    console.error("Erreur update request:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get("/api/deleted-admins", authMiddleware, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      `SELECT u.id, u.firstName, u.lastName, u.email, u.role, u.deletedAt,
              (SELECT COUNT(*) FROM requests r WHERE r.assigned_to = u.id) AS assignmentsCount
       FROM users u
       WHERE u.deleted = 1`
    );
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des anciens membres :",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route publique pour vérifier un code d'accident
app.get("/api/check-accident-code", async (req, res) => {
  const { code, email } = req.query;

  try {
    const [rows] = await dbPool.execute(
      `SELECT * FROM requests 
       WHERE JSON_EXTRACT(data, '$.codeDossier') = ? 
       AND JSON_EXTRACT(data, '$.email') = ?
       AND JSON_EXTRACT(data, '$.documentLabel') = ?`,
      [code, email, "Déclaration d'accident"]
    );

    res.json({ valid: rows.length > 0 });
  } catch (error) {
    console.error("❌ Erreur vérification code:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Vérifie si un code de dossier existe (utile avant d'envoyer un certificat de guérison)
app.get("/api/check-code/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      `SELECT id FROM requests WHERE JSON_EXTRACT(data, '$.codeDossier') = ? AND type = 'accident-report'`,
      [code]
    );

    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({ valid: false, message: "Code inexistant" });
    }

    res.json({ valid: true, message: "Code reconnu" });
  } catch (error) {
    console.error("Erreur lors de la vérification du code dossier :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.post("/api/upload", upload.array("pdfFiles", 2), (req, res) => {
  if (!req.files || req.files.length === 0) {
    console.error("❌ Aucun fichier reçu !");
    return res.status(400).json({ error: "Aucun fichier téléchargé" });
  }

  console.log("✅ Fichiers reçus :", req.files);

  const filePaths = req.files.map((file) => `/uploads/${file.filename}`);

  res.json({ filePaths }); // On renvoie un tableau des chemins
});

// Endpoint pour ajouter un rendez-vous
app.post("/api/appointments", async (req, res) => {
  try {
    const { date, time, type, personName, email, adminId, notes } = req.body;

    // Vérification des données
    if (!date || !time || !type || !personName || !email || !adminId) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // Connexion à la base de données
    const connection = await mysql.createConnection(dbConfig);

    const sql = `
        INSERT INTO appointments (date, time, type, person_name, email, admin_id, notes) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

    await connection.execute(sql, [
      date,
      time,
      type,
      personName,
      email,
      adminId,
      notes,
    ]);

    await connection.end();

    res.status(201).json({ message: "✅ Rendez-vous ajouté avec succès !" });
  } catch (error) {
    console.error("❌ Erreur serveur :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de l'ajout du rendez-vous" });
  }
});

app.get("/api/appointments", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
        SELECT 
          a.id, a.date, a.time, a.type, a.person_name AS personName, 
          a.email, a.notes, u.firstName AS adminFirstName, u.lastName AS adminLastName
        FROM appointments a
        LEFT JOIN users u ON a.admin_id = u.id
        ORDER BY a.date ASC, a.time ASC
      `);
    await connection.end();

    res.json(rows);
  } catch (error) {
    console.error(
      "Erreur serveur lors de la récupération des rendez-vous :",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.delete("/api/appointments/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await mysql.createConnection(dbConfig);
    // Vérifier si le rendez-vous existe
    const [appointment] = await connection.execute(
      "SELECT * FROM appointments WHERE id = ?",
      [id]
    );

    if (!appointment || appointment.length === 0) {
      return res.status(404).json({ error: "Rendez-vous non trouvé" });
    }

    // Suppression
    await connection.execute("DELETE FROM appointments WHERE id = ?", [id]);

    res.status(200).json({ message: "Rendez-vous supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post("/appointments", async (req, res) => {
  try {
    const { date, time, type, personName, email, adminId, notes } = req.body;

    // Vérifie que tous les champs obligatoires sont remplis
    if (!date || !time || !type || !personName || !email || !adminId) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // Insertion en base de données
    const sql = `
        INSERT INTO appointments (date, time, type, person_name, email, admin_id, notes) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
    await db.query(sql, [date, time, type, personName, email, adminId, notes]);

    res.status(201).json({ message: "Rendez-vous ajouté avec succès" });
  } catch (error) {
    console.error("Erreur serveur :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de l'ajout du rendez-vous" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password, captcha } = req.body;

  if (!captcha) {
    return res.status(400).json({ message: "Captcha manquant." });
  }

  // Valider le token reCAPTCHA avec Google
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  try {
    const response = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${secretKey}&response=${captcha}`,
    });

    const data = await response.json();

    if (!data.success) {
      return res
        .status(403)
        .json({ message: "Échec de vérification du captcha." });
    }
  } catch (error) {
    console.error("Erreur de vérification CAPTCHA :", error);
    return res.status(500).json({ message: "Erreur serveur captcha." });
  }
});

app.get("/api/storage-settings", async (req, res) => {
  try {
    const connection = await dbPool.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM storage_settings LIMIT 1"
    );
    connection.release();

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res
        .status(404)
        .json({ message: "Aucune configuration de stockage trouvée" });
    }
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des paramètres de stockage:",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Endpoint pour mettre à jour les paramètres de stockage
app.put("/api/storage-settings", async (req, res) => {
  const { total_capacity, provider_name } = req.body;

  if (!total_capacity || !provider_name) {
    return res
      .status(400)
      .json({ message: "Capacité totale et nom de l'hébergeur requis" });
  }

  try {
    const connection = await dbPool.getConnection();
    const [result] = await connection.query(
      "UPDATE storage_settings SET total_capacity = ?, provider_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1",
      [total_capacity, provider_name]
    );
    connection.release();

    if (result.affectedRows > 0) {
      res.json({ message: "Paramètres de stockage mis à jour avec succès" });
    } else {
      res
        .status(404)
        .json({ message: "Aucune configuration de stockage trouvée" });
    }
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour des paramètres de stockage:",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.get("/api/database-stats", async (req, res) => {
  try {
    const connection = await dbPool.getConnection();

    // Récupérer le nombre de demandes terminées
    const [completedRequests] = await connection.query(
      "SELECT COUNT(*) as count FROM requests WHERE status = 'Terminé'"
    );

    // Récupérer le nombre de demandes non terminées
    const [pendingRequests] = await connection.query(
      "SELECT COUNT(*) as count FROM requests WHERE status != 'Terminé' OR status IS NULL"
    );

    // Récupérer le nombre de rendez-vous
    const [appointments] = await connection.query(
      "SELECT COUNT(*) as count FROM appointments"
    );

    connection.release();

    // Estimation de la taille (en Mo) basée sur le nombre d'entrées
    const completedSize = completedRequests[0].count * 0.05; // 50 Ko par demande terminée
    const pendingSize = pendingRequests[0].count * 0.05; // 50 Ko par demande en cours
    const appointmentsSize = appointments[0].count * 0.02; // 20 Ko par rendez-vous

    // Calculer la somme totale utilisée
    const totalUsedSize = completedSize + pendingSize + appointmentsSize;

    res.json({
      completed: {
        count: completedRequests[0].count,
        sizeInMo: completedSize,
      },
      pending: {
        count: pendingRequests[0].count,
        sizeInMo: pendingSize,
      },
      appointments: {
        count: appointments[0].count,
        sizeInMo: appointmentsSize,
      },
      total: {
        count:
          completedRequests[0].count +
          pendingRequests[0].count +
          appointments[0].count,
        sizeInMo: totalUsedSize,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des statistiques de la base de données:",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.post("/api/forget-password", async (req, res) => {
  const { email } = req.body;

  console.log("📥 Requête reçue pour forget-password avec email:", email); // ✅ Vérification
  try {
    const [users] = await dbPool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    console.log("🔍 Utilisateur trouvé:", users); // ✅ Vérifier si l'utilisateur est trouvé

    if (users.length === 0) {
      return res.status(400).json({ message: "Utilisateur introuvable" });
    }

    const user = users[0];

    // Générer un token de reset sécurisé (valide 1h)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiration = new Date(Date.now() + 3600000); // 1 heure

    console.log("🔑 Token généré:", resetToken); // ✅ Vérifier si le token est bien généré

    // Stocker le token dans la base de données
    await dbPool.execute(
      "UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?",
      [resetToken, expiration, email]
    );

    console.log("✅ Token stocké dans la BDD"); // ✅ Vérifier si le token est bien stocké

    // Construire le lien de réinitialisation
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log("📨 Lien de réinitialisation:", resetLink); // ✅ Vérifier si le lien est bien généré

    // Envoyer l'email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <p>Bonjour ${user.firstName},</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous :</p>
        <a href="${resetLink}" target="_blank">
          Réinitialiser mon mot de passe
        </a>
        <p>Ce lien expirera dans 1 heure.</p>
      `,
    });

    console.log("📧 Email envoyé avec succès"); // ✅ Vérifier si l'email est bien envoyé

    res.json({ message: "Email de réinitialisation envoyé." });
  } catch (error) {
    console.error("❌ Erreur serveur:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

app.post("/api/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const [users] = await dbPool.execute(
      "SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()",
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Token invalide ou expiré." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await dbPool.execute(
      "UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?",
      [hashedPassword, users[0].id]
    );

    res.json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

const emailRecipientsRoutes = require("./routes/emailRecipients");
app.use("/api/email-recipients", emailRecipientsRoutes);

app.use("/api/form-mail", formMailRouter);
app.use("/send-request", formMailRouter);

const changeDataRoutes = require("./changeData");
app.use("/api", changeDataRoutes);

// =========================================================
// INTÉGRATION DES FONCTIONNALITÉS DU SERVEUR PROXY
// =========================================================

// Fonction pour récupérer les paramètres API de la base de données
async function getApiSettings() {
  try {
    const [rows] = await dbPool.execute(
      "SELECT * FROM api_settings ORDER BY id DESC LIMIT 1"
    );
    if (rows.length === 0) {
      throw new Error("Paramètres API non trouvés");
    }
    return rows[0];
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres API:", error);

    // Utiliser les valeurs hardcodées en fallback
    return {
      base_url: "https://clubapi.prosoccerdata.com",
      club_key: "ewlcdd1fdhooj8pm8qyzj98kvrrxh6hn",
      api_key: "3UMU0HpTYjafC8lITNAt1812UJdx67Nq30pjbCtQ",
      api_secret:
        "bearer gngz3n0kvrchsqx1r7is3yjg2d1m0uuhqroagwcxhze6vhk7ddffelrevzgjjufq",
    };
  }
}

async function fetchAllInvoices(baseUrl, clubKey, apiKey, apiSecret, teamIds) {
  let allInvoices = [];
  let currentPage = 1;
  let totalPages = 1;

  do {
    const response = await axios.get(
      `${baseUrl}/finances/overview/memberduesinvoices`,
      {
        headers: {
          "x-api-club": clubKey,
          "x-api-key": apiKey,
          Authorization: apiSecret,
          "Content-Type": "application/json",
        },
        params: {
          statuses: ["not_sent", "paid", "open", "too_late", "credited"],
          teamIds: teamIds, // ou commentez cette ligne pour tester sans filtrage sur teamIds
          page: currentPage,
          size: 100,
        },
      }
    );

    const data = response.data;
    let invoices = [];

    // Extraction des factures selon le format de la réponse
    if (data.content && Array.isArray(data.content)) {
      invoices = data.content;
    } else if (data.items && Array.isArray(data.items)) {
      invoices = data.items;
    } else if (Array.isArray(data)) {
      invoices = data;
    } else {
      invoices = [data];
    }

    allInvoices = allInvoices.concat(invoices);

    // Détermination du nombre total de pages
    if (data.totalPages) {
      totalPages = data.totalPages;
    } else if (data.pageable && typeof data.pageable.pageNumber === "number") {
      totalPages = data.pageable.pageNumber + 1; // Si pageNumber est 0-indexé
    } else {
      totalPages = currentPage; // Arrêter après la première page si non précisé
    }
    currentPage++;
  } while (currentPage <= totalPages);

  return allInvoices;
}

// Endpoint pour renvoyer directement le tableau complet de factures
app.get("/api/members-dues", async (req, res) => {
  try {
    // Récupérer les paramètres API
    const settings = await getApiSettings();

    // Récupérer toutes les équipes
    const teamsResponse = await axios.get(`${settings.base_url}/teams/all`, {
      headers: {
        "Accept-Language": "fr-FR",
        "x-api-club": settings.club_key,
        "x-api-key": settings.api_key,
        Authorization: settings.api_secret,
        "Content-Type": "application/json",
      },
    });

    // Extraction des équipes
    const teamsData = teamsResponse.data.items || teamsResponse.data;
    const teamIds = Array.isArray(teamsData)
      ? teamsData.map((team) => team.id)
      : [];

    // Récupérer toutes les factures en parcourant toutes les pages
    const allInvoices = await fetchAllInvoices(
      settings.base_url,
      settings.club_key,
      settings.api_key,
      settings.api_secret,
      teamIds
    );

    // Renvoi uniquement du tableau d'invoices (sans infos de pagination)
    res.json(allInvoices);
  } catch (error) {
    console.error("Erreur lors de l'appel API:", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération des données" });
  }
});

// Endpoint pour le comptage des joueurs par équipe
app.get("/api/teams/player-counts", async (req, res) => {
  try {
    // Récupérer les paramètres API
    const settings = await getApiSettings();

    // Récupérer toutes les équipes
    const teamsRes = await axios.get(`${settings.base_url}/teams/all`, {
      headers: {
        "Accept-Language": "fr-FR",
        "x-api-club": settings.club_key,
        "x-api-key": settings.api_key,
        Authorization: settings.api_secret,
        "Content-Type": "application/json",
      },
    });

    const teams = teamsRes.data.items || teamsRes.data;

    // Pour chaque équipe, récupérer les membres
    const results = await Promise.all(
      teams.map(async (team) => {
        try {
          const membersRes = await axios.get(
            `${settings.base_url}/teams/${team.id}/members`,
            {
              headers: {
                "x-api-club": settings.club_key,
                "x-api-key": settings.api_key,
                Authorization: settings.api_secret,
                "Content-Type": "application/json",
              },
            }
          );

          const members = membersRes.data.content || membersRes.data || [];
          const playerCount = members.filter((m) => m.player === true).length;

          return {
            teamId: team.id,
            teamName: team.name,
            playerCount,
          };
        } catch (err) {
          console.warn(`❌ Erreur pour l'équipe ID ${team.id}:`, err.message);
          return {
            teamId: team.id,
            teamName: team.name,
            playerCount: 0,
          };
        }
      })
    );

    res.json(results);
  } catch (error) {
    console.error("Erreur récupération des équipes/membres :", error);
    res.status(500).json({
      message: "Erreur serveur lors du comptage des joueurs par équipe",
    });
  }
});

// Endpoint pour récupérer les membres d'une équipe
app.get("/api/teams/:id/members", async (req, res) => {
  const teamId = req.params.id;
  try {
    // Récupérer les paramètres API
    const settings = await getApiSettings();

    const membersRes = await axios.get(
      `${settings.base_url}/teams/${teamId}/members`,
      {
        headers: {
          "x-api-club": settings.club_key,
          "x-api-key": settings.api_key,
          Authorization: settings.api_secret,
          "Content-Type": "application/json",
        },
      }
    );

    // La data peut être dans .content ou pas
    const members = Array.isArray(membersRes.data.content)
      ? membersRes.data.content
      : Array.isArray(membersRes.data)
      ? membersRes.data
      : [];

    res.json(members);
  } catch (err) {
    console.error(`Erreur membres équipe ${teamId}:`, err);
    res.status(500).json({ message: "Impossible de récupérer les membres" });
  }
});

// Endpoint pour récupérer toutes les équipes
app.get("/api/teams/all", async (req, res) => {
  try {
    // Récupérer les paramètres API
    const settings = await getApiSettings();

    const response = await axios.get(`${settings.base_url}/teams/all`, {
      headers: {
        "Accept-Language": "fr-FR",
        "x-api-club": settings.club_key,
        "x-api-key": settings.api_key,
        Authorization: settings.api_secret,
        "Content-Type": "application/json",
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Erreur lors de l'appel API (teams/all):", error);
    res
      .status(error.response?.status || 500)
      .json({ message: "Erreur serveur lors de la récupération des équipes" });
  }
});

// Ajouter le router des paramètres API
const apiSettingsRouter = require("./routes/apiSettings");
app.use("/api/api-settings", apiSettingsRouter);

// Créer le serveur HTTP et Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? "https://daringbrusselsacademy.be"
        : "https://daringbrusselsacademy.be/node/",
    methods: ["GET", "POST"],
  },
});

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(
    `🚀 Serveur unifié en cours d'exécution sur https://daringbrusselsacademy.be/node${PORT}`
  );
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erreur serveur interne" });
});

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Route d'accueil
app.get("/", (req, res) => {
  res.json({
    message: "Daring Brussels Academy API",
    status: "online",
    version: "1.0",
  });
});

// Ajouter cette route pour tester directement l'accès aux fichiers
app.get("/api/test-file", (req, res) => {
  const filePath = req.query.path;
  if (!filePath) {
    return res.status(400).send("Path parameter required");
  }

  const fullPath = path.join(uploadsDir, filePath.replace("/uploads/", ""));

  fs.access(fullPath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({
        exists: false,
        path: fullPath,
        error: err.message,
      });
    }

    res.json({
      exists: true,
      path: fullPath,
      url: `https://daringbrusselsacademy.be/node/uploads/${filePath.replace(
        "/uploads/",
        ""
      )}`,
    });
  });
});

// Vérifie si un fichier existe dans le dossier uploads
app.get("/api/test-file-exists", (req, res) => {
  const filePath = req.query.path;
  if (!filePath) {
    return res.status(400).json({ error: "Chemin de fichier manquant" });
  }

  // Vérification que le chemin commence par /uploads/ pour la sécurité
  if (!filePath.startsWith("/uploads/")) {
    return res.status(400).json({ error: "Chemin non autorisé" });
  }

  const fullPath = path.join(__dirname, filePath.substring(1)); // Enlève le / initial

  fs.access(fullPath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({
        exists: false,
        error: err.message,
        requestedPath: filePath,
        fullPath: fullPath,
      });
    }

    res.json({
      exists: true,
      path: filePath,
      fullPath: fullPath,
    });
  });
});

// Ajouter dans server.js
app.get("/api/file-as-base64", (req, res) => {
  const filePath = req.query.path;
  if (!filePath || !filePath.startsWith("/uploads/")) {
    return res.status(400).send("Invalid file path");
  }

  const fullPath = path.join(__dirname, filePath.substring(1));

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      return res.status(404).send("File not found");
    }

    const base64 = data.toString("base64");
    res.send(base64);
  });
});
