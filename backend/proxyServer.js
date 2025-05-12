const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 5001; // Port du serveur proxy

// Activer CORS pour autoriser toutes les origines
app.use(cors());

const BASE_API_URL = "https://clubapi.prosoccerdata.com";
const CLUB_KEY = "ewlcdd1fdhooj8pm8qyzj98kvrrxh6hn";
const API_KEY = "3UMU0HpTYjafC8lITNAt1812UJdx67Nq30pjbCtQ";
const API_SECRET =
  "bearer gngz3n0kvrchsqx1r7is3yjg2d1m0uuhqroagwcxhze6vhk7ddffelrevzgjjufq";

async function fetchAllInvoices(teamIds) {
  let allInvoices = [];
  let currentPage = 1;
  let totalPages = 1;

  do {
    const response = await axios.get(
      `${BASE_API_URL}/finances/overview/memberduesinvoices`,
      {
        headers: {
          "x-api-club": CLUB_KEY,
          "x-api-key": API_KEY,
          Authorization: API_SECRET,
          "Content-Type": "application/json",
        },
        params: {
          statuses: ["not_sent", "paid", "open", "too_late", "credited"],
          teamIds: teamIds, // ou commentez cette ligne pour tester sans filtrage sur teamIds
          page: currentPage,
          size: 100,
        },
      }
    );

    const data = response.data;
    let invoices = [];

    // Extraction des factures selon le format de la réponse
    if (data.content && Array.isArray(data.content)) {
      invoices = data.content;
    } else if (data.items && Array.isArray(data.items)) {
      invoices = data.items;
    } else if (Array.isArray(data)) {
      invoices = data;
    } else {
      invoices = [data];
    }

    allInvoices = allInvoices.concat(invoices);

    // Détermination du nombre total de pages
    if (data.totalPages) {
      totalPages = data.totalPages;
    } else if (data.pageable && typeof data.pageable.pageNumber === "number") {
      totalPages = data.pageable.pageNumber + 1; // Si pageNumber est 0-indexé
    } else {
      totalPages = currentPage; // Arrêter après la première page si non précisé
    }
    currentPage++;
  } while (currentPage <= totalPages);

  return allInvoices;
}

// Endpoint mis à jour pour renvoyer directement le tableau complet de factures
app.get("/api/members-dues", async (req, res) => {
  try {
    // Récupérer toutes les équipes pour obtenir leurs identifiants
    const teamsResponse = await axios.get(`${BASE_API_URL}/teams/all`, {
      headers: {
        "Accept-Language": "fr-FR",
        "x-api-club": CLUB_KEY,
        "x-api-key": API_KEY,
        Authorization: API_SECRET,
        "Content-Type": "application/json",
      },
    });

    // Extraction en tenant compte d'une éventuelle structure { items: [...] }
    const teamsData = teamsResponse.data.items || teamsResponse.data;
    const teamIds = Array.isArray(teamsData)
      ? teamsData.map((team) => team.id)
      : [];

    // Récupérer toutes les factures en parcourant toutes les pages
    const allInvoices = await fetchAllInvoices(teamIds);

    // Renvoi uniquement du tableau d'invoices (sans infos de pagination)
    res.json(allInvoices);
  } catch (error) {
    console.error("Erreur lors de l'appel API:", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération des données" });
  }
});

app.get("/api/teams/all", async (req, res) => {
  try {
    const response = await axios.get(`${BASE_API_URL}/teams/all`, {
      headers: {
        "Accept-Language": "fr-FR",
        "x-api-club": CLUB_KEY,
        "x-api-key": API_KEY,
        Authorization: API_SECRET,
        "Content-Type": "application/json",
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Erreur lors de l'appel API (teams/all):", error);
    res
      .status(error.response?.status || 500)
      .json({ message: "Erreur serveur lors de la récupération des équipes" });
  }
});

app.get("/api/teams/player-counts", async (req, res) => {
  try {
    const teamsRes = await axios.get(`${BASE_API_URL}/teams/all`, {
      headers: {
        "Accept-Language": "fr-FR",
        "x-api-club": CLUB_KEY,
        "x-api-key": API_KEY,
        Authorization: API_SECRET,
        "Content-Type": "application/json",
      },
    });

    const teams = teamsRes.data.items || teamsRes.data;

    // Pour chaque équipe, on récupère les membres
    const results = await Promise.all(
      teams.map(async (team) => {
        try {
          const membersRes = await axios.get(
            `${BASE_API_URL}/teams/${team.id}/members`,
            {
              headers: {
                "x-api-club": CLUB_KEY,
                "x-api-key": API_KEY,
                Authorization: API_SECRET,
                "Content-Type": "application/json",
              },
            }
          );

          const members = membersRes.data.content || membersRes.data || [];
          const playerCount = members.filter((m) => m.player === true).length;

          return {
            teamId: team.id,
            teamName: team.name,
            playerCount,
          };
        } catch (err) {
          console.warn(`❌ Erreur pour l’équipe ID ${team.id}:`, err.message);
          return {
            teamId: team.id,
            teamName: team.name,
            playerCount: 0,
          };
        }
      })
    );

    res.json(results);
  } catch (error) {
    console.error("Erreur récupération des équipes/membres :", error);
    res.status(500).json({
      message: "Erreur serveur lors du comptage des joueurs par équipe",
    });
  }
});

// juste avant app.listen(...)
app.get("/api/teams/:id/members", async (req, res) => {
  const teamId = req.params.id;
  try {
    const membersRes = await axios.get(
      `${BASE_API_URL}/teams/${teamId}/members`,
      {
        headers: {
          "x-api-club": CLUB_KEY,
          "x-api-key": API_KEY,
          Authorization: API_SECRET,
          "Content-Type": "application/json",
        },
      }
    );
    // la data peut être dans .content ou pas
    const members = Array.isArray(membersRes.data.content)
      ? membersRes.data.content
      : Array.isArray(membersRes.data)
      ? membersRes.data
      : [];
    res.json(members);
  } catch (err) {
    console.error(`Erreur membres équipe ${teamId}:`, err);
    res.status(500).json({ message: "Impossible de récupérer les membres" });
  }
});

// Lancer le serveur proxy
app.listen(PORT, () => {
  console.log(
    `🚀 Serveur proxy en cours d'exécution sur http://localhost:${PORT}`
  );
});
