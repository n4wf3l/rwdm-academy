const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const { format } = require("date-fns");
const { fr } = require("date-fns/locale");
const fetch = require("node-fetch");
const db = require("../db"); // Changez cette ligne

function getLabelFromType(type) {
  switch (type) {
    case "registration":
      return "Inscription à l'académie";
    case "selection-tests":
      return "Tests de sélection";
    case "accident-report":
      return "Déclaration d'accident";
    case "responsibility-waiver":
      return "Décharge de responsabilité";
    case "other":
      return "Rendez-vous général";
    default:
      return "Rendez-vous";
  }
}

router.post("/send-registration-email", async (req, res) => {
  const { formData, requestId } = req.body;

  if (
    !formData ||
    !formData.parent1Email ||
    !formData.firstName ||
    !formData.lastName
  ) {
    return res.status(400).json({ error: "Données manquantes." });
  }

  try {
    // Ajouter la configuration du transporter ici
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: +process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      requireTLS: true,
      tls: {
        rejectUnauthorized: false,
      },
    });

    const [templates] = await db.execute(
      "SELECT * FROM emails WHERE type = ?",
      ["registration"]
    );

    if (templates.length === 0) {
      return res.status(404).json({ message: "Template d'email non trouvé" });
    }

    const template = templates[0];

    // Remplacer les variables et préserver les sauts de ligne
    let htmlContent = template.body
      // Variables existantes
      .replace(/{parentName}/g, formData.parent1FirstName || "")
      .replace(/{playerName}/g, `${formData.firstName} ${formData.lastName}`)
      .replace(/{academy}/g, formData.academy || "")
      .replace(/{season}/g, formData.season || "")
      .replace(/{requestId}/g, requestId)

      // Nouvelles variables détaillées
      .replace(/{firstName}/g, formData.firstName || "")
      .replace(/{lastName}/g, formData.lastName || "")
      .replace(
        /{birthDate}/g,
        formData.birthDate
          ? new Date(formData.birthDate).toLocaleDateString("fr-FR")
          : ""
      )
      .replace(/{birthPlace}/g, formData.birthPlace || "")
      .replace(/{address}/g, formData.address || "")
      .replace(/{postalCode}/g, formData.postalCode || "")
      .replace(/{city}/g, formData.city || "")
      .replace(/{category}/g, formData.category || "")
      .replace(/{currentClub}/g, formData.currentClub || "")

      // Informations du parent 1
      .replace(/{parent1LastName}/g, formData.parent1LastName || "")
      .replace(/{parent1FirstName}/g, formData.parent1FirstName || "")
      .replace(/{parent1Phone}/g, formData.parent1Phone || "")
      .replace(/{parent1Email}/g, formData.parent1Email || "")
      .replace(/{parent1Address}/g, formData.parent1Address || "")
      .replace(/{parent1PostalCode}/g, formData.parent1PostalCode || "")
      .replace(/{parent1Gsm}/g, formData.parent1Gsm || "")

      // Informations du parent 2 (si présentes)
      .replace(/{parent2LastName}/g, formData.parent2LastName || "")
      .replace(/{parent2FirstName}/g, formData.parent2FirstName || "")
      .replace(/{parent2Phone}/g, formData.parent2Phone || "")
      .replace(/{parent2Email}/g, formData.parent2Email || "")

      // Convertir les retours à la ligne en balises <br/>
      .replace(/\n/g, "<br/>");

    const mailOptions = {
      from: `"RWDM Academy" <${process.env.EMAIL_USER}>`,
      to: formData.parent1Email,
      subject: template.subject.replace(/{requestId}/g, requestId),
      html: htmlContent,
    };

    console.log("Options d'email:", mailOptions);

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email envoyé:", info.messageId);

    res.json({ message: "Email de confirmation envoyé avec succès." });
  } catch (err) {
    console.error("❌ Erreur détaillée:", err);
    res.status(500).json({
      error: "Erreur lors de l'envoi de l'email",
      details: err.message,
    });
  }
});

router.post("/send-selection-test-email", async (req, res) => {
  const { formData, requestId } = req.body;

  if (
    !formData ||
    !formData.parentEmail ||
    !formData.firstName ||
    !formData.lastName
  ) {
    return res.status(400).json({ error: "Données manquantes." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: +process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      requireTLS: true,
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Ajoutez cette vérification de connexion
    transporter.verify(function (error, success) {
      if (error) {
        console.error("❌ Erreur de configuration SMTP:", error);
      } else {
        console.log("✅ Serveur SMTP prêt à envoyer des emails");
      }
    });

    const html = `
   <p>Bonjour ${formData.parentFirstName ?? ""},</p>
  
<p>Nous vous confirmons que nous avons bien reçu la demande de test de sélection de <strong>${
      formData.firstName
    } ${formData.lastName}</strong> pour le noyau <strong>${
      formData.noyau
    }</strong>.</p>
  
<p>📢 Cette demande sera étudiée par notre staff technique.</p>
  
<p>En cas d'acceptation, un membre du staff vous contactera par email afin de vous inviter à une séance de test à une date et une heure précises.</p>
  
<p>🕒 Nous vous recommandons de rester attentif à vos emails pour ne manquer aucune information importante liée à cette candidature.</p>
  
<p><strong>Numéro de référence de la demande :</strong> ${requestId}</p>
  
<br/>
<p>Cordialement,</p>
<p><strong>RWDM Academy</strong><br/>Cellule détection</p>

<!-- Clause de non‑responsabilité -->
<p style="font-size:0.85em; color:#555; margin-top:1.5em;">
  La RWDM décline toute responsabilité en cas d'incidents, d'accidents, de vols survenus dans ses installations et aux abords.  
  En signant ce document, vous reconnaissez avoir pris connaissance de cette information.
</p>
  `;

    await transporter.sendMail({
      from: '"RWDM Academy" <info@nainnovations.be>',
      to: formData.parentEmail,
      subject: `Demande de test reçue – RWDM Academy (ref #${requestId})`,
      html,
    });

    res.json({ message: "Email de confirmation (test) envoyé avec succès." });
  } catch (err) {
    console.error("❌ Erreur d'envoi test :", err);
    res.status(500).json({ error: "Erreur lors de l’envoi de l’email." });
  }
});

router.post("/send-accident-report-email", async (req, res) => {
  const { formData, requestId } = req.body;

  if (
    !formData ||
    !formData.email ||
    !formData.playerFirstName ||
    !formData.playerLastName
  ) {
    return res.status(400).json({ error: "Données manquantes." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // Changé de SMTP_HOST
      port: +process.env.EMAIL_PORT, // Changé de SMTP_PORT
      secure: false,
      auth: {
        user: process.env.EMAIL_USER, // Changé de SMTP_USER
        pass: process.env.EMAIL_PASS, // Changé de SMTP_PASS
      },
      requireTLS: true,
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Récupérer le template depuis la base de données
    const [templates] = await db.execute(
      "SELECT * FROM emails WHERE type = ?",
      [
        formData.documentLabel === "Certificat de guérison"
          ? "healing"
          : "accident",
      ]
    );

    if (templates.length === 0) {
      return res.status(404).json({ message: "Template d'email non trouvé" });
    }

    const template = templates[0];
    const isDeclaration = formData.documentLabel === "Déclaration d'accident";

    // Remplacer les variables dans le template
    let htmlContent = template.body
      .replace(
        /{playerName}/g,
        `${formData.playerFirstName} ${formData.playerLastName}`
      )
      .replace(/{codeDossier}/g, formData.codeDossier || "")
      .replace(/{requestId}/g, requestId)
      .replace(/\n/g, "<br/>");

    const mailOptions = {
      from: `"RWDM Academy" <${process.env.EMAIL_USER}>`,
      to: formData.email,
      subject: template.subject.replace(/{requestId}/g, requestId),
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email envoyé:", info.messageId);

    res.json({ message: "Email de confirmation envoyé avec succès." });
  } catch (err) {
    console.error("❌ Erreur détaillée:", err);
    res.status(500).json({
      error: "Erreur lors de l'envoi de l'email",
      details: err.message,
    });
  }
});

router.post("/send-waiver-email", async (req, res) => {
  const { formData, requestId } = req.body;

  if (
    !formData ||
    !formData.parentEmail ||
    !formData.parentFirstName ||
    !formData.parentLastName
  ) {
    return res.status(400).json({ error: "Données manquantes." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // Changé de SMTP_HOST
      port: +process.env.EMAIL_PORT, // Changé de SMTP_PORT
      secure: false,
      auth: {
        user: process.env.EMAIL_USER, // Changé de SMTP_USER
        pass: process.env.EMAIL_PASS, // Changé de SMTP_PASS
      },
      requireTLS: true,
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Récupérer le template depuis la base de données
    const [templates] = await db.execute(
      "SELECT * FROM emails WHERE type = ?",
      ["waiver"]
    );

    if (templates.length === 0) {
      return res.status(404).json({ message: "Template d'email non trouvé" });
    }

    const template = templates[0];

    // Remplacer les variables dans le template
    let htmlContent = template.body
      .replace(/{parentName}/g, formData.parentFirstName)
      .replace(
        /{playerName}/g,
        `${formData.playerFirstName} ${formData.playerLastName}`
      )
      .replace(/{requestId}/g, requestId)
      .replace(/\n/g, "<br/>");

    const mailOptions = {
      from: `"Daring Brussels Academy" <${process.env.EMAIL_USER}>`,
      to: formData.parentEmail,
      subject: template.subject.replace(/{requestId}/g, requestId),
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email envoyé:", info.messageId);

    res.json({ message: "Email de confirmation envoyé avec succès." });
  } catch (err) {
    console.error("❌ Erreur détaillée:", err);
    res.status(500).json({
      error: "Erreur lors de l'envoi de l'email",
      details: err.message,
    });
  }
});

router.post("/send-contact-message", async (req, res) => {
  try {
    const { name, email, subject, message, captcha } = req.body;

    // Validation des données
    if (!name || !email || !subject || !message) {
      console.log("❌ Données du formulaire incomplètes");
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    if (!captcha) {
      console.log("❌ Captcha manquant");
      return res.status(400).json({ error: "Captcha requis" });
    }

    // Vérification du captcha
    console.log("🔍 Vérification du captcha...");
    try {
      const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";
      const secretKey = "6Lf0l2grAAAAAADk3nC-kSvp_6sMpK7iRC6CuTjy";

      const response = await fetch(verifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${secretKey}&response=${captcha}`,
      });

      const captchaData = await response.json();
      if (!captchaData.success) {
        console.log("❌ Échec de vérification du captcha:", captchaData);
        return res.status(400).json({ error: "Vérification captcha échouée" });
      }
      console.log("✅ Captcha validé");
    } catch (error) {
      console.error("❌ Erreur lors de la vérification du captcha:", error);
      return res.status(500).json({ error: "Erreur de vérification captcha" });
    }

    // AJOUTER CETTE PARTIE - Définir le transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: +process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      requireTLS: true,
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Test de connexion SMTP avant envoi (non bloquant)
    console.log("🔄 Test de connexion SMTP...");
    try {
      await transporter.verify();
      console.log("✅ Connexion SMTP réussie");
    } catch (error) {
      console.warn("⚠️ Avertissement SMTP:", error.message);
      // Continuer quand même, le test peut parfois échouer même si l'envoi fonctionne
    }

    // Envoi de l'email
    console.log("📧 Envoi de l'email en cours...");
    try {
      // Remplacer par cette implémentation avec un mappage des sujets:
      const getSubjectTranslation = (subjectCode) => {
        const subjectMap = {
          registration: "Inscription à l'académie",
          selection_tests: "Tests de sélection",
          liability_waiver: "Décharge de responsabilité",
          accident_report: "Déclaration d'accident",
          recruitment: "Recrutement",
          incident: "Incident",
          technical: "Problème technique",
          other: "Autre question",
        };

        return subjectMap[subjectCode] || subjectCode;
      };

      const subjectType = getSubjectTranslation(subject);

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: `[Contact] ${subjectType} - ${name}`,
        html: `
          <h2>Nouveau message de contact</h2>
          <p><strong>De:</strong> ${name} (${email})</p>
          <p><strong>Sujet:</strong> ${subjectType}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
            ${message.replace(/\n/g, "<br>")}
          </div>
        `,
      });
      console.log("✅ Email envoyé avec succès");

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("❌ Erreur d'envoi d'email:", error);
      return res.status(500).json({ error: "Erreur d'envoi du message" });
    }
  } catch (error) {
    console.error("❌ Erreur générale:", error);
    res.status(500).json({ error: "Erreur lors de l'envoi du message" });
  }
});

router.post("/send-decision-email", async (req, res) => {
  const { formData, requestId, decision, template } = req.body;

  if (!formData || !requestId || !decision || !template) {
    return res.status(400).json({ error: "Données manquantes" });
  }

  try {
    console.log(
      "📝 Données formData reçues:",
      JSON.stringify(formData, null, 2)
    );

    // Vérifiez si les données sont stockées sous forme de chaîne JSON
    let formDataObj = formData;
    if (typeof formData === "string") {
      try {
        formDataObj = JSON.parse(formData);
      } catch (e) {
        console.error("❌ Erreur lors du parsing JSON de formData:", e);
      }
    }

    // Ajout d'un log détaillé pour voir exactement ce qui est présent dans formDataObj
    console.log(
      "🔍 Structure complète de formDataObj:",
      Object.keys(formDataObj)
    );

    // Extraction spécifique pour les inscriptions à l'académie
    let contactEmail;

    if (template === "registration_confirmed") {
      // Pour les inscriptions à l'académie, chercher plus spécifiquement dans la structure
      if (formDataObj.formData && formDataObj.formData.parent1Email) {
        // Cas où les données sont imbriquées dans un sous-objet formData
        contactEmail = formDataObj.formData.parent1Email;
      } else if (formDataObj.parent1Email) {
        // Cas standard
        contactEmail = formDataObj.parent1Email;
      } else {
        // Recherche plus générique
        contactEmail =
          formDataObj.email || formDataObj.parentEmail || "Non disponible";
      }
    } else {
      // Pour les autres types, utiliser la méthode existante
      contactEmail =
        formDataObj.email ||
        formDataObj.parent1Email ||
        formDataObj.parentEmail ||
        "Non disponible";
    }

    const contactPhone = formDataObj.phone || "Non disponible";

    console.log("📧 Email extrait:", contactEmail);
    console.log("☎️ Téléphone extrait:", contactPhone);

    // Vérification critique de l'email
    if (contactEmail === "Non disponible") {
      console.error(
        "❌ Aucun email valide trouvé dans les données :",
        formDataObj
      );
      return res
        .status(400)
        .json({ error: "Adresse email du destinataire non trouvée" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: +process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      requireTLS: true,
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Récupérer le template de confirmation/refus
    const [templates] = await db.execute(
      "SELECT * FROM emails WHERE type = ?",
      [template]
    );

    if (templates.length === 0) {
      return res.status(404).json({
        message: "Template d'email non trouvé",
        template: template,
      });
    }

    const emailTemplate = templates[0];

    // Déterminer les destinataires selon le type d'email
    let emailTo = contactEmail;
    let emailCc = [];

    // Pour les emails vers l'Union Belge, ajouter l'adresse de l'Union
    if (template.includes("-notify")) {
      // Récupérer l'adresse email de l'Union Belge depuis la base de données
      const [unionEmails] = await db.execute(
        "SELECT * FROM email_recipients WHERE type = 'union_belge'"
      );

      if (unionEmails.length > 0) {
        emailCc.push(unionEmails[0].email);
      }
    }

    // Formatter la date d'accident si présente
    const formattedAccidentDate = formDataObj.accidentDate
      ? new Date(formDataObj.accidentDate).toLocaleDateString("fr-FR")
      : "";

    // Faire une copie du contenu du template avant les remplacements
    let originalContent = emailTemplate.body;

    // Remplacer les variables dans le template, depuis l'objet formDataObj
    let htmlContent = emailTemplate.body
      // Variables de base
      .replace(
        /{parentName}/g,
        formDataObj.parentFirstName || formDataObj.parent1FirstName || ""
      )
      .replace(
        /{playerName}/g,
        `${formDataObj.firstName || formDataObj.playerFirstName} ${
          formDataObj.lastName || formDataObj.playerLastName
        }`
      )
      .replace(/{category}/g, formDataObj.category || formDataObj.noyau || "")
      .replace(/{codeDossier}/g, formDataObj.codeDossier || "")
      .replace(/{requestId}/g, requestId)
      .replace(/{academy}/g, formDataObj.academy || "RWDM Academy")
      .replace(/{season}/g, formDataObj.season || "")

      // Variables spécifiques pour les accidents et guérisons - remplacements DIRECTS
      .replace(/{clubName}/g, formDataObj.clubName || "RWDM")
      .replace(
        /{playerFirstName}/g,
        formDataObj.playerFirstName || formDataObj.firstName || ""
      )
      .replace(
        /{playerLastName}/g,
        formDataObj.playerLastName || formDataObj.lastName || ""
      )
      .replace(/{email}/g, contactEmail)
      .replace(/{phone}/g, contactPhone)
      .replace(/{accidentDate}/g, formattedAccidentDate)
      .replace(/{description}/g, formDataObj.description || "Non spécifié")
      .replace(/{documentLabel}/g, formDataObj.documentLabel || "")
      .replace(/{adminName}/g, "Nawfel Ajari") // Ajoutez cette ligne

      // Variables pour les décharges
      .replace(/{currentClub}/g, formDataObj.currentClub || "")
      .replace(
        /{signatureDate}/g,
        formDataObj.signatureDate
          ? new Date(formDataObj.signatureDate).toLocaleDateString("fr-FR")
          : ""
      )

      // Conversion des sauts de ligne
      .replace(/\n/g, "<br/>");

    // Forcer un remplacement direct de certaines variables
    console.log("📊 Remplacement forcé des variables critiques");
    htmlContent = htmlContent
      .replace(new RegExp("{email}", "g"), contactEmail)
      .replace(new RegExp("{phone}", "g"), contactPhone)
      .replace(new RegExp("{adminName}", "g"), "Nawfel Ajari");

    // Vérification des variables non remplacées
    const nonReplacedVars = htmlContent.match(/\{[a-zA-Z0-9_]+\}/g) || [];
    if (nonReplacedVars.length > 0) {
      console.warn("⚠️ Variables non remplacées:", nonReplacedVars);

      // Force le remplacement des variables non remplacées
      nonReplacedVars.forEach((variable) => {
        const varName = variable.substring(1, variable.length - 1);
        console.log(
          `🔄 Remplacement forcé de ${variable} par sa valeur directe`
        );
        htmlContent = htmlContent.replace(
          new RegExp(variable, "g"),
          "Non disponible"
        );
      });
    }

    // Log avant/après pour vérification
    console.log(
      "📄 Contenu AVANT remplacement (extrait):",
      originalContent.substring(0, 100)
    );
    console.log(
      "📄 Contenu APRÈS remplacement (extrait):",
      htmlContent.substring(0, 100)
    );

    const mailOptions = {
      from: `"RWDM Academy" <${process.env.EMAIL_USER}>`,
      to: emailTo,
      cc: emailCc.length > 0 ? emailCc : undefined,
      subject: emailTemplate.subject
        .replace(/{requestId}/g, requestId)
        .replace(/{codeDossier}/g, formDataObj.codeDossier || ""),
      html: htmlContent,
    };

    // Ajout de pièces jointes pour les emails vers l'Union Belge
    if (template.includes("-notify") && formDataObj.filePath) {
      try {
        const filePath = `.${formDataObj.filePath}`;
        mailOptions.attachments = [
          {
            filename: formDataObj.documentLabel + ".pdf",
            path: filePath,
          },
        ];
      } catch (err) {
        console.error("❌ Erreur lors de l'attachement du fichier:", err);
      }
    }

    console.log("📧 Envoi d'email de décision:", {
      template,
      decision,
      to: mailOptions.to,
      cc: mailOptions.cc,
    });

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email envoyé:", info.messageId);

    res.json({
      message: "Email envoyé avec succès",
      messageId: info.messageId,
    });
  } catch (err) {
    console.error("❌ Erreur détaillée:", err);
    res.status(500).json({
      error: "Erreur lors de l'envoi de l'email",
      details: err.message,
    });
  }
});

router.post("/send-appointment-confirmation", async (req, res) => {
  const { appointment } = req.body;

  if (!appointment || !appointment.email) {
    return res.status(400).json({ error: "Données manquantes." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: +process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      requireTLS: true,
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Get template from database
    const [templates] = await db.execute(
      "SELECT * FROM emails WHERE type = ?",
      ["appointment_scheduled"]
    );

    if (templates.length === 0) {
      return res.status(404).json({ message: "Template d'email non trouvé" });
    }

    const template = templates[0];

    // Replace variables in template
    let htmlContent = template.body
      .replace(/{parentName}/g, appointment.personName || "")
      .replace(
        /{playerName}/g,
        appointment.playerName || appointment.personName || ""
      ) // Ajoutez cette ligne
      .replace(
        /{appointmentDate}/g,
        format(new Date(appointment.date), "dd MMMM yyyy", { locale: fr })
      )
      .replace(/{appointmentTime}/g, appointment.time)
      .replace(/{appointmentType}/g, getLabelFromType(appointment.type))
      .replace(/{adminName}/g, appointment.adminName || "")
      .replace(/{notes}/g, appointment.notes || "")
      .replace(/\n/g, "<br/>");

    const mailOptions = {
      from: `"Daring Brussels Academy" <${process.env.EMAIL_USER}>`,
      to: appointment.email,
      subject: template.subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email envoyé:", info.messageId);

    res.json({ message: "Email de confirmation envoyé avec succès." });
  } catch (err) {
    console.error("❌ Erreur envoi rendez‑vous :", err);
    res.status(500).json({ error: "Erreur lors de l'envoi de l'email." });
  }
});

router.post("/send-appointment-cancellation", async (req, res) => {
  const { appointment } = req.body;

  if (
    !appointment ||
    !appointment.email ||
    !appointment.date ||
    !appointment.time
  ) {
    return res.status(400).json({ error: "Données manquantes." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // Changed from SMTP_HOST
      port: process.env.EMAIL_PORT, // Changed from SMTP_PORT
      secure: false,
      auth: {
        user: process.env.EMAIL_USER, // Changed from SMTP_USER
        pass: process.env.EMAIL_PASS, // Changed from SMTP_PASS
      },
    });

    // Get template from database
    const [templates] = await db.execute(
      "SELECT * FROM emails WHERE type = ?",
      ["appointment_cancelled"]
    );

    if (templates.length === 0) {
      return res.status(404).json({ message: "Template d'email non trouvé" });
    }

    const template = templates[0];

    // Replace variables in template
    let htmlContent = template.body
      .replace(/{parentName}/g, appointment.personName || "")
      .replace(
        /{playerName}/g,
        appointment.playerName || appointment.personName || ""
      ) // Ajoutez cette ligne
      .replace(
        /{appointmentDate}/g,
        format(new Date(appointment.date), "dd MMMM yyyy", { locale: fr })
      )
      .replace(/{appointmentTime}/g, appointment.time)
      .replace(/{appointmentType}/g, getLabelFromType(appointment.type))
      .replace(/{adminName}/g, appointment.adminName || "")
      .replace(/{notes}/g, appointment.notes || "")
      .replace(/\n/g, "<br/>");

    const mailOptions = {
      from: `"Daring Brussels Academy" <${process.env.EMAIL_USER}>`,
      to: appointment.email,
      subject: template.subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email d'annulation envoyé:", info.messageId);

    res.json({ message: "Email d'annulation envoyé avec succès." });
  } catch (err) {
    console.error("❌ Erreur envoi email d'annulation:", err);
    res.status(500).json({ error: "Erreur lors de l'envoi de l'email." });
  }
});

// Get all email templates - Mettre ces routes AU DÉBUT
router.get("/", async (req, res) => {
  try {
    const [templates] = await db.execute("SELECT * FROM emails");
    console.log("Templates trouvés:", templates);
    res.json(templates);
  } catch (err) {
    console.error("Erreur récupération templates:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Update email template - Modifiez la route PATCH existante
router.patch("/:type", async (req, res) => {
  const { type } = req.params;
  const { subject, body } = req.body;

  try {
    // Log pour débugger
    console.log("📝 Mise à jour du template:", {
      type,
      subject,
      body: body.substring(0, 100) + "...", // Log partiel du body pour ne pas surcharger
    });

    // Vérifier d'abord si le template existe
    const [existing] = await db.execute("SELECT * FROM emails WHERE type = ?", [
      type,
    ]);

    if (existing.length === 0) {
      // Si le template n'existe pas, on le crée
      const [result] = await db.execute(
        "INSERT INTO emails (type, subject, body) VALUES (?, ?, ?)",
        [type, subject, body]
      );
      console.log("✅ Nouveau template créé");
      return res.json({ message: "Template d'email créé avec succès" });
    }

    // Sinon, on met à jour le template existant
    const [result] = await db.execute(
      "UPDATE emails SET subject = ?, body = ?, updated_at = NOW() WHERE type = ?",
      [subject, body, type]
    );

    if (result.affectedRows === 0) {
      console.error("❌ Aucune ligne mise à jour pour le type:", type);
      return res.status(404).json({ message: "Template d'email non trouvé" });
    }

    console.log("✅ Template mis à jour avec succès");
    res.json({ message: "Template d'email mis à jour avec succès" });
  } catch (error) {
    console.error("❌ Erreur mise à jour template:", error);
    res.status(500).json({
      message: "Erreur serveur",
      details: error.message,
    });
  }
});

// Remplacez la route send-selection-email par send-selection-tests-email

router.post("/send-selection-tests-email", async (req, res) => {
  const { formData, requestId } = req.body;

  if (
    !formData ||
    !formData.parentEmail ||
    !formData.firstName ||
    !formData.lastName
  ) {
    return res.status(400).json({ error: "Données manquantes." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const [templates] = await db.execute(
      "SELECT * FROM emails WHERE type = ?",
      ["selection"]
    );

    if (templates.length === 0) {
      return res.status(404).json({ message: "Template d'email non trouvé" });
    }

    const template = templates[0];

    // Remplacer les variables et préserver les sauts de ligne
    let htmlContent = template.body
      // Variables existantes
      .replace(/{parentName}/g, formData.parentFirstName || "")
      .replace(/{playerName}/g, `${formData.firstName} ${formData.lastName}`)
      .replace(/{category}/g, formData.noyau || "")
      .replace(/{position}/g, formData.position || "")
      .replace(/{academy}/g, formData.academy || "")
      .replace(/{requestId}/g, requestId)

      // Nouvelles variables détaillées
      .replace(/{firstName}/g, formData.firstName || "")
      .replace(/{lastName}/g, formData.lastName || "")
      .replace(
        /{playerBirthDate}/g,
        formData.playerBirthDate
          ? new Date(formData.playerBirthDate).toLocaleDateString("fr-FR")
          : ""
      )
      .replace(/{currentClub}/g, formData.currentClub || "")
      .replace(/{previousClub}/g, formData.previousClub || "")
      .replace(/{noyau}/g, formData.noyau || "")
      .replace(
        /{testStartDate}/g,
        formData.testStartDate
          ? new Date(formData.testStartDate).toLocaleDateString("fr-FR")
          : ""
      )
      .replace(
        /{testEndDate}/g,
        formData.testEndDate
          ? new Date(formData.testEndDate).toLocaleDateString("fr-FR")
          : ""
      )

      // Informations du parent
      .replace(/{parentEmail}/g, formData.parentEmail || "")
      .replace(/{parentPhone}/g, formData.parentPhone || "")
      .replace(/{parentLastName}/g, formData.parentLastName || "")
      .replace(/{parentFirstName}/g, formData.parentFirstName || "")
      .replace(/{parentRelation}/g, formData.parentRelation || "")

      .replace(/\n/g, "<br/>");

    const mailOptions = {
      from: `"Daring Brussels Academy" <${process.env.EMAIL_USER}>`,
      to: formData.parentEmail,
      subject: template.subject.replace(/{requestId}/g, requestId),
      html: htmlContent,
    };

    console.log("Options d'email:", mailOptions);

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email envoyé:", info.messageId);

    res.json({ message: "Email de confirmation envoyé avec succès." });
  } catch (err) {
    console.error("❌ Erreur détaillée:", err);
    res.status(500).json({
      error: "Erreur lors de l'envoi de l'email",
      details: err.message,
    });
  }
});

module.exports = router;
