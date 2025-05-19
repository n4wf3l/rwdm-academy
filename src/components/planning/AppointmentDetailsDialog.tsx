import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CancelAppointmentDialog from "@/components/ui/CancelAppointmentDialog";
import { Appointment } from "@/components/planning/planningUtils";
import { useTranslation } from "@/hooks/useTranslation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const { toast } = useToast();
  const { t } = useTranslation();

  if (!appointment) return null;

  // Format des champs de rendez-vous
  const formattedDate = format(new Date(appointment.date), "dd MMMM yyyy", {
    locale: fr,
  });

  // Obtenir le type traduit
  const getTranslatedType = () => {
    const appointmentType = appointment.type as string;

    switch (appointmentType) {
      case "registration":
        return t("type_registration");
      case "selection_tests":
      case "selection-tests":
        return t("type_selection_tests");
      case "accident_report":
      case "accident-report":
        return t("type_accident_report");
      case "responsibility_waiver":
      case "responsibility-waiver":
        return t("type_responsibility_waiver");
      case "other":
        return t("type_other");
      default:
        return appointmentType;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("appointment_details_title")}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            {/* Informations du client */}
            <div className="space-y-1">
              <Label htmlFor="personName">
                {t("appointment_detail_client")}
              </Label>
              <Input
                id="personName"
                value={appointment.personName}
                readOnly
                className="bg-gray-100"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email">{t("appointment_detail_email")}</Label>
              <Input
                id="email"
                value={appointment.email}
                readOnly
                className="bg-gray-100"
              />
            </div>

            {/* Date */}
            <div className="space-y-1">
              <Label htmlFor="date">{t("appointment_detail_date")}</Label>
              <Input
                id="date"
                value={formattedDate}
                readOnly
                className="bg-gray-100"
              />
            </div>

            {/* Heure */}
            <div className="space-y-1">
              <Label htmlFor="time">{t("appointment_detail_time")}</Label>
              <Input
                id="time"
                value={appointment.time}
                readOnly
                className="bg-gray-100 font-semibold"
              />
            </div>

            {/* Type de rendez-vous */}
            <div className="space-y-1">
              <Label htmlFor="type">{t("appointment_detail_type")}</Label>
              <Input
                id="type"
                value={getTranslatedType()}
                readOnly
                className="bg-gray-100"
              />
            </div>

            {/* Assigné à */}
            <div className="space-y-1">
              <Label htmlFor="admin">{t("appointment_detail_admin")}</Label>
              <Input
                id="admin"
                value={`${appointment.adminFirstName} ${appointment.adminLastName}`}
                readOnly
                className="bg-gray-100 capitalize"
              />
            </div>

            {/* Notes - sur toute la largeur */}
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="notes">{t("appointment_detail_notes")}</Label>
              <Input
                id="notes"
                value={
                  appointment.notes?.trim()
                    ? appointment.notes
                    : t("appointment_no_notes")
                }
                readOnly
                className="bg-gray-100"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => setCancelDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {t("cancel_button")}
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              {t("close_button")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
