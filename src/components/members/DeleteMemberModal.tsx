import React from "react";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

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
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <h2 className="text-lg font-bold">Supprimer le membre</h2>
        {member && (
          <p className="mt-2">
            Êtes-vous sûr de vouloir supprimer le membre{" "}
            <span className="font-semibold">
              {member.firstName} {member.lastName}
            </span>{" "}
            ?
          </p>
        )}
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Supprimer
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteMemberModal;
