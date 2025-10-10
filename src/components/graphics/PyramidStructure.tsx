// components/graphics/PyramidStructure.tsx

import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import ModalPlayers from "./ModalPlayers";
import CategoryCounts from "./CategoryCounts";
import { Card, CardContent } from "../ui/card";
import { Loader } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { API_BASE, fetchConfig } from "@/lib/api-config";

/* ------------------------- CONFIG API (LOCAL/DEV) ------------------------- */
// Utiliser notre configuration API centralisée

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

// — Composants auxiliaires (déclarés avant pour éviter erreur de portée) —

function SideBox(props: {
  title: string;
  items: TeamInfo[];
  onClick: () => void;
}) {
  const { title, items, onClick } = props;
  const total = items.reduce((sum, t) => sum + t.players, 0);
  const { t } = useTranslation();

  return (
    <div
      onClick={onClick}
      className="bg-black text-white px-4 py-3 rounded-lg shadow-md w-48 cursor-pointer transition-transform hover:scale-105 flex flex-col items-center"
    >
      <h4 className="font-bold mb-1">{title}</h4>
      <p className="text-xs text-blue-100 mb-2">
        {items.length} {items.length > 1 ? t("teamsPlural") : t("teamSingular")}{" "}
        – {total} {t("players")}
      </p>
      {items.map((i) => (
        <p key={i.id} className="text-xs text-blue-100 truncate">
          {i.name}
        </p>
      ))}
    </div>
  );
}

function PyramidLevel(props: {
  level: {
    name: string;
    displayName?: string;
    ageGroups: TeamInfo[];
    teams: number;
    players: number;
  };
  onClick: () => void;
}) {
  const { level, onClick } = props;
  const { t } = useTranslation();
  const widths = ["w-64", "w-80", "w-96", "w-[30rem]", "w-[36rem]"];
  const colors = [
    "bg-red-700",
    "bg-red-600",
    "bg-red-500",
    "bg-red-400",
    "bg-red-300",
    "bg-red-200",
  ];
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
        className={`${widths[idx] || widths[0]} ${
          colors[idx] || colors[5]
        } relative p-4 text-white shadow-lg clip-[polygon(50%_0%,100%_100%,0%_100%)] border-4 border-white`}
      >
        <div className="flex justify-between items-center whitespace-nowrap">
          <h3 className="text-xl font-bold">
            {level.displayName || level.name}
          </h3>
          <div className="flex gap-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {level.teams}{" "}
              {level.teams > 1 ? t("teamsPlural") : t("teamSingular")}
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {level.players} {t("players")}
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
}

// — Composant principal —

const PyramidStructure: React.FC = () => {
  const [teams, setTeams] = useState<TeamRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const pyramidRef = useRef<HTMLDivElement>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [playersByCat, setPlayersByCat] = useState<Record<string, string[]>>(
    {}
  );
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/teams/player-counts`, {
          ...fetchConfig
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // S'assurer que data est un tableau
        const teamsArray = Array.isArray(data) ? data : Array.isArray(data.teams) ? data.teams : [];
        
        setTeams(teamsArray.filter((t) => typeof t.teamName === "string"));
      } catch (error) {
        console.error("Erreur lors du chargement des équipes:", error);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
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
        // U20–U23 (Uxx ou Under-xx)
        match: (n) => /\b(?:U|Under-)(2[0-3])\b/i.test(n),
      },
      {
        name: "Middle Youth",
        displayName: "Jeu à 11",
        ageGroups: [],
        teams: 0,
        players: 0,
        // U13–U19
        match: (n) => /\b(?:U|Under-)(1[3-9])\b/i.test(n),
      },
      {
        name: "Junior Youth",
        displayName: "Jeu à 8",
        ageGroups: [],
        teams: 0,
        players: 0,
        // U10–U12
        match: (n) => /\b(?:U|Under-)(1[0-2])\b/i.test(n),
      },
      {
        name: "Foundation",
        displayName: "Préformation",
        ageGroups: [],
        teams: 0,
        players: 0,
        // U5–U9, exclut 10+
        match: (n) =>
          /\b(?:U|Under-)?[5-9]\b/i.test(n) &&
          !/\b(?:U|Under-)(1[0-9]|2[0-3])\b/i.test(n),
      },
    ];

    teams.forEach((t) => {
      const name = t.teamName,
        cnt = t.playerCount,
        lower = name.toLowerCase();

      if (/(befa|eagles)/i.test(lower)) {
        befa.push({
          id: t.teamId,
          name: name.replace(/Eagles Brussels Football Academy/i, "BEFA"),
          players: cnt,
        });
      } else if (/forever/i.test(lower) || /rf\b/i.test(lower)) {
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

    const rwTotal = rw.reduce((s, x) => s + x.players, 0);
    const befaTotal = befa.reduce((s, x) => s + x.players, 0);
    const pyramidTotal = levels.reduce((s, l) => s + l.players, 0);
    const topTotal = top?.players || 0;
    const total = rwTotal + befaTotal + pyramidTotal + topTotal;
    const unique = Math.round(total / 1.15);

    return {
      rwTeams: rw,
      befaTeams: befa,
      topTeam: top,
      pyramidLevels: levels,
      totalPlayers: total,
      uniquePlayers: unique,
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
        const response = await fetch(`${API_BASE}/api/teams/${team.id}/members`, {
          ...fetchConfig
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        res = await response.json();
      } catch (err: any) {
        if (err.message?.includes('429')) {
          await new Promise((r) => setTimeout(r, 1000));
          try {
            const retryResponse = await fetch(`${API_BASE}/api/teams/${team.id}/members`, {
              ...fetchConfig
            });
            
            if (retryResponse.ok) {
              res = await retryResponse.json();
            } else {
              console.warn(`Échec pour ${team.name}`);
              continue;
            }
          } catch (retryErr) {
            console.warn(`Échec pour ${team.name}`, retryErr);
            continue;
          }
        } else {
          console.warn(`Erreur pour ${team.name}`, err);
          continue;
        }
      }
      
      const data = res;
      const members: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
        ? data.content
        : [];
        
      let cat =
        title === "BEFA"
          ? "BEFA"
          : title === "A"
          ? "A"
          : team.name.match(/\b(?:U|Under-)?\d{1,2}\b/)?.[0].toUpperCase() ||
            team.name;
      byCat[cat] = byCat[cat] || [];
      members.forEach((m) => {
        const raw =
          m.fullName || [m.firstName, m.lastName].filter(Boolean).join(" ");
        if (!raw) return;
        const pretty = raw
          .split(" ")
          .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
          .join(" ");
        byCat[cat].push(pretty);
      });
    }

    setPlayersByCat(byCat);
    setModalLoading(false);
  };

  return (
    <div className="relative">
      <CategoryCounts teams={teams} loading={loading} pyramidRef={pyramidRef} />

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

      <div className="flex justify-center items-start gap-8 border border-gray-200 rounded-lg p-6">
        {!loading && (
          <SideBox
            title="RWDM ForEver"
            items={rwTeams}
            onClick={() => handleLevelClick("RWDM ForEver", rwTeams)}
          />
        )}
        <div className="flex flex-col items-center mx-4 md:mx-8 max-w-4xl">
          {loading ? (
            <Loader className="animate-spin w-8 h-8 text-gray-500" />
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
                  level={lvl}
                  onClick={() => handleLevelClick(lvl.name, lvl.ageGroups)}
                />
              ))}
            </>
          )}
        </div>
        {!loading && (
          <SideBox
            title="BEFA"
            items={befaTeams}
            onClick={() => handleLevelClick("BEFA", befaTeams)}
          />
        )}
      </div>

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