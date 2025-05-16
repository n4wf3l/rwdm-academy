import React from "react";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

interface DeleteMemberModalProps {
  isOpen: boolean;
  member: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteMemberModal: React.FC<DeleteMemberModalProps> = ({
  isOpen,
  member,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <h2 className="text-lg font-bold">{t("deleteMember.title")}</h2>
        {member && (
          <p className="mt-2">
            {t("deleteMember.prompt")}{" "}
            <span className="font-semibold">
              {member.firstName} {member.lastName}
            </span>
            ?
          </p>
        )}
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            {t("button.cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {t("button.delete")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteMemberModal;
