import React, { useEffect, useState, useMemo } from "react";
import { ChevronDown, X } from "lucide-react";
import axios from "axios";

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
  ageGroups: TeamInfo[];
  teams: number;
  players: number;
  match: (name: string) => boolean;
}

const PyramidStructure: React.FC = () => {
  const [teams, setTeams] = useState<TeamRaw[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [playersByCat, setPlayersByCat] = useState<Record<string, string[]>>(
    {}
  );
  const [modalTitle, setModalTitle] = useState<string>("");

  useEffect(() => {
    axios
      .get<TeamRaw[]>("http://localhost:5001/api/teams/player-counts")
      .then((res) =>
        setTeams(res.data.filter((t) => typeof t.teamName === "string"))
      )
      .catch((err) => console.error("Erreur chargement équipes", err))
      .finally(() => setLoading(false));
  }, []);

  const { rwTeams, befaTeams, topTeam, pyramidLevels, otherTeams } =
    useMemo(() => {
      const rw: TeamInfo[] = [];
      const befa: TeamInfo[] = [];
      const other: TeamInfo[] = [];
      let top: TeamInfo | null = null;

      const levels: Level[] = [
        {
          name: "Senior Youth",
          ageGroups: [],
          teams: 0,
          players: 0,
          match: (n) => /U1[89]|U2[01]/i.test(n),
        },
        {
          name: "Middle Youth",
          ageGroups: [],
          teams: 0,
          players: 0,
          match: (n) => /U1[3-7]/i.test(n),
        },
        {
          name: "Junior Youth",
          ageGroups: [],
          teams: 0,
          players: 0,
          match: (n) => /U(1[0-2]|9)/i.test(n),
        },
        {
          name: "Foundation",
          ageGroups: [],
          teams: 0,
          players: 0,
          match: (n) => /U[5-8]/i.test(n),
        },
      ];

      teams.forEach((t) => {
        const name = t.teamName,
          cnt = t.playerCount,
          low = name.toLowerCase();
        if (low.includes("befa") || low.includes("eagles")) {
          befa.push({
            id: t.teamId,
            name: name.replace(/Eagles Brussels Football Academy/i, "BEFA"),
            players: cnt,
          });
        } else if (low.includes("rf")) {
          rw.push({ id: t.teamId, name, players: cnt });
        } else if (name.includes("RWDM") && !/U\d+/i.test(name)) {
          top = { id: t.teamId, name, players: cnt };
        } else {
          const lvl = levels.find((l) => l.match(name));
          if (lvl) {
            lvl.teams++;
            lvl.players += cnt;
            lvl.ageGroups.push({ id: t.teamId, name, players: cnt });
          } else {
            other.push({ id: t.teamId, name, players: cnt });
          }
        }
      });

      return {
        rwTeams: rw,
        befaTeams: befa,
        topTeam: top,
        pyramidLevels: levels,
        otherTeams: other,
      };
    }, [teams]);

  const handleLevelClick = async (title: string, items: TeamInfo[]) => {
    setModalTitle(title);
    setModalLoading(true);
    setModalOpen(true);

    try {
      const byCat: Record<string, string[]> = {};
      for (const team of items) {
        await new Promise((r) => setTimeout(r, 200));
        const res = await axios.get<any>(
          `http://localhost:5001/api/teams/${team.id}/members`
        );
        const data = res.data;
        const members: any[] = Array.isArray(data.content)
          ? data.content
          : Array.isArray(data)
          ? data
          : [];
        const match = team.name.match(/U\d{1,2}/i);
        if (!match) continue; // on ignore non-Uxx
        const cat = match[0].toUpperCase();
        byCat[cat] = byCat[cat] || [];
        members.forEach((m) => {
          const raw =
            m.fullName || [m.firstName, m.lastName].filter(Boolean).join(" ");
          if (!raw) return;
          const nice = raw
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");
          byCat[cat].push(nice);
        });
      }
      setPlayersByCat(byCat);
    } catch (err) {
      console.error("Erreur fetch players:", err);
      setPlayersByCat({ Erreur: ["Impossible de charger les joueurs"] });
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="relative py-10">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
        Hiérarchie des équipes
      </h2>

      <div className="flex items-start justify-center gap-8">
        <div className="hidden md:flex flex-col items-center mt-40">
          <SideBox
            title="RWDM ForEver"
            items={rwTeams}
            onClick={() => handleLevelClick("RWDM ForEver", rwTeams)}
          />
        </div>

        <div className="flex flex-col items-center mx-4 md:mx-8 max-w-4xl">
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <>
              {topTeam && (
                <PyramidLevel
                  level={{
                    name: "A",
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
                    ageGroups: lvl.ageGroups,
                    teams: lvl.teams,
                    players: lvl.players,
                  }}
                  onClick={() => handleLevelClick(lvl.name, lvl.ageGroups)}
                />
              ))}
              {otherTeams.length > 0 && (
                <PyramidLevel
                  level={{
                    name: "Autres",
                    ageGroups: otherTeams,
                    teams: otherTeams.length,
                    players: otherTeams.reduce((a, t) => a + t.players, 0),
                  }}
                  onClick={() => handleLevelClick("Autres", otherTeams)}
                />
              )}
            </>
          )}
        </div>

        <div className="hidden md:flex flex-col items-center mt-40">
          <SideBox
            title="BEFA"
            items={befaTeams}
            onClick={() => handleLevelClick("BEFA", befaTeams)}
          />
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-6 z-50"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg w-full max-w-4xl max-h-full overflow-y-auto p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
              onClick={() => setModalOpen(false)}
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold mb-4">{modalTitle}</h3>

            {modalLoading ? (
              <p>Chargement des joueurs…</p>
            ) : (
              <div className="flex flex-wrap gap-6">
                {Object.entries(playersByCat).map(([cat, names]) => (
                  <div key={cat} className="flex-1 min-w-[200px]">
                    <h2 className="text-xl font-semibold mb-2">{cat}</h2>
                    <ul className="list-disc list-inside space-y-1">
                      {names.map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PyramidStructure;

// -----------------------
// Composants auxiliaires
// -----------------------
const SideBox: React.FC<{
  title: string;
  items: { id: number; name: string; players: number }[];
  onClick: () => void;
}> = ({ title, items, onClick }) => {
  const total = items.reduce((s, i) => s + i.players, 0);
  return (
    <div
      className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-md w-48 cursor-pointer
                 transform transition hover:scale-105 flex flex-col items-center"
      onClick={onClick}
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
  const idx = [
    "A",
    "Senior Youth",
    "Middle Youth",
    "Junior Youth",
    "Foundation",
    "Autres",
  ].indexOf(level.name);

  return (
    <div className="flex flex-col items-center mb-5" onClick={onClick}>
      <div
        className={`${widths[idx] || widths[0]} ${colors[idx] || colors[5]}
                      rounded-lg p-4 text-white shadow-lg cursor-pointer
                      hover:scale-[1.02] transition-transform`}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">{level.name}</h3>
          <div className="flex gap-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {level.teams} {level.teams > 1 ? "Teams" : "Team"}
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {level.players} Players
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
      <ChevronDown size={28} className="text-red-600 animate-bounce mt-2" />
    </div>
  );
};
