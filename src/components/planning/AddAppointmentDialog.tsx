import React, { useEffect, useState } from "react";
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
import { AppointmentType, AVAILABLE_ADMINS } from "./planningUtils";

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
  addAppointment: () => void;
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
  addAppointment,
}) => {
  const [admins, setAdmins] = useState<{ id: string; name: string }[]>([]);

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

  const saveAppointmentToDB = async () => {
    try {
      if (
        !newAppointmentDate ||
        !newAppointmentTime ||
        !newAppointmentType ||
        !newAppointmentAdmin
      ) {
        alert("❌ Veuillez remplir tous les champs obligatoires.");
        return;
      }

      const appointmentData = {
        date: format(newAppointmentDate, "yyyy-MM-dd"),
        time: newAppointmentTime,
        type: newAppointmentType,
        personName: newAppointmentPerson,
        email: newAppointmentEmail,
        adminId: newAppointmentAdmin,
        notes: newAppointmentNotes || "",
      };

      console.log("📤 Envoi des données :", appointmentData);

      const response = await fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement du rendez-vous");
      }

      alert("✅ Rendez-vous enregistré avec succès !");
      setIsOpen(false); // Ferme le modal après succès
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout du rendez-vous :", error);
      alert("❌ Une erreur est survenue, veuillez réessayer.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Planifier un nouveau rendez-vous</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointmentDate">Date du rendez-vous</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    {newAppointmentDate ? (
                      format(newAppointmentDate, "dd/MM/yyyy")
                    ) : (
                      <span>Sélectionnez une date</span>
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
              <Label htmlFor="appointmentTime">Heure du rendez-vous</Label>
              <Select
                value={newAppointmentTime}
                onValueChange={setNewAppointmentTime}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une heure" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimeSlots.length > 0 ? (
                    availableTimeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      Aucun créneau disponible
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="appointmentType">Type de rendez-vous</Label>
            <Select
              value={newAppointmentType}
              onValueChange={(value) =>
                setNewAppointmentType(value as AppointmentType)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="registration">
                  Inscription à l'académie
                </SelectItem>
                <SelectItem value="selection-tests">
                  Tests de sélection
                </SelectItem>
                <SelectItem value="accident-report">
                  Déclaration d'accident
                </SelectItem>
                <SelectItem value="responsibility-waiver">
                  Décharge de responsabilité
                </SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="appointmentPerson">Nom de la personne</Label>
            <Input
              id="appointmentPerson"
              value={newAppointmentPerson}
              onChange={(e) => setNewAppointmentPerson(e.target.value)}
              placeholder="Entrez le nom complet"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="appointmentEmail">Email de contact</Label>
            <Input
              id="appointmentEmail"
              type="email"
              value={newAppointmentEmail}
              onChange={(e) => setNewAppointmentEmail(e.target.value)}
              placeholder="exemple@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appointmentAdmin">Administrateur assigné</Label>
            <Select
              value={newAppointmentAdmin}
              onValueChange={setNewAppointmentAdmin}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un administrateur" />
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
                    Aucun administrateur trouvé
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="appointmentNotes">Notes (optionnel)</Label>
            <Input
              id="appointmentNotes"
              value={newAppointmentNotes}
              onChange={(e) => setNewAppointmentNotes(e.target.value)}
              placeholder="Ajoutez des notes supplémentaires"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button className="bg-rwdm-blue" onClick={saveAppointmentToDB}>
            Planifier le rendez-vous
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddAppointmentDialog;
