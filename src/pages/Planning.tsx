import React, { useState, useEffect, useMemo } from "react";
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
  Archive,
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
import DatabaseUsageChart from "@/components/charts/DatabaseUsageChart";
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
import ListOfAllAppointments from "@/components/planning/ListOfAllAppointments";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

const Planning = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isArchiveMode, setIsArchiveMode] = useState(false);
  const { t } = useTranslation();
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
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [adminFilter, setAdminFilter] = useState<string>("all");
  const [userRole, setUserRole] = useState<string>(""); // Ajouter un état pour stocker le rôle de l'utilisateur
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const fetchNewRequestsCount = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/requests", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();

        const count = data.filter((r: any) => r.status === "Nouveau").length;
        setNewRequestsCount(count);
      } catch (error) {
        console.error("Erreur comptage demandes :", error);
      }
    };

    fetchNewRequestsCount();
  }, []);

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
  const [appointmentFilter, setAppointmentFilter] = useState<"all" | "mine">(
    "all"
  );

  const filteredAppointments = useMemo(() => {
    if (adminFilter === "all") return appointments;
    return appointments.filter(
      (appointment) =>
        `${appointment.adminFirstName} ${appointment.adminLastName}` ===
        adminFilter
    );
  }, [appointments, adminFilter]);

  // 2️⃣ Gérez le toast DANS le handler, pas en useEffect
  const handleAdminFilterChange = (value: string) => {
    setAdminFilter(value);

    if (value !== "all") {
      toast({
        title: t("filter_applied_title"),
        description: `${t("filter_applied_desc")} ${value}`,
      });
    } else {
      toast({
        title: t("filter_cleared_title"),
      });
    }
  };
  // Créneaux disponibles pour la date sélectionnée du nouveau rendez-vous
  const availableTimeSlots = useMemo(() => {
    if (!newAppointmentDate) return [];
    return getAvailableTimeSlotsForDate(appointments, newAppointmentDate);
  }, [appointments, newAppointmentDate]);

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

  const handleTimeSlotClick = (date: Date, hour: string) => {
    const [h, m] = hour.split(":").map(Number);
    const newDate = new Date(date);
    newDate.setHours(h, m, 0, 0);

    setNewAppointmentDate(newDate); // ✅ corrigé ici
    setNewAppointmentTime(hour); // ✅ pas besoin de reformater, c'est déjà bon
    setIsScheduleModalOpen(true);
  };

  // Afficher les détails d'un rendez-vous
  const showAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsAppointmentDetailModalOpen(true);
  };

  // Générer les heures pour l'affichage du planning
  const hours = Array.from({ length: 22 }, (_, i) => {
    const hour = 9 + Math.floor(i / 2);
    const minutes = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minutes}`;
  });

  const uniqueAdmins = useMemo(() => {
    const admins = appointments
      .map((appointment) => ({
        fullName: `${appointment.adminFirstName} ${appointment.adminLastName}`,
        id: `${appointment.adminFirstName}-${appointment.adminLastName}`, // Générer un ID basé sur le nom
      }))
      .filter((admin) => admin.fullName.trim() !== ""); // Filtrer les noms vides
    return Array.from(
      new Map(admins.map((admin) => [admin.id, admin])).values()
    ); // Supprimer les doublons par ID
  }, [appointments]);

  async function handleCancelAppointment(
    appointmentId: number,
    sendEmail = false
  ): Promise<void> {
    const appointmentToCancel = appointments.find(
      (appt) => parseInt(appt.id, 10) === appointmentId
    );

    // Mettre à jour l'état (optimistic UI)
    setAppointments((prevAppointments) =>
      prevAppointments.filter((appt) => parseInt(appt.id, 10) !== appointmentId)
    );

    try {
      // 1. Supprimer en base
      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointmentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Erreur suppression rendez-vous");

      // 2. Envoi email si demandé
      if (sendEmail && appointmentToCancel) {
        const emailRes = await fetch(
          "http://localhost:5000/api/form-mail/send-appointment-cancellation",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ appointment: appointmentToCancel }),
          }
        );

        if (!emailRes.ok) throw new Error("Erreur envoi email d'annulation");
      }

      toast({
        title: "Rendez-vous annulé",
        description: sendEmail
          ? "Le rendez-vous a été annulé et la personne a été avertie par email."
          : "Le rendez-vous a été annulé.",
      });
    } catch (error) {
      console.error("❌ Annulation échouée :", error);
      toast({
        title: "Erreur",
        description:
          "Impossible d'annuler le rendez-vous ou d'envoyer l'email.",
        variant: "destructive",
      });
    }
  }

  // Ajouter cette fonction pour générer des badges d'appointement
  const getAppointmentBadge = (type: AppointmentType) => {
    switch (type) {
      case "registration":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300">
            {t("registration_label")}
          </span>
        );
      case "selection-tests":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-300">
            {t("selection_tests_label")}
          </span>
        );
      case "accident-report":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300">
            {t("accident_report_label")}
          </span>
        );
      case "responsibility-waiver":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-300">
            {t("responsibility_waiver_label")}
          </span>
        );
      case "other":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300">
            {t("other_label")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300">
            {type}
          </span>
        );
    }
  };

  // Ajouter cette fonction pour gérer la suppression
  const handleAppointmentsDeleted = (deletedIds: string[]) => {
    // Filtrer les rendez-vous supprimés de l'état local
    setAppointments((prevAppointments) =>
      prevAppointments.filter((appt) => !deletedIds.includes(appt.id))
    );
  };

  // Ajouter un useEffect pour récupérer le rôle de l'utilisateur
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok)
          throw new Error("Impossible de récupérer l'utilisateur");

        const userData = await response.json();
        setUserRole(userData.role);
      } catch (error) {
        console.error("Erreur lors de la récupération du rôle:", error);
      }
    };

    fetchUserRole();
  }, []);

  return (
    <AdminLayout newRequestsCount={newRequestsCount}>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="flex flex-col md:flex-row justify-between md:items-center gap-4"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <motion.h1
              className="text-3xl font-bold text-rwdm-blue dark:text-white"
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {t("planning_title")}
            </motion.h1>
            <motion.p
              className="text-gray-600 dark:text-gray-300"
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {t("planning_description")}
            </motion.p>
          </div>

          {/* Div modifiée pour inclure le bouton d'archive */}
          <motion.div
            className="flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {["owner", "superadmin"].includes(userRole) && (
              <Button
                variant={isArchiveMode ? "default" : "outline"}
                className={
                  isArchiveMode ? "bg-amber-600 hover:bg-amber-700" : ""
                }
                onClick={() => setIsArchiveMode(!isArchiveMode)}
              >
                <Archive className="mr-2 h-4 w-4" />
                {isArchiveMode ? t("exitArchiveMode") : t("archiveMode")}
              </Button>
            )}

            <Button
              className="bg-rwdm-blue"
              onClick={() => setIsScheduleModalOpen(true)}
              disabled={isArchiveMode}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("add_appointment")}
            </Button>
          </motion.div>
        </motion.div>

        {/* Remplacement conditionnel de la section Tabs par la liste des rendez-vous archivés */}
        {isArchiveMode ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <ListOfAllAppointments
              appointments={appointments}
              onExitArchiveMode={() => setIsArchiveMode(false)}
              getAppointmentBadge={getAppointmentBadge}
              onAppointmentsDeleted={handleAppointmentsDeleted} // Ajouter ce prop
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Tabs
              defaultValue="week"
              className="w-full"
              onValueChange={(value) => setCurrentView(value as "day" | "week")}
            >
              <div className="flex items-center justify-between mt-4">
                <TabsList
                  className={`w-full max-w-lg grid ${
                    ["owner", "superadmin"].includes(userRole)
                      ? "grid-cols-3"
                      : "grid-cols-2"
                  }`}
                >
                  <TabsTrigger value="day">{t("view_day")}</TabsTrigger>
                  <TabsTrigger value="week">{t("view_week")}</TabsTrigger>
                  <TabsTrigger value="database">{t("database")}</TabsTrigger>
                </TabsList>
                <Select
                  value={adminFilter}
                  onValueChange={handleAdminFilterChange}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={t("all_admins")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("all_admins")}</SelectItem>
                    {uniqueAdmins.map((admin) => (
                      <SelectItem key={admin.id} value={admin.fullName}>
                        {admin.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <TabsContent value="day" className="mt-4">
                <DayView
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  hasAppointmentsOnDate={hasAppointmentsOnDate}
                  sortedAppointments={sortAppointmentsByTime(
                    filteredAppointments.filter(
                      (appointment) =>
                        format(appointment.date, "yyyy-MM-dd") ===
                        selectedDateStr
                    )
                  )}
                  setNewAppointmentDate={setNewAppointmentDate}
                  setIsScheduleModalOpen={setIsScheduleModalOpen}
                  showAppointmentDetails={showAppointmentDetails}
                  adminFilter={adminFilter}
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
                  appointments={filteredAppointments}
                  handleTimeSlotClick={handleTimeSlotClick}
                  showAppointmentDetails={showAppointmentDetails}
                />
              </TabsContent>

              {["owner", "superadmin"].includes(userRole) && (
                <TabsContent value="database" className="mt-4">
                  <DatabaseUsageChart />
                </TabsContent>
              )}
            </Tabs>
          </motion.div>
        )}
      </motion.div>

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
        appointments={appointments}
        addAppointmentToState={(appointment) =>
          setAppointments((prev) => [...prev, appointment])
        }
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
