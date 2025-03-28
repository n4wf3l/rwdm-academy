import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isSameDay,
  addDays,
} from "date-fns";
import { fr } from "date-fns/locale";
import { Link, useLocation } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils"; // Added missing import
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  User,
  Plus,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Import the new components we'll create
import {
  AppointmentType,
  Appointment,
  translateAppointmentType,
  getAppointmentBadge,
  groupAppointmentsByDay,
  sortAppointmentsByTime,
  generateAppointmentId,
  isTimeSlotAvailable,
  getAvailableTimeSlotsForDate,
  formatHour,
  getTimeFromDate,
  isAppointmentInHour,
  getAppointmentsForHourAndDate,
  AVAILABLE_TIMES,
  AVAILABLE_ADMINS,
  START_HOUR,
  END_HOUR,
} from "@/components/planning/planningUtils";
import DayView from "@/components/planning/DayView";
import WeekView from "@/components/planning/WeekView";
import AddAppointmentDialog from "@/components/planning/AddAppointmentDialog";
import AppointmentDetailsDialog from "@/components/planning/AppointmentDetailsDialog";

const Planning = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isAppointmentDetailModalOpen, setIsAppointmentDetailModalOpen] =
    useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [newAppointmentDate, setNewAppointmentDate] = useState<
    Date | undefined
  >(new Date());
  const [newAppointmentTime, setNewAppointmentTime] = useState<string>("");
  const [newAppointmentType, setNewAppointmentType] =
    useState<AppointmentType>("registration");
  const [newAppointmentPerson, setNewAppointmentPerson] = useState("");
  const [newAppointmentEmail, setNewAppointmentEmail] = useState("");
  const [newAppointmentAdmin, setNewAppointmentAdmin] = useState("");
  const [newAppointmentNotes, setNewAppointmentNotes] = useState("");
  const [currentView, setCurrentView] = useState<"day" | "week">("day");
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());

  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/appointments", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des rendez-vous");
        }

        const data = await response.json();
        console.log("✅ Rendez-vous récupérés :", data); // Vérification

        setAppointments(
          data.map((appointment: any) => ({
            ...appointment,
            date: new Date(appointment.date),
            time: appointment.time,
          }))
        );
      } catch (error) {
        console.error("Erreur lors du fetch des rendez-vous :", error);
      }
    };

    fetchAppointments();
  }, []);

  // Vérifier si nous avons été redirigés depuis la page dashboard avec une demande d'inscription validée
  useEffect(() => {
    if (location.state?.scheduleAppointment && location.state?.request) {
      const request = location.state.request;
      setNewAppointmentPerson(request.name);
      setNewAppointmentEmail(request.email);
      setNewAppointmentType(request.type as AppointmentType);
      setNewAppointmentNotes(
        `Rendez-vous suite à la validation de la demande ${request.id}`
      );

      // Ouvrir le modal de planification
      setIsScheduleModalOpen(true);
    }
  }, [location.state]);

  // Grouper les rendez-vous par jour
  const appointmentsByDay = groupAppointmentsByDay(appointments);

  // Filtrer les rendez-vous pour la date sélectionnée
  const selectedDateStr = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : "";
  const appointmentsForSelectedDate = appointmentsByDay[selectedDateStr] || [];
  const sortedAppointments = sortAppointmentsByTime(
    appointmentsForSelectedDate
  );

  // Créneaux disponibles pour la date sélectionnée du nouveau rendez-vous
  const availableTimeSlots = newAppointmentDate
    ? getAvailableTimeSlotsForDate(appointments, newAppointmentDate)
    : [];

  // Fonction pour déterminer si une date a des rendez-vous
  const hasAppointmentsOnDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return (
      !!appointmentsByDay[dateStr] && appointmentsByDay[dateStr].length > 0
    );
  };

  // Ajouter un nouveau rendez-vous
  const addAppointment = () => {
    if (
      !newAppointmentDate ||
      !newAppointmentTime ||
      !newAppointmentAdmin ||
      !newAppointmentPerson
    ) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    // Création de la date avec l'heure sélectionnée
    const [hours, minutes] = newAppointmentTime.split(":").map(Number);
    const appointmentDate = new Date(newAppointmentDate);
    appointmentDate.setHours(hours, minutes, 0, 0);

    // Création du nouveau rendez-vous
    const admin = AVAILABLE_ADMINS.find(
      (admin) => admin.id === newAppointmentAdmin
    );

    const newAppointment: Appointment = {
      id: generateAppointmentId(appointments),
      date: appointmentDate,
      type: newAppointmentType,
      personName: newAppointmentPerson,
      adminName: admin ? admin.name : "",
      adminFirstName: admin ? admin.name.split(" ")[0] : "",
      adminLastName: admin ? admin.name.split(" ").slice(1).join(" ") : "",
      notes: newAppointmentNotes,
      email: newAppointmentEmail,
      time: "",
    };

    // Ajout du rendez-vous à la liste
    setAppointments((prev) => [...prev, newAppointment]);

    // Redirection vers la date du nouveau rendez-vous
    setSelectedDate(appointmentDate);

    // Fermeture du modal
    setIsScheduleModalOpen(false);

    // Notification de confirmation
    toast({
      title: "Rendez-vous créé",
      description: `Le rendez-vous a été planifié pour le ${format(
        appointmentDate,
        "dd/MM/yyyy"
      )} à ${newAppointmentTime}.`,
    });

    // Simulation d'envoi d'email
    toast({
      title: "Email envoyé",
      description: `Un email de confirmation a été envoyé à ${newAppointmentEmail}.`,
      variant: "default",
    });

    // Réinitialisation des champs
    resetAppointmentForm();
  };

  // Réinitialiser le formulaire
  const resetAppointmentForm = () => {
    setNewAppointmentDate(new Date());
    setNewAppointmentTime("");
    setNewAppointmentType("registration");
    setNewAppointmentPerson("");
    setNewAppointmentEmail("");
    setNewAppointmentAdmin("");
    setNewAppointmentNotes("");
  };

  // Calculer les jours de la semaine actuelle
  const daysOfWeek = eachDayOfInterval({
    start: startOfWeek(currentWeek, { weekStartsOn: 1 }), // Commence le lundi
    end: endOfWeek(currentWeek, { weekStartsOn: 1 }), // Finit le dimanche
  });

  // Naviguer à la semaine précédente
  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeek);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeek(prevWeek);
  };

  // Naviguer à la semaine suivante
  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeek(nextWeek);
  };

  // Naviguer à la semaine actuelle
  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  // Gérer le clic sur un créneau horaire
  const handleTimeSlotClick = (date: Date, hour: number) => {
    const timeSlotDate = new Date(date);
    timeSlotDate.setHours(hour, 0, 0, 0);

    setNewAppointmentDate(timeSlotDate);
    setNewAppointmentTime(`${hour.toString().padStart(2, "0")}:00`);
    setIsScheduleModalOpen(true);
  };

  // Afficher les détails d'un rendez-vous
  const showAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsAppointmentDetailModalOpen(true);
  };

  // Générer les heures pour l'affichage du planning
  const hours = Array.from(
    { length: END_HOUR - START_HOUR },
    (_, i) => START_HOUR + i
  );

  async function handleCancelAppointment(appointmentId: number): Promise<void> {
    // Mettre à jour l'état pour retirer le rendez-vous de l'interface
    setAppointments((prevAppointments) =>
      prevAppointments.filter(
        (appointment) => parseInt(appointment.id, 10) !== appointmentId
      )
    );

    // Appel à l'API pour supprimer le rendez-vous
    try {
      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointmentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Si vous utilisez l'authentification
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'annulation du rendez-vous");
      }

      // Afficher une notification de succès
      toast({
        title: "Rendez-vous annulé",
        description: `Le rendez-vous a été annulé avec succès.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Erreur lors de l'annulation du rendez-vous :", error);
      // Si l'appel à l'API échoue, vous pouvez choisir de réajouter le rendez-vous à l'état
      // ou afficher un message d'erreur
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de l'annulation du rendez-vous.",
        variant: "destructive",
      });
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-rwdm-blue dark:text-white">
              Planning
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Consultez et gérez les rendez-vous au secrétariat
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              className="bg-rwdm-blue"
              onClick={() => setIsScheduleModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un rendez-vous
            </Button>
            <Link to="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour au tableau de bord
              </Button>
            </Link>
          </div>
        </div>

        <Tabs
          defaultValue="week"
          className="w-full"
          onValueChange={(value) => setCurrentView(value as "day" | "week")}
        >
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="day">Vue journalière</TabsTrigger>
            <TabsTrigger value="week">Vue hebdomadaire</TabsTrigger>
          </TabsList>

          <TabsContent value="day" className="mt-4">
            <DayView
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              hasAppointmentsOnDate={hasAppointmentsOnDate}
              sortedAppointments={sortedAppointments}
              setNewAppointmentDate={setNewAppointmentDate}
              setIsScheduleModalOpen={setIsScheduleModalOpen}
              showAppointmentDetails={showAppointmentDetails}
            />
          </TabsContent>

          <TabsContent value="week" className="mt-4">
            <WeekView
              currentWeek={currentWeek}
              daysOfWeek={daysOfWeek}
              goToPreviousWeek={goToPreviousWeek}
              goToCurrentWeek={goToCurrentWeek}
              goToNextWeek={goToNextWeek}
              hours={hours}
              appointments={appointments}
              handleTimeSlotClick={handleTimeSlotClick}
              showAppointmentDetails={showAppointmentDetails}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal for adding an appointment */}
      <AddAppointmentDialog
        isOpen={isScheduleModalOpen}
        setIsOpen={setIsScheduleModalOpen}
        newAppointmentDate={newAppointmentDate}
        setNewAppointmentDate={setNewAppointmentDate}
        newAppointmentTime={newAppointmentTime}
        setNewAppointmentTime={setNewAppointmentTime}
        newAppointmentType={newAppointmentType}
        setNewAppointmentType={setNewAppointmentType}
        newAppointmentPerson={newAppointmentPerson}
        setNewAppointmentPerson={setNewAppointmentPerson}
        newAppointmentEmail={newAppointmentEmail}
        setNewAppointmentEmail={setNewAppointmentEmail}
        newAppointmentAdmin={newAppointmentAdmin}
        setNewAppointmentAdmin={setNewAppointmentAdmin}
        newAppointmentNotes={newAppointmentNotes}
        setNewAppointmentNotes={setNewAppointmentNotes}
        availableTimeSlots={availableTimeSlots}
        addAppointment={addAppointment}
      />
      {/* Modal for appointment details */}
      <AppointmentDetailsDialog
        isOpen={isAppointmentDetailModalOpen}
        setIsOpen={setIsAppointmentDetailModalOpen}
        appointment={selectedAppointment}
        onCancel={handleCancelAppointment}
      />
    </AdminLayout>
  );
};

export default Planning;
