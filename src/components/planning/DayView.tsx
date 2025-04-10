import React, { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Clock, CalendarIcon, Mail, User, Plus } from "lucide-react";
import { Appointment, getAppointmentBadge } from "./planningUtils";
import AppointmentDetailsDialog from "./AppointmentDetailsDialog"; // Importez le dialog

interface DayViewProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  hasAppointmentsOnDate: (date: Date) => boolean;
  sortedAppointments: Appointment[];
  setNewAppointmentDate: (date: Date | undefined) => void;
  setIsScheduleModalOpen: (isOpen: boolean) => void;
  showAppointmentDetails: (appointment: Appointment) => void;
}

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

  const handleCardClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDialogOpen(true);
  };

  const handleCancelAppointment = (appointmentId: number) => {
    console.log("Annuler le rendez-vous avec l'ID :", appointmentId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Calendrier */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Calendrier</CardTitle>
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
            <h3 className="font-semibold mb-2">Légende</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-rwdm-blue/20"></div>
                <span className="text-sm">Journée avec rendez-vous</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-rwdm-blue"></div>
                <span className="text-sm">Jour sélectionné</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Détails des rendez-vous */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>
            Rendez-vous du{" "}
            {selectedDate
              ? format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })
              : "jour sélectionné"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedAppointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CalendarIcon className="mx-auto h-12 w-12 opacity-30 mb-2" />
              <p>Aucun rendez-vous pour cette date.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setNewAppointmentDate(selectedDate);
                  setIsScheduleModalOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un rendez-vous à cette date
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedAppointments.map((appointment) => (
                <Card
                  key={appointment.id}
                  className="shadow-sm transition-transform transform hover:scale-[1.02] cursor-pointer"
                  onClick={() => handleCardClick(appointment)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-2">
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
                        <div>
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent text-white ${getAppointmentBadge(
                              appointment.type
                            )}`}
                          >
                            {appointment.type === "registration" &&
                              "Inscription"}
                            {appointment.type === "selection-tests" && "Tests"}
                            {appointment.type === "accident-report" &&
                              "Accident"}
                            {appointment.type === "responsibility-waiver" &&
                              "Décharge"}
                            {appointment.type === "other" && "Autre"}
                          </span>
                        </div>
                      </div>

                      {/* Affichage de l'administrateur */}
                      <div className="mt-2 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <User className="h-4 w-4" />
                          <span>
                            <strong>Administrateur :</strong>{" "}
                            {appointment.adminFirstName &&
                            appointment.adminLastName
                              ? `${appointment.adminFirstName} ${appointment.adminLastName}`
                              : "Aucun administrateur assigné"}
                          </span>
                        </div>

                        {/* Affichage des notes */}
                        {appointment.notes ? (
                          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                            <p className="text-gray-700 dark:text-gray-300">
                              <strong>Notes :</strong> {appointment.notes}
                            </p>
                          </div>
                        ) : (
                          <p className="mt-2 text-gray-600">Aucune note</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Details Dialog */}
      <AppointmentDetailsDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        appointment={selectedAppointment}
        onCancel={handleCancelAppointment}
      />
    </div>
  );
};

export default DayView;
