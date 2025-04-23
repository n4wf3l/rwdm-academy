const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");

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

  if (
    settingsData.general.logo &&
    settingsData.general.logo.length * 0.75 > maxBase64Size // base64 = +33% taille
  ) {
    return res
      .status(400)
      .json({ error: "Le fichier logo est trop volumineux." });
  }

  try {
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

module.exports = router;
