import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MedicalReportPDF = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleDownload = (lang: "fr" | "nl") => {
    const fileName =
      lang === "nl" ? "melding_ongeval.pdf" : "declaration_accident.pdf";

    const link = document.createElement("a");
    link.href = `/${fileName}`;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Téléchargement lancé",
      description:
        lang === "fr"
          ? "Le fichier en français est en cours de téléchargement."
          : "Het Nederlandstalige formulier wordt gedownload.",
    });

    setOpen(false);
  };

  return (
    <>
      <div className="flex justify-center mt-6">
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Télécharger le formulaire médical
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <DialogTitle>Choisissez la langue du formulaire</DialogTitle>
            <DialogDescription>
              Le formulaire PDF est disponible en français ou en néerlandais.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => handleDownload("fr")}
            >
              <Download className="w-4 h-4 mr-2" />
              Français
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => handleDownload("nl")}
            >
              <Download className="w-4 h-4 mr-2" />
              Nederlands
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MedicalReportPDF;
