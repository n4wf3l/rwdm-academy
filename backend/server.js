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
const router = express.Router();
const crypto = require("crypto");

// Middleware pour gérer CORS et le JSON
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Maximum 10 tentatives
  message: { message: "Trop de tentatives, veuillez réessayer plus tard." },
});
app.use("/api/login", loginLimiter);

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
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

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

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

const superAdminMiddleware = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Accès réservé aux superadmins" });
  }
  next();
};

// Configuration de la BDD MySQL à partir des variables d'environnement
const dbConfig = {
  host: process.env.DB_HOST, // Exemple : "localhost"
  user: process.env.DB_USER, // Exemple : "root"
  password: process.env.DB_PASSWORD, // Exemple : "MonSuperMotDePasse"
  database: process.env.DB_NAME, // Exemple : "rwdm-academy"
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Dossier où stocker les fichiers
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Renomme le fichier
  },
});

const allowedExtensions = [".pdf", ".jpeg", ".jpg", ".png"];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error("Type de fichier non autorisé"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
});

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
  superAdminMiddleware,
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
    const [rows] = await dbPool.execute("SELECT * FROM users");

    res.json(rows); // Retourne les membres sous forme de JSON
  } catch (error) {
    console.error("Erreur lors de la récupération des membres :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Endpoint pour supprimer un membre admin
app.delete(
  "/api/admins/:email",
  authMiddleware,
  superAdminMiddleware,
  async (req, res) => {
    const { email } = req.params;
    try {
      const connection = await mysql.createConnection(dbConfig);
      const [result] = await connection.execute(
        "DELETE FROM users WHERE email = ?",
        [email]
      );
      await connection.end();
      if (result.affectedRows > 0) {
        res.json({ message: "Membre supprimé avec succès" });
      } else {
        res.status(404).json({ message: "Membre non trouvé" });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du membre :", error);
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
  superAdminMiddleware,
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
    } = req.body;

    // Vérifier les champs obligatoires...
    try {
      const connection = await mysql.createConnection(dbConfig);
      let query = "";
      let params = [];
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        query =
          "UPDATE users SET firstName = ?, lastName = ?, email = ?, password = ?, role = ?, `function` = ?, profilePicture = ? WHERE id = ?";
        params = [
          firstName,
          lastName,
          email,
          hashedPassword,
          role,
          functionTitle || "",
          profilePicture || "",
          id,
        ];
      } else {
        query =
          "UPDATE users SET firstName = ?, lastName = ?, email = ?, role = ?, `function` = ?, profilePicture = ? WHERE id = ?";
        params = [
          firstName,
          lastName,
          email,
          role,
          functionTitle || "",
          profilePicture || "",
          id,
        ];
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

// Ajoute cette route dans ton backend (par exemple, à la fin de ton fichier)
app.get("/api/me", authMiddleware, async (req, res) => {
  console.log("User décodé:", req.user);
  const userId = req.user.id;
  try {
    const [rows] = await dbPool.execute(
      "SELECT firstName, lastName, role FROM users WHERE id = ?",
      [userId]
    );
    console.log("Résultat DB:", rows);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json(rows[0]); // maintenant contient aussi "role"
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

  // ✅ Vérification du code dossier si c'est un certificat
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

    await connection.end();
    res.status(201).json({ message: "Demande enregistrée avec succès" });
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
       r.rejected_at, u.id AS admin_id, u.firstName AS admin_firstName, u.lastName AS admin_lastName, u.email AS admin_email
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

app.patch("/api/requests/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  let { status, assignedTo } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Si on assigne un admin sans fournir de status, on force le status "Assigné"
    if (assignedTo !== undefined && status === undefined) {
      status = "Assigné";
    }

    const columnsToUpdate = [];
    const values = [];

    if (status !== undefined) {
      columnsToUpdate.push("status = ?");
      values.push(status);

      // Met à jour rejected_at si le statut est "Rejeté"
      if (status === "Rejeté" || status === "rejected") {
        columnsToUpdate.push("rejected_at = NOW()");
        console.log("🛠️ PATCH reçu avec:", { status, assignedTo });
      } else {
        columnsToUpdate.push("rejected_at = NULL");
      }
    }

    if (assignedTo !== undefined) {
      columnsToUpdate.push("assigned_to = ?");
      const assignedValue = assignedTo === "none" ? null : assignedTo;
      values.push(assignedValue);
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

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post("/api/upload", upload.single("pdfFile"), (req, res) => {
  if (!req.file) {
    console.error("❌ Aucun fichier reçu !");
    return res.status(400).json({ error: "Aucun fichier téléchargé" });
  }

  console.log("✅ Fichier reçu :", req.file);

  res.json({ filePath: `/uploads/${req.file.filename}` });
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

    console.log("📥 API a renvoyé :", rows); // Vérification
    console.log("🚀 Données envoyées au frontend :", rows);
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
    const [result] = await connection.execute(
      "DELETE FROM appointments WHERE id = ?",
      [id]
    );
    await connection.end();
    if (result.affectedRows > 0) {
      res.json({ message: "Rendez-vous annulé avec succès" });
    } else {
      res.status(404).json({ message: "Rendez-vous non trouvé" });
    }
  } catch (error) {
    console.error("Erreur lors de l'annulation du rendez-vous :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.post("/appointments", async (req, res) => {
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

module.exports = router;

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
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
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

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
