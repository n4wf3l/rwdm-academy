import React, { useState } from "react";
import Modal from "@/components/ui/modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Appointment,
  translateAppointmentType,
} from "@/components/planning/planningUtils";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useToast } from "@/hooks/use-toast";
import CancelAppointmentDialog from "@/components/ui/CancelAppointmentDialog"; // 🔁 Ce composant doit exister !

interface AppointmentDetailsDialogProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  appointment: Appointment | null;
  onCancel: (appointmentId: number, sendEmail: boolean) => void;
}

const AppointmentDetailsDialog: React.FC<AppointmentDetailsDialogProps> = ({
  isOpen,
  setIsOpen,
  appointment,
  onCancel,
}) => {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [sendCancelEmail, setSendCancelEmail] = useState(false);

  if (!appointment) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Card>
          <CardHeader>
            <DialogTitle />
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
                <strong>Type :</strong>{" "}
                {translateAppointmentType(appointment.type)}
              </p>
              <p>
                <strong>Administrateur :</strong> {appointment.adminFirstName}{" "}
                {appointment.adminLastName}
              </p>
              <p>
                <strong>Notes :</strong> {appointment.notes || "Aucune note"}
              </p>
            </div>
          </CardContent>

          <div className="p-4 flex justify-between">
            <Button
              variant="destructive"
              onClick={() => setCancelDialogOpen(true)}
            >
              Annuler le rendez-vous
            </Button>
            <Button onClick={() => setIsOpen(false)}>Fermer</Button>
          </div>
        </Card>
      </Modal>

      {/* Dialogue de confirmation stylisé */}
      <CancelAppointmentDialog
        open={cancelDialogOpen}
        onClose={() => {
          setCancelDialogOpen(false);
          setSendCancelEmail(false);
        }}
        onConfirm={() => {
          onCancel(parseInt(appointment.id, 10), sendCancelEmail);
          setCancelDialogOpen(false);
          setIsOpen(false);
        }}
        withEmailCheckbox
        sendEmailChecked={sendCancelEmail}
        setSendEmailChecked={setSendCancelEmail}
      />
    </>
  );
};

export default AppointmentDetailsDialog;
