
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { ArrowLeft, Calendar as CalendarIcon, Clock, User } from "lucide-react";

// Types pour notre planning
type AppointmentType = 'registration' | 'selection-tests' | 'accident-report' | 'responsibility-waiver' | 'other';

interface Appointment {
  id: string;
  date: Date;
  type: AppointmentType;
  personName: string;
  adminName: string;
  notes?: string;
}

// Données fictives pour notre démo
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "APP-001",
    date: new Date(2023, 7, 15, 10, 0), // 15 août 2023, 10:00
    type: "registration",
    personName: "Lucas Dubois",
    adminName: "Sophie Dupont",
    notes: "Premier rendez-vous pour l'inscription"
  },
  {
    id: "APP-002",
    date: new Date(2023, 7, 15, 14, 30), // 15 août 2023, 14:30
    type: "selection-tests",
    personName: "Emma Petit",
    adminName: "Thomas Martin",
    notes: "Préparation aux tests de la semaine prochaine"
  },
  {
    id: "APP-003",
    date: new Date(2023, 7, 16, 9, 15), // 16 août 2023, 9:15
    type: "accident-report",
    personName: "Noah Lambert",
    adminName: "Elise Bernard",
    notes: "Suivi de la déclaration d'accident du 10/08"
  },
  {
    id: "APP-004",
    date: new Date(2023, 7, 17, 11, 0), // 17 août 2023, 11:00
    type: "responsibility-waiver",
    personName: "Chloé Moreau",
    adminName: "Michael Lambert",
    notes: "Signature de la décharge pour le tournoi"
  },
  {
    id: "APP-005",
    date: new Date(2023, 7, 18, 15, 45), // 18 août 2023, 15:45
    type: "other",
    personName: "Louis Lefevre",
    adminName: "Sophie Dupont",
    notes: "Discussion sur le programme d'entraînement"
  }
];

// Traduction des types de rendez-vous
const translateAppointmentType = (type: AppointmentType): string => {
  switch (type) {
    case 'registration': return 'Inscription à l\'académie';
    case 'selection-tests': return 'Tests de sélection';
    case 'accident-report': return 'Déclaration d\'accident';
    case 'responsibility-waiver': return 'Décharge de responsabilité';
    case 'other': return 'Autre';
    default: return type;
  }
};

// Couleur du badge selon le type de rendez-vous
const getAppointmentBadge = (type: AppointmentType) => {
  switch (type) {
    case 'registration': return <Badge className="bg-green-500">Inscription</Badge>;
    case 'selection-tests': return <Badge className="bg-blue-500">Tests</Badge>;
    case 'accident-report': return <Badge className="bg-red-500">Accident</Badge>;
    case 'responsibility-waiver': return <Badge className="bg-purple-500">Décharge</Badge>;
    case 'other': return <Badge className="bg-gray-500">Autre</Badge>;
    default: return <Badge>Inconnu</Badge>;
  }
};

// Fonction pour grouper les rendez-vous par jour
const groupAppointmentsByDay = (appointments: Appointment[]) => {
  const grouped: Record<string, Appointment[]> = {};
  
  appointments.forEach(appointment => {
    const dateStr = format(appointment.date, 'yyyy-MM-dd');
    if (!grouped[dateStr]) {
      grouped[dateStr] = [];
    }
    grouped[dateStr].push(appointment);
  });
  
  return grouped;
};

// Fonction pour trier les rendez-vous par heure
const sortAppointmentsByTime = (appointments: Appointment[]) => {
  return [...appointments].sort((a, b) => a.date.getTime() - b.date.getTime());
};

const Planning = () => {
  const [appointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Grouper les rendez-vous par jour
  const appointmentsByDay = groupAppointmentsByDay(appointments);
  
  // Filtrer les rendez-vous pour la date sélectionnée
  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const appointmentsForSelectedDate = appointmentsByDay[selectedDateStr] || [];
  const sortedAppointments = sortAppointmentsByTime(appointmentsForSelectedDate);
  
  // Fonction pour déterminer si une date a des rendez-vous
  const hasAppointmentsOnDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return !!appointmentsByDay[dateStr] && appointmentsByDay[dateStr].length > 0;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-rwdm-blue dark:text-white">Planning</h1>
            <p className="text-gray-600 dark:text-gray-300">Consultez et gérez les rendez-vous au secrétariat</p>
          </div>
          
          <div className="flex gap-2">
            <Link to="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour au tableau de bord
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                className="w-full"
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
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                Rendez-vous du {selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) : 'jour sélectionné'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedAppointments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CalendarIcon className="mx-auto h-12 w-12 opacity-30 mb-2" />
                  <p>Aucun rendez-vous pour cette date.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedAppointments.map((appointment) => (
                    <Card key={appointment.id} className="shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-lg">{appointment.personName}</div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span>{format(appointment.date, 'HH:mm')}</span>
                              </div>
                            </div>
                            <div>
                              {getAppointmentBadge(appointment.type)}
                            </div>
                          </div>
                          
                          <div className="mt-2 text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <User className="h-4 w-4" />
                              <span>Admin: {appointment.adminName}</span>
                            </div>
                            
                            {appointment.notes && (
                              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                <p className="text-gray-700 dark:text-gray-300">{appointment.notes}</p>
                              </div>
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
        </div>
      </div>
    </AdminLayout>
  );
};

export default Planning;
