const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 5000; // Port du serveur proxy

// Activer CORS pour autoriser toutes les origines
app.use(cors());

const BASE_API_URL = "https://clubapi.prosoccerdata.com";
const CLUB_KEY = "ewlcdd1fdhooj8pm8qyzj98kvrrxh6hn";
const API_KEY = "3UMU0HpTYjafC8lITNAt1812UJdx67Nq30pjbCtQ";
const API_SECRET =
  "bearer gngz3n0kvrchsqx1r7is3yjg2d1m0uuhqroagwcxhze6vhk7ddffelrevzgjjufq";

// Route pour récupérer les factures des membres
app.get("/api/members-dues", async (req, res) => {
  try {
    const response = await axios.get(
      `${BASE_API_URL}/finances/overview/memberduesinvoices`,
      {
        headers: {
          "x-api-club": CLUB_KEY,
          "x-api-key": API_KEY,
          Authorization: API_SECRET,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Erreur lors de l'appel API:", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération des données" });
  }
});

app.get("/api/teams/all", async (req, res) => {
  try {
    const response = await axios.get(
      "https://clubapi.prosoccerdata.com/teams/all",
      {
        headers: {
          "Accept-Language": "fr-FR",
          "x-api-club": CLUB_KEY,
          "x-api-key": API_KEY,
          Authorization: API_SECRET,
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Erreur lors de l'appel API (teams/all):", error);
    res
      .status(error.response?.status || 500)
      .json({ message: "Erreur serveur lors de la récupération des équipes" });
  }
  console.log("Equipes reçues depuis l'API :", response.data);
});

// Lancer le serveur proxy
app.listen(PORT, () => {
  console.log(
    `🚀 Serveur proxy en cours d'exécution sur http://localhost:${PORT}`
  );
});
