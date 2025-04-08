import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Request } from "@/components/RequestDetailsModal";

export const generateAccidentReportPDF = async (
  request: Request,
  containerRef: React.RefObject<HTMLDivElement>
) => {
  if (!containerRef.current) return;

  const pdf = new jsPDF("p", "mm", "a4");

  // Capture HTML → Canvas → Image
  const canvas = await html2canvas(containerRef.current, {
    scale: 2,
    backgroundColor: "#ffffff",
  });
  const imgData = canvas.toDataURL("image/png");

  // Chargement du logo
  const logo = new Image();
  logo.src = "/logo.png";
  await new Promise((resolve, reject) => {
    logo.onload = resolve;
    logo.onerror = reject;
  });

  const logoWidth = 30;
  const logoHeight = (logo.height / logo.width) * logoWidth;

  // Ajout du logo
  pdf.addImage(logo, "PNG", (210 - logoWidth) / 2, 10, logoWidth, logoHeight);

  // Titre
  pdf.setFontSize(18);
  pdf.text("Déclaration d'accident", 105, logoHeight + 20, {
    align: "center",
  });

  // Contenu du formulaire (HTML transformé en image)
  pdf.addImage(imgData, "PNG", 10, logoHeight + 30, 190, 220);

  // Téléchargement
  pdf.save("Declaration_Accident.pdf");
};
