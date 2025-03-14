
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Link, useLocation } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Plus,
  Mail,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Types pour notre planning
type AppointmentType = 'registration' | 'selection-tests' | 'accident-report' | 'responsibility-waiver' | 'other';

interface Appointment {
  id: string;
  date: Date;
  type: AppointmentType;
  personName: string;
  adminName: string;
  notes?: string;
  email?: string;
}

// Données fictives pour notre démo
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "APP-001",
    date: new Date(2023, 7, 15, 10, 0), // 15 août 2023, 10:00
    type: "registration",
    personName: "Lucas Dubois",
    adminName: "Sophie Dupont",
    notes: "Premier rendez-vous pour l'inscription",
    email: "lucas.dubois@example.com"
  },
  {
    id: "APP-002",
    date: new Date(2023, 7, 15, 14, 30), // 15 août 2023, 14:30
    type: "selection-tests",
    personName: "Emma Petit",
    adminName: "Thomas Martin",
    notes: "Préparation aux tests de la semaine prochaine",
    email: "emma.petit@example.com"
  },
  {
    id: "APP-003",
    date: new Date(2023, 7, 16, 9, 15), // 16 août 2023, 9:15
    type: "accident-report",
    personName: "Noah Lambert",
    adminName: "Elise Bernard",
    notes: "Suivi de la déclaration d'accident du 10/08",
    email: "noah.lambert@example.com"
  },
  {
    id: "APP-004",
    date: new Date(2023, 7, 17, 11, 0), // 17 août 2023, 11:00
    type: "responsibility-waiver",
    personName: "Chloé Moreau",
    adminName: "Michael Lambert",
    notes: "Signature de la décharge pour le tournoi",
    email: "chloe.moreau@example.com"
  },
  {
    id: "APP-005",
    date: new Date(2023, 7, 18, 15, 45), // 18 août 2023, 15:45
    type: "other",
    personName: "Louis Lefevre",
    adminName: "Sophie Dupont",
    notes: "Discussion sur le programme d'entraînement",
    email: "louis.lefevre@example.com"
  }
];

// Heures disponibles pour les rendez-vous
const AVAILABLE_TIMES = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

// Admins disponibles
const AVAILABLE_ADMINS = [
  { id: "1", name: "Sophie Dupont" },
  { id: "2", name: "Thomas Martin" },
  { id: "3", name: "Elise Bernard" },
  { id: "4", name: "Michael Lambert" }
];

// Heures de début et de fin pour le planning
const START_HOUR = 9;
const END_HOUR = 18;

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

// Fonction pour générer un nouvel ID de rendez-vous
const generateAppointmentId = (appointments: Appointment[]) => {
  const lastId = appointments.length > 0 
    ? parseInt(appointments[appointments.length - 1].id.split('-')[1]) 
    : 0;
  const newIdNumber = (lastId + 1).toString().padStart(3, '0');
  return `APP-${newIdNumber}`;
};

// Fonction pour vérifier si un créneau horaire est disponible
const isTimeSlotAvailable = (appointments: Appointment[], date: Date, time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const timeSlotDate = new Date(date);
  timeSlotDate.setHours(hours, minutes, 0, 0);
  
  return !appointments.some(appointment => {
    const appointmentTime = appointment.date.getTime();
    const slotTime = timeSlotDate.getTime();
    return appointmentTime === slotTime;
  });
};

// Fonction pour obtenir les créneaux disponibles pour une date
const getAvailableTimeSlotsForDate = (appointments: Appointment[], date: Date) => {
  return AVAILABLE_TIMES.filter(time => isTimeSlotAvailable(appointments, date, time));
};

// Fonction pour formater l'heure (9 -> 09:00)
const formatHour = (hour: number) => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

// Fonction pour extraire l'heure et les minutes d'une date
const getTimeFromDate = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return {
    hours,
    minutes,
    formattedTime: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  };
};

// Fonction pour vérifier si un rendez-vous est dans une heure spécifique
const isAppointmentInHour = (appointment: Appointment, date: Date, hour: number) => {
  return appointment.date.getHours() === hour && isSameDay(appointment.date, date);
};

// Fonction pour obtenir tous les rendez-vous pour une heure et une date spécifique
const getAppointmentsForHourAndDate = (appointments: Appointment[], date: Date, hour: number) => {
  return appointments.filter(appointment => isAppointmentInHour(appointment, date, hour));
};

const Planning = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isAppointmentDetailModalOpen, setIsAppointmentDetailModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newAppointmentDate, setNewAppointmentDate] = useState<Date | undefined>(new Date());
  const [newAppointmentTime, setNewAppointmentTime] = useState<string>('');
  const [newAppointmentType, setNewAppointmentType] = useState<AppointmentType>('registration');
  const [newAppointmentPerson, setNewAppointmentPerson] = useState('');
  const [newAppointmentEmail, setNewAppointmentEmail] = useState('');
  const [newAppointmentAdmin, setNewAppointmentAdmin] = useState('');
  const [newAppointmentNotes, setNewAppointmentNotes] = useState('');
  const [currentView, setCurrentView] = useState<'day' | 'week'>('day');
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  
  const location = useLocation();
  const { toast } = useToast();

  // Vérifier si nous avons été redirigés depuis la page dashboard avec une demande d'inscription validée
  useEffect(() => {
    if (location.state?.scheduleAppointment && location.state?.request) {
      const request = location.state.request;
      setNewAppointmentPerson(request.name);
      setNewAppointmentEmail(request.email);
      setNewAppointmentType(request.type as AppointmentType);
      setNewAppointmentNotes(`Rendez-vous suite à la validation de la demande ${request.id}`);
      
      // Ouvrir le modal de planification
      setIsScheduleModalOpen(true);
    }
  }, [location.state]);
  
  // Grouper les rendez-vous par jour
  const appointmentsByDay = groupAppointmentsByDay(appointments);
  
  // Filtrer les rendez-vous pour la date sélectionnée
  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const appointmentsForSelectedDate = appointmentsByDay[selectedDateStr] || [];
  const sortedAppointments = sortAppointmentsByTime(appointmentsForSelectedDate);
  
  // Créneaux disponibles pour la date sélectionnée du nouveau rendez-vous
  const availableTimeSlots = newAppointmentDate 
    ? getAvailableTimeSlotsForDate(appointments, newAppointmentDate)
    : [];

  // Fonction pour déterminer si une date a des rendez-vous
  const hasAppointmentsOnDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return !!appointmentsByDay[dateStr] && appointmentsByDay[dateStr].length > 0;
  };

  // Ajouter un nouveau rendez-vous
  const addAppointment = () => {
    if (!newAppointmentDate || !newAppointmentTime || !newAppointmentAdmin || !newAppointmentPerson) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }
    
    // Création de la date avec l'heure sélectionnée
    const [hours, minutes] = newAppointmentTime.split(':').map(Number);
    const appointmentDate = new Date(newAppointmentDate);
    appointmentDate.setHours(hours, minutes, 0, 0);
    
    // Création du nouveau rendez-vous
    const newAppointment: Appointment = {
      id: generateAppointmentId(appointments),
      date: appointmentDate,
      type: newAppointmentType,
      personName: newAppointmentPerson,
      adminName: AVAILABLE_ADMINS.find(admin => admin.id === newAppointmentAdmin)?.name || '',
      notes: newAppointmentNotes,
      email: newAppointmentEmail
    };
    
    // Ajout du rendez-vous à la liste
    setAppointments(prev => [...prev, newAppointment]);
    
    // Redirection vers la date du nouveau rendez-vous
    setSelectedDate(appointmentDate);
    
    // Fermeture du modal
    setIsScheduleModalOpen(false);
    
    // Notification de confirmation
    toast({
      title: "Rendez-vous créé",
      description: `Le rendez-vous a été planifié pour le ${format(appointmentDate, 'dd/MM/yyyy')} à ${newAppointmentTime}.`,
    });
    
    // Simulation d'envoi d'email
    toast({
      title: "Email envoyé",
      description: `Un email de confirmation a été envoyé à ${newAppointmentEmail}.`,
      variant: "default"
    });
    
    // Réinitialisation des champs
    resetAppointmentForm();
  };
  
  // Réinitialiser le formulaire
  const resetAppointmentForm = () => {
    setNewAppointmentDate(new Date());
    setNewAppointmentTime('');
    setNewAppointmentType('registration');
    setNewAppointmentPerson('');
    setNewAppointmentEmail('');
    setNewAppointmentAdmin('');
    setNewAppointmentNotes('');
  };

  // Calculer les jours de la semaine actuelle
  const daysOfWeek = eachDayOfInterval({
    start: startOfWeek(currentWeek, { weekStartsOn: 1 }), // Commence le lundi
    end: endOfWeek(currentWeek, { weekStartsOn: 1 }) // Finit le dimanche
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
    setNewAppointmentTime(`${hour.toString().padStart(2, '0')}:00`);
    setIsScheduleModalOpen(true);
  };

  // Afficher les détails d'un rendez-vous
  const showAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsAppointmentDetailModalOpen(true);
  };

  // Générer les heures pour l'affichage du planning
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-rwdm-blue dark:text-white">Planning</h1>
            <p className="text-gray-600 dark:text-gray-300">Consultez et gérez les rendez-vous au secrétariat</p>
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
        
        <Tabs defaultValue="week" className="w-full" onValueChange={(value) => setCurrentView(value as 'day' | 'week')}>
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="day">Vue journalière</TabsTrigger>
            <TabsTrigger value="week">Vue hebdomadaire</TabsTrigger>
          </TabsList>
          
          <TabsContent value="day" className="mt-4">
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
                                  {appointment.email && (
                                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                                      <Mail className="h-4 w-4" />
                                      <span>{appointment.email}</span>
                                    </div>
                                  )}
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
          </TabsContent>
          
          <TabsContent value="week" className="mt-4">
            <Card>
              <CardHeader className="pb-0">
                <div className="flex justify-between items-center">
                  <CardTitle>
                    Semaine du {format(daysOfWeek[0], 'd MMMM', { locale: fr })} au {format(daysOfWeek[6], 'd MMMM yyyy', { locale: fr })}
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
                                  {format(day, 'EEEE', { locale: fr })}
                                </span>
                                <span className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                                  isToday(day) && "bg-rwdm-blue text-white"
                                )}>
                                  {format(day, 'd')}
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
                              {formatHour(hour)}
                            </TableCell>
                            {daysOfWeek.map((day, dayIndex) => {
                              const appointmentsForHour = getAppointmentsForHourAndDate(appointments, day, hour);
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
                                        {appointmentsForHour.map((appointment, appointmentIndex) => (
                                          <div 
                                            key={appointmentIndex}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              showAppointmentDetails(appointment);
                                            }}
                                            className={cn(
                                              "p-1 rounded-md text-xs cursor-pointer",
                                              appointment.type === 'registration' && "bg-green-100 border-l-4 border-green-500 text-green-800",
                                              appointment.type === 'selection-tests' && "bg-blue-100 border-l-4 border-blue-500 text-blue-800",
                                              appointment.type === 'accident-report' && "bg-red-100 border-l-4 border-red-500 text-red-800",
                                              appointment.type === 'responsibility-waiver' && "bg-purple-100 border-l-4 border-purple-500 text-purple-800",
                                              appointment.type === 'other' && "bg-gray-100 border-l-4 border-gray-500 text-gray-800",
                                            )}
                                          >
                                            <div className="font-medium truncate">{appointment.personName}</div>
                                            <div className="flex justify-between items-center">
                                              <span>{getTimeFromDate(appointment.date).formattedTime}</span>
                                              <span className="text-[10px]">{appointment.adminName.split(' ')[0]}</span>
                                            </div>
                                          </div>
                                        ))}
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
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Modal pour ajouter un rendez-vous */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
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
                        format(newAppointmentDate, 'dd/MM/yyyy')
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
                      availableTimeSlots.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>Aucun créneau disponible</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appointmentType">Type de rendez-vous</Label>
              <Select 
                value={newAppointmentType} 
                onValueChange={(value) => setNewAppointmentType(value as AppointmentType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registration">Inscription à l'académie</SelectItem>
                  <SelectItem value="selection-tests">Tests de sélection</SelectItem>
                  <SelectItem value="accident-report">Déclaration d'accident</SelectItem>
                  <SelectItem value="responsibility-waiver">Décharge de responsabilité</SelectItem>
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
                  {AVAILABLE_ADMINS.map(admin => (
                    <SelectItem key={admin.id} value={admin.id}>{admin.name}</SelectItem>
                  ))}
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
            <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
              Annuler
            </Button>
            <Button className="bg-rwdm-blue" onClick={addAppointment}>
              Planifier le rendez-vous
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal pour afficher les détails d'un rendez-vous */}
      <Dialog open={isAppointmentDetailModalOpen} onOpenChange={setIsAppointmentDetailModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails du rendez-vous</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl">{selectedAppointment.personName}</h3>
                  <p className="text-gray-600">
                    {format(selectedAppointment.date, 'EEEE d MMMM yyyy', { locale: fr })}
                    {' à '}
                    {format(selectedAppointment.date, 'HH:mm')}
                  </p>
                </div>
                <div>
                  {getAppointmentBadge(selectedAppointment.type)}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{selectedAppointment.email || 'Aucun email'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>Administrateur: {selectedAppointment.adminName}</span>
                </div>
              </div>
              
              {selectedAppointment.notes && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-1">Notes:</h4>
                  <p className="text-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-300 p-3 rounded-md">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Implémenter la modification de rendez-vous ici
                    // Pour le moment, nous fermons simplement le modal
                    setIsAppointmentDetailModalOpen(false);
                  }}
                >
                  Modifier
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    // Implémenter la suppression de rendez-vous ici
                    // Pour le moment, nous fermons simplement le modal
                    setIsAppointmentDetailModalOpen(false);
                  }}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Planning;
