// backend/routes/settings.js
const express = require("express");
const router = express.Router();
const db = require("../db"); // your MySQL pool (promise) instance

// GET all settings
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM site_settings WHERE id = 1");
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    const row = rows[0];
    
    const general = JSON.parse(row.general);
    const about = JSON.parse(row.about);
    
    // Formatage des URLs d'images pour l'API locale
    if (general.logo && general.logo.startsWith("/uploads/")) {
      const imageName = general.logo.replace("/uploads/", "");
      general.logo = `http://localhost:5000/api/image/${imageName}`;
    }
    
    // Formatage des URLs des photos About si nécessaire
    if (about.historyPhoto && about.historyPhoto.startsWith("/uploads/")) {
      const imageName = about.historyPhoto.replace("/uploads/", "");
      about.historyPhoto = `http://localhost:5000/api/image/${imageName}`;
    }
    if (about.missionPhoto && about.missionPhoto.startsWith("/uploads/")) {
      const imageName = about.missionPhoto.replace("/uploads/", "");
      about.missionPhoto = `http://localhost:5000/api/image/${imageName}`;
    }
    if (about.approachPhoto && about.approachPhoto.startsWith("/uploads/")) {
      const imageName = about.approachPhoto.replace("/uploads/", "");
      about.approachPhoto = `http://localhost:5000/api/image/${imageName}`;
    }
    if (about.academyPhotos1 && about.academyPhotos1.startsWith("/uploads/")) {
      const imageName = about.academyPhotos1.replace("/uploads/", "");
      about.academyPhotos1 = `http://localhost:5000/api/image/${imageName}`;
    }
    if (about.academyPhotos2 && about.academyPhotos2.startsWith("/uploads/")) {
      const imageName = about.academyPhotos2.replace("/uploads/", "");
      about.academyPhotos2 = `http://localhost:5000/api/image/${imageName}`;
    }
    if (about.academyPhotos3 && about.academyPhotos3.startsWith("/uploads/")) {
      const imageName = about.academyPhotos3.replace("/uploads/", "");
      about.academyPhotos3 = `http://localhost:5000/api/image/${imageName}`;
    }
    
    res.json({
      maintenanceMode: Boolean(row.maintenanceMode),
      language: row.language,
      general: general,
      about: about,
      contact: JSON.parse(row.contact),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});

// Toggle maintenance
router.put("/maintenance", async (req, res) => {
  const { maintenanceMode } = req.body;
  if (typeof maintenanceMode !== "boolean") {
    return res.status(400).json({ error: "maintenanceMode must be boolean" });
  }
  try {
    await db.query(
      "UPDATE site_settings SET maintenanceMode = ? WHERE id = 1",
      [maintenanceMode ? 1 : 0]
    );
    res.json({ maintenanceMode });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});

// PUT full settings
router.put("/", async (req, res) => {
  const { maintenanceMode, language, general, about, contact } = req.body;
  try {
    await db.query(
      `UPDATE site_settings
       SET maintenanceMode = ?, language = ?,
           general = ?, about = ?, contact = ?
       WHERE id = 1`,
      [
        maintenanceMode ? 1 : 0,
        language,
        JSON.stringify(general),
        JSON.stringify(about),
        JSON.stringify(contact),
      ]
    );
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;
