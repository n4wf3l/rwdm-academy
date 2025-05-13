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
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div
        className="p-4 border-b flex justify-between items-center cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
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
  const [apiActive, setApiActive] = useState<boolean>(() =>
    Boolean(localStorage.getItem("apiKey"))
  );
  useEffect(() => {
    apiActive
      ? localStorage.setItem("apiKey", "dummy-key")
      : localStorage.removeItem("apiKey");
  }, [apiActive]);

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
            <h1 className="text-3xl font-bold">Statistiques</h1>
            <p className="text-gray-600">Gestion financière & pyramide</p>
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as any)}
              className="mt-4"
            >
              <TabsList className="grid grid-cols-2 w-[300px]">
                <TabsTrigger value="stats">Gestion financière</TabsTrigger>
                <TabsTrigger value="categories">Hiérarchie</TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Button variant="outline" onClick={() => setApiActive(!apiActive)}>
              API {apiActive ? "actif" : "inactif"}
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
              <CardTitle>Hiérarchie des équipes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Données fournies par l’API <strong>Pro Soccer Data</strong> en
                temps réel. Certains noms peuvent apparaître en double.
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
                    <CardTitle>Filtres de recherche</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <motion.div className="flex gap-4" layout>
                      <motion.div
                        className="relative flex-1"
                        whileHover={{ scale: 1.01 }}
                      >
                        <Search className="absolute left-3 top-3 text-gray-400" />
                        <Input
                          placeholder="Rechercher un joueur…"
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
                            <SelectValue placeholder="Toutes catégories" />
                          </SelectTrigger>
                          <SelectContent>
                            {allCats.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat === "all" ? "Toutes catégories" : cat}
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
                    title: "Total Facturé",
                    icon: Euro,
                    color: "text-green-500",
                    value: filtered
                      .reduce((s, i) => s + parseFloat(i.totalAmount || "0"), 0)
                      .toLocaleString(),
                  },
                  {
                    title: "Total Encaissé",
                    icon: Wallet,
                    color: "text-blue-500",
                    value: filtered
                      .reduce((s, i) => s + parseFloat(i.paidAmount || "0"), 0)
                      .toLocaleString(),
                  },
                  {
                    title: "Impayés",
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
                    title: "Retards",
                    icon: AlertTriangle,
                    color: "text-yellow-500",
                    value: filtered.filter((i) => i.status === "too_late")
                      .length,
                  },
                ].map(({ title, icon: Icon, color, value }) => (
                  <motion.div
                    key={title}
                    className="transform transition-transform duration-200 hover:scale-105"
                    whileHover={{ y: -4 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>{title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center">
                        <Icon className={`h-6 w-6 ${color}`} />
                        <span className="ml-3 text-2xl font-semibold">
                          {value} {title !== "Retards" ? "€" : ""}
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
                    <CardTitle>Factures par catégorie</CardTitle>
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
                <CollapsibleCard title="Répartition par Catégorie">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip formatter={(v) => `${v.toLocaleString()} €`} />
                      <Legend />
                      <Bar dataKey="paid" name="Payé" fill="#10B981" />
                      <Bar dataKey="unpaid" name="Impayé" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CollapsibleCard>

                <CollapsibleCard title="Évolution des Paiements">
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
      </motion.div>
    </AdminLayout>
  );
};

export default Graphics;
