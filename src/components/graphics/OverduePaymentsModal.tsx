import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CalendarClock, Printer } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { formatDistance } from "date-fns";
import { fr, nl } from "date-fns/locale";

interface OverduePaymentsModalProps {
  open: boolean;
  onClose: () => void;
  overdueInvoices: any[];
}

// Formate les noms de "JORDAN DENOUVEAU" à "Jordan Denouveau"
const formatName = (name: string): string =>
  name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

// Calcule les jours de retard
const getDaysOverdue = (dueDate: string): number => {
  const due = new Date(dueDate);
  const today = new Date();
  return Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
};

const OverduePaymentsModal: React.FC<OverduePaymentsModalProps> = ({
  open,
  onClose,
  overdueInvoices,
}) => {
  const [search, setSearch] = useState("");
  const { t, lang } = useTranslation();
  const printableContentRef = useRef<HTMLDivElement>(null);

  // Fonction d'impression modifiée
  const handlePrint = () => {
    const printContent = document.createElement("div");
    printContent.innerHTML = `
      <html>
        <head>
          <title>RWDM Academy - ${t("stats.overdue")}</title>
          <style>
            @media print {
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .print-header { margin-bottom: 20px; }
              .print-logo { 
                text-align: center;
                font-size: 22px;
                font-weight: bold;
                margin-bottom: 10px;
                color:rgb(0, 0, 0);
              }
              .print-card { 
                border: 1px solid #ddd; 
                padding: 12px; 
                margin-bottom: 12px; 
                break-inside: avoid;
                page-break-inside: avoid;
              }
              .print-player { font-weight: bold; margin-bottom: 5px; }
              .print-date { color: #e53e3e; margin-bottom: 8px; font-size: 0.9em; }
              .print-amounts { margin-bottom: 8px; font-size: 0.9em; }
              .print-balance { 
                padding-top: 8px;
                border-top: 1px solid #eee;
                font-weight: bold;
                color: #e53e3e;
                display: flex;
                justify-content: space-between;
              }
              .print-title { 
                text-align: center;
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 15px;
                color: #e53e3e;
              }
              .print-date-generated {
                text-align: right;
                font-size: 0.8em;
                margin-bottom: 20px;
                color: #666;
              }
              .print-container {
                column-count: 2;
                column-gap: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <div class="print-logo">RWDM Academy</div>
            <div class="print-title">${t("stats.overdue")} (${
      filteredInvoices.length
    })</div>
            <div class="print-date-generated">${new Date().toLocaleDateString(
              lang === "fr" ? "fr-FR" : "nl-BE"
            )}</div>
          </div>
          
          <div class="print-container">
            ${filteredInvoices
              .map((invoice) => {
                const rawName = invoice.memberBasicDto?.fullName || "—";
                const fullName = formatName(rawName);
                const total = parseFloat(invoice.totalAmount || "0");
                const paid = parseFloat(invoice.paidAmount || "0");
                const balance = total - paid;
                const dueDate = invoice.dueDate;
                const daysOverdue = dueDate ? getDaysOverdue(dueDate) : null;

                const dueDateRelative = dueDate
                  ? formatDistance(new Date(dueDate), new Date(), {
                      addSuffix: true,
                      locale: lang === "fr" ? fr : nl,
                    })
                  : "—";

                return `
                <div class="print-card">
                  <div class="print-player">${fullName}</div>
                  <div class="print-date">
                    ${dueDateRelative}
                    ${daysOverdue ? ` (${daysOverdue} ${t("days")})` : ""}
                  </div>
                  <div class="print-amounts">
                    <div>${t(
                      "summary.total"
                    )}: ${total.toLocaleString()} €</div>
                    <div>${t("summary.paid")}: ${paid.toLocaleString()} €</div>
                  </div>
                  <div class="print-balance">
                    <span>${t("summary.balance")}:</span>
                    <span>${balance.toLocaleString()} €</span>
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  // Filtrage dynamique par nom
  const filteredInvoices = useMemo(() => {
    return overdueInvoices.filter((invoice) => {
      const fullName = invoice.memberBasicDto?.fullName || "";
      return fullName.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, overdueInvoices]);

  // Reset recherche à chaque ouverture
  useEffect(() => {
    if (open) setSearch("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center text-red-600">
            <AlertCircle className="mr-2 h-5 w-5" />
            {t("stats.overdue")} ({filteredInvoices.length})
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            {t("dialog.overdueWarning")}
          </p>
        </DialogHeader>

        {/* Barre de recherche avec bouton d'impression */}
        <div className="flex gap-2 items-center">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search.playerWithOverduePlaceholder")}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrint}
            title={t("button.print")}
            className="shrink-0"
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>

        {/* Contenu à imprimer */}
        <div ref={printableContentRef} className="mt-4">
          {filteredInvoices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
              {filteredInvoices.map((invoice, idx) => {
                const rawName = invoice.memberBasicDto?.fullName || "—";
                const fullName = formatName(rawName);
                const total = parseFloat(invoice.totalAmount || "0");
                const paid = parseFloat(invoice.paidAmount || "0");
                const balance = total - paid;
                const dueDate = invoice.dueDate;
                const daysOverdue = dueDate ? getDaysOverdue(dueDate) : null;

                // Formatage relatif de la date d'échéance
                const dueDateRelative = dueDate
                  ? formatDistance(new Date(dueDate), new Date(), {
                      addSuffix: true,
                      locale: lang === "fr" ? fr : nl,
                    })
                  : null;

                return (
                  <div
                    key={idx}
                    className="border p-3 rounded-md bg-red-50 shadow-sm"
                  >
                    <p className="font-medium text-gray-800">{fullName}</p>
                    <div className="flex items-center text-red-600 text-sm mb-2">
                      <CalendarClock className="w-4 h-4 mr-1" />
                      <span>
                        {dueDateRelative}
                        {daysOverdue && ` (${daysOverdue} ${t("days")})`}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{t("summary.total")}:</span>{" "}
                      {total.toLocaleString()} €<br />
                      <span className="font-medium">
                        {t("summary.paid")}:
                      </span>{" "}
                      {paid.toLocaleString()} €
                    </p>
                    <div className="mt-2 pt-2 border-t">
                      <p className="font-bold text-red-600 flex items-center justify-between">
                        <span>{t("summary.balance")}:</span>
                        <span>{balance.toLocaleString()} €</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 mt-4">{t("overdue.none")}</p>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            {t("button.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OverduePaymentsModal;
