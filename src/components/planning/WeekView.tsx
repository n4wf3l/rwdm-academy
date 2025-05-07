import React from "react";
import { format, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Appointment,
  getAppointmentsForHourAndDate,
  translateAppointmentType,
} from "./planningUtils";

interface WeekViewProps {
  currentWeek: Date; // Ajout de la propriété currentWeek
  daysOfWeek: Date[];
  goToPreviousWeek: () => void;
  goToCurrentWeek: () => void;
  goToNextWeek: () => void;
  hours: string[];
  appointments: Appointment[];
  handleTimeSlotClick: (date: Date, hour: string) => void;
  showAppointmentDetails: (appointment: Appointment) => void;
}

const headerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const contentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.2 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const WeekView: React.FC<WeekViewProps> = ({
  daysOfWeek,
  goToPreviousWeek,
  goToCurrentWeek,
  goToNextWeek,
  hours,
  appointments,
  handleTimeSlotClick,
  showAppointmentDetails,
}) => (
  <Card className="flex flex-col">
    <CardHeader>
      <CardTitle>Légende</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-wrap gap-6">
        {/* Inscription */}
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-sm bg-green-100 border border-green-500"></span>
          <span className="text-sm">Inscription à l'académie</span>
        </div>

        {/* Tests de sélection */}
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-sm bg-blue-100 border border-blue-500"></span>
          <span className="text-sm">Tests de sélection</span>
        </div>

        {/* Déclaration d'accident */}
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-sm bg-red-100 border border-red-500"></span>
          <span className="text-sm">Déclaration d'accident</span>
        </div>

        {/* Décharge de responsabilité */}
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-sm bg-purple-100 border border-purple-500"></span>
          <span className="text-sm">Décharge de responsabilité</span>
        </div>

        {/* Autre */}
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-sm bg-gray-100 border border-gray-500"></span>
          <span className="text-sm">Autre</span>
        </div>
      </div>
    </CardContent>

    {/* 1) En-tête */}
    <motion.div
      initial="hidden"
      animate="visible"
      variants={headerVariants}
      className="pb-0"
    >
      <CardHeader>
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
    </motion.div>

    {/* 2) Contenu déroulant */}
    <motion.div
      initial="hidden"
      animate="visible"
      variants={contentVariants}
      className="flex-1 flex flex-col"
    >
      <CardContent className="pt-6 flex-1 flex flex-col">
        {/* scrollable container */}
        <ScrollArea className="flex-1">
          <div className="relative">
            <Table className="w-full table-auto">
              {/* 3) Le header reste sticky */}
              <TableHeader className="sticky top-0 bg-white dark:bg-rwdm-darkblue z-10">
                <TableRow>
                  <TableHead className="w-12 text-right text-xs py-1">
                    Heure
                  </TableHead>
                  {daysOfWeek.map((day, idx) => (
                    <TableHead
                      key={idx}
                      className={`text-center w-1/7 min-w-[80px] text-xs ${
                        isToday(day) ? "bg-rwdm-blue/10" : ""
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-normal">
                          {format(day, "EEE", { locale: fr })}
                        </span>
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            isToday(day) ? "bg-rwdm-blue text-white" : ""
                          }`}
                        >
                          {format(day, "d")}
                        </span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              {/* 4) Un seul TableBody */}
              <TableBody>
                {hours.map((hour) => (
                  <motion.tr
                    key={hour}
                    initial="hidden"
                    animate="visible"
                    variants={rowVariants}
                  >
                    <TableCell className="align-top text-right font-medium text-xs py-0.5">
                      {hour}
                    </TableCell>

                    {daysOfWeek.map((day, di) => {
                      const apps = getAppointmentsForHourAndDate(
                        appointments,
                        day,
                        hour
                      );
                      return (
                        <TableCell
                          key={di}
                          className={`align-top border-l p-0 ${
                            isToday(day) ? "bg-rwdm-blue/5" : ""
                          }`}
                        >
                          <div
                            className="w-full h-full min-h-[30px] py-0.5 px-1"
                            onClick={() => handleTimeSlotClick(day, hour)}
                          >
                            {apps.length === 0 ? (
                              <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                  <motion.div
                                    className="w-full h-full rounded-md border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center cursor-pointer"
                                    whileHover={{
                                      backgroundColor: "#f3f4f6",
                                    }}
                                    transition={{ duration: 0.15 }}
                                  >
                                    <span className="text-xs text-gray-400 p-6">
                                      Disponible
                                    </span>
                                  </motion.div>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                  <Tooltip.Content
                                    side="top"
                                    align="center"
                                    className="bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-md data-[side=top]:mb-2"
                                  >
                                    {hour}
                                    <Tooltip.Arrow className="fill-gray-800" />
                                  </Tooltip.Content>
                                </Tooltip.Portal>
                              </Tooltip.Root>
                            ) : (
                              <div className="space-y-0.5">
                                {apps.map((appt, ai) => {
                                  // Formater le nom de l’admin : Prénom + initiale du nom
                                  const adminLabel = appt.adminFirstName
                                    ? `${
                                        appt.adminFirstName
                                      } ${appt.adminLastName.charAt(0)}.`
                                    : "Admin inconnu";

                                  // Formater le client de la même manière :
                                  // On suppose que personName = "Prénom Nom"
                                  const [clientFirst, clientLast] =
                                    appt.personName.split(" ");
                                  const clientLabel = clientFirst
                                    ? `${clientFirst} ${
                                        clientLast?.charAt(0) ?? ""
                                      }.`
                                    : appt.personName;

                                  return (
                                    <motion.div
                                      key={ai}
                                      whileHover={{ scale: 1.02 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        showAppointmentDetails(appt);
                                      }}
                                      className={`
        w-full flex flex-col items-start
        p-0.5 gap-0.5
        rounded-md text-xs cursor-pointer
        ${
          appt.type === "registration"
            ? "bg-green-100 border-l-4 border-green-500"
            : appt.type === "selection-tests"
            ? "bg-blue-100 border-l-4 border-blue-500"
            : appt.type === "accident-report"
            ? "bg-red-100 border-l-4 border-red-500"
            : appt.type === "responsibility-waiver"
            ? "bg-purple-100 border-l-4 border-purple-500"
            : "bg-gray-100 border-l-4 border-gray-500"
        }
      `}
                                    >
                                      {/* 1. Nom de l’admin */}
                                      <span className="mt-2 ml-2 font-semibold truncate leading-tight capitalize">
                                        {adminLabel}
                                      </span>

                                      {/* 2. Heure en grand */}
                                      <strong className="self-end text-lg leading-tight">
                                        {appt.time}
                                      </strong>

                                      {/* 3. Nom du client formaté */}
                                      <span className="self-end text-[10px] truncate leading-tight capitalize">
                                        Client : {clientLabel}
                                      </span>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </motion.div>
  </Card>
);

export default WeekView;
