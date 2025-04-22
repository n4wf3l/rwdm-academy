import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CancelAppointmentDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  withEmailCheckbox?: boolean;
  sendEmailChecked?: boolean;
  setSendEmailChecked?: (val: boolean) => void;
}

const CancelAppointmentDialog: React.FC<CancelAppointmentDialogProps> = ({
  open,
  onClose,
  onConfirm,
  withEmailCheckbox = false,
  sendEmailChecked = false,
  setSendEmailChecked = () => {},
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer l'annulation</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600">
          Êtes-vous sûr de vouloir annuler ce rendez-vous ?
        </p>

        {withEmailCheckbox && (
          <div className="my-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sendEmailChecked}
                onChange={() => setSendEmailChecked(!sendEmailChecked)}
              />
              Avertir la personne par email
            </label>
          </div>
        )}

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelAppointmentDialog;
