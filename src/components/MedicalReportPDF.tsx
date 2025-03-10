import React, { useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button"; // Utilisation de ton composant Button si existant

const MedicalReportPDF = () => {
  const pdfRef = useRef<HTMLDivElement>(null);

  // Fonction pour générer le PDF
  const generatePDF = () => {
    const input = pdfRef.current;
  
    if (!input) return;
  
    // Rendre le contenu visible avant la capture
    input.style.visibility = 'visible';
  
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
  
      pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
      pdf.save("rapport_medical.pdf");
  
      // Rendre le contenu à nouveau invisible après la capture
      input.style.visibility = 'hidden';
    });
  };

  return (
    <div className="p-6">
      {/* Contenu caché qui sera utilisé pour le PDF */}
      <div ref={pdfRef} style={{ visibility: 'hidden', position: 'absolute' }}>
        {/* Titre */}
        <h2 className="text-xl font-bold text-center mb-4">À remplir par le médecin traitant</h2>

        {/* Formulaire */}
        <div className="space-y-4 text-sm">
          <p>1. Date du 1er examen médical : __________</p>
          <p>2. Quelle est la nature et la gravité des blessures ou des lésions ?</p>
          <p className="border p-2 h-12"></p>

          <p>3. Estimez-vous la nécessité de l’intervention d’un spécialiste ? OUI / NON</p>
          <p>   Combien de séances sont nécessaires ? ________</p>
          <p>   (Si c’est une URGENCE, une copie de la prescription doit être adressée AVANT chaque nouvelle série débutée)</p>

          <p>4. S’agit-il d’une récidive ? OUI / NON</p>

          <p>5. Y a-t-il des séquelles d’un accident antérieur ? OUI / NON</p>
          <p>   Si oui, indiquez les constatations et la référence sur la déclaration de l’accident.</p>
          <p className="border p-2 h-12"></p>

          <p>6. Conséquence de l’accident :</p>
          <p>   - Incapacité partielle de travail : OUI / NON pendant _____ jours</p>
          <p>   - Incapacité totale de travail : OUI / NON pendant _____ jours</p>
          <p>   - Incapacité sportive : OUI / NON pendant _____ jours</p>

          <p>7. L’accident provoquera-t-il une invalidité permanente ? OUI / NON</p>

          <p>8. Peut-on estimer que les lésions sont consolidées ? OUI / NON</p>

          <p>9. Vos constatations comportent-elles une réserve ? OUI / NON</p>
          <p>   Si oui, lesquelles ?</p>
          <p className="border p-2 h-12"></p>

          {/* Signature du médecin */}
          <p className="mt-4">Le médecin : _____________________</p>
          <p className="mt-1">Délivré à _____________________</p>
          <p className="mt-1">Le ___/___/20___</p>
        </div>
      </div>

      {/* Bouton pour générer le PDF */}
      <div className="flex justify-center mt-6">
        <Button onClick={generatePDF} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Générer le PDF Médical
        </Button>
      </div>
    </div>
  );
};

export default MedicalReportPDF;