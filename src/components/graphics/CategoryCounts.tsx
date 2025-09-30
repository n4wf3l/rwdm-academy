import React, { useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Loader2, Download } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "../ui/button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  pyramidRef?: React.RefObject<HTMLDivElement>; // Référence à la pyramide pour le PDF
}

const CategoryCounts: React.FC<CategoryCountsProps> = ({
  teams,
  loading,
  pyramidRef,
}) => {
  const { t } = useTranslation();
  const statsRef = useRef<HTMLDivElement>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  // Fonction pour générer le PDF
  const generatePDF = async () => {
    setIsPdfGenerating(true); // Active l'état de génération

    const pdf = new jsPDF("p", "mm", "a4");

    try {
      // Ajouter le titre au PDF
      pdf.setFontSize(24);
      pdf.setTextColor(0, 0, 0);
      pdf.text("RWDM Brussels Academy", 105, 20, { align: "center" });
      pdf.setFontSize(16);
      pdf.text(new Date().toLocaleDateString(), 105, 30, { align: "center" });
      pdf.setDrawColor(0);
      pdf.line(20, 35, 190, 35);

      let yPosition = 45; // Position Y initiale après le titre

      // Capturer la carte des totaux de joueurs si elle existe
      if (pyramidRef?.current) {
        // Trouver la carte des totaux (c'est le premier enfant de pyramidRef)
        const totalCard = pyramidRef.current.querySelector(".mb-6");

        if (totalCard) {
          const totalCanvas = await html2canvas(totalCard as HTMLElement, {
            scale: 2,
          });
          const totalImgData = totalCanvas.toDataURL("image/png");

          // Ajouter l'image des totaux au PDF
          const totalImgWidth = 170; // Légèrement plus petit que la largeur max
          const totalImgHeight =
            (totalCanvas.height * totalImgWidth) / totalCanvas.width;

          pdf.addImage(
            totalImgData,
            "PNG",
            20, // Centré horizontalement
            yPosition,
            totalImgWidth,
            totalImgHeight
          );

          yPosition += totalImgHeight + 15; // Mettre à jour la position Y
        }
      }

      // Capturer les stats
      if (statsRef.current) {
        const statsCanvas = await html2canvas(statsRef.current, { scale: 2 });
        const statsImgData = statsCanvas.toDataURL("image/png");

        // Ajouter les stats au PDF
        const statsImgWidth = 180;
        const statsImgHeight =
          (statsCanvas.height * statsImgWidth) / statsCanvas.width;

        pdf.addImage(
          statsImgData,
          "PNG",
          15, // Centré horizontalement
          yPosition,
          statsImgWidth,
          statsImgHeight
        );

        yPosition += statsImgHeight + 15; // Mettre à jour la position Y
      }

      // Capturer la pyramide si disponible
      if (pyramidRef?.current) {
        // On exclut la carte des totaux en ciblant uniquement la structure de la pyramide
        const pyramidStructure =
          pyramidRef.current.querySelector('[data-pyramid-structure="true"]') ||
          pyramidRef.current.querySelector(".relative > .relative");

        if (pyramidStructure) {
          const pyramidCanvas = await html2canvas(
            pyramidStructure as HTMLElement,
            {
              scale: 2,
              windowWidth: 1200, // Assurer une bonne largeur pour la capture
              windowHeight: 1800,
            }
          );
          const pyramidImgData = pyramidCanvas.toDataURL("image/png");

          // Si la pyramide ne tient pas sur la même page, ajouter une nouvelle page
          const pyramidImgWidth = 180;
          const pyramidImgHeight =
            (pyramidCanvas.height * pyramidImgWidth) / pyramidCanvas.width;

          if (yPosition + pyramidImgHeight > 250) {
            pdf.addPage();
            yPosition = 20; // Réinitialiser la position Y sur la nouvelle page
          }

          pdf.addImage(
            pyramidImgData,
            "PNG",
            15, // Centré horizontalement
            yPosition,
            pyramidImgWidth,
            pyramidImgHeight
          );
        }
      }

      // Sauvegarder le PDF
      pdf.save("rwdm-brussels-academy-stats.pdf");
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert(t("pdf.generationError"));
    } finally {
      setIsPdfGenerating(false); // Désactive l'état de génération dans tous les cas
    }
  };

  // Nouveaux filtres
  const rwdmForeverTeams = teams.filter((t) => /\bFOREVER\b/i.test(t.teamName));

  const rwdmTeams = teams.filter(
    (t) =>
      /(RWDM|RWDM BRUSSELS)/i.test(t.teamName) &&
      !/\bFOREVER\b/i.test(t.teamName)
  );

  const ebfaTeams = teams.filter((t) =>
    /(eagles|football academy)/i.test(t.teamName)
  );

  // Nouvelle structure stats
  const stats: Record<"RWDM ForEver" | "RWDM" | "EBFA", CategoryStats> = {
    "RWDM ForEver": {
      teams: rwdmForeverTeams.length,
      players: rwdmForeverTeams.reduce((sum, t) => sum + t.playerCount, 0),
    },
    RWDM: {
      teams: rwdmTeams.length,
      players: rwdmTeams.reduce((sum, t) => sum + t.playerCount, 0),
    },
    EBFA: {
      teams: ebfaTeams.length,
      players: ebfaTeams.reduce((sum, t) => sum + t.playerCount, 0),
    },
  };

  // Catégories à afficher
  const categories = ["RWDM ForEver", "RWDM", "EBFA"] as const;

  return (
    <Card className="mb-8 mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("categoryCounts.title")}</CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={generatePDF}
          disabled={loading || isPdfGenerating}
        >
          {isPdfGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
              <span>{t("pdf.generating")}</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>{t("pdf.export")}</span>
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
          </div>
        ) : (
          <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const count = stats[cat].teams;
              const teamsLabel =
                count > 1
                  ? t("categoryCounts.teamsPlural")
                  : t("categoryCounts.teamsSingular");

              return (
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
                    {count} {teamsLabel}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryCounts;
