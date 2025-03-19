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
        { expiresIn: "1h" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
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
      functionTitle,
      description,
      profilePicture,
      role,
    } = req.body;

    try {
      const [rows] = await dbPool.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );
      if (rows.length > 0)
        return res.status(400).json({ message: "Cet email est déjà utilisé" });

      const hashedPassword = await bcrypt.hash(password, 10);

      await dbPool.execute(
        "INSERT INTO users (firstName, lastName, email, password, role, `function`, description, profilePicture) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          firstName,
          lastName,
          email,
          hashedPassword,
          role || "admin",
          functionTitle || "",
          description || "",
          profilePicture || "",
        ]
      );

      res
        .status(201)
        .json({ message: "Nouveau membre admin créé avec succès" });
    } catch (error) {
      console.error("Erreur lors de la création de l'admin :", error);
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
      description,
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
          "UPDATE users SET firstName = ?, lastName = ?, email = ?, password = ?, role = ?, `function` = ?, description = ?, profilePicture = ? WHERE id = ?";
        params = [
          firstName,
          lastName,
          email,
          hashedPassword,
          role,
          functionTitle || "",
          description || "",
          profilePicture || "",
          id,
        ];
      } else {
        query =
          "UPDATE users SET firstName = ?, lastName = ?, email = ?, role = ?, `function` = ?, description = ?, profilePicture = ? WHERE id = ?";
        params = [
          firstName,
          lastName,
          email,
          role,
          functionTitle || "",
          description || "",
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
      "SELECT id, firstName, lastName, email, profilePicture, `function` as functionTitle, description, role FROM users"
    );
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des admins :", error);
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

app.patch("/api/requests/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  let { status, assignedTo } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Si on assigne un admin sans fournir de status, on force le status "Assigné"
    if (assignedTo !== undefined && status === undefined) {
      status = "Assigné";
    }

    // Construction dynamique de la requête
    const columnsToUpdate = [];
    const values = [];

    if (status !== undefined) {
      columnsToUpdate.push("status = ?");
      values.push(status);
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
    res.json(rows);
  } catch (error) {
    console.error(
      "Erreur serveur lors de la récupération des rendez-vous :",
      error
    );
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

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
