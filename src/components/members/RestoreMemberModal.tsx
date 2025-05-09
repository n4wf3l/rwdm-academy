import React from "react";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

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
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Réactiver le compte</h2>
        <p>
          Êtes-vous sûr de vouloir réactiver le compte de{" "}
          <span className="font-medium">
            {member.firstName} {member.lastName}
          </span>
          ?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="default" onClick={onConfirm}>
            Confirmer
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RestoreMemberModal;
