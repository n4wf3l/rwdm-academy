import React, { useState, useEffect } from "react";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "@/hooks/useTranslation";

interface SpellCheckField {
  label: string;
  value: string;
}

interface SpellCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fields: SpellCheckField[];
  title?: string;
  loading?: boolean; // 👈 Ajoute cette ligne
}

const SpellCheckModal: React.FC<SpellCheckModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fields,
  title,
  loading,
}) => {
  const { t } = useTranslation();
  const [checked, setChecked] = useState<boolean[]>(
    Array(fields.length).fill(false)
  );

  useEffect(() => {
    // Réinitialise si le modal se ferme
    if (!isOpen) setChecked(Array(fields.length).fill(false));
  }, [isOpen, fields.length]);

  const handleCheck = (index: number) => {
    const updated = [...checked];
    updated[index] = !updated[index];
    setChecked(updated);
  };

  const allChecked = checked.every((c) => c);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            {title}
          </DialogTitle>
          <DialogDescription>{t("spellcheck_description")}</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-5">
          {fields.map((field, index) => (
            <div key={index} className="space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {field.label} :
              </p>
              <div className="flex items-center gap-3">
                <p
                  className={`text-base font-medium px-3 py-2 rounded-md flex-1
                    ${
                      checked[index]
                        ? "bg-green-100 dark:bg-green-900 text-green-700"
                        : "bg-red-100 dark:bg-red-900 text-red-700"
                    }`}
                >
                  {field.value || (
                    <span className="text-gray-400 italic">
                      {t("spellcheck_not_provided")}
                    </span>
                  )}
                </p>

                <Checkbox
                  checked={checked[index]}
                  onCheckedChange={() => handleCheck(index)}
                  className="border-gray-400"
                />
                {checked[index] && <Check className="w-4 h-4 text-green-600" />}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="sm:justify-between mt-2">
          <Button variant="outline" onClick={onClose}>
            {t("spellcheck_modify")}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading || !allChecked}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5 mr-2 inline" />
            ) : null}
            {t("spellcheck_confirm_submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SpellCheckModal;
