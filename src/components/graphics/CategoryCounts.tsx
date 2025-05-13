// components/CategoryCounts.tsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Loader2 } from "lucide-react";

interface TeamRaw {
  teamId: number;
  teamName: string;
  playerCount: number;
}

interface CategoryStats {
  teams: number;
  players: number;
}

interface CategoryCountsProps {
  teams: TeamRaw[];
  loading: boolean;
}

const CategoryCounts: React.FC<CategoryCountsProps> = ({ teams, loading }) => {
  // Filtrer et calculer les stats
  const befaTeams = teams.filter((t) => /(befa|eagles)/i.test(t.teamName));
  const rfTeams = teams.filter((t) => /\brf\b/i.test(t.teamName));
  const rwdmTeams = teams.filter((t) => /RWDM/i.test(t.teamName));

  const stats: Record<"RF" | "RWDM" | "BEFA", CategoryStats> = {
    RF: {
      teams: rfTeams.length,
      players: rfTeams.reduce((sum, t) => sum + t.playerCount, 0),
    },
    RWDM: {
      teams: rwdmTeams.length,
      players: rwdmTeams.reduce((sum, t) => sum + t.playerCount, 0),
    },
    BEFA: {
      teams: befaTeams.length,
      players: befaTeams.reduce((sum, t) => sum + t.playerCount, 0),
    },
  };

  return (
    <Card className="mb-8 mt-8">
      <CardHeader>
        <CardTitle>Statistiques par catégorie</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {(["RF", "RWDM", "BEFA"] as const).map((cat) => (
              <div
                key={cat}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition cursor-pointer border"
              >
                <h4 className="text-center text-lg font-semibold mb-2">
                  {cat}
                </h4>
                <p className="text-5xl font-bold text-center text-gray-900">
                  {stats[cat].players}
                </p>
                <p className="text-sm text-center text-gray-500 mt-2">
                  {stats[cat].teams}{" "}
                  {stats[cat].teams > 1 ? "équipes" : "équipe"}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryCounts;
