import React, { useEffect, useState, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (sendEmail: boolean) => void; // ← on transmet l’état de la case
  title?: string;
  message: ReactNode;
  showEmailCheckbox?: boolean; // ← afficher ou non la case
  confirmDisabled?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title = "Confirmer l'action",
  message,
  showEmailCheckbox = false,
  confirmDisabled = false,
}) => {
  const [sendEmail, setSendEmail] = useState(false);

  // Quand on rouvre le dialogue, on réinitialise la checkbox
  useEffect(() => {
    if (open) setSendEmail(false);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* --- Message principal --- */}
        <p className="text-sm text-gray-600">{message}</p>

        {/* --- La case à cocher « Envoyer un email » --- */}
        {showEmailCheckbox && (
          <div className="my-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={() => setSendEmail(!sendEmail)}
              />
              Envoyer un email de confirmation
            </label>
          </div>
        )}

        {/* --- Boutons --- */}
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            className="bg-rwdm-blue text-white"
            onClick={() => onConfirm(sendEmail)}
            disabled={confirmDisabled} // ← on désactive ici
          >
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
