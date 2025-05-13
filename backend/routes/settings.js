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
    res.json({
      maintenanceMode: Boolean(row.maintenanceMode),
      language: row.language,
      general: JSON.parse(row.general),
      about: JSON.parse(row.about),
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
