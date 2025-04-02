import AdminLayout from "@/components/AdminLayout";
import React, { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Euro,
  Wallet,
  AlertCircle,
  AlertTriangle,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  CreditCard,
  Send,
} from "lucide-react";
import FullScreenLoader from "@/components/FullScreenLoader";
import InvoicesTable from "@/components/graphics/InvoicesTable";
import TeamsTable from "@/components/graphics/TeamsTable";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ApiKeyModal from "@/components/ApiKeyModal";
import InvoiceListModal from "@/components/graphics/InvoiceListModal";

const statusColors: Record<string, string> = {
  not_sent: "bg-gray-100 text-gray-800",
  open: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  too_late: "bg-red-100 text-red-800",
  credited: "bg-purple-100 text-purple-800",
};

const statusIcons: Record<string, any> = {
  not_sent: Send,
  open: Clock,
  paid: CheckCircle2,
  too_late: AlertTriangle,
  credited: CreditCard,
};

function StatusBadge({ status }: { status: string }) {
  const Icon = statusIcons[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}
    >
      <Icon className="w-4 h-4 mr-1" />
      {status.replace("_", " ").charAt(0).toUpperCase() +
        status.slice(1).replace("_", " ")}
    </span>
  );
}

function CollapsibleCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div
        className="p-4 border-b border-gray-200 flex justify-between items-center cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {isCollapsed ? (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        )}
      </div>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed ? "h-0 overflow-hidden" : "p-4"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088fe"];

const API_MEMBERS_DUES_URL = "http://localhost:5001/api/members-dues";
const API_TEAMS_ALL_URL = "http://localhost:5001/api/teams/all";

const Graphics: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // États pour les filtres
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlayer, setFilterPlayer] = useState("");
  const [filterTeam, setFilterTeam] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCommune, setSelectedCommune] = useState("all");
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKey, setApiKey] = useState<string>(
    () => localStorage.getItem("apiKey") || ""
  );
  const baseURL = localStorage.getItem("apikey") || "http://localhost:5001";
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [selectedCategoryInvoices, setSelectedCategoryInvoices] = useState<
    any[]
  >([]);
  const API_MEMBERS_DUES_URL = `${baseURL}/api/members-dues`;
  const API_TEAMS_ALL_URL = `${baseURL}/api/teams/all`;

  // teamOptions calculé à partir des factures
  const teamOptions = useMemo(() => {
    return [
      "Toutes",
      ...Array.from(
        new Set(
          invoices.map((invoice) => invoice.revenueItemName).filter(Boolean)
        )
      ),
    ];
  }, [invoices]);

  // Récupération des données
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch(API_MEMBERS_DUES_URL);
        if (!response.ok)
          throw new Error(`Erreur API (invoices): ${response.status}`);
        const result = await response.json();
        if (result) {
          if (Array.isArray(result)) setInvoices(result);
          else if (result.content && Array.isArray(result.content))
            setInvoices(result.content);
          else setErrorMessage("Aucune donnée sur les factures reçue");
        } else {
          setErrorMessage("Aucune donnée sur les factures reçue");
        }
      } catch (error: any) {
        setErrorMessage(`Erreur API (invoices): ${error.message}`);
      }
    };

    const fetchTeams = async () => {
      try {
        const response = await fetch(API_TEAMS_ALL_URL, {
          headers: { "Accept-Language": "fr-FR" },
        });
        if (!response.ok)
          throw new Error(`Erreur API (teams): ${response.status}`);
        const result = await response.json();
        if (result) {
          if (Array.isArray(result)) setTeams(result);
          else if (result.content && Array.isArray(result.content))
            setTeams(result.content);
          else setErrorMessage("Aucune donnée sur les équipes reçue");
        } else {
          setErrorMessage("Aucune donnée sur les équipes reçue");
        }
      } catch (error: any) {
        setErrorMessage(`Erreur API (teams): ${error.message}`);
      }
    };

    Promise.all([fetchInvoices(), fetchTeams()]).finally(() =>
      setLoading(false)
    );
  }, []);

  // Filtrer les factures selon les critères
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const total = parseFloat(invoice.totalAmount || "0");
      const paid = parseFloat(invoice.paidAmount || "0");

      let statusMatch = true;
      if (filterStatus === "paid") statusMatch = total === paid;
      else if (filterStatus === "unpaid") statusMatch = total > paid;

      let playerMatch = true;
      if (filterPlayer.trim() !== "") {
        const fullName = invoice.memberBasicDto?.fullName || "";
        playerMatch = fullName
          .toLowerCase()
          .includes(filterPlayer.toLowerCase());
      }

      let teamMatch = true;
      if (filterTeam !== "all") {
        teamMatch =
          (invoice.revenueItemName || "").toLowerCase() ===
          filterTeam.toLowerCase();
      }

      let categoryMatch = true;
      if (selectedCategory !== "all") {
        categoryMatch =
          (invoice.revenueItemName || "").toLowerCase() ===
          selectedCategory.toLowerCase();
      }

      let communeMatch = true;
      if (selectedCommune !== "all") {
        communeMatch = (invoice.memberBasicDto?.commune || "")
          .toLowerCase()
          .includes(selectedCommune.toLowerCase());
      }

      return (
        statusMatch && playerMatch && teamMatch && categoryMatch && communeMatch
      );
    });
  }, [
    invoices,
    filterStatus,
    filterPlayer,
    filterTeam,
    selectedCategory,
    selectedCommune,
  ]);

  function groupBy<T>(
    arr: T[],
    keyFn: (item: T) => string
  ): Record<string, T[]> {
    return arr.reduce((acc, item) => {
      const key = keyFn(item);
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, T[]>);
  }

  const uniqueMembers = new Set(
    filteredInvoices.map((inv) => inv.memberBasicDto?.id)
  ).size;

  // Groupement par catégorie basé sur revenueItemName
  const invoicesByCategory = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredInvoices.forEach((invoice) => {
      const category = invoice.revenueItemName || "—";
      if (!groups[category]) groups[category] = [];
      groups[category].push(invoice);
    });
    return groups;
  }, [filteredInvoices]);

  // Statut global d'un groupe : toutes payées = "green", sinon "red"
  const getGroupStatus = (group: any[]) => {
    return group.every(
      (inv) =>
        parseFloat(inv.totalAmount || "0") <= parseFloat(inv.paidAmount || "0")
    )
      ? "green"
      : "red";
  };

  // Données pour les graphiques
  const categoryStats = useMemo(() => {
    const stats: Record<string, any> = {};
    invoices.forEach((inv) => {
      const cat = inv.revenueItemName || "—";
      if (!stats[cat]) {
        stats[cat] = { category: cat, total: 0, paid: 0, unpaid: 0, count: 0 };
      }
      stats[cat].total += parseFloat(inv.totalAmount || "0");
      stats[cat].paid += parseFloat(inv.paidAmount || "0");
      stats[cat].unpaid +=
        parseFloat(inv.totalAmount || "0") - parseFloat(inv.paidAmount || "0");
      stats[cat].count++;
    });
    return Object.values(stats).sort((a, b) =>
      a.category.localeCompare(b.category)
    );
  }, [invoices]);

  const communeStats = useMemo(() => {
    const stats: Record<string, any> = {};
    invoices.forEach((inv) => {
      const commune = inv.memberBasicDto?.commune || "—";
      if (!stats[commune])
        stats[commune] = { name: commune, count: 0, unpaidAmount: 0 };
      stats[commune].count++;
      if (
        parseFloat(inv.totalAmount || "0") > parseFloat(inv.paidAmount || "0")
      ) {
        stats[commune].unpaidAmount +=
          parseFloat(inv.totalAmount || "0") -
          parseFloat(inv.paidAmount || "0");
      }
    });
    return Object.values(stats);
  }, [invoices]);

  const monthlyTrend = useMemo(() => {
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"];
    return months.map((month) => ({
      month,
      paid: Math.floor(Math.random() * 50000) + 30000,
      unpaid: Math.floor(Math.random() * 20000) + 5000,
    }));
  }, [invoices]);

  // État pour l'expansion des cards de catégorie
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  return (
    <AdminLayout>
      {loading && (
        <FullScreenLoader
          isLoading={loading}
          messages={["Chargement des données...", "Veuillez patienter..."]}
        />
      )}
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-rwdm-blue dark:text-white">
              Gestion financière
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Gérez les statistiques
            </p>
          </div>
          <div>
            <Button variant="outline" onClick={() => setShowApiModal(true)}>
              Clé API
            </Button>
          </div>
        </div>

        {/* Filtres */}
        <Card>
          <CardHeader>
            <CardTitle>Filtres de recherche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex relative flex-1">
                <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <select
                  className="pl-8 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">Toutes les catégories</option>

                  {Object.entries(
                    groupBy(Object.keys(invoicesByCategory), (name) =>
                      name.charAt(0).toUpperCase()
                    )
                  ).map(([letter, categories]) => (
                    <optgroup key={letter} label={letter}>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="flex relative flex-1">
                <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Recherche par nom de joueur"
                  value={filterPlayer}
                  onChange={(e) => setFilterPlayer(e.target.value)}
                  className="pl-8 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                />
              </div>
              <div className="flex relative flex-1">
                <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <select
                  className="pl-8 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={selectedCommune}
                  onChange={(e) => setSelectedCommune(e.target.value)}
                >
                  <option value="all">Toutes les communes</option>
                  {[
                    "Bruxelles",
                    "Anderlecht",
                    "Schaerbeek",
                    "Molenbeek",
                    "Uccle",
                  ].map((commune) => (
                    <option key={commune} value={commune}>
                      {commune}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Facturé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Euro className="h-6 w-6 text-green-500" />
                <p className="text-2xl font-semibold text-gray-900 ml-3">
                  {filteredInvoices
                    .reduce(
                      (acc, inv) => acc + parseFloat(inv.totalAmount || "0"),
                      0
                    )
                    .toLocaleString()}{" "}
                  €
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Encaissé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Wallet className="h-6 w-6 text-blue-500" />
                <p className="text-2xl font-semibold text-gray-900 ml-3">
                  {filteredInvoices
                    .reduce(
                      (acc, inv) => acc + parseFloat(inv.paidAmount || "0"),
                      0
                    )
                    .toLocaleString()}{" "}
                  €
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Impayés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <p className="text-2xl font-semibold text-gray-900 ml-3">
                  {filteredInvoices
                    .reduce(
                      (acc, inv) =>
                        acc +
                        (parseFloat(inv.totalAmount || "0") -
                          parseFloat(inv.paidAmount || "0")),
                      0
                    )
                    .toLocaleString()}{" "}
                  €
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Retards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                <p className="text-2xl font-semibold text-gray-900 ml-3">
                  {
                    filteredInvoices.filter((inv) => inv.status === "too_late")
                      .length
                  }
                </p>
                <p className="mt-1 text-sm text-gray-500"> </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card: Factures par Catégorie */}
        <Card>
          <CardHeader>
            <CardTitle>Factures par Catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(invoicesByCategory).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Object.entries(invoicesByCategory).map(([category, invs]) => {
                  const filteredGroup =
                    selectedCommune === "all"
                      ? invs
                      : invs.filter(
                          (inv) =>
                            (
                              inv.memberBasicDto?.commune || ""
                            ).toLowerCase() === selectedCommune.toLowerCase()
                        );

                  const total = filteredGroup.reduce(
                    (sum, inv) => sum + parseFloat(inv.totalAmount || "0"),
                    0
                  );
                  const paid = filteredGroup.reduce(
                    (sum, inv) => sum + parseFloat(inv.paidAmount || "0"),
                    0
                  );
                  const unpaid = total - paid;
                  const unpaidRatio = total === 0 ? 0 : unpaid / total;

                  const red = Math.round(255 * unpaidRatio);
                  const green = Math.round(180 * (1 - unpaidRatio));
                  const tooLateCount = filteredGroup.filter(
                    (inv) => inv.status === "too_late"
                  ).length;
                  const tooLatePercentage =
                    filteredGroup.length === 0
                      ? 0
                      : Math.round((tooLateCount / filteredGroup.length) * 100);

                  return (
                    <div
                      key={category}
                      className="bg-white p-4 rounded-lg shadow hover:shadow-md transition cursor-pointer border"
                      onClick={() => {
                        setSelectedCategoryName(category);
                        setSelectedCategoryInvoices(filteredGroup);
                        setModalOpen(true);
                      }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-md font-semibold">
                          {(() => {
                            const words = category.split(" ");
                            const acronym = words
                              .slice(0, 4)
                              .map((word) => word[0]?.toUpperCase() ?? "")
                              .join("");
                            const suffix = words.slice(4).join(" ");
                            return suffix
                              ? `${acronym} ${suffix}`
                              : category.length > 25
                              ? acronym
                              : category;
                          })()}
                        </h4>
                        <div
                          className="w-5 h-5 rounded-full"
                          style={{
                            backgroundColor: `rgb(${red}, ${green}, 80)`,
                          }}
                          title={`${unpaid.toFixed(2)} € impayés`}
                        />
                      </div>

                      {/* Grand chiffre centré */}
                      <p className="text-4xl font-bold text-center text-gray-900">
                        {filteredGroup.length}
                      </p>

                      {/* Ligne avec retards */}
                      {filteredGroup.length > 0 && (
                        <p className="text-sm text-center text-gray-500 mt-2">
                          {tooLateCount} facture{tooLateCount > 1 ? "s" : ""} en
                          retard ({tooLatePercentage}%)
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>Aucune facture trouvée.</p>
            )}
          </CardContent>
        </Card>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CollapsibleCard title="Répartition par Catégorie">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => `${value.toLocaleString()} €`}
                />
                <Legend />
                <Bar dataKey="paid" name="Payé" fill="#10B981" />
                <Bar dataKey="unpaid" name="Impayé" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </CollapsibleCard>

          <CollapsibleCard title="Distribution par Commune">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={communeStats}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {communeStats.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => value.toLocaleString()} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CollapsibleCard>

          <CollapsibleCard title="Évolution des Paiements">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => `${value.toLocaleString()} €`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="paid"
                  name="Payé"
                  fill="#10B981"
                  stroke="#059669"
                />
                <Area
                  type="monotone"
                  dataKey="unpaid"
                  name="Impayé"
                  fill="#EF4444"
                  stroke="#DC2626"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CollapsibleCard>

          <CollapsibleCard title="Impayés par Commune">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={communeStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => `${value.toLocaleString()} €`}
                />
                <Legend />
                <Bar
                  dataKey="unpaidAmount"
                  name="Montant Impayé"
                  fill="#EF4444"
                />
              </BarChart>
            </ResponsiveContainer>
          </CollapsibleCard>
        </div>

        {/* Section Table Factures */}
        <InvoicesTable invoices={invoices} loading={loading} />

        {/* Section Teams */}
        <TeamsTable teams={teams} loading={loading} />
      </div>
      <ApiKeyModal
        open={showApiModal}
        onClose={() => setShowApiModal(false)}
        currentKey={apiKey}
        onSave={(key) => {
          localStorage.setItem("apiKey", key);
          setApiKey(key);
        }}
      />
      <InvoiceListModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        category={selectedCategoryName}
        invoices={selectedCategoryInvoices}
      />
    </AdminLayout>
  );
};

export default Graphics;
