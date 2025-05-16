import React from "react";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

interface RestoreMemberModalProps {
  isOpen: boolean;
  member: { firstName: string; lastName: string };
  onClose: () => void;
  onConfirm: () => void;
}

const RestoreMemberModal: React.FC<RestoreMemberModalProps> = ({
  isOpen,
  member,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">{t("reactivateModalTitle")}</h2>
        <p>
          {t("reactivateModalConfirmStart")}{" "}
          <span className="font-medium">
            {member.firstName} {member.lastName}
          </span>
          {t("reactivateModalConfirmEnd")}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t("buttonCancel")}
          </Button>
          <Button variant="default" onClick={onConfirm}>
            {t("buttonConfirm")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RestoreMemberModal;
