import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CalendarClock } from "lucide-react";
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

        {/* Barre de recherche */}
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("search.playerWithOverduePlaceholder")}
          className="mb-4"
        />

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
