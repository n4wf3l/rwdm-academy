const db = require("../db");
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path"); // ✅ Important

// ✅ GET l'email enregistré
router.get("/accident-report", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT email FROM email_recipients WHERE type = ? LIMIT 1",
      ["accident-report"]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Email non trouvé" });
    }

    res.json({ email: rows[0].email });
  } catch (err) {
    console.error("❌ Erreur récupération email:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ PUT pour mise à jour de l’email
router.put("/accident-report", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email requis." });

  try {
    await db.execute(
      `INSERT INTO email_recipients (type, email, created_at, updated_at)
       VALUES (?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE email = VALUES(email), updated_at = NOW()`,
      ["accident-report", email]
    );

    res.json({ message: "Email mis à jour avec succès." });
  } catch (err) {
    console.error("❌ Erreur mise à jour email:", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ✅ POST réel qui envoie l'email avec pièce jointe PDF
router.post("/send-request/:id", async (req, res) => {
  const { id } = req.params;
  console.log("📩 Envoi d'un email pour la demande ID :", id);

  try {
    // 1. Récupération de la demande
    const [requests] = await db.query("SELECT * FROM requests WHERE id = ?", [
      id,
    ]);
    if (requests.length === 0) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    const request = requests[0];
    const requestData = JSON.parse(request.data);

    // 2. Récupération du template d'email
    const [templates] = await db.query("SELECT * FROM emails WHERE type = ?", [
      request.type,
    ]);

    if (templates.length === 0) {
      return res.status(404).json({ message: "Template d'email non trouvé" });
    }

    const emailTemplate = templates[0];

    // 3. Récupération de l'adresse email de destination
    const [emails] = await db.query(
      "SELECT email FROM email_recipients WHERE type = ? LIMIT 1",
      ["accident-report"]
    );
    if (emails.length === 0) {
      return res.status(404).json({ message: "Email non trouvé" });
    }

    const recipient = emails[0].email;

    // 4. Préparer les pièces jointes
    let attachments = [];
    const filePathsArray = Array.isArray(requestData.filePaths)
      ? requestData.filePaths
      : requestData.filePath
      ? [requestData.filePath]
      : [];

    filePathsArray.forEach((filePath) => {
      const cleanedFilePath = filePath.replace(/^\/+/, "");
      const fileAbsolutePath = path.join(__dirname, "..", cleanedFilePath);

      if (fs.existsSync(fileAbsolutePath)) {
        attachments.push({
          filename: path.basename(fileAbsolutePath),
          content: fs.createReadStream(fileAbsolutePath),
          contentType: "application/pdf",
        });
      }
    });

    // 5. Remplacer les variables dans le template
    const htmlContent = emailTemplate.body
      .replace(
        /{playerName}/g,
        `${requestData.playerFirstName || ""} ${
          requestData.playerLastName || ""
        }`
      )
      .replace(/{clubName}/g, requestData.clubName || "")
      .replace(/{parentEmail}/g, requestData.email || "")
      .replace(/{documentLabel}/g, requestData.documentLabel || request.type)
      .replace(
        /{accidentDate}/g,
        requestData.accidentDate
          ? new Date(requestData.accidentDate).toLocaleDateString("fr-BE")
          : ""
      )
      .replace(/{description}/g, requestData.description || "")
      .replace(/\n/g, "<br/>");

    // 6. Configurer et envoyer l'email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"RWDM Academy" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: emailTemplate.subject.replace(/{requestId}/g, request.id),
      html: htmlContent,
      attachments,
    });

    console.log("✅ Email bien envoyé :", info.messageId);

    // 7. Mettre à jour le champ sent_at
    await db.query("UPDATE requests SET sent_at = NOW() WHERE id = ?", [id]);

    res.json({ message: "Email envoyé avec succès !" });
  } catch (err) {
    console.error("❌ Erreur pendant l'envoi :", err);
    res.status(500).json({ message: "Erreur lors de l'envoi de l'email." });
  }
});

module.exports = router;
