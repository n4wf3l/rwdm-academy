import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Download, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import axios from "axios";

const MedicalReportPDF = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { t, lang } = useTranslation();
  const [pdfAvailable, setPdfAvailable] = useState<{
    fr: boolean;
    nl: boolean;
  }>({
    fr: false,
    nl: false,
  });

  // Récupérer les informations sur les PDFs depuis l'API lors du chargement du composant
  useEffect(() => {
    const checkPdfAvailability = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/accident-forms"
        );

        if (response.data?.forms) {
          const frForm = response.data.forms.find(
            (form: any) => form.language === "FR"
          );
          const nlForm = response.data.forms.find(
            (form: any) => form.language === "NL"
          );

          setPdfAvailable({
            fr: !!frForm,
            nl: !!nlForm,
          });
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des PDF:", error);
        setPdfAvailable({ fr: false, nl: false });
      }
    };

    checkPdfAvailability();
  }, []);

  const handleDownload = async (lang: "fr" | "nl") => {
    try {
      const response = await axios({
        url: `http://localhost:5000/api/accident-forms/download/${lang.toUpperCase()}`,
        method: "GET",
        responseType: "blob",
      });

      // Vérifier si le serveur a renvoyé une erreur avec un contenu JSON
      if (response.data.type === "application/json") {
        const reader = new FileReader();
        reader.onload = () => {
          const errorData = JSON.parse(reader.result as string);
          toast({
            title: t("download_error_title") || "Erreur",
            description: errorData.error || t("download_error_description"),
            variant: "destructive",
          });
        };
        reader.readAsText(response.data);
        return;
      }

      // Créer un nom de fichier adapté
      const contentDisposition = response.headers["content-disposition"];
      let fileName =
        lang === "fr" ? "declaration_accident.pdf" : "melding_ongeval.pdf";

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          fileName = filenameMatch[1];
        }
      }

      // Télécharger le fichier
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: t("toast_download_title"),
        description:
          lang === "fr"
            ? t("toast_download_desc_fr")
            : t("toast_download_desc_nl"),
      });

      setOpen(false);
    } catch (error) {
      console.error("Erreur lors du téléchargement du PDF:", error);
      toast({
        title: t("download_error_title") || "Erreur",
        description:
          t("pdf_not_configured") ||
          "Ce formulaire n'a pas encore été configuré par l'administrateur.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex justify-center mt-6">
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {t("medical_download_button")}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <DialogTitle>{t("medical_dialog_title")}</DialogTitle>
            <DialogDescription>
              {t("medical_dialog_description")}
            </DialogDescription>
          </DialogHeader>

          {!pdfAvailable.fr && !pdfAvailable.nl ? (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md text-amber-800 dark:text-amber-200 flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              <p>{t("pdf_not_available")}</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => handleDownload("fr")}
                disabled={!pdfAvailable.fr}
              >
                <Download className="w-4 h-4 mr-2" />
                {t("medical_language_fr")}
                {!pdfAvailable.fr && (
                  <span className="ml-2 text-xs text-gray-400">
                    {t("not_available")}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => handleDownload("nl")}
                disabled={!pdfAvailable.nl}
              >
                <Download className="w-4 h-4 mr-2" />
                {t("medical_language_nl")}
                {!pdfAvailable.nl && (
                  <span className="ml-2 text-xs text-gray-400">
                    {t("not_available")}
                  </span>
                )}
              </Button>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MedicalReportPDF;
