const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-auth.mailprotect.be",
  port: 587,
  secure: false,
  auth: {
    user: "info@nainnovations.be",
    pass: "mdp123",
  },
});

const sendEmail = async () => {
  const info = await transporter.sendMail({
    from: '"RWDM Academy" <info@nainnovations.be>',
    to: "ajr212ajr@hotmail.com",
    subject: "Test de mail RWDM 🚀",
    text: "Ceci est un test depuis la plateforme.",
    html: "<b>Ceci est un test depuis la plateforme RWDM.</b>",
  });

  console.log("✅ Mail envoyé :", info.messageId);
};

sendEmail().catch(console.error);
