const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const { format } = require("date-fns");
const { fr } = require("date-fns/locale");

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
    const transporter = nodemailer.createTransport({
      host: "smtp-auth.mailprotect.be",
      port: 587,
      secure: false,
      auth: {
        user: "info@nainnovations.be",
        pass: "mdp123",
      },
    });

    const html = `
  <p>Bonjour ${formData.parent1FirstName ?? ""},</p>

  <p>Nous vous confirmons que nous avons bien reçu la demande d'inscription de votre enfant <strong>${
    formData.firstName
  } ${formData.lastName}</strong> à la ${formData.academy} pour la saison ${
      formData.season
    }.</p>

  <p>Notre équipe administrative étudiera votre dossier dans les plus brefs délais. En cas d'acceptation, vous serez contacté pour fixer un rendez-vous au secrétariat ou pour une séance de test de sélection.</p>

  <p>📢 Restez attentif à vos emails — une réponse vous sera envoyée prochainement.</p>
      <br/>
        <p><strong>Numéro de référence de la demande :</strong> ${requestId}</p>
              <br/>
  <br/>
  <p>Cordialement,</p>
  <p><strong>RWDM Academy</strong><br/>Service des inscriptions</p>
`;

    await transporter.sendMail({
      from: '"RWDM Academy" <info@nainnovations.be>',
      to: formData.parent1Email,
      subject: `Demande d'inscription reçue – RWDM Academy (ref #${requestId})`,
      html,
    });

    res.json({ message: "Email de confirmation envoyé avec succès." });
  } catch (err) {
    console.error("❌ Erreur d'envoi :", err);
    res.status(500).json({ error: "Erreur lors de l’envoi de l’email." });
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
      host: "smtp-auth.mailprotect.be",
      port: 587,
      secure: false,
      auth: {
        user: "info@nainnovations.be",
        pass: "mdp123",
      },
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
      host: "smtp-auth.mailprotect.be",
      port: 587,
      secure: false,
      auth: {
        user: "info@nainnovations.be",
        pass: "mdp123",
      },
    });

    const isDeclaration = formData.documentLabel === "Déclaration d'accident";

    const html = isDeclaration
      ? `
          <p>Bonjour,</p>
  
          <p>Nous vous confirmons que nous avons bien reçu la <strong>déclaration d'accident</strong> concernant le joueur 
          <strong>${formData.playerFirstName} ${formData.playerLastName}</strong>.</p>
  
          <p>
            <strong style="color:#c53030; font-size: 18px;">IMPORTANT :</strong><br/>
            Conservez précieusement le code ci-dessous. Il vous sera demandé plus tard pour téléverser le <strong>certificat de guérison</strong>.
          </p>
  
          <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border: 2px dashed #c53030; text-align: center;">
            <p style="font-size: 22px; font-weight: bold; color: #c53030; letter-spacing: 2px;">
              ${formData.codeDossier}
            </p>
          </div>
  
          <p>
            Sans ce code, vous ne pourrez pas finaliser la procédure de remboursement auprès de l’Union belge.<br/>
            Gardez-le en lieu sûr ou imprimez ce mail si besoin.
          </p>
  
          <p><strong>Numéro de référence de la déclaration :</strong> ${requestId}</p>
  
          <br/>
          <p>Cordialement,</p>
          <p><strong>RWDM Academy</strong><br/>Cellule médicale</p>
        `
      : `
          <p>Bonjour,</p>
  
          <p>Merci pour l’envoi du <strong>certificat de guérison</strong> concernant le joueur 
          <strong>${formData.playerFirstName} ${formData.playerLastName}</strong>.</p>
  
          <p>
            🩺 Votre document a bien été reçu par le club. Il sera prochainement vérifié par notre cellule médicale.</p>

             <p>
            Vous recevrez une confirmation ou des instructions supplémentaires par email dès que le traitement aura été effectué.
          </p>
  
          <br/>
          <p>Cordialement,</p>
          <p><strong>RWDM Academy</strong><br/>Cellule médicale</p>
        `;

    const subject = isDeclaration
      ? `Déclaration d'accident reçue – RWDM Academy (ref #${requestId})`
      : `Certificat de guérison reçu – RWDM Academy (ref #${requestId})`;

    await transporter.sendMail({
      from: '"RWDM Academy" <info@nainnovations.be>',
      to: formData.email,
      subject,
      html,
    });

    res.json({ message: "Email de confirmation envoyé avec succès." });
  } catch (err) {
    console.error("❌ Erreur d'envoi :", err);
    res.status(500).json({ error: "Erreur lors de l’envoi de l’email." });
  }
});

router.post("/send-waiver-email", async (req, res) => {
  const { formData, requestId } = req.body;

  if (
    !formData ||
    !formData.parentEmail ||
    !formData.parentFirstName ||
    !formData.parentLastName ||
    !formData.playerFirstName ||
    !formData.playerLastName
  ) {
    return res.status(400).json({ error: "Données manquantes." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-auth.mailprotect.be",
      port: 587,
      secure: false,
      auth: {
        user: "info@nainnovations.be",
        pass: "mdp123",
      },
    });

    const html = `
        <p>Bonjour ${formData.parentFirstName},</p>
  
        <p>Nous vous confirmons que la <strong>décharge de responsabilité</strong> pour le joueur
        <strong>${formData.playerFirstName} ${formData.playerLastName}</strong> a bien été reçue.</p>
  
        <p>
          📝 Elle sera analysée et validée prochainement par notre cellule administrative.<br/>
          Vous serez tenu(e) informé(e) par email une fois la procédure finalisée.
        </p>
  
        <p><strong>Numéro de référence :</strong> ${requestId}</p>
  
        <br/>
        <p>Cordialement,</p>
        <p><strong>RWDM Academy</strong><br/>Administration</p>
      `;

    await transporter.sendMail({
      from: '"RWDM Academy" <info@nainnovations.be>',
      to: formData.parentEmail,
      subject: `Décharge de responsabilité reçue – RWDM Academy (ref #${requestId})`,
      html,
    });

    res.json({ message: "Email de confirmation envoyé avec succès." });
  } catch (err) {
    console.error("❌ Erreur d'envoi :", err);
    res.status(500).json({ error: "Erreur lors de l’envoi de l’email." });
  }
});

router.post("/send-contact-message", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-auth.mailprotect.be",
      port: 587,
      secure: false,
      auth: {
        user: "info@nainnovations.be",
        pass: "mdp123",
      },
    });

    const html = `
        <h2>📬 Nouveau message reçu depuis le formulaire de contact</h2>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Sujet :</strong> ${subject}</p>
        <p><strong>Message :</strong><br/>${message.replace(/\n/g, "<br/>")}</p>
      `;

    await transporter.sendMail({
      from: '"RWDM Academy – Contact" <info@nainnovations.be>', // ✅ SPF OK
      to: "info@nainnovations.be",
      replyTo: email, // ✅ pour répondre au visiteur
      subject: `📬 Nouveau message via formulaire de contact : ${subject}`,
      html,
    });

    res.json({ message: "Message envoyé avec succès." });
  } catch (err) {
    console.error("❌ Erreur lors de l'envoi du message :", err);
    res.status(500).json({ error: "Erreur lors de l'envoi du message." });
  }
});

router.post("/send-decision-email", async (req, res) => {
  const { formData, requestId, decision, requestType } = req.body;

  if (!formData || !requestId || !decision || !requestType)
    return res.status(400).json({ error: "Données manquantes." });

  /* ── 1.  Petit helper pour traduire le type ─────────── */
  const typeLabels = {
    registration: "inscription à l'académie",
    "selection-tests": "test de sélection",
    "accident-report": "déclaration d'accident",
    "responsibility-waiver": "décharge de responsabilité",
  };
  const typeLabel = typeLabels[requestType] ?? "votre demande";

  /* ── 2.  Transporter nodemailer identique ───────────── */
  const transporter = nodemailer.createTransport({
    host: "smtp-auth.mailprotect.be",
    port: 587,
    secure: false,
    auth: { user: "info@nainnovations.be", pass: "mdp123" },
  });

  /* ── 3.  Objet & contenu dynamiques ─────────────────── */
  const accepted = decision === "accepted";
  const subject = accepted
    ? `Votre demande est acceptée – RWDM Academy (ref #${requestId})`
    : `Votre demande est refusée – RWDM Academy (ref #${requestId})`;

  const html = accepted
    ? `
          <p>Bonjour ${
            formData.parentFirstName ?? formData.firstName ?? "Madame, Monsieur"
          },</p>
          <p>✅ Bonne nouvelle ! Votre <strong>${typeLabel}</strong> (réf ${requestId}) a été <strong>acceptée</strong> par la direction de la RWDM Academy.</p>
          <p>Nous reviendrons rapidement vers vous pour la suite.</p>
          <p>Cordialement,<br/>RWDM Academy</p>
        `
    : `
          <p>Bonjour ${
            formData.parentFirstName ?? formData.firstName ?? "Madame, Monsieur"
          },</p>
          <p>Nous sommes au regret de vous informer que <strong>${typeLabel}</strong> (réf ${requestId}) a été <strong>refusée</strong> par la direction de la RWDM Academy.</p>
          <p>Cordialement,<br/>RWDM Academy</p>
        `;

  /* ── 4.  Envoi ───────────────────────────────────────── */
  await transporter.sendMail({
    from: '"RWDM Academy" <info@nainnovations.be>',
    to: formData.email || formData.parent1Email || formData.parentEmail,
    subject,
    html,
  });

  res.json({ message: "Email de décision envoyé avec succès." });
});

router.post("/send-appointment-confirmation", async (req, res) => {
  const { appointment } = req.body;

  // Sécurité minimale
  if (!appointment || !appointment.email) {
    return res.status(400).json({ error: "Données manquantes." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-auth.mailprotect.be",
      port: 587,
      secure: false,
      auth: {
        user: "info@nainnovations.be",
        pass: "mdp123",
      },
    });

    // On formate un petit résumé
    const { date, time, type, personName, adminName } = appointment;

    const html = `
    <p>Bonjour ${personName ?? "Madame, Monsieur"},</p>
  
    <p>
      Nous avons le plaisir de vous confirmer la planification de votre rendez-vous avec l'équipe RWDM Academy.
    </p>
  
    <p><strong>Détails du rendez-vous :</strong></p>
  
    <table style="margin: 16px 0; border-collapse: collapse; font-size: 15px;">
      <tr>
        <td style="padding: 4px 8px;"><strong>Date :</strong></td>
        <td style="padding: 4px 8px;">${format(new Date(date), "dd MMMM yyyy", {
          locale: fr,
        })}</td>
      </tr>
      <tr>
        <td style="padding: 4px 8px;"><strong>Heure :</strong></td>
        <td style="padding: 4px 8px;">${time}</td>
      </tr>
      <tr>
        <td style="padding: 4px 8px;"><strong>Type de rendez-vous :</strong></td>
        <td style="padding: 4px 8px;">${getLabelFromType(type)}</td>
      </tr>
      ${
        adminName
          ? `<tr>
              <td style="padding: 4px 8px;"><strong>Administrateur référent :</strong></td>
              <td style="padding: 4px 8px;">${adminName}</td>
            </tr>`
          : ""
      }
      <tr>
        <td style="padding: 4px 8px;"><strong>Lieu :</strong></td>
        <td style="padding: 4px 8px;">
          Avenue Charles Malis 61<br/>
          1080 Molenbeek-Saint-Jean<br/>
          <em>Direction de l'académie du club</em>
        </td>
      </tr>
    </table>
  
    <p>
      Nous vous remercions de vous présenter à l'heure convenue. En cas d'indisponibilité, merci de nous contacter dès que possible afin de convenir d'un autre créneau.
    </p>
  
    <p>Bien cordialement,</p>
  
    <p>
      <strong>RWDM Academy</strong><br/>
      Cellule administrative
    </p>
  `;

    await transporter.sendMail({
      from: '"RWDM Academy" <info@nainnovations.be>',
      to: appointment.email,
      subject: "Confirmation de rendez‑vous – RWDM Academy",
      html,
    });

    res.json({ message: "Email de confirmation envoyé avec succès." });
  } catch (err) {
    console.error("❌ Erreur envoi rendez‑vous :", err);
    res.status(500).json({ error: "Erreur lors de l’envoi de l’email." });
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
      host: "smtp-auth.mailprotect.be",
      port: 587,
      secure: false,
      auth: {
        user: "info@nainnovations.be",
        pass: "mdp123",
      },
    });

    // ✅ formatage date + heure
    const { format } = require("date-fns");
    const { fr } = require("date-fns/locale");
    const formattedDate = format(new Date(appointment.date), "dd/MM/yyyy", {
      locale: fr,
    });
    const formattedTime = appointment.time;

    const html = `
        <p>Bonjour ${appointment.personName},</p>
        <p>Nous vous informons que votre rendez-vous prévu le <strong>${formattedDate}</strong> à <strong>${formattedTime}</strong> a été <strong>annulé</strong>.</p>
        <p>Pour toute question, n'hésitez pas à nous contacter.</p>
        <br/>
        <p>Cordialement,<br/>RWDM Academy</p>
      `;

    await transporter.sendMail({
      from: '"RWDM Academy" <info@nainnovations.be>',
      to: appointment.email,
      subject: `Rendez-vous annulé – RWDM Academy`,
      html,
    });

    res.json({ message: "Email d’annulation envoyé avec succès." });
  } catch (err) {
    console.error("❌ Erreur envoi email rendez-vous :", err);
    res.status(500).json({ error: "Erreur lors de l’envoi de l’email." });
  }
});

module.exports = router;
