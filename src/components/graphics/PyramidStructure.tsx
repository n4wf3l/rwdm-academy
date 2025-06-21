// components/graphics/PyramidStructure.tsx
import React, { useEffect, useState, useMemo, useRef } from "react";
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

  // Ajouter cette référence
  const pyramidRef = useRef<HTMLDivElement>(null);
  const pyramidStructureRef = useRef<HTMLDivElement>(null); // Nouvelle référence

  useEffect(() => {
    axios
      .get<TeamRaw[]>("http://localhost:5000/api/teams/player-counts")
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
        // Nouveau: Détecte juste le nombre 20-23 au lieu de U20-U23
        match: (n) => /\b(2[0-3])\b/i.test(n),
      },
      {
        name: "Middle Youth",
        displayName: "Jeu à 11",
        ageGroups: [],
        teams: 0,
        players: 0,
        // Nouveau: Détecte juste les nombres 13-19
        match: (n) => /\b(1[3-9])\b/i.test(n),
      },
      {
        name: "Junior Youth",
        displayName: "Jeu à 8",
        ageGroups: [],
        teams: 0,
        players: 0,
        // Nouveau: Détecte juste les nombres 10-12
        match: (n) => /\b(1[0-2])\b/i.test(n),
      },
      {
        name: "Foundation",
        displayName: "Préformation",
        ageGroups: [],
        teams: 0,
        players: 0,
        // Version améliorée: détecte mieux U5-U9 et les nombres simples 5-9
        match: (n) =>
          /\b([U]?[5-9])\b/i.test(n) || /\b(Under-[5-9])\b/i.test(n),
      },
    ];

    // Mettre à jour la classification des équipes
    teams.forEach((t) => {
      const name = t.teamName,
        cnt = t.playerCount,
        low = name.toLowerCase();

      // Détecte l'équipe A (regarde pour A-team)
      if (/(DARING BRUSSELS|Daring Brussels).+A-team/i.test(name)) {
        top = { id: t.teamId, name, players: cnt };
      }
      // Sépare clairement DBF et DARING BRUSSELS
      else if (/^DBF\s/i.test(name)) {
        // Uniquement les équipes commençant par DBF dans la sidebox
        rw.push({ id: t.teamId, name, players: cnt });
      }
      // Condition plus tolérante pour RWDM
      else if (/RWDM\s*U?\d/i.test(name)) {
        // Le \s* permet zéro ou plusieurs espaces, U? rend le U optionnel
        const lvl = levels.find((l) => l.match(name));
        if (lvl) {
          lvl.teams++;
          lvl.players += cnt;
          lvl.ageGroups.push({
            id: t.teamId,
            name: name.replace(/RWDM/i, "DARING BRUSSELS"),
            players: cnt,
          });
        }
      } else if (/(DARING BRUSSELS|Daring Brussels)/i.test(name)) {
        // Ne pas ajouter équipes DARING BRUSSELS dans la sidebox

        // Mais les ajouter quand même à la pyramide au milieu
        const lvl = levels.find((l) => l.match(name));
        if (lvl) {
          lvl.teams++;
          lvl.players += cnt;
          lvl.ageGroups.push({ id: t.teamId, name, players: cnt });
        }
      }
      // Détection Eagles Brussels Football Academy
      else if (/(eagles|football academy)/i.test(low)) {
        befa.push({
          id: t.teamId,
          name: name,
          players: cnt,
        });
      }
      // Autres équipes (détection par niveau d'âge)
      else {
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
          `http://localhost:5000/api/teams/${team.id}/members`
        );
      } catch (err: any) {
        if (err.response?.status === 429) {
          await new Promise((r) => setTimeout(r, 1000));
          try {
            res = await axios.get<any>(
              `http://localhost:5000/api/teams/${team.id}/members`
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
      if (title === "EBFA") {
        // Utiliser le nom de l'équipe comme catégorie ou "BEFA" par défaut
        cat = team.name.replace(/Eagles Brussels Football Academy/i, "EBFA");
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
      {/* Passer la référence de la pyramide au composant CategoryCounts */}
      <CategoryCounts teams={teams} loading={loading} pyramidRef={pyramidRef} />

      {/* Ajouter la référence à la div contenant la structure de la pyramide */}
      <div ref={pyramidRef}>
        {/* Total Players Card - reste inclus dans pyramidRef */}
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
                    <div className="text-4xl font-bold mb-1">
                      {uniquePlayers}
                    </div>
                    <p className="text-xs opacity-80">
                      {t("withoutDuplicates")}
                    </p>
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

        {/* Structure de la pyramide proprement dite */}
        <div
          ref={pyramidStructureRef}
          className="relative"
          data-pyramid-structure="true"
        >
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader className="animate-spin w-8 h-8 text-gray-500" />
            </div>
          ) : (
            <>
              {/* Top team */}
              {topTeam && (
                <div className="flex justify-center">
                  <PyramidLevel
                    level={{
                      name: "A",
                      ageGroups: [topTeam],
                      teams: 1,
                      players: topTeam.players,
                    }}
                    onClick={() => handleLevelClick("A-team", [topTeam])}
                  />
                </div>
              )}

              {/* Rest of the pyramid structure */}
              {pyramidLevels.map((level) => (
                <div key={level.name} className="flex justify-center">
                  <PyramidLevel
                    level={level}
                    onClick={() =>
                      handleLevelClick(
                        level.displayName || level.name,
                        level.ageGroups
                      )
                    }
                  />
                </div>
              ))}

              {/* Side boxes */}
              <div className="absolute left-0 top-1/3 transform -translate-x-12">
                <SideBox
                  title="DB ForEver"
                  items={rwTeams}
                  onClick={() => handleLevelClick("DB ForEver", rwTeams)}
                />
              </div>
              <div className="absolute right-0 top-1/3 transform translate-x-12">
                <SideBox
                  title="EBFA"
                  items={befaTeams}
                  onClick={() => handleLevelClick("EBFA", befaTeams)}
                />
              </div>
            </>
          )}
        </div>
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
  const { t } = useTranslation(); // Ajouter cette ligne pour accéder aux traductions

  // Fonction pour formater les noms d'équipes - inchangée
  const formatTeamName = (name: string) => {
    if (/Eagles Brussels Football Academy/i.test(name)) {
      const match = name.match(/Eagles Brussels Football Academy (U\d+\s+.*)/i);
      if (match && match[1]) {
        return `EBFA ${match[1]}`;
      }
    }
    return name;
  };

  return (
    <div
      onClick={onClick}
      className="bg-black text-white px-4 py-3 rounded-lg shadow-md w-48 cursor-pointer transform transition flex flex-col items-center"
    >
      <h4 className="font-bold mb-1">{title}</h4>
      <p className="text-xs text-blue-100 mb-2">
        {items.length} {t("teams")} – {total} {t("players")}
      </p>
      {items.map((i) => (
        <p key={i.id} className="text-xs text-blue-100 truncate">
          {formatTeamName(i.name)}
        </p>
      ))}
    </div>
  );
};

const PyramidLevel: React.FC<{
  level: {
    name: string;
    displayName?: string;
    ageGroups: TeamInfo[];
    teams: number;
    players: number;
  };
  onClick: () => void;
}> = ({ level, onClick }) => {
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
};
