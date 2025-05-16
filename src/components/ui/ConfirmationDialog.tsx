import React, { useEffect, useState, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (sendEmail: boolean) => void;
  title?: string;
  message: ReactNode;
  showEmailCheckbox?: boolean;
  confirmDisabled?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  showEmailCheckbox = false,
  confirmDisabled = false,
}) => {
  const { t } = useTranslation();
  const [sendEmail, setSendEmail] = useState(false);

  useEffect(() => {
    if (open) setSendEmail(false);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title ?? t("confirm_action_title")}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600">{message}</p>

        {showEmailCheckbox && (
          <div className="my-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={() => setSendEmail(!sendEmail)}
              />
              {t("send_email_checkbox_label")}
            </label>
          </div>
        )}

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            className="bg-rwdm-blue text-white"
            onClick={() => onConfirm(sendEmail)}
            disabled={confirmDisabled}
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
