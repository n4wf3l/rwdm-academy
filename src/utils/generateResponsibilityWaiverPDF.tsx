import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Request } from "@/components/RequestDetailsModal";

// ✅ Fonction de traduction du type
const translateType = (type: string): string => {
  switch (type) {
    case "registration":
      return "Inscription";
    case "selection-tests":
      return "Tests techniques";
    case "responsibility-waiver":
      return "Décharge de responsabilité";
    case "accident-report":
      return "Déclaration d'accident";
    default:
      return type;
  }
};

export const generateResponsibilityWaiverPDF = async (
  request: Request,
  containerRef: React.RefObject<HTMLDivElement>
) => {
  const input = containerRef.current;

  if (!input) {
    console.error("Le container PDF est introuvable.");
    return;
  }

  const pdf = new jsPDF("p", "mm", "a4");

  // 📸 Capture HTML -> image
  const canvas = await html2canvas(input, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");

  // 📎 Charger le logo
  const logo = new Image();
  logo.src = "/logo.png";

  return new Promise<void>((resolve) => {
    logo.onload = () => {
      const logoWidth = 30;
      const logoHeight = (logo.height / logo.width) * logoWidth;

      // 📌 Logo centré
      pdf.addImage(
        logo,
        "PNG",
        (210 - logoWidth) / 2,
        10,
        logoWidth,
        logoHeight
      );

      // 📌 Titre dynamique en fonction du type
      pdf.setFontSize(18);
      pdf.text(translateType(request.type), 105, logoHeight + 20, {
        align: "center",
      });

      // 📌 Image HTML du formulaire
      pdf.addImage(imgData, "PNG", 10, logoHeight + 30, 190, 220);

      // 📄 Téléchargement
      pdf.save(`${translateType(request.type)}_${request.id}.pdf`);
      resolve();
    };
  });
};
