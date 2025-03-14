import React from "react";
import Modal from "@/components/ui/modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Appointment } from "@/components/planning/planningUtils"; // Utilisez l'interface importée

interface AppointmentDetailsDialogProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  appointment: Appointment | null;
}

const AppointmentDetailsDialog: React.FC<AppointmentDetailsDialogProps> = ({
  isOpen,
  setIsOpen,
  appointment,
}) => {
  if (!appointment) return null;

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <Card>
        <CardHeader>
          <CardTitle>Détails du rendez-vous</CardTitle>
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
              {format(new Date(appointment.date), "dd/MM/yyyy 'à' HH:mm")}
            </p>
            <p>
              <strong>Type :</strong> {appointment.type}
            </p>
            <p>
              <strong>Administrateur :</strong> {appointment.adminName}
            </p>
            <p>
              <strong>Notes :</strong> {appointment.notes}
            </p>
          </div>
        </CardContent>
        <div className="p-4 flex justify-end">
          <Button onClick={() => setIsOpen(false)}>Fermer</Button>
        </div>
      </Card>
    </Modal>
  );
};

export default AppointmentDetailsDialog;
