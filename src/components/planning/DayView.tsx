import React, { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Calendar as CalendarIcon,
  Mail,
  User,
  Plus,
} from "lucide-react";
import { Appointment, getAppointmentBadge } from "./planningUtils";
import AppointmentDetailsDialog from "./AppointmentDetailsDialog";
import { useTranslation } from "@/hooks/useTranslation";

interface DayViewProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  hasAppointmentsOnDate: (date: Date) => boolean;
  sortedAppointments: Appointment[];
  setNewAppointmentDate: (date: Date | undefined) => void;
  setIsScheduleModalOpen: (isOpen: boolean) => void;
  showAppointmentDetails: (appointment: Appointment) => void;
  adminFilter: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

const DayView: React.FC<DayViewProps> = ({
  selectedDate,
  setSelectedDate,
  hasAppointmentsOnDate,
  sortedAppointments,
  setNewAppointmentDate,
  setIsScheduleModalOpen,
  showAppointmentDetails,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const { t } = useTranslation();
  const handleCardClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDialogOpen(true);
  };

  const handleCancelAppointment = (appointmentId: number) => {
    console.log("Annuler le rendez-vous avec l'ID :", appointmentId);
  };

  return (
    <>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Calendrier */}
        <motion.div className="md:col-span-1" variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>{t("calendar_title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={fr}
                className="w-full pointer-events-auto"
                modifiers={{
                  hasAppointment: (date) => hasAppointmentsOnDate(date),
                }}
                modifiersClassNames={{
                  hasAppointment: "bg-rwdm-blue/20 font-bold text-rwdm-blue",
                }}
              />
              <div className="mt-6">
                <h3 className="font-semibold mb-2">{t("legend_title")}</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-rwdm-blue/20" />
                    <span className="text-sm">
                      {t("legend_with_appointments")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-rwdm-blue" />
                    <span className="text-sm">{t("legend_selected_day")}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Détails des rendez-vous */}
        <motion.div className="md:col-span-2" variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>
                {t("appointments_on")}{" "}
                {selectedDate
                  ? format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })
                  : t("day_selected")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedAppointments.length === 0 ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-12 text-gray-500"
                >
                  <CalendarIcon className="mx-auto h-12 w-12 opacity-30 mb-2" />
                  <p>{t("no_appointments")}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setNewAppointmentDate(selectedDate);
                      setIsScheduleModalOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t("add_appointment_on_date")}
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {sortedAppointments.map((appointment) => (
                    <motion.div
                      key={appointment.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      className="cursor-pointer"
                      onClick={() => handleCardClick(appointment)}
                    >
                      <Card className="shadow-sm transition-transform">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-lg">
                                {appointment.personName
                                  .split(" ")
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1).toLowerCase()
                                  )
                                  .join(" ")}
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span>{appointment.time}</span>
                              </div>
                              {appointment.email && (
                                <div className="flex items-center gap-2 text-gray-600 mt-1">
                                  <Mail className="h-4 w-4" />
                                  <span>{appointment.email}</span>
                                </div>
                              )}
                            </div>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${getAppointmentBadge(
                                appointment.type
                              )}`}
                            >
                              {
                                {
                                  registration: t("registration_label"),
                                  "selection-tests": t("selection_tests_label"),
                                  "accident-report": t("accident_report_label"),
                                  "responsibility-waiver": t(
                                    "responsibility_waiver_label"
                                  ),
                                  other: t("other_label"),
                                }[appointment.type]
                              }
                            </span>
                          </div>

                          {/* Administrateur */}
                          <div className="mt-2 text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <User className="h-4 w-4" />
                              <span>
                                <strong>{t("admin_label")}</strong>{" "}
                                {appointment.adminFirstName &&
                                appointment.adminLastName
                                  ? `${appointment.adminFirstName} ${appointment.adminLastName}`
                                  : t("no_admin_assigned")}
                              </span>
                            </div>

                            {/* Notes */}
                            {appointment.notes ? (
                              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                <p className="text-gray-700 dark:text-gray-300">
                                  <strong>{t("notes_label")}</strong>{" "}
                                  {appointment.notes}
                                </p>
                              </div>
                            ) : (
                              <p className="mt-2 text-gray-600">
                                {t("no_notes")}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Appointment Details Dialog */}
      <AppointmentDetailsDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        appointment={selectedAppointment}
        onCancel={handleCancelAppointment}
      />
    </>
  );
};

export default DayView;
