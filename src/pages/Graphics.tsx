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

// Normalise "Eagles ... Academy" → "BEFA …"
function normalizeBEFA(raw: string): string {
  const m = raw.match(/^(.*?Eagles.*?Academy)\s*(.*)$/i);
  if (!m) return raw;
  const suffix = m[2].trim();
  return suffix ? `BEFA ${suffix}` : "BEFA";
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

const Graphics: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPlayer, setFilterPlayer] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selCatName, setSelCatName] = useState("");
  const [selCatInvs, setSelCatInvs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"stats" | "categories">("stats");
  const [newReqCount, setNewReqCount] = useState(0);
  const { t } = useTranslation();
  const BASE = localStorage.getItem("apikey") || "http://localhost:5001";
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

  // Enrichissement & normalisation
  const enriched = useMemo(
    () =>
      invoices.map((inv) => ({
        ...inv,
        normCat: normalizeBEFA(inv.revenueItemName || ""),
      })),
    [invoices]
  );

  // Options du sélecteur
  const allCats = useMemo(
    () => ["all", ...Array.from(new Set(enriched.map((i) => i.normCat)))],
    [enriched]
  );

  // Filtre
  const filtered = useMemo(
    () =>
      enriched.filter((inv) => {
        const okName = (inv.memberBasicDto?.fullName || "")
          .toLowerCase()
          .includes(filterPlayer.toLowerCase());
        const okCat =
          selectedCategory === "all" || inv.normCat === selectedCategory;
        return okName && okCat;
      }),
    [enriched, filterPlayer, selectedCategory]
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
    const m = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"];
    return m.map((mo) => ({
      month: mo,
      paid: Math.random() * 50000,
      unpaid: Math.random() * 20000,
    }));
  }, [invoices]);

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
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                apiActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {apiActive ? t("apiActive") : t("apiUnavailable")}
            </span>
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
              {/* Filtreur */}
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
                    <motion.div className="flex gap-4" layout>
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
                      <motion.div whileHover={{ scale: 1.01 }}>
                        <Select
                          value={selectedCategory}
                          onValueChange={(v) => setSelectedCategory(v)}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue
                              placeholder={t("filters.allCategories")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {/* L’option « Toutes catégories » */}
                            <SelectItem value="all">
                              {t("filters.allCategories")}
                            </SelectItem>

                            {/* Toutes les autres, déjà triées par préfixe et en bloc */}
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
                      .toLocaleString(),
                  },
                  {
                    title: t("stats.totalPaid"),
                    icon: Wallet,
                    color: "text-blue-500",
                    value: filtered
                      .reduce((s, i) => s + parseFloat(i.paidAmount || "0"), 0)
                      .toLocaleString(),
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
                      .toLocaleString(),
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
                    {[
                      {
                        title: "ELITE",
                        sub: "RWDM Academy",
                        filter: (cat: string) => cat.startsWith("ELITE"),
                        barColor: "#FF0000",
                      },
                      {
                        title: "RF ForEver",
                        sub: "RWDM ForEver",
                        filter: (cat: string) =>
                          cat.toLowerCase().startsWith("rf for ever") ||
                          cat.toLowerCase().startsWith("r f for ever"),
                        barColor: "#FCA5A5",
                      },
                      {
                        title: "BEFA",
                        sub: "Brussels Eagles Football Academy",
                        filter: (cat: string) => cat.startsWith("BEFA"),
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
                    })}
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
      </motion.div>
    </AdminLayout>
  );
};

export default Graphics;
