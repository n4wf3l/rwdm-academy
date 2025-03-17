// server.js
require("dotenv").config(); // Charger les variables d'environnement

const fs = require("fs");
const path = require("path");

// Vérifier si le dossier 'uploads' existe, sinon le créer
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

console.log("DB_USER =", process.env.DB_USER);

const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware pour gérer CORS et le JSON
app.use(cors());
app.use(express.json({ limit: "10mb" }));

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

const upload = multer({ storage });
// Clé secrète pour signer les tokens JWT à partir du .env
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware pour vérifier l'authentification
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token manquant" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide" });
  }
};

// Middleware pour vérifier le rôle superadmin
const superAdminMiddleware = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Accès réservé aux superadmins" });
  }
  next();
};

// ---------------------
// Endpoint de connexion
// ---------------------
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email et mot de passe requis" });

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    await connection.end();

    if (rows.length === 0) {
      return res.status(400).json({ message: "Utilisateur introuvable" });
    }

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // Générer un token en incluant le rôle
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ message: "Authentification réussie", token });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Endpoint pour créer un nouveau membre admin (accessible uniquement par superadmin)
app.post(
  "/api/admins",
  authMiddleware,
  superAdminMiddleware,
  async (req, res) => {
    // On attend dans le corps de la requête : firstName, lastName, email, password, functionTitle, description, profilePicture, role
    const {
      firstName,
      lastName,
      email,
      password,
      functionTitle, // déjà défini ici
      description,
      profilePicture,
      role,
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message:
          "Les champs prénom, nom, email et mot de passe sont obligatoires",
      });
    }

    // Vérifier que le rôle est admin ou superadmin si fourni
    if (role && !["admin", "superadmin"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Le rôle doit être 'admin' ou 'superadmin'" });
    }

    try {
      const connection = await mysql.createConnection(dbConfig);

      // Vérifier si un utilisateur avec le même email existe déjà
      const [rows] = await connection.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );
      if (rows.length > 0) {
        await connection.end();
        return res
          .status(400)
          .json({ message: "Un utilisateur avec cet email existe déjà" });
      }

      // Hacher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insertion dans la base de données
      // On insère la valeur de functionTitle dans la colonne "function"
      await connection.execute(
        "INSERT INTO users (firstName, lastName, email, password, role, `function`, description, profilePicture) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          firstName,
          lastName,
          email,
          hashedPassword,
          role || "admin",
          functionTitle || "", // Utilisez functionTitle ici
          description || "",
          profilePicture || "",
        ]
      );
      await connection.end();

      res
        .status(201)
        .json({ message: "Nouveau membre admin créé avec succès" });
    } catch (error) {
      console.error("Erreur lors de la création du membre admin :", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

// Endpoint pour récupérer tous les membres admins
app.get("/api/admins", authMiddleware, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute("SELECT * FROM users");
    await connection.end();
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

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
