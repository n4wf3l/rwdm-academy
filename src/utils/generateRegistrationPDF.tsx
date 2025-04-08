import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";
import { Request } from "@/components/RequestDetailsModal";
import { Button } from "@/components/ui/button";

const generateRegistrationPDF = (request: Request) => {
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
      pdf.text("Fiche d'inscription", 105, logoHeight + 20, {
        align: "center",
      });
      pdf.addImage(imgData, "PNG", 10, logoHeight + 30, 190, 220);
      pdf.save("Fiche_Inscription.pdf");
    };
  };

  return (
    <div>
      <Button
        onClick={handleGenerate}
        className="mx-auto block bg-blue-600 text-white mt-4 mb-10"
      >
        Générer PDF
      </Button>

      <div ref={pdfRef} className="p-4 bg-white rounded-lg shadow-md space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-700">
            Informations du joueur
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
              <strong>Nationalité :</strong> {d.nationality || "-"}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-700">
            Parent / Tuteur
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
            Détails divers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p>
              <strong>Adresse :</strong> {d.address || "-"}
            </p>
            <p>
              <strong>Catégorie d'âge :</strong> {d.ageCategory || "-"}
            </p>
            <p>
              <strong>Position :</strong> {d.position || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default generateRegistrationPDF;
