const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safeName = Date.now() + "-" + file.originalname.replace(/\s/g, "");
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // Max 1 Mo
});

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

  const isBase64 = (str) =>
    typeof str === "string" && !str.startsWith("/uploads/") && str.length > 100;

  const tooBig = (img) => isBase64(img) && img.length * 0.75 > maxBase64Size;

  const stripIfAlreadyUploaded = (img) =>
    typeof img === "string" && img.startsWith("/uploads/") ? img : "";

  try {
    // 🔁 Nettoie les images déjà uploadées AVANT de faire les vérifications
    settingsData.general.logo = stripIfAlreadyUploaded(
      settingsData.general.logo
    );
    settingsData.about.historyPhoto = stripIfAlreadyUploaded(
      settingsData.about.historyPhoto
    );
    settingsData.about.missionPhoto = stripIfAlreadyUploaded(
      settingsData.about.missionPhoto
    );
    settingsData.about.approachPhoto = stripIfAlreadyUploaded(
      settingsData.about.approachPhoto
    );
    settingsData.about.academyPhotos1 = stripIfAlreadyUploaded(
      settingsData.about.academyPhotos1
    );
    settingsData.about.academyPhotos2 = stripIfAlreadyUploaded(
      settingsData.about.academyPhotos2
    );
    settingsData.about.academyPhotos3 = stripIfAlreadyUploaded(
      settingsData.about.academyPhotos3
    );

    // 📦 Vérifie uniquement les éventuels nouveaux encodages base64
    const imagesToCheck = [
      settingsData.general.logo,
      settingsData.about.historyPhoto,
      settingsData.about.missionPhoto,
      settingsData.about.approachPhoto,
      settingsData.about.academyPhotos1,
      settingsData.about.academyPhotos2,
      settingsData.about.academyPhotos3,
    ];

    for (const img of imagesToCheck) {
      if (tooBig(img)) {
        return res.status(400).json({
          error: "Une des images encodées est trop volumineuse (max 1 Mo).",
        });
      }
    }

    // 🔎 Vérification taille totale du JSON simulée
    const totalSize = Buffer.byteLength(JSON.stringify(settingsData), "utf8");
    if (totalSize > 2 * 1024 * 1024) {
      return res.status(400).json({
        error: `Les données envoyées sont trop volumineuses (${(
          totalSize /
          1024 /
          1024
        ).toFixed(2)} Mo).`,
      });
    }

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

router.post("/upload/image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier envoyé." });
  }

  // Retourne le chemin relatif utilisable côté frontend
  const filePath = `/uploads/${req.file.filename}`;
  res.json({ filePath });
});

router.delete("/upload/image", (req, res) => {
  const { filePath } = req.body;
  if (!filePath) return res.status(400).json({ error: "Aucun chemin fourni." });

  const fullPath = path.join(__dirname, "../", filePath);

  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error("Erreur suppression fichier :", err);
        return res
          .status(500)
          .json({ error: "Erreur lors de la suppression du fichier." });
      }
      return res.json({ message: "Fichier supprimé avec succès." });
    });
  } else {
    return res.status(404).json({ error: "Fichier introuvable." });
  }
});

// Mettre à jour l'état de maintenance d'un formulaire
router.put("/form-maintenance/:formType", async (req, res) => {
  const { formType } = req.params;
  const { is_maintenance, maintenance_message } = req.body;

  try {
    console.log(
      `Form maintenance toggle (PUT): ${formType} = ${is_maintenance}`
    );

    const connection = await mysql.createConnection(dbConfig);

    // Use form_type to match the DB column
    const [existingRecord] = await connection.execute(
      "SELECT * FROM form_maintenance WHERE form_type = ?",
      [formType]
    );

    if (is_maintenance !== undefined) {
      if (existingRecord.length === 0) {
        await connection.execute(
          "INSERT INTO form_maintenance (form_type, is_maintenance) VALUES (?, ?)",
          [formType, is_maintenance ? 1 : 0]
        );
      } else {
        await connection.execute(
          "UPDATE form_maintenance SET is_maintenance = ? WHERE form_type = ?",
          [is_maintenance ? 1 : 0, formType]
        );
      }
    }

    // Handle maintenance message if provided
    if (maintenance_message) {
      if (existingRecord.length === 0) {
        await connection.execute(
          "INSERT INTO form_maintenance (form_type, maintenance_message_json) VALUES (?, ?)",
          [formType, JSON.stringify(maintenance_message)]
        );
      } else {
        await connection.execute(
          "UPDATE form_maintenance SET maintenance_message_json = ? WHERE form_type = ?",
          [JSON.stringify(maintenance_message), formType]
        );
      }
    }

    await connection.end();
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating maintenance status:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Handle POST requests the same way as PUT
router.post("/form-maintenance/:formType", async (req, res) => {
  const { formType } = req.params;
  const { is_maintenance, maintenance_message } = req.body;

  try {
    console.log(
      `Form maintenance toggle (POST): ${formType} = ${is_maintenance}`
    );

    const connection = await mysql.createConnection(dbConfig);
    const [existingRecord] = await connection.execute(
      "SELECT * FROM form_maintenance WHERE form_type = ?", // Changed from form_key
      [formType]
    );

    if (is_maintenance !== undefined) {
      if (existingRecord.length === 0) {
        await connection.execute(
          "INSERT INTO form_maintenance (form_type, is_maintenance) VALUES (?, ?)", // Changed from form_key
          [formType, is_maintenance ? 1 : 0]
        );
      } else {
        await connection.execute(
          "UPDATE form_maintenance SET is_maintenance = ? WHERE form_type = ?", // Changed from form_key
          [is_maintenance ? 1 : 0, formType]
        );
      }
    }

    // Handle maintenance message
    if (maintenance_message) {
      if (existingRecord.length === 0) {
        await connection.execute(
          "INSERT INTO form_maintenance (form_type, maintenance_message_json) VALUES (?, ?)", // Changed from form_key
          [formType, JSON.stringify(maintenance_message)]
        );
      } else {
        await connection.execute(
          "UPDATE form_maintenance SET maintenance_message_json = ? WHERE form_type = ?", // Changed from form_key
          [JSON.stringify(maintenance_message), formType]
        );
      }
    }

    await connection.end();
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating maintenance status:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtenir tous les états de maintenance
router.get("/form-maintenance", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute("SELECT * FROM form_maintenance");
    await connection.end();

    console.log("Form maintenance raw data:", rows);

    const states = rows.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.form_type]: curr.is_maintenance === 1,
      }),
      {}
    );

    console.log("Sending maintenance states:", states);

    const messages = rows.reduce((acc, curr) => {
      let parsedMessages;
      try {
        parsedMessages = JSON.parse(curr.maintenance_message_json || "{}");
      } catch {
        parsedMessages = { FR: "", NL: "", EN: "" };
      }

      return {
        ...acc,
        [curr.form_type]: parsedMessages, // Match with form_type
      };
    }, {});

    res.json({ states, messages });
  } catch (error) {
    console.error("Error fetching maintenance states:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route pour récupérer les formulaires
router.get("/accident-forms", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [forms] = await connection.execute(
      "SELECT * FROM accident_declaration_forms WHERE is_active = 1"
    );
    await connection.end();

    res.json({ forms });
  } catch (error) {
    console.error("Erreur lors de la récupération des formulaires:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route pour uploader un formulaire
router.post(
  "/accident-forms/upload",
  upload.single("pdfFile"),
  async (req, res) => {
    if (!req.file || !req.body.language) {
      return res.status(400).json({ error: "Fichier ou langue manquant" });
    }

    // S'assurer que le dossier forms existe
    const formsDir = path.join(__dirname, "../uploads/forms");
    if (!fs.existsSync(formsDir)) {
      fs.mkdirSync(formsDir, { recursive: true });
    }

    // Déplacer le fichier dans le dossier forms
    const oldPath = req.file.path;
    const filename = path.basename(oldPath);
    const newPath = path.join(formsDir, filename);

    fs.renameSync(oldPath, newPath);

    const { language } = req.body;
    const filePath = `/uploads/forms/${filename}`;

    try {
      const connection = await mysql.createConnection(dbConfig);

      // Vérifier si un formulaire existe déjà pour cette langue
      const [existingForms] = await connection.execute(
        "SELECT id, file_path FROM accident_declaration_forms WHERE language = ? AND is_active = 1",
        [language]
      );

      // Si un formulaire existant est trouvé
      if (existingForms && existingForms.length > 0) {
        const oldForm = existingForms[0];
        const oldFilePath = oldForm.file_path;

        // Mettre à jour l'entrée existante plutôt que d'en créer une nouvelle
        await connection.execute(
          "UPDATE accident_declaration_forms SET file_path = ?, original_filename = ?, file_size = ? WHERE id = ?",
          [filePath, req.file.originalname, req.file.size, oldForm.id]
        );

        // Supprimer l'ancien fichier du système de fichiers
        try {
          const oldFullPath = path.join(
            __dirname,
            "..",
            oldFilePath.startsWith("/") ? oldFilePath.substring(1) : oldFilePath
          );
          if (fs.existsSync(oldFullPath)) {
            fs.unlinkSync(oldFullPath);
            console.log(`Ancien fichier supprimé: ${oldFullPath}`);
          }
        } catch (fileError) {
          console.error(
            `Erreur lors de la suppression de l'ancien fichier: ${fileError}`
          );
          // On continue même si la suppression du fichier échoue
        }
      } else {
        // Pas de formulaire existant, créer une nouvelle entrée
        await connection.execute(
          "INSERT INTO accident_declaration_forms (language, file_path, original_filename, file_size, is_active) VALUES (?, ?, ?, ?, 1)",
          [language, filePath, req.file.originalname, req.file.size]
        );
      }

      await connection.end();

      res.json({
        success: true,
        filePath,
        message: `Formulaire ${language} mis à jour`,
      });
    } catch (error) {
      console.error("Erreur lors de l'upload du formulaire:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
);

// Route pour télécharger un formulaire d'accident
router.get("/accident-forms/download/:language", async (req, res) => {
  try {
    const { language } = req.params;

    // Valider le paramètre de langue
    if (language !== "FR" && language !== "NL") {
      return res.status(400).json({ error: "Langue invalide" });
    }

    // Créer une connexion à la base de données
    const connection = await mysql.createConnection(dbConfig);

    // Récupérer les informations du fichier dans la base de données
    const [forms] = await connection.execute(
      "SELECT file_path, original_filename FROM accident_declaration_forms WHERE language = ? AND is_active = 1",
      [language]
    );

    // Fermer la connexion
    await connection.end();

    // Si aucun formulaire n'est trouvé, retourner une erreur claire
    if (!forms || forms.length === 0) {
      return res.status(404).json({
        error: `Aucun formulaire ${language} n'a été configuré. Veuillez contacter l'administrateur.`,
      });
    }

    // Utiliser le fichier trouvé en base de données
    const { file_path, original_filename } = forms[0];

    // Construire le chemin correct
    const relativePath = file_path.startsWith("/")
      ? file_path.substring(1)
      : file_path;
    const filePath = path.join(__dirname, "..", relativePath);
    const fileName = original_filename || path.basename(file_path);

    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      console.error(`Fichier non trouvé: ${filePath}`);
      return res.status(404).json({
        error: `Le fichier '${fileName}' n'a pas été trouvé sur le serveur.`,
      });
    }

    console.log(`Envoi du fichier: ${filePath}, nom: ${fileName}`);

    // Définir les headers pour le téléchargement
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    // Envoyer le fichier
    const fileStream = fs.createReadStream(filePath);
    fileStream.on("error", (err) => {
      console.error(`Erreur lors de la lecture du fichier: ${err}`);
      return res
        .status(500)
        .json({ error: "Erreur lors de la lecture du fichier" });
    });

    fileStream.pipe(res);
  } catch (error) {
    console.error("Erreur lors du téléchargement du formulaire:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// COMPATIBILITY ROUTE - Using GET method to avoid proxying issues
router.get("/form-maintenance/:formType/toggle", async (req, res) => {
  const { formType } = req.params;
  const is_maintenance = req.query.enabled === "true";

  try {
    console.log(
      `Form maintenance toggle (GET): ${formType} = ${is_maintenance}`
    );

    const connection = await mysql.createConnection(dbConfig);

    // Check if record exists
    const [existingRecord] = await connection.execute(
      "SELECT * FROM form_maintenance WHERE form_type = ?",
      [formType]
    );

    if (existingRecord.length === 0) {
      // Insert new record
      await connection.execute(
        "INSERT INTO form_maintenance (form_type, is_maintenance) VALUES (?, ?)",
        [formType, is_maintenance ? 1 : 0]
      );
    } else {
      // Update existing record
      await connection.execute(
        "UPDATE form_maintenance SET is_maintenance = ? WHERE form_type = ?",
        [is_maintenance ? 1 : 0, formType]
      );
    }

    await connection.end();
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating maintenance status:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// COMPATIBILITY ROUTE - For message updates via GET
router.get("/form-maintenance/:formType/message", async (req, res) => {
  const { formType } = req.params;
  let maintenance_message;

  try {
    if (req.query.content) {
      maintenance_message = JSON.parse(decodeURIComponent(req.query.content));
    }

    if (!maintenance_message) {
      return res.status(400).json({
        success: false,
        error: "Missing message content",
      });
    }

    const connection = await mysql.createConnection(dbConfig);
    const [existingRecord] = await connection.execute(
      "SELECT * FROM form_maintenance WHERE form_type = ?",
      [formType]
    );

    if (existingRecord.length === 0) {
      await connection.execute(
        "INSERT INTO form_maintenance (form_type, maintenance_message_json) VALUES (?, ?)",
        [formType, JSON.stringify(maintenance_message)]
      );
    } else {
      await connection.execute(
        "UPDATE form_maintenance SET maintenance_message_json = ? WHERE form_type = ?",
        [JSON.stringify(maintenance_message), formType]
      );
    }

    await connection.end();
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating maintenance message:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
