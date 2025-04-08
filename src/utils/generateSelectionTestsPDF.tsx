import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";
import { Request } from "@/components/RequestDetailsModal";
import { Button } from "@/components/ui/button";

const generateSelectionTestsPDF = (request: Request) => {
  const d = request.details;
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    const input = pdfRef.current;
    const pdf = new jsPDF("p", "mm", "a4");

    const canvas = await html2canvas(input!, {
      scale: 2,
      backgroundColor: "#ffffff",
    });
    const imgData = canvas.toDataURL("image/png");

    const logo = new Image();
    logo.src = "/logo.png";
    logo.onload = () => {
      const logoWidth = 30;
      const logoHeight = (logo.height / logo.width) * logoWidth;

      pdf.addImage(
        logo,
        "PNG",
        (210 - logoWidth) / 2,
        10,
        logoWidth,
        logoHeight
      );
      pdf.setFontSize(18);
      pdf.text("Tests techniques", 105, logoHeight + 20, { align: "center" });
      pdf.addImage(imgData, "PNG", 10, logoHeight + 30, 190, 220);
      pdf.save("Tests_Techniques.pdf");
    };
  };

  return (
    <div>
      <Button
        onClick={handleGenerate}
        className="mx-auto block bg-yellow-600 text-white mt-4 mb-10"
      >
        Générer PDF
      </Button>

      <div ref={pdfRef} className="p-4 bg-white rounded-lg shadow-md space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-700">
            Infos joueur
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p>
              <strong>Nom :</strong> {d.lastName || "-"}
            </p>
            <p>
              <strong>Prénom :</strong> {d.firstName || "-"}
            </p>
            <p>
              <strong>Date de naissance :</strong> {d.birthDate || "-"}
            </p>
            <p>
              <strong>Club actuel :</strong> {d.currentClub || "-"}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-700">
            Contact parent
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p>
              <strong>Nom :</strong> {d.parentLastName || "-"}
            </p>
            <p>
              <strong>Prénom :</strong> {d.parentFirstName || "-"}
            </p>
            <p>
              <strong>Email :</strong> {d.parent1Email || "-"}
            </p>
            <p>
              <strong>Téléphone :</strong> {d.parent1Phone || "-"}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-700">
            Détails de test
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p>
              <strong>Jour de participation :</strong> {d.testDay || "-"}
            </p>
            <p>
              <strong>Horaire :</strong> {d.testTime || "-"}
            </p>
            <p>
              <strong>Confirmation :</strong> {d.confirmation || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default generateSelectionTestsPDF;
