import AdminLayout from "@/components/AdminLayout";
import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/members-dues"; // On appelle notre proxy au lieu de l'API

const Graphics = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Erreur API: Statut ${response.status}`);

        const result = await response.json();
        console.log("Données reçues :", result);

        if (result && result.content) {
          setData(result.content);
        } else {
          setErrorMessage("Aucune donnée reçue depuis l'API (content est vide)");
        }
      } catch (error) {
        setErrorMessage(`Erreur API: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <AdminLayout>
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-bold mb-4">📊 Membres avec paiements en attente</h2>
        {loading && <p className="text-blue-500">Chargement des données...</p>}
        {errorMessage && <p className="text-red-500">⚠ {errorMessage}</p>}
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 border">Date de Facture</th>
                <th className="py-2 px-4 border">Numéro de Facture</th>
                <th className="py-2 px-4 border">Nom Complet</th>
                <th className="py-2 px-4 border">ID Membre</th>
                <th className="py-2 px-4 border">ID Paiement</th>
                <th className="py-2 px-4 border">Nom Article</th>
                <th className="py-2 px-4 border">Statut</th>
                <th className="py-2 px-4 border">Montant Total</th>
                <th className="py-2 px-4 border">Montant Payé</th>
                <th className="py-2 px-4 border">Termes</th>
                <th className="py-2 px-4 border">Termes Payés</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((invoice, index) => (
                  <tr key={index} className="border">
                    <td className="py-2 px-4 border">{invoice.invoiceDate || "N/A"}</td>
                    <td className="py-2 px-4 border">{invoice.invoiceNumber || "N/A"}</td>
                    <td className="py-2 px-4 border">{invoice.memberBasicDto?.fullName || "N/A"}</td>
                    <td className="py-2 px-4 border">{invoice.memberBasicDto?.id || "N/A"}</td>
                    <td className="py-2 px-4 border">{invoice.memberDueId || "N/A"}</td>
                    <td className="py-2 px-4 border">{invoice.revenueItemName || "N/A"}</td>
                    <td className="py-2 px-4 border">{invoice.status}</td>
                    <td className="py-2 px-4 border">{invoice.totalAmount} €</td>
                    <td className="py-2 px-4 border">{invoice.paidAmount} €</td>
                    <td className="py-2 px-4 border">{invoice.terms || "N/A"}</td>
                    <td className="py-2 px-4 border">{invoice.paidTerms || "N/A"}</td>
                  </tr>
                ))
              ) : (
                !loading && (
                  <tr>
                    <td colSpan={11} className="text-center py-4">Aucune donnée disponible</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Graphics;
