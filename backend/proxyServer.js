const express = require("express");
const cors = require("cors");
const axios = require("axios");
const db = require("./db"); // Assurez-vous d'avoir la configuration DB

const app = express();
const PORT = 5001; // Port du serveur proxy

app.use(cors());
app.use(express.json());

// Fonction pour récupérer les paramètres API de la base de données
async function getApiSettings() {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM api_settings ORDER BY id DESC LIMIT 1"
    );
    if (rows.length === 0) {
      throw new Error("Paramètres API non trouvés");
    }
    return rows[0];
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres API:", error);

    // Utiliser les valeurs hardcodées en fallback
    return {
      base_url: "https://clubapi.prosoccerdata.com",
      club_key: "ewlcdd1fdhooj8pm8qyzj98kvrrxh6hn",
      api_key: "3UMU0HpTYjafC8lITNAt1812UJdx67Nq30pjbCtQ",
      api_secret:
        "bearer gngz3n0kvrchsqx1r7is3yjg2d1m0uuhqroagwcxhze6vhk7ddffelrevzgjjufq",
    };
  }
}

async function fetchAllInvoices(baseUrl, clubKey, apiKey, apiSecret, teamIds) {
  let allInvoices = [];
  let currentPage = 1;
  let totalPages = 1;

  do {
    const response = await axios.get(
      `${baseUrl}/finances/overview/memberduesinvoices`,
      {
        headers: {
          "x-api-club": clubKey,
          "x-api-key": apiKey,
          Authorization: apiSecret,
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
    // Récupérer les paramètres API
    const settings = await getApiSettings();

    // Récupérer toutes les équipes
    const teamsResponse = await axios.get(`${settings.base_url}/teams/all`, {
      headers: {
        "Accept-Language": "fr-FR",
        "x-api-club": settings.club_key,
        "x-api-key": settings.api_key,
        Authorization: settings.api_secret,
        "Content-Type": "application/json",
      },
    });

    // Extraction des équipes
    const teamsData = teamsResponse.data.items || teamsResponse.data;
    const teamIds = Array.isArray(teamsData)
      ? teamsData.map((team) => team.id)
      : [];

    // Récupérer toutes les factures en parcourant toutes les pages
    const allInvoices = await fetchAllInvoices(
      settings.base_url,
      settings.club_key,
      settings.api_key,
      settings.api_secret,
      teamIds
    );

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

// Ajouter le router des paramètres API
const apiSettingsRouter = require("./routes/apiSettings");
app.use("/api/api-settings", apiSettingsRouter);

// Lancer le serveur proxy
app.listen(PORT, () => {
  console.log(
    `🚀 Serveur proxy en cours d'exécution sur http://localhost:${PORT}`
  );
});
