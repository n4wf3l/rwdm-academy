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
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface InvoiceListModalProps {
  open: boolean;
  onClose: () => void;
  category: string;
  invoices: any[];
}

// ✅ Formate : "JORDAN DENOUVEAU" => "Jordan Denouveau"
const formatName = (name: string): string =>
  name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const getStatus = (invoice: any) => {
  const total = parseFloat(invoice.totalAmount || "0");
  const paid = parseFloat(invoice.paidAmount || "0");

  if (total === paid)
    return {
      label: "Payée",
      color: "text-green-600",
      icon: <CheckCircle2 className="w-4 h-4 mr-1" />,
    };
  if (paid === 0)
    return {
      label: "Non payée",
      color: "text-red-600",
      icon: <AlertTriangle className="w-4 h-4 mr-1" />,
    };
  return {
    label: "Partielle",
    color: "text-yellow-600",
    icon: <Clock className="w-4 h-4 mr-1" />,
  };
};

const InvoiceListModal: React.FC<InvoiceListModalProps> = ({
  open,
  onClose,
  category,
  invoices,
}) => {
  const [search, setSearch] = useState("");
  const { t } = useTranslation();
  // 🔍 Filtrage dynamique par nom
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const fullName = invoice.memberBasicDto?.fullName || "";
      return fullName.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, invoices]);

  // 🧼 Reset recherche à chaque ouverture
  useEffect(() => {
    if (open) setSearch("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {t("dialog.invoicesForCategory")} : {category}
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            {t("dialog.listContains")}{" "}
            <strong>{filteredInvoices.length}</strong>{" "}
            {filteredInvoices.length > 1
              ? t("dialog.playersPlural")
              : t("dialog.playerSingular")}
            .
          </p>
        </DialogHeader>

        {/* 🔍 Barre de recherche */}
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("search.playerPlaceholder")}
          className="mb-4"
        />

        {filteredInvoices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
            {filteredInvoices.map((invoice, idx) => {
              const rawName = invoice.memberBasicDto?.fullName || "—";
              const fullName = formatName(rawName);
              const total = parseFloat(invoice.totalAmount || "0");
              const paid = parseFloat(invoice.paidAmount || "0");
              const { label, color, icon } = getStatus(invoice);

              return (
                <div
                  key={idx}
                  className="border p-3 rounded-md bg-gray-50 shadow-sm"
                >
                  <p className="font-medium text-gray-800">{fullName}</p>
                  <p className="text-sm text-gray-600">
                    {t("summary.total")}: {total.toLocaleString()} €<br />
                    {t("summary.paid")}: {paid.toLocaleString()} €
                  </p>
                  <p className={`flex items-center text-sm mt-1 ${color}`}>
                    {icon}
                    {label}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 mt-4">{t("invoices.none")}</p>
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

export default InvoiceListModal;
