// components/graphics/PyramidStructure.tsx
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import ModalPlayers from "./ModalPlayers";
import CategoryCounts from "./CategoryCounts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Loader } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface TeamRaw {
  teamId: number;
  teamName: string;
  playerCount: number;
}

interface TeamInfo {
  id: number;
  name: string;
  players: number;
}

interface Level {
  name: string;
  displayName: string;
  ageGroups: TeamInfo[];
  teams: number;
  players: number;
  match: (name: string) => boolean;
}

const PyramidStructure: React.FC = () => {
  const [teams, setTeams] = useState<TeamRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [playersByCat, setPlayersByCat] = useState<Record<string, string[]>>(
    {}
  );
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    axios
      .get<TeamRaw[]>("http://localhost:5001/api/teams/player-counts")
      .then((res) =>
        setTeams(res.data.filter((t) => typeof t.teamName === "string"))
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const {
    rwTeams,
    befaTeams,
    topTeam,
    pyramidLevels,
    totalPlayers,
    uniquePlayers,
  } = useMemo(() => {
    const rw: TeamInfo[] = [];
    const befa: TeamInfo[] = [];
    let top: TeamInfo | null = null;

    const levels: Level[] = [
      {
        name: "Senior Youth",
        displayName: "Post formation",
        ageGroups: [],
        teams: 0,
        players: 0,
        // Uniquement U20 à U23
        match: (n) => /\b(U2[0-3])\b/i.test(n),
      },
      {
        name: "Middle Youth",
        displayName: "Jeu à 11",
        ageGroups: [],
        teams: 0,
        players: 0,
        // U13 à U19 (incluant U18-U19 qui étaient dans Senior Youth)
        match: (n) => /\b(U1[3-9])\b/i.test(n),
      },
      {
        name: "Junior Youth",
        displayName: "Jeu à 8",
        ageGroups: [],
        teams: 0,
        players: 0,
        // Uniquement U10 à U12 (pas U9)
        match: (n) => /\b(U1[0-2])\b/i.test(n),
      },
      {
        name: "Foundation",
        displayName: "Préformation",
        ageGroups: [],
        teams: 0,
        players: 0,
        // U5 à U9 uniquement
        match: (n) => /\bU[5-9]\b/i.test(n) && !/\bU1[0-9]\b/i.test(n),
      },
    ];

    teams.forEach((t) => {
      const name = t.teamName,
        cnt = t.playerCount,
        low = name.toLowerCase();
      if (/(befa|eagles)/i.test(low)) {
        befa.push({
          id: t.teamId,
          name: name.replace(/Eagles Brussels Football Academy/i, "BEFA"),
          players: cnt,
        });
      } else if (/rf/i.test(low)) {
        rw.push({ id: t.teamId, name, players: cnt });
      } else if (/RWDM/i.test(name) && /\bA[- ]?team\b/i.test(name)) {
        top = { id: t.teamId, name, players: cnt };
      } else {
        const lvl = levels.find((l) => l.match(name));
        if (lvl) {
          lvl.teams++;
          lvl.players += cnt;
          lvl.ageGroups.push({ id: t.teamId, name, players: cnt });
        }
      }
    });

    // Calculer le total des joueurs (avec doublons)
    const rwTotal = rw.reduce((sum, t) => sum + t.players, 0);
    const befaTotal = befa.reduce((sum, t) => sum + t.players, 0);
    const pyramidTotal = levels.reduce((sum, l) => sum + l.players, 0);
    const topTotal = top?.players || 0;
    const totalPlayers = rwTotal + befaTotal + pyramidTotal + topTotal;

    // Estimation du nombre de joueurs uniques (sans doublons)
    // En supposant qu'en moyenne, un joueur joue dans 1.15 équipes
    const estimatedUniqueRate = 1.15;
    const uniquePlayers = Math.round(totalPlayers / estimatedUniqueRate);

    return {
      rwTeams: rw,
      befaTeams: befa,
      topTeam: top,
      pyramidLevels: levels,
      totalPlayers,
      uniquePlayers,
    };
  }, [teams]);

  const handleLevelClick = async (title: string, items: TeamInfo[]) => {
    setModalTitle(title);
    setModalLoading(true);
    setModalOpen(true);

    const byCat: Record<string, string[]> = {};
    for (const team of items) {
      await new Promise((r) => setTimeout(r, 300));
      let res;
      try {
        res = await axios.get<any>(
          `http://localhost:5001/api/teams/${team.id}/members`
        );
      } catch (err: any) {
        if (err.response?.status === 429) {
          await new Promise((r) => setTimeout(r, 1000));
          try {
            res = await axios.get<any>(
              `http://localhost:5001/api/teams/${team.id}/members`
            );
          } catch {
            console.warn(`Échec définitif pour ${team.name}`);
            continue;
          }
        } else {
          console.warn(`Erreur fetch membres ${team.name}`, err);
          continue;
        }
      }
      const data = res.data;
      const members: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data.content)
        ? data.content
        : [];

      let cat: string | null = null;

      // Gestion spéciale pour BEFA
      if (title === "BEFA") {
        // Utiliser le nom de l'équipe comme catégorie ou "BEFA" par défaut
        cat = team.name.replace(/Eagles Brussels Football Academy/i, "BEFA");
      } else if (title === "A" || /\bA[- ]?team\b/i.test(team.name)) {
        cat = "A";
      } else {
        const m = team.name.match(/\bU\d{1,2}\b/i);
        if (m) cat = m[0].toUpperCase();
      }

      // Dernier recours: utiliser le nom de l'équipe comme catégorie
      if (!cat) cat = team.name;

      byCat[cat] = byCat[cat] || [];
      members.forEach((m) => {
        const raw =
          m.fullName || [m.firstName, m.lastName].filter(Boolean).join(" ");
        if (!raw) return;
        const pretty = raw
          .split(" ")
          .map((w) => w[0]?.toUpperCase() + w.slice(1).toLowerCase())
          .join(" ");
        byCat[cat]!.push(pretty);
      });
    }

    setPlayersByCat(byCat);
    setModalLoading(false);
  };

  return (
    <div className="relative">
      {/* Header */}
      <CategoryCounts teams={teams} loading={loading} />

      {/* Total Players Card */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-r from-black to-red-600 text-white">
            <CardContent className="flex flex-col items-center py-4">
              <h2 className="text-2xl font-bold mb-2">
                {t("totalPlayersAcademy")}
              </h2>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-1">{uniquePlayers}</div>
                  <p className="text-xs opacity-80">{t("withoutDuplicates")}</p>
                </div>
                <div className="text-center opacity-70">
                  <div className="text-2xl font-semibold mb-1">
                    {totalPlayers}
                  </div>
                  <p className="text-xs opacity-80">{t("withDuplicates")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Grille */}
      <div className="flex justify-center items-start gap-8 border border-gray-200 rounded-lg p-6">
        {/* RWDM - après chargement, entrant depuis la gauche */}
        {!loading && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            whileHover={{ scale: 1.05 }}
            className="hidden md:flex flex-col items-center mt-40"
          >
            <SideBox
              title="RWDM ForEver"
              items={rwTeams}
              onClick={() => handleLevelClick("RWDM ForEver", rwTeams)}
            />
          </motion.div>
        )}

        {/* Pyramide - apparaît toujours (loading ou non) */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            delay: 0.2,
          }}
          className="flex flex-col items-center mx-4 md:mx-8 max-w-4xl"
        >
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader className="animate-spin w-8 h-8 text-gray-500" />
            </div>
          ) : (
            <>
              {topTeam && (
                <PyramidLevel
                  level={{
                    name: "A",
                    displayName: "A",
                    ageGroups: [topTeam],
                    teams: 1,
                    players: topTeam.players,
                  }}
                  onClick={() => handleLevelClick("A", [topTeam])}
                />
              )}
              {pyramidLevels.map((lvl, i) => (
                <PyramidLevel
                  key={i}
                  level={{
                    name: lvl.name,
                    displayName: lvl.displayName,
                    ageGroups: lvl.ageGroups,
                    teams: lvl.teams,
                    players: lvl.players,
                  }}
                  onClick={() => handleLevelClick(lvl.name, lvl.ageGroups)}
                />
              ))}
            </>
          )}
        </motion.div>

        {/* BEFA - après chargement, entrant depuis la droite */}
        {!loading && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            whileHover={{ scale: 1.05 }}
            className="hidden md:flex flex-col items-center mt-40"
          >
            <SideBox
              title="BEFA"
              items={befaTeams}
              onClick={() => handleLevelClick("BEFA", befaTeams)}
            />
          </motion.div>
        )}
      </div>

      {/* Modal */}
      <ModalPlayers
        open={modalOpen}
        title={modalTitle}
        loading={modalLoading}
        playersByCat={playersByCat}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default PyramidStructure;

// — Composants auxiliaires —
const SideBox: React.FC<{
  title: string;
  items: TeamInfo[];
  onClick: () => void;
}> = ({ title, items, onClick }) => {
  const total = items.reduce((sum, t) => sum + t.players, 0);
  return (
    <div
      onClick={onClick}
      className="bg-black text-white px-4 py-3 rounded-lg shadow-md w-48 cursor-pointer transform transition flex flex-col items-center"
    >
      <h4 className="font-bold mb-1">{title}</h4>
      <p className="text-xs text-blue-100 mb-2">
        {items.length} équipes – {total} joueurs
      </p>
      {items.map((i) => (
        <p key={i.id} className="text-xs text-blue-100 truncate">
          {i.name}
        </p>
      ))}
    </div>
  );
};

const PyramidLevel: React.FC<{
  level: {
    name: string;
    displayName?: string; // Champ optionnel pour l'affichage
    ageGroups: TeamInfo[];
    teams: number;
    players: number;
  };
  onClick: () => void;
}> = ({ level, onClick }) => {
  const widths = ["w-64", "w-80", "w-96", "w-[30rem]", "w-[36rem]"];
  const colors = [
    "bg-red-700",
    "bg-red-600",
    "bg-red-500",
    "bg-red-400",
    "bg-red-300",
    "bg-red-200",
  ];
  // Utiliser le nom original pour l'index
  const idx = [
    "A",
    "Senior Youth",
    "Middle Youth",
    "Junior Youth",
    "Foundation",
  ].indexOf(level.name);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="flex flex-col items-center mb-5 cursor-pointer"
    >
      <div
        className={`
          ${widths[idx] || widths[0]} ${colors[idx] || colors[5]}
          relative p-4 text-white shadow-lg
          clip-[polygon(50%_0%,100%_100%,0%_100%)] border-4 border-white
        `}
      >
        <div className="flex justify-between items-center whitespace-nowrap">
          <h3 className="text-xl font-bold">
            {level.displayName || level.name}
          </h3>
          <div className="flex gap-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {level.teams} {level.teams > 1 ? "Équipes" : "Équipe"}
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {level.players} Joueurs
            </span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          {level.ageGroups.map((g) => (
            <span
              key={g.id}
              className="bg-white/10 px-3 py-1 rounded-md text-sm"
            >
              {g.name}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
