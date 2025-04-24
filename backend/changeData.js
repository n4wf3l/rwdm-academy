const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safeName = Date.now() + "-" + file.originalname.replace(/\s/g, "");
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // Max 1 Mo
});

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// PUT /api/settings – Sauvegarder les paramètres
router.put("/settings", async (req, res) => {
  const settingsData = req.body;
  const maxBase64Size = 1 * 1024 * 1024; // 1 Mo

  const isBase64 = (str) =>
    typeof str === "string" && !str.startsWith("/uploads/") && str.length > 100;

  const tooBig = (img) => isBase64(img) && img.length * 0.75 > maxBase64Size;

  const stripIfAlreadyUploaded = (img) =>
    typeof img === "string" && img.startsWith("/uploads/") ? img : "";

  try {
    // 🔁 Nettoie les images déjà uploadées AVANT de faire les vérifications
    settingsData.general.logo = stripIfAlreadyUploaded(
      settingsData.general.logo
    );
    settingsData.about.historyPhoto = stripIfAlreadyUploaded(
      settingsData.about.historyPhoto
    );
    settingsData.about.missionPhoto = stripIfAlreadyUploaded(
      settingsData.about.missionPhoto
    );
    settingsData.about.approachPhoto = stripIfAlreadyUploaded(
      settingsData.about.approachPhoto
    );
    settingsData.about.academyPhotos1 = stripIfAlreadyUploaded(
      settingsData.about.academyPhotos1
    );
    settingsData.about.academyPhotos2 = stripIfAlreadyUploaded(
      settingsData.about.academyPhotos2
    );
    settingsData.about.academyPhotos3 = stripIfAlreadyUploaded(
      settingsData.about.academyPhotos3
    );

    // 📦 Vérifie uniquement les éventuels nouveaux encodages base64
    const imagesToCheck = [
      settingsData.general.logo,
      settingsData.about.historyPhoto,
      settingsData.about.missionPhoto,
      settingsData.about.approachPhoto,
      settingsData.about.academyPhotos1,
      settingsData.about.academyPhotos2,
      settingsData.about.academyPhotos3,
    ];

    for (const img of imagesToCheck) {
      if (tooBig(img)) {
        return res.status(400).json({
          error: "Une des images encodées est trop volumineuse (max 1 Mo).",
        });
      }
    }

    // 🔎 Vérification taille totale du JSON simulée
    const totalSize = Buffer.byteLength(JSON.stringify(settingsData), "utf8");
    if (totalSize > 2 * 1024 * 1024) {
      return res.status(400).json({
        error: `Les données envoyées sont trop volumineuses (${(
          totalSize /
          1024 /
          1024
        ).toFixed(2)} Mo).`,
      });
    }

    const connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      `INSERT INTO site_settings (id, general, about, contact, language)
       VALUES (1, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         general = VALUES(general),
         about = VALUES(about),
         contact = VALUES(contact),
         language = VALUES(language)`,
      [
        JSON.stringify(settingsData.general),
        JSON.stringify(settingsData.about),
        JSON.stringify(settingsData.contact),
        settingsData.language,
      ]
    );

    await connection.end();
    res.json({ message: "Paramètres sauvegardés avec succès." });
  } catch (error) {
    console.error("❌ Erreur lors de la sauvegarde des paramètres :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/settings – Charger les paramètres
router.get("/settings", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      "SELECT general, about, contact, language FROM site_settings WHERE id = 1"
    );

    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({ message: "Aucun paramètre trouvé" });
    }

    res.json({
      general: JSON.parse(rows[0].general),
      about: JSON.parse(rows[0].about),
      contact: JSON.parse(rows[0].contact),
      language: rows[0].language,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des paramètres :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/upload/image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier envoyé." });
  }

  // Retourne le chemin relatif utilisable côté frontend
  const filePath = `/uploads/${req.file.filename}`;
  res.json({ filePath });
});

router.delete("/upload/image", (req, res) => {
  const { filePath } = req.body;
  if (!filePath) return res.status(400).json({ error: "Aucun chemin fourni." });

  const fullPath = path.join(__dirname, "../", filePath);

  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error("Erreur suppression fichier :", err);
        return res
          .status(500)
          .json({ error: "Erreur lors de la suppression du fichier." });
      }
      return res.json({ message: "Fichier supprimé avec succès." });
    });
  } else {
    return res.status(404).json({ error: "Fichier introuvable." });
  }
});

module.exports = router;
