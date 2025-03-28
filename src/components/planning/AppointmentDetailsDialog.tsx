import React from "react";
import Modal from "@/components/ui/modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Appointment } from "@/components/planning/planningUtils";
import { DialogTitle } from "@radix-ui/react-dialog"; // Assurez-vous d'importer DialogTitle

interface AppointmentDetailsDialogProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  appointment: Appointment | null;
  onCancel: (appointmentId: number) => void;
}

const AppointmentDetailsDialog: React.FC<AppointmentDetailsDialogProps> = ({
  isOpen,
  setIsOpen,
  appointment,
  onCancel,
}) => {
  if (!appointment) return null;

  const handleCancel = () => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) {
      onCancel(parseInt(appointment.id, 10)); // Conversion en nombre
      setIsOpen(false); // Fermer la modale après l'annulation
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <Card>
        <CardHeader>
          <DialogTitle> Détails du rendez-vous </DialogTitle>{" "}
          {/* Ajout du DialogTitle */}
          <CardTitle>
            <h2>Détails du rendez-vous</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>Nom :</strong> {appointment.personName}
            </p>
            <p>
              <strong>Email :</strong> {appointment.email}
            </p>
            <p>
              <strong>Date :</strong>{" "}
              {format(new Date(appointment.date), "dd/MM/yyyy", {
                locale: fr,
              })}
            </p>
            <p>
              <strong>Heure :</strong> {appointment.time}
            </p>
            <p>
              <strong>Type :</strong> {appointment.type}
            </p>
            <p>
              <strong>Administrateur :</strong>{" "}
              {appointment.adminFirstName && appointment.adminLastName
                ? `${appointment.adminFirstName} ${appointment.adminLastName}`
                : "Aucun administrateur assigné"}
            </p>
            <p>
              <strong>Notes :</strong> {appointment.notes || "Aucune note"}
            </p>
          </div>
        </CardContent>
        <div className="p-4 flex justify-between">
          <Button variant="destructive" onClick={handleCancel}>
            Annuler le rendez-vous
          </Button>
          <Button onClick={() => setIsOpen(false)}>Fermer</Button>
        </div>
      </Card>
    </Modal>
  );
};

export default AppointmentDetailsDialog;
