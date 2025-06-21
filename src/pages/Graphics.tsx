import AdminLayout from "@/components/AdminLayout";
import React, { useEffect, useState, useMemo } from "react";
import InvoicesTable from "@/components/graphics/InvoicesTable";
import InvoiceListModal from "@/components/graphics/InvoiceListModal";
import PyramidStructure from "@/components/graphics/PyramidStructure";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Euro,
  Wallet,
  AlertCircle,
  AlertTriangle,
  Search,
  ChevronDown,
  ChevronUp,
  Loader,
  Settings,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { motion } from "framer-motion";
import ApiKeyModal from "@/components/ApiKeyModal";
import { useTranslation } from "@/hooks/useTranslation";
import OverduePaymentsModal from "@/components/graphics/OverduePaymentsModal";
import ApiSettingsModal from "@/components/graphics/ApiSettingsModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Modifier la fonction de normalisation pour refléter les nouveaux noms
// Ancienne fonction:
function normalizeBEFA(raw: string): string {
  const m = raw.match(/^(.*?Eagles.*?Academy)\s*(.*)$/i);
  if (!m) return raw;
  const suffix = m[2].trim();
  return suffix ? `BEFA ${suffix}` : "BEFA";
}

// Nouvelle fonction qui normalise tous les types d'équipes:
function normalizeTeamName(raw: string): string {
  // Eagles Brussels Football Academy -> EBFA
  const ebfaMatch = raw.match(/^(.*?Eagles.*?Academy)\s*(.*)$/i);
  if (ebfaMatch) {
    const suffix = ebfaMatch[2].trim();
    return suffix ? `EBFA ${suffix}` : "EBFA";
  }

  // RWDM ou BEFA -> nouveaux noms
  raw = raw.replace(/\bBEFA\b/gi, "EBFA");
  raw = raw.replace(/\bRWDM\b/gi, "Daring Brussels");
  raw = raw.replace(/\bELITE\b/gi, "Daring Brussels Academy");
  raw = raw.replace(/\bRF ForEver\b/gi, "DB ForEver");

  return raw;
}

function CollapsibleCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  // DÉSACTIVER PAR DÉFAUT (collapsed = true)
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div
        className="p-4 border-b flex justify-between items-center cursor-pointer"
        onClick={() => setCollapsed((c) => !c)}
      >
        <h3 className="text-lg font-medium">{title}</h3>
        {collapsed ? <ChevronDown /> : <ChevronUp />}
      </div>
      <div className={collapsed ? "h-0 overflow-hidden" : "p-4"}>
        {children}
      </div>
    </div>
  );
}

// Fonction pour extraire la saison d'un numéro de facture
const extractSeasonFromInvoiceNumber = (
  invoiceNumber: string
): string | null => {
  // Format attendu: INV-2023-2024-XXX
  const match = invoiceNumber?.match(/INV-(\d{4})-(\d{4})/i);
  if (match && match[1] && match[2]) {
    return `${match[1]}-${match[2]}`;
  }
  return null;
};

const Graphics: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPlayer, setFilterPlayer] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSeason, setSelectedSeason] = useState("all"); // Nouveau state pour la saison
  const [modalOpen, setModalOpen] = useState(false);
  const [selCatName, setSelCatName] = useState("");
  const [selCatInvs, setSelCatInvs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"stats" | "categories">("stats");
  const [newReqCount, setNewReqCount] = useState(0);
  const { t } = useTranslation();
  const BASE = localStorage.getItem("apikey") || "http://localhost:5000";
  const API = `${BASE}/api/members-dues`;

  useEffect(() => {
    fetch(API)
      .then((r) => {
        if (!r.ok) throw new Error(`Erreur ${r.status}`);
        return r.json();
      })
      .then((data) =>
        setInvoices(Array.isArray(data) ? data : data.content || [])
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [API]);

  // Liste des saisons disponibles
  const availableSeasons = useMemo(() => {
    const seasons = new Set<string>();
    seasons.add("all"); // Option pour "Toutes les saisons"

    invoices.forEach((inv) => {
      const season = extractSeasonFromInvoiceNumber(inv.invoiceNumber);
      if (season) seasons.add(season);
    });

    return Array.from(seasons).sort();
  }, [invoices]);

  // Enrichissement & normalisation
  const enriched = useMemo(
    () =>
      invoices.map((inv) => ({
        ...inv,
        normCat: normalizeBEFA(inv.revenueItemName || ""),
        season: extractSeasonFromInvoiceNumber(inv.invoiceNumber) || "unknown",
      })),
    [invoices]
  );

  // Options du sélecteur
  const allCats = useMemo(
    () => ["all", ...Array.from(new Set(enriched.map((i) => i.normCat)))],
    [enriched]
  );

  // Filtre avec saison
  const filtered = useMemo(
    () =>
      enriched.filter((inv) => {
        const okName = (inv.memberBasicDto?.fullName || "")
          .toLowerCase()
          .includes(filterPlayer.toLowerCase());
        const okCat =
          selectedCategory === "all" || inv.normCat === selectedCategory;
        const okSeason =
          selectedSeason === "all" || inv.season === selectedSeason;
        return okName && okCat && okSeason;
      }),
    [enriched, filterPlayer, selectedCategory, selectedSeason]
  );

  // Groupement pour vignettes
  const groups = useMemo(() => {
    const g: Record<string, any[]> = {};
    filtered.forEach((inv) => {
      g[inv.normCat] = g[inv.normCat] || [];
      g[inv.normCat].push(inv);
    });
    return g;
  }, [filtered]);

  // Stats graphiques
  const categoryStats = useMemo(() => {
    const stats: Record<
      string,
      { category: string; paid: number; unpaid: number }
    > = {};
    invoices.forEach((inv) => {
      const cat = normalizeBEFA(inv.revenueItemName || "");
      if (!stats[cat]) stats[cat] = { category: cat, paid: 0, unpaid: 0 };
      const t = parseFloat(inv.totalAmount || "0");
      const p = parseFloat(inv.paidAmount || "0");
      stats[cat].paid += p;
      stats[cat].unpaid += t - p;
    });
    return Object.values(stats);
  }, [invoices]);

  const monthlyTrend = useMemo(() => {
    // Définir les mois pour l'année courante
    const currentYear = new Date().getFullYear();
    const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((month) => {
      return {
        month: new Date(currentYear, month, 1).toLocaleDateString("fr-FR", {
          month: "short",
        }),
        paid: 0,
        unpaid: 0,
      };
    });

    // Filtrer les factures selon les critères actuels
    const relevantInvoices = filtered;

    // Agréger les données par mois
    relevantInvoices.forEach((invoice) => {
      if (invoice.invoiceDate) {
        const invoiceDate = new Date(invoice.invoiceDate);
        const monthIndex = invoiceDate.getMonth();

        // Seulement si l'année est celle en cours
        if (
          invoiceDate.getFullYear() === currentYear &&
          monthIndex >= 0 &&
          monthIndex < 12
        ) {
          const totalAmount = parseFloat(invoice.totalAmount || "0");
          const paidAmount = parseFloat(invoice.paidAmount || "0");

          months[monthIndex].paid += paidAmount;
          months[monthIndex].unpaid += totalAmount - paidAmount;
        }
      }
    });

    // Ne renvoyer que les mois jusqu'au mois actuel
    const currentMonth = new Date().getMonth();
    return months.slice(0, currentMonth + 1);
  }, [filtered]);

  // Toggle API active/inactive
  const [apiActive, setApiActive] = useState<boolean>(true); // par défaut true

  useEffect(() => {
    fetch(API)
      .then((r) => {
        if (!r.ok) throw new Error(`Erreur ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setApiActive(true); // ✅ API fonctionne
        setInvoices(Array.isArray(data) ? data : data.content || []);
      })
      .catch((err) => {
        setApiActive(false); // ❌ API ne fonctionne pas
        console.error("Erreur API:", err);
      })
      .finally(() => setLoading(false));
  }, [API]);

  const sortedCategories = useMemo(() => {
    const groups: Record<string, string[]> = {};
    for (const cat of allCats) {
      const prefix = cat.split(" ")[0]; // "ELITE", "U19", etc.
      groups[prefix] = groups[prefix] || [];
      groups[prefix].push(cat);
    }
    // 2. Trier les préfixes et à l’intérieur de chaque groupe
    return Object.keys(groups)
      .sort()
      .flatMap((prefix) => groups[prefix].sort());
  }, [allCats]);

  // 1. Ajoutez ces états pour gérer la modal de retards
  const [overdueInvoices, setOverdueInvoices] = useState<any[]>([]);
  const [overdueModalOpen, setOverdueModalOpen] = useState(false);
  const [apiSettingsModalOpen, setApiSettingsModalOpen] = useState(false);

  // Ajouter ces états au début du composant Graphics
  const [teams, setTeams] = useState<any[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);

  return (
    <AdminLayout newRequestsCount={newReqCount}>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* En-tête & onglets */}
        <motion.div
          className="flex justify-between items-center"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold">{t("statistics_title")}</h1>
            <p className="text-gray-600">{t("statistics_description")}</p>
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as any)}
              className="mt-4"
            >
              <TabsList className="grid grid-cols-2 w-[300px]">
                <TabsTrigger value="stats">
                  {t("financialManagement")}
                </TabsTrigger>
                <TabsTrigger value="categories">{t("hierarchy")}</TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="outline"
              className={`flex items-center gap-2 font-medium transition-all ${
                apiActive
                  ? "bg-green-50 text-green-700 hover:bg-green-600 border-green-200"
                  : "bg-red-50 text-red-700 hover:bg-red-600 border-red-200"
              }`}
              onClick={() => setApiSettingsModalOpen(true)}
              title={t("api.settings.title")}
            >
              {apiActive ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12h14M12 5l7 7-7 7"
                    />
                  </svg>
                  {t("apiActive")}
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5" />
                  {t("apiUnavailable")}
                </>
              )}
              <Settings className="h-4 w-4 ml-1 opacity-70" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Toujours visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t("hierarchyTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                {t("hierarchyDesc1")} <strong>Pro Soccer Data</strong>{" "}
                {t("hierarchyDesc2")}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {activeTab === "stats" ? (
          loading ? (
            // Spinner au chargement des factures
            <div className="flex justify-center py-20">
              <Loader className="animate-spin w-8 h-8 text-gray-500" />
            </div>
          ) : (
            <>
              {/* Filtreur amélioré avec filtre de saison */}
              <motion.div
                className="mb-4"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>{t("filters.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <motion.div
                      className="flex flex-col md:flex-row gap-4"
                      layout
                    >
                      <motion.div
                        className="relative flex-1"
                        whileHover={{ scale: 1.01 }}
                      >
                        <Search className="absolute left-3 top-3 text-gray-400" />
                        <Input
                          placeholder={t("filters.searchPlayer")}
                          className="pl-10"
                          value={filterPlayer}
                          onChange={(e) => setFilterPlayer(e.target.value)}
                        />
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="w-full md:w-48"
                      >
                        <Select
                          value={selectedCategory}
                          onValueChange={(v) => setSelectedCategory(v)}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("filters.allCategories")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              {t("filters.allCategories")}
                            </SelectItem>
                            {sortedCategories
                              .filter((cat) => cat !== "all")
                              .map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </motion.div>

                      {/* Nouveau filtre par saison */}
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="w-full md:w-48"
                      >
                        <Select
                          value={selectedSeason}
                          onValueChange={(v) => setSelectedSeason(v)}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("filters.allSeasons")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              {t("filters.allSeasons")}
                            </SelectItem>
                            {availableSeasons
                              .filter((season) => season !== "all")
                              .map((season) => (
                                <SelectItem key={season} value={season}>
                                  {season}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 4 KPI cards */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 },
                  },
                }}
              >
                {[
                  {
                    title: t("stats.totalInvoiced"),
                    icon: Euro,
                    color: "text-green-500",
                    value: filtered
                      .reduce((s, i) => s + parseFloat(i.totalAmount || "0"), 0)
                      .toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }),
                  },
                  {
                    title: t("stats.totalPaid"),
                    icon: Wallet,
                    color: "text-blue-500",
                    value: filtered
                      .reduce((s, i) => s + parseFloat(i.paidAmount || "0"), 0)
                      .toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }),
                  },
                  {
                    title: t("stats.unpaid"),
                    icon: AlertCircle,
                    color: "text-red-500",
                    value: filtered
                      .reduce(
                        (s, i) =>
                          s +
                          (parseFloat(i.totalAmount || "0") -
                            parseFloat(i.paidAmount || "0")),
                        0
                      )
                      .toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }),
                  },
                  {
                    title: t("stats.overdue"),
                    icon: AlertTriangle,
                    color: "text-yellow-500",
                    value: filtered.filter((i) => i.status === "too_late")
                      .length,
                    onClick: () => {
                      // Filtrer les factures en retard et ouvrir la modal
                      const overdueItems = filtered.filter(
                        (i) => i.status === "too_late"
                      );
                      setOverdueInvoices(overdueItems);
                      setOverdueModalOpen(true);
                    },
                  },
                ].map(({ title, icon: Icon, color, value, onClick }) => (
                  <motion.div
                    key={title}
                    className={`transform transition-transform duration-200 hover:scale-105 ${
                      onClick ? "cursor-pointer" : ""
                    }`}
                    whileHover={{ y: -4 }}
                    onClick={onClick}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>{title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center">
                        <Icon className={`h-6 w-6 ${color}`} />
                        <span className="ml-3 text-2xl font-semibold">
                          {value} {title !== t("stats.overdue") ? "€" : ""}
                        </span>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Factures par catégorie */}
              <motion.div
                className="mb-8"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>{t("invoices.byCategoryTitle")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Vérifier si des éléments correspondent aux filtres actuels */}
                    {Object.keys(groups).length === 0 ? (
                      <div className="py-12 text-center">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-gray-500"
                        >
                          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <p className="text-lg font-medium">
                            {selectedCategory !== "all" ? (
                              <>
                                {t("noElements.category")}
                                <strong>{selectedCategory}</strong>{" "}
                                {t("noElements.found")}
                                {selectedSeason !== "all" && (
                                  <>
                                    {" "}
                                    {t("noElements.forSeason")}{" "}
                                    <strong>{selectedSeason}</strong>
                                  </>
                                )}
                                .
                              </>
                            ) : (
                              <>
                                {t("noElements.noInvoices")}
                                {selectedSeason !== "all" && (
                                  <>
                                    {" "}
                                    {t("noElements.forSeason")}{" "}
                                    <strong>{selectedSeason}</strong>
                                  </>
                                )}
                                .
                              </>
                            )}
                          </p>
                          <p className="mt-2">
                            {t("noElements.tryChangingFilters")}
                          </p>
                        </motion.div>
                      </div>
                    ) : (
                      [
                        {
                          title: t("category.daring_brussels_academy"),
                          sub: t("category.daring_brussels_academy_sub"),
                          filter: (cat: string) =>
                            cat.startsWith("ELITE") ||
                            cat.startsWith("Daring Brussels Academy") ||
                            cat.includes("RWDM Academy") ||
                            cat.includes("Cotisation Academy"),
                          barColor: "#FF0000",
                        },
                        {
                          title: t("category.db_forever"),
                          sub: t("category.db_forever_sub"),
                          filter: (cat: string) =>
                            cat.toLowerCase().includes("for ever") ||
                            cat.toLowerCase().startsWith("dbf") ||
                            cat.toLowerCase().includes("daring brussels for") ||
                            cat.includes("FOREVERS"),
                          barColor: "#FCA5A5",
                        },
                        {
                          title: t("category.ebfa"),
                          sub: t("category.ebfa_sub"),
                          filter: (cat: string) =>
                            cat.startsWith("BEFA") ||
                            cat.startsWith("EBFA") ||
                            cat.includes("Eagles") ||
                            cat.includes("Football Academy"),
                          barColor: "#1E3A8A",
                        },
                      ].map(({ title, sub, filter, barColor }) => {
                        const entries = Object.entries(groups)
                          .filter(([cat]) => filter(cat))
                          .sort(([a], [b]) => {
                            const numA = parseInt(
                              (a.match(/U(\d+)/) || [])[1] || "0",
                              10
                            );
                            const numB = parseInt(
                              (b.match(/U(\d+)/) || [])[1] || "0",
                              10
                            );
                            return numA - numB;
                          });
                        if (!entries.length) return null;
                        return (
                          <motion.div
                            key={title}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <h3 className="text-lg font-semibold text-gray-600 mb-4">
                              {title}{" "}
                              <span className="text-sm text-gray-500">
                                ({sub})
                              </span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                              {entries.map(([cat, invs]) => (
                                <motion.div
                                  key={cat}
                                  className="p-4 bg-white rounded shadow border border-gray-200 cursor-pointer transform transition-transform duration-200 hover:scale-105 hover:shadow-md"
                                  onClick={() => {
                                    setSelCatName(cat);
                                    setSelCatInvs(invs);
                                    setModalOpen(true);
                                  }}
                                >
                                  <h4 className="mb-1 font-semibold">{cat}</h4>
                                  <div className="text-3xl font-bold text-center">
                                    {invs.length}
                                  </div>
                                  <div
                                    className="h-2 rounded-full mt-2"
                                    style={{
                                      backgroundColor: barColor,
                                    }}
                                  />
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Graphiques + tableau */}
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <CollapsibleCard title={t("byCategory")}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip formatter={(v) => `${v.toLocaleString()} €`} />
                      <Legend />
                      <Bar dataKey="paid" name={t("paid")} fill="#10B981" />
                      <Bar dataKey="unpaid" name={t("unpaid")} fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CollapsibleCard>

                <CollapsibleCard title={t("paymentsTrend")}>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(v) => `${v.toLocaleString()} €`} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="paid"
                        name={t("paid")}
                        fill="#10B981"
                        stroke="#059669"
                      />
                      <Area
                        type="monotone"
                        dataKey="unpaid"
                        name={t("unpaid")}
                        fill="#EF4444"
                        stroke="#DC2626"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CollapsibleCard>
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <InvoicesTable invoices={invoices} loading={loading} />
              </motion.div>
            </>
          )
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PyramidStructure />
          </motion.div>
        )}

        {/* Modals */}
        <ApiKeyModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          currentKey={localStorage.getItem("apiKey") || ""}
          onSave={(k) => localStorage.setItem("apiKey", k)}
        />
        <InvoiceListModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          category={selCatName}
          invoices={selCatInvs}
        />
        <OverduePaymentsModal
          open={overdueModalOpen}
          onClose={() => setOverdueModalOpen(false)}
          overdueInvoices={overdueInvoices}
        />
        <ApiSettingsModal
          open={apiSettingsModalOpen}
          onClose={() => setApiSettingsModalOpen(false)}
          onSave={() => {
            setApiSettingsModalOpen(false);
            // Recharger les données après mise à jour des paramètres API
            setLoading(true);
            fetch(API)
              .then((r) => {
                if (!r.ok) throw new Error(`Erreur ${r.status}`);
                return r.json();
              })
              .then((data) => {
                setApiActive(true);
                setInvoices(Array.isArray(data) ? data : data.content || []);
              })
              .catch((err) => {
                setApiActive(false);
                console.error("Erreur API:", err);
              })
              .finally(() => setLoading(false));
          }}
        />
      </motion.div>
    </AdminLayout>
  );
};

export default Graphics;
