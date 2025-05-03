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
import { useTranslation } from "@/hooks/useTranslation";

const MedicalReportPDF = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { t, lang } = useTranslation();

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
      title: t("toast_download_title"),
      description:
        lang === "fr"
          ? t("toast_download_desc_fr")
          : t("toast_download_desc_nl"),
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

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => handleDownload("fr")}
            >
              <Download className="w-4 h-4 mr-2" />
              {t("medical_language_fr")}
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => handleDownload("nl")}
            >
              <Download className="w-4 h-4 mr-2" />
              {t("medical_language_nl")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MedicalReportPDF;
