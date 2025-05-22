const express = require("express");
const router = express.Router();
const db = require("../db");

// GET - Récupérer les paramètres API
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, base_url, club_key, api_key, created_at, updated_at FROM api_settings ORDER BY id DESC LIMIT 1"
    );

    if (rows.length === 0) {
      return res.json({
        base_url: "https://clubapi.prosoccerdata.com",
        club_key: "",
        api_key: "",
      });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres API:", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des paramètres",
    });
  }
});

// PUT - Mettre à jour les paramètres API
router.put("/", async (req, res) => {
  const { base_url, club_key, api_key, api_secret } = req.body;

  if (!base_url || !club_key || !api_key) {
    return res.status(400).json({
      message: "Les champs base_url, club_key et api_key sont obligatoires",
    });
  }

  try {
    // Tester si une entrée existe déjà
    const [existingRows] = await db.execute(
      "SELECT id FROM api_settings LIMIT 1"
    );

    if (existingRows.length > 0) {
      // Mise à jour
      const query = api_secret
        ? "UPDATE api_settings SET base_url = ?, club_key = ?, api_key = ?, api_secret = ?, updated_at = NOW() ORDER BY id DESC LIMIT 1"
        : "UPDATE api_settings SET base_url = ?, club_key = ?, api_key = ?, updated_at = NOW() ORDER BY id DESC LIMIT 1";

      const params = api_secret
        ? [base_url, club_key, api_key, api_secret]
        : [base_url, club_key, api_key];

      await db.execute(query, params);
    } else {
      // Création
      const query =
        "INSERT INTO api_settings (base_url, club_key, api_key, api_secret, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())";
      await db.execute(query, [
        base_url,
        club_key,
        api_key,
        api_secret || null,
      ]);
    }

    return res.json({
      success: true,
      message: "Paramètres API mis à jour avec succès",
      connectionTested: false,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des paramètres API:", error);
    res.status(500).json({
      message: "Erreur serveur lors de la mise à jour des paramètres",
    });
  }
});

// PUT - Tester la connexion API
router.put("/test", async (req, res) => {
  const { base_url, club_key, api_key, api_secret } = req.body;
  const axios = require("axios");

  if (!base_url || !club_key || !api_key) {
    return res.status(400).json({
      success: false,
      message: "Les champs base_url, club_key et api_key sont obligatoires",
    });
  }

  try {
    const response = await axios.get(`${base_url}/teams/all`, {
      headers: {
        "Accept-Language": "fr-FR",
        "x-api-club": club_key,
        "x-api-key": api_key,
        Authorization: api_secret,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      return res.json({
        success: true,
        message: t("api.success"),
      });
    } else {
      return res.json({
        success: false,
        message: `Échec de la connexion avec code: ${response.status}`,
      });
    }
  } catch (error) {
    console.error("Erreur lors du test de connexion:", error);

    let errorMessage = "Échec de la connexion à Pro Soccer Data.";
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage =
          "Authentification refusée. Vérifiez vos clés API et secret.";
      } else {
        errorMessage = `Erreur ${error.response.status}: ${
          error.response.data.message || "Paramètres incorrects"
        }`;
      }
    }

    return res.json({
      success: false,
      message: errorMessage,
    });
  }
});

module.exports = router;
