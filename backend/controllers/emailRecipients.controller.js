// backend/controllers/emailRecipients.controller.js
const db = require("../db");

exports.getEmailRecipient = async (req, res) => {
  const { type } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT email FROM email_recipients WHERE type = ? LIMIT 1",
      [type]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Email non trouvé" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Erreur récupération email:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.updateEmailRecipient = async (req, res) => {
  const { type } = req.params;
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email requis" });
  }

  try {
    await db.query(
      `INSERT INTO email_recipients (type, email)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE email = VALUES(email)`,
      [type, email]
    );
    res.json({ message: "Email mis à jour avec succès." });
  } catch (err) {
    console.error("Erreur mise à jour email:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
