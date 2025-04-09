import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Appointment,
  formatHour,
  getAppointmentsForHourAndDate,
  getTimeFromDate,
  translateAppointmentType,
} from "./planningUtils";

interface WeekViewProps {
  currentWeek: Date;
  daysOfWeek: Date[];
  goToPreviousWeek: () => void;
  goToCurrentWeek: () => void;
  goToNextWeek: () => void;
  hours: string[];
  appointments: Appointment[];
  handleTimeSlotClick: (date: Date, hour: string) => void;
  showAppointmentDetails: (appointment: Appointment) => void;
}

const WeekView: React.FC<WeekViewProps> = ({
  currentWeek,
  daysOfWeek,
  goToPreviousWeek,
  goToCurrentWeek,
  goToNextWeek,
  hours,
  appointments,
  handleTimeSlotClick,
  showAppointmentDetails,
}) => {
  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <CardTitle>
            Semaine du {format(daysOfWeek[0], "d MMMM", { locale: fr })} au{" "}
            {format(daysOfWeek[6], "d MMMM yyyy", { locale: fr })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
              Aujourd'hui
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ScrollArea className="h-[600px]">
          <div className="relative">
            <Table className="w-full">
              <TableHeader className="sticky top-0 bg-white dark:bg-rwdm-darkblue z-10">
                <TableRow>
                  <TableHead className="w-20 text-right">Heure</TableHead>
                  {daysOfWeek.map((day, index) => (
                    <TableHead
                      key={index}
                      className={cn(
                        "text-center w-1/7 min-w-[120px] font-medium",
                        isToday(day) && "bg-rwdm-blue/10"
                      )}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-normal">
                          {format(day, "EEEE", { locale: fr })}
                        </span>
                        <span
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                            isToday(day) && "bg-rwdm-blue text-white"
                          )}
                        >
                          {format(day, "d")}
                        </span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {hours.map((hour) => (
                  <TableRow key={hour}>
                    <TableCell className="align-top text-right font-medium py-2">
                      {hour}
                    </TableCell>

                    {daysOfWeek.map((day, dayIndex) => {
                      const appointmentsForHour = getAppointmentsForHourAndDate(
                        appointments,
                        day,
                        hour // ✅ string, ex: "09:30"
                      );

                      return (
                        <TableCell
                          key={dayIndex}
                          className={cn(
                            "align-top border-l p-0",
                            isToday(day) && "bg-rwdm-blue/5"
                          )}
                        >
                          <div
                            className="w-full h-full min-h-[100px] p-1"
                            onClick={() => handleTimeSlotClick(day, hour)}
                          >
                            {appointmentsForHour.length === 0 ? (
                              <div className="w-full h-full rounded-md border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                <span className="text-xs text-gray-400">+</span>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                {appointmentsForHour.map(
                                  (appointment, appointmentIndex) => (
                                    <div
                                      key={appointmentIndex}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        showAppointmentDetails(appointment);
                                      }}
                                      className={cn(
                                        "p-1 rounded-md text-xs cursor-pointer",
                                        appointment.type === "registration" &&
                                          "bg-green-100 border-l-4 border-green-500 text-green-800",
                                        appointment.type ===
                                          "selection-tests" &&
                                          "bg-blue-100 border-l-4 border-blue-500 text-blue-800",
                                        appointment.type ===
                                          "accident-report" &&
                                          "bg-red-100 border-l-4 border-red-500 text-red-800",
                                        appointment.type ===
                                          "responsibility-waiver" &&
                                          "bg-purple-100 border-l-4 border-purple-500 text-purple-800",
                                        appointment.type === "other" &&
                                          "bg-gray-100 border-l-4 border-gray-500 text-gray-800"
                                      )}
                                    >
                                      <div className="font-bold truncate">
                                        {appointment.personName
                                          .split(" ")
                                          .map(
                                            (word) =>
                                              word.charAt(0).toUpperCase() +
                                              word.slice(1).toLowerCase()
                                          )
                                          .join(" ")}
                                      </div>
                                      <div className="flex flex-col items-start gap-1">
                                        <span className="block text-wrap break-words max-w-[110px] leading-tight">
                                          {translateAppointmentType(
                                            appointment.type
                                          )}
                                        </span>
                                        <span className="text-[10px]">
                                          {appointment.adminFirstName &&
                                          appointment.adminLastName
                                            ? `${appointment.adminFirstName} ${appointment.adminLastName}`
                                            : "Admin inconnu"}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default WeekView;
