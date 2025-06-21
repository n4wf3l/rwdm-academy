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
    const [requests] = await db.query(
      `SELECT r.*, 
        CONCAT(u.firstName, ' ', u.lastName) as admin_name
      FROM requests r
      LEFT JOIN users u ON r.assigned_to = u.id
      WHERE r.id = ?`,
      [id]
    );

    if (requests.length === 0) {
      console.log("❌ Demande non trouvée:", id);
      return res.status(404).json({
        message: "Demande non trouvée",
        requestId: id,
      });
    }

    const request = requests[0];
    const requestData = JSON.parse(request.data);

    // Vérifier si on a reçu des données supplémentaires du frontend
    if (req.body.documentLabel) {
      requestData.documentLabel = req.body.documentLabel;
    }

    if (req.body.type) {
      request.type = req.body.type;
    }

    console.log("📑 Données de la demande:", {
      id: request.id,
      type: request.type,
      data: requestData,
    });

    // 2. Déterminer le type d'email et le destinataire
    let emailType;

    // Check si c'est un certificat de guérison
    if (
      requestData.documentLabel === "Certificat de guérison" ||
      requestData.documentLabel === "Geneescertificaat"
    ) {
      emailType = "healing-notify";
    } else {
      emailType = "accident-notify";
    }

    console.log("Type de document:", {
      id: request.id,
      documentLabel: requestData.documentLabel,
      emailType,
    });

    // 3. Récupération du template d'email
    const [templates] = await db.query("SELECT * FROM emails WHERE type = ?", [
      emailType,
    ]);

    if (templates.length === 0) {
      return res.status(404).json({
        message: `Template d'email non trouvé pour le type ${emailType}`,
      });
    }

    const emailTemplate = templates[0];

    // 4. Récupération de l'adresse email du destinataire
    // AVANT: const recipientType = ...
    // MODIFIÉ: Utilisation du même type de destinataire pour les deux types d'emails
    const [emails] = await db.query(
      "SELECT email FROM email_recipients WHERE type = ?",
      ["accident-report"] // Toujours utiliser accident-report comme destinataire
    );

    if (emails.length === 0) {
      return res.status(404).json({ message: "Email destinataire non trouvé" });
    }

    const recipient = emails[0].email;

    // 5. Préparer les pièces jointes
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

    // 6. Remplacer les variables dans le template
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
      .replace(/{adminName}/g, request.admin_name || "Non assigné")
      .replace(/\n/g, "<br/>");

    // 7. Configurer et envoyer l'email
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
      from: `"Daring Brussels Academy" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: emailTemplate.subject.replace(/{requestId}/g, request.id),
      html: htmlContent,
      attachments,
    });

    console.log("✅ Email bien envoyé :", info.messageId);

    // 8. Mettre à jour le champ sent_at
    await db.query("UPDATE requests SET sent_at = NOW() WHERE id = ?", [id]);

    res.json({ message: "Email envoyé avec succès !" });
  } catch (err) {
    console.error("❌ Erreur pendant l'envoi :", err);
    res.status(500).json({
      message: "Erreur lors de l'envoi de l'email.",
      error: err.message,
    });
  }
});

module.exports = router;
