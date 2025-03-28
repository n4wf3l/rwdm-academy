import AdminLayout from "@/components/AdminLayout";
import React, { useEffect, useState, useMemo } from "react";

const API_MEMBERS_DUES_URL = "http://localhost:5000/api/members-dues";
const API_TEAMS_ALL_URL = "http://localhost:5000/api/teams/all";

const Graphics = () => {
  const [invoices, setInvoices] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // États pour le filtrage
  const [filterStatus, setFilterStatus] = useState("all"); // "all", "paid", "unpaid"
  const [filterPlayer, setFilterPlayer] = useState("");
  const [filterTeam, setFilterTeam] = useState("all"); // "all" ou nom d'équipe
  const teamOptions = [
    "Toutes",
    ...Array.from(
      new Set(
        invoices.map((invoice) => invoice.revenueItemName).filter(Boolean)
      )
    ),
  ];

  useEffect(() => {
    // Récupération des factures
    const fetchInvoices = async () => {
      try {
        const response = await fetch(API_MEMBERS_DUES_URL);
        if (!response.ok)
          throw new Error(`Erreur API (invoices): Statut ${response.status}`);
        const result = await response.json();
        // Vérification de la structure de la réponse
        if (result) {
          if (Array.isArray(result)) {
            setInvoices(result);
          } else if (result.content && Array.isArray(result.content)) {
            setInvoices(result.content);
          } else {
            setErrorMessage("Aucune donnée sur les factures reçue");
          }
        } else {
          setErrorMessage("Aucune donnée sur les factures reçue");
        }
      } catch (error) {
        setErrorMessage(`Erreur API (invoices): ${error.message}`);
      }
    };

    // Récupération de toutes les équipes
    const fetchTeams = async () => {
      try {
        const response = await fetch(API_TEAMS_ALL_URL, {
          headers: { "Accept-Language": "fr-FR" },
        });
        if (!response.ok)
          throw new Error(`Erreur API (teams): Statut ${response.status}`);
        const result = await response.json();
        // Vérification de la structure de la réponse pour les équipes
        if (result) {
          if (Array.isArray(result)) {
            setTeams(result);
          } else if (result.content && Array.isArray(result.content)) {
            setTeams(result.content);
          } else {
            setErrorMessage("Aucune donnée sur les équipes reçue");
          }
        } else {
          setErrorMessage("Aucune donnée sur les équipes reçue");
        }
      } catch (error) {
        setErrorMessage(`Erreur API (teams): ${error.message}`);
      }
    };

    Promise.all([fetchInvoices(), fetchTeams()]).finally(() =>
      setLoading(false)
    );
  }, []);

  // Calcul des factures filtrées selon les critères sélectionnés
  const filteredInvoices = invoices.filter((invoice) => {
    // Filtrer par statut
    const total = parseFloat(invoice.totalAmount);
    const paid = parseFloat(invoice.paidAmount);
    let statusMatch = true;
    if (filterStatus === "paid") {
      statusMatch = total === paid;
    } else if (filterStatus === "unpaid") {
      statusMatch = total > paid;
    }

    // Filtrer par joueur
    let playerMatch = true;
    if (filterPlayer.trim() !== "") {
      const fullName = invoice.memberBasicDto?.fullName || "";
      playerMatch = fullName.toLowerCase().includes(filterPlayer.toLowerCase());
    }

    // Filtrer par équipe (revenueItemName)
    let teamMatch = true;
    if (filterTeam !== "all") {
      teamMatch =
        (invoice.revenueItemName || "").toLowerCase() ===
        filterTeam.toLowerCase();
    }

    return statusMatch && playerMatch && teamMatch;
  });

  const uniqueMembers = new Set(
    filteredInvoices.map((invoice) => invoice.memberBasicDto?.id)
  ).size;

  return (
    <AdminLayout>
      <div className="p-6 bg-white shadow-md rounded-lg">
        {/* Filtres */}
        <h2 className="text-xl font-bold mb-4">🔍 Filtrer les factures</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div>
            <label className="block mb-1">Statut :</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="all">Tous</option>
              <option value="paid">Payées</option>
              <option value="unpaid">Impayées</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Joueur :</label>
            <input
              type="text"
              placeholder="Recherche par nom"
              value={filterPlayer}
              onChange={(e) => setFilterPlayer(e.target.value)}
              className="border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Équipe :</label>
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="border p-2 rounded"
            >
              {teamOptions.map((teamName, index) => (
                <option key={index} value={teamName}>
                  {teamName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section Invoices */}
        <h2 className="text-xl font-bold mb-4">
          📊 Toutes les Factures ({filteredInvoices.length}){" "}
          <span className="text-sm text-gray-600">
            ({uniqueMembers} membres uniques)
          </span>
        </h2>
        {loading && <p className="text-blue-500">Chargement des données...</p>}
        {errorMessage && <p className="text-red-500">⚠ {errorMessage}</p>}
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 border">Date de Facture</th>
                <th className="py-2 px-4 border">Numéro</th>
                <th className="py-2 px-4 border">Nom Complet</th>
                <th className="py-2 px-4 border">Montant Total</th>
                <th className="py-2 px-4 border">Montant Payé</th>
                <th className="py-2 px-4 border">Équipe</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length > 0
                ? filteredInvoices.map((invoice, index) => (
                    <tr key={index} className="border">
                      <td className="py-2 px-4 border">
                        {invoice.invoiceDate
                          ? new Date(invoice.invoiceDate).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )
                          : "N/A"}
                      </td>
                      <td className="py-2 px-4 border">
                        {invoice.invoiceNumber || "N/A"}
                      </td>
                      <td className="py-2 px-4 border">
                        {invoice.memberBasicDto?.fullName || "N/A"}
                      </td>
                      <td className="py-2 px-4 border">
                        {invoice.totalAmount} €
                      </td>
                      <td className="py-2 px-4 border">
                        {invoice.paidAmount} €
                      </td>
                      <td className="py-2 px-4 border">
                        {invoice.revenueItemName || "N/A"}
                      </td>
                    </tr>
                  ))
                : !loading && (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        Aucune facture ne correspond aux critères sélectionnés
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>

        {/* Section Teams */}
        <h2 className="text-xl font-bold mt-8 mb-4">🏆 Liste des équipes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 border">ID</th>
                <th className="py-2 px-4 border">Nom</th>
                <th className="py-2 px-4 border">Catégorie</th>
                <th className="py-2 px-4 border">Niveau</th>
                <th className="py-2 px-4 border">Genre</th>
              </tr>
            </thead>
            <tbody>
              {teams.length > 0
                ? teams.map((team, index) => (
                    <tr key={index} className="border">
                      <td className="py-2 px-4 border">{team.id || "N/A"}</td>
                      <td className="py-2 px-4 border">{team.name || "N/A"}</td>
                      <td className="py-2 px-4 border">{team.age || "N/A"}</td>
                      <td className="py-2 px-4 border">
                        {team.level || "N/A"}
                      </td>
                      <td className="py-2 px-4 border">
                        {team.gender || "N/A"}
                      </td>
                    </tr>
                  ))
                : !loading && (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        Aucune équipe disponible
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Graphics;
