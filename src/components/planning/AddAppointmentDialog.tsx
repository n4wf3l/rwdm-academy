import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AppointmentType,
  AVAILABLE_ADMINS,
  AVAILABLE_TIMES,
  getAvailableTimeSlotsForDate,
  Appointment,
} from "./planningUtils";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface AddAppointmentDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  newAppointmentDate: Date | undefined;
  setNewAppointmentDate: (date: Date | undefined) => void;
  newAppointmentTime: string;
  setNewAppointmentTime: (time: string) => void;
  newAppointmentType: AppointmentType;
  setNewAppointmentType: (type: AppointmentType) => void;
  newAppointmentPerson: string;
  setNewAppointmentPerson: (person: string) => void;
  newAppointmentEmail: string;
  setNewAppointmentEmail: (email: string) => void;
  newAppointmentAdmin: string;
  setNewAppointmentAdmin: (admin: string) => void;
  newAppointmentNotes: string;
  setNewAppointmentNotes: (notes: string) => void;
  availableTimeSlots: string[];
  appointments: Appointment[];
  addAppointmentToState: (appointment: any) => void;
}

const AddAppointmentDialog: React.FC<AddAppointmentDialogProps> = ({
  isOpen,
  setIsOpen,
  newAppointmentDate,
  setNewAppointmentDate,
  newAppointmentTime,
  setNewAppointmentTime,
  newAppointmentType,
  setNewAppointmentType,
  newAppointmentPerson,
  setNewAppointmentPerson,
  newAppointmentEmail,
  setNewAppointmentEmail,
  newAppointmentAdmin,
  setNewAppointmentAdmin,
  newAppointmentNotes,
  setNewAppointmentNotes,
  availableTimeSlots,
  appointments,
  addAppointmentToState,
}) => {
  const [admins, setAdmins] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admins", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des administrateurs");
        }

        const data = await response.json();
        console.log("✅ Admins récupérés :", data);

        const formattedAdmins = data.map((admin: any) => ({
          id: admin.id.toString(),
          name: `${admin.firstName} ${admin.lastName}`,
        }));

        setAdmins(formattedAdmins);
      } catch (error) {
        console.error("Erreur lors du fetch des admins:", error);
      }
    };

    fetchAdmins();
  }, []);

  const sendAppointmentEmail = async (appointmentData) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/form-mail/send-appointment-confirmation", // Changed from send-appointment-email
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            appointment: {
              ...appointmentData,
              adminName: admins.find((a) => a.id === appointmentData.adminId)
                ?.name,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Échec de l'envoi de l'email");
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Erreur envoi email:", error);
      throw error;
    }
  };

  const saveAppointmentToDB = async () => {
    try {
      /* ───────── 1) Vérifications de base ───────── */
      if (
        !newAppointmentDate ||
        !newAppointmentTime ||
        !newAppointmentType ||
        !newAppointmentAdmin
      ) {
        toast({
          title: "Champs obligatoires",
          description: "Veuillez remplir tous les champs obligatoires.",
          variant: "destructive",
        });
        return;
      }

      /* ───────── 2) Construction des données à envoyer ───────── */
      const appointmentData = {
        date: format(newAppointmentDate, "yyyy-MM-dd"),
        time: newAppointmentTime,
        type: newAppointmentType,
        personName: newAppointmentPerson,
        email: newAppointmentEmail,
        adminId: newAppointmentAdmin,
        notes: newAppointmentNotes || "",
      };

      /* ───────── 3) Enregistrement en DB ───────── */
      const response = await fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok)
        throw new Error("Erreur lors de l'enregistrement du rendez‑vous");

      const savedAppointment = await response.json();

      /* ───────── 4) Reconstruction correcte pour le state ───────── */
      const [hour, minute] = newAppointmentTime.split(":").map(Number);
      const [y, m, d] = (savedAppointment.date ?? appointmentData.date)
        .split("-")
        .map(Number);
      const dateObj = new Date(y, m - 1, d);
      dateObj.setHours(hour, minute, 0, 0);

      const admin = admins.find((a) => a.id === newAppointmentAdmin);

      addAppointmentToState({
        id: savedAppointment.id,
        date: dateObj,
        time: newAppointmentTime,
        type: newAppointmentType,
        personName: newAppointmentPerson,
        email: newAppointmentEmail,
        notes: newAppointmentNotes,
        adminName: admin?.name ?? "",
        adminFirstName: admin?.name?.split(" ")[0] ?? "",
        adminLastName: admin?.name?.split(" ")?.slice(1).join(" ") ?? "",
      });

      /* ───────── 5) Envoi automatique d’e‑mail (optionnel) ───────── */
      if (sendEmailChecked) {
        const mailRes = await sendAppointmentEmail(appointmentData);

        toast({
          title: "Email envoyé",
          description: mailRes.message,
        });
      }

      /* ───────── 6) Succès final ───────── */
      toast({
        title: "Rendez‑vous enregistré",
        description: `Le rendez‑vous avec ${newAppointmentPerson} a bien été enregistré.`,
      });

      setIsOpen(false);
    } catch (err) {
      console.error("❌ Erreur lors de l'enregistrement :", err);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue, veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const [sendEmailChecked, setSendEmailChecked] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle> {t("schedule_new_appointment")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointmentDate">
                {t("appointment_date_label")}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    {newAppointmentDate ? (
                      format(newAppointmentDate, "dd/MM/yyyy")
                    ) : (
                      <span>{t("select_date_placeholder")}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newAppointmentDate}
                    onSelect={setNewAppointmentDate}
                    locale={fr}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointmentTime">
                {t("appointment_type_label")}
              </Label>
              <Select
                value={newAppointmentTime}
                onValueChange={setNewAppointmentTime}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("select_time_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {availableTimeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="appointmentType">
              {t("appointment_type_label")}
            </Label>
            <Select
              value={newAppointmentType}
              onValueChange={(value) =>
                setNewAppointmentType(value as AppointmentType)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("select_type_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="registration">
                  {t("type_registration")}
                </SelectItem>
                <SelectItem value="selection_tests">
                  {t("type_selection_tests")}
                </SelectItem>
                <SelectItem value="accident_report">
                  {t("type_accident_report")}
                </SelectItem>
                <SelectItem value="responsibility_waiver">
                  {t("type_responsibility_waiver")}
                </SelectItem>
                <SelectItem value="other">{t("type_other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="appointmentPerson">{t("person_name_label")}</Label>
            <Input
              id="appointmentPerson"
              value={newAppointmentPerson}
              onChange={(e) => setNewAppointmentPerson(e.target.value)}
              placeholder={t("person_name_placeholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="appointmentEmail">{t("contact_email_label")}</Label>
            <Input
              id="appointmentEmail"
              type="email"
              value={newAppointmentEmail}
              onChange={(e) => setNewAppointmentEmail(e.target.value)}
              placeholder={t("contact_email_placeholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appointmentAdmin">
              {t("assigned_admin_label")}
            </Label>
            <Select
              value={newAppointmentAdmin}
              onValueChange={setNewAppointmentAdmin}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("select_admin_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {admins.length > 0 ? (
                  admins.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    {t("no_admins_found")}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="appointmentNotes">{t("notes_label")}</Label>
            <Input
              id="appointmentNotes"
              value={newAppointmentNotes}
              onChange={(e) => setNewAppointmentNotes(e.target.value)}
              placeholder={t("notes_placeholder")}
            />
          </div>

          <div className="flex items-center space-x-2 mt-2">
            <input
              type="checkbox"
              id="send-email-checkbox"
              checked={sendEmailChecked}
              onChange={(e) => setSendEmailChecked(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="send-email-checkbox" className="text-sm">
              {t("send_email_checkbox_label")}
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {t("cancel_button")}
          </Button>
          <Button className="bg-rwdm-blue" onClick={saveAppointmentToDB}>
            {t("schedule_appointment_button")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddAppointmentDialog;
