import React, { useState } from "react";
import Modal from "@/components/ui/modal";
import {
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarIcon,
  Clock,
  FileText,
  Mail,
  Tag,
  Trash2,
  User,
  UserCheck,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CancelAppointmentDialog from "@/components/ui/CancelAppointmentDialog";
import {
  Appointment,
  translateAppointmentType,
} from "@/components/planning/planningUtils";
import { useTranslation } from "@/hooks/useTranslation";

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

  return (
    <>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {/* Header */}
        <CardHeader>
          <CardTitle>{t("appointment_details_title")}</CardTitle>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">
                {t("appointment_detail_client")}
              </span>
            </div>
            <span className="capitalize">{appointment.personName}</span>

            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="font-medium">
                {t("appointment_detail_email")}
              </span>
            </div>
            <span className="lowercase">{appointment.email}</span>

            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <span className="font-medium">
                {t("appointment_detail_date")}
              </span>
            </div>
            <span>
              {format(new Date(appointment.date), "dd/MM/yyyy", { locale: fr })}
            </span>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-medium">
                {t("appointment_detail_time")}
              </span>
            </div>
            <span className="font-semibold">{appointment.time}</span>

            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-gray-500" />
              <span className="font-medium">
                {t("appointment_detail_type")}
              </span>
            </div>
            <span>{translateAppointmentType(appointment.type)}</span>

            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-gray-500" />
              <span className="font-medium">
                {t("appointment_detail_admin")}
              </span>
            </div>
            <span className="capitalize">
              {appointment.adminFirstName} {appointment.adminLastName}
            </span>

            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="font-medium">
                {t("appointment_detail_notes")}
              </span>
            </div>
            <span>
              {appointment.notes?.trim()
                ? appointment.notes
                : t("appointment_no_notes")}
            </span>
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex justify-end space-x-2 bg-gray-50 dark:bg-gray-700">
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
        </CardFooter>
      </Modal>

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
          toast({
            title: "Rendez-vous annulé",
            description: "Le rendez-vous a bien été annulé.",
            variant: "destructive",
          });
        }}
        withEmailCheckbox
        sendEmailChecked={sendCancelEmail}
        setSendEmailChecked={setSendCancelEmail}
      />
    </>
  );
};

export default AppointmentDetailsDialog;
