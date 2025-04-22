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
  console.log("📩 Envoi d’un email pour la demande ID :", id);

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

    // 2. Récupération de l'adresse email de destination
    const [emails] = await db.query(
      "SELECT email FROM email_recipients WHERE type = ? LIMIT 1",
      ["accident-report"]
    );
    if (emails.length === 0) {
      return res.status(404).json({ message: "Email non trouvé" });
    }

    const recipient = emails[0].email;

    // 3. Préparer la pièce jointe PDF
    let attachments = [];

    // ✅ Gère filePath (string) ou filePaths (array)
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
      } else {
        console.warn("❗️Fichier non trouvé :", fileAbsolutePath);
      }
    });

    // 4. Contenu de l’email
    const htmlContent = `
      <p>Madame, Monsieur,</p>
      <p>Veuillez trouver ci-joint un document transmis par l’Académie du RWDM à l’attention de l’Union belge de football.</p>
      <p>Ce document concerne :</p>
      <ul>
        <li><strong>Nom du joueur :</strong> ${
          requestData.playerFirstName ?? "—"
        } ${requestData.playerLastName ?? "—"}</li>
        <li><strong>Club :</strong> ${requestData.clubName ?? "—"}</li>
        <li><strong>Email du parent :</strong> ${requestData.email ?? "—"}</li>
        <li><strong>Type de document :</strong> ${
          requestData.documentLabel ?? request.type
        }</li>
        <li><strong>Date de l'accident :</strong> ${
          requestData.accidentDate
            ? new Date(requestData.accidentDate).toLocaleDateString("fr-BE")
            : "—"
        }</li>
      </ul>
      <p><strong>Description de l’incident selon la victime :</strong><br>${
        requestData.description ?? "—"
      }</p>
      <p>📎 Le document PDF est joint à cet email.</p>
      <br/>
      <p>Cordialement,</p>
      <p><strong>Académie du RWDM</strong><br/>Service administratif</p>
    `;

    // 5. Config Nodemailer
    const transporter = nodemailer.createTransport({
      host: "smtp-auth.mailprotect.be",
      port: 587,
      secure: false,
      auth: {
        user: "info@nainnovations.be",
        pass: "mdp123",
      },
    });

    // 6. Envoi final
    const info = await transporter.sendMail({
      from: '"RWDM Academy" <info@nainnovations.be>',
      to: recipient,
      subject: `Nouvelle demande ${request.id} – ${
        requestData.documentLabel ?? request.type
      }`,
      html: htmlContent,
      attachments,
    });

    console.log("✅ Email bien envoyé :", info.messageId);

    // 7. Mettre à jour le champ sent_at
    await db.query("UPDATE requests SET sent_at = NOW() WHERE id = ?", [id]);

    res.json({ message: "Email envoyé avec succès !" });
  } catch (err) {
    console.error("❌ Erreur pendant l'envoi :", err);
    res.status(500).json({ message: "Erreur lors de l’envoi de l’email." });
  }
});

module.exports = router;
