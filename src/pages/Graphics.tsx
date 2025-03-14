import AdminLayout from "@/components/AdminLayout";
import React, { useEffect, useState } from "react";

const API_MEMBERS_DUES_URL = "http://localhost:5000/api/members-dues";
const API_TEAMS_ALL_URL = "http://localhost:5000/api/teams/all";

const Graphics = () => {
  const [invoices, setInvoices] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Récupération des factures (invoices)
    const fetchInvoices = async () => {
      try {
        const response = await fetch(API_MEMBERS_DUES_URL);
        if (!response.ok)
          throw new Error(`Erreur API (invoices): Statut ${response.status}`);
        const result = await response.json();
        if (result && result.content) {
          setInvoices(result.content);
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
        if (result && result.length > 0) {
          setTeams(result);
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

  return (
    <AdminLayout>
      <div className="p-6 bg-white shadow-md rounded-lg">
        {/* Section Invoices */}
        <h2 className="text-xl font-bold mb-4">📊 Factures en attente</h2>
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
              </tr>
            </thead>
            <tbody>
              {invoices.length > 0
                ? invoices.map((invoice, index) => (
                    <tr key={index} className="border">
                      <td className="py-2 px-4 border">
                        {invoice.invoiceDate || "N/A"}
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
                    </tr>
                  ))
                : !loading && (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        Aucune facture disponible
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
