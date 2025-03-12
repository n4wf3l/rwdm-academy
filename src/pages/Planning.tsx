
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
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
  Mail
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

const Planning = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newAppointmentDate, setNewAppointmentDate] = useState<Date | undefined>(new Date());
  const [newAppointmentTime, setNewAppointmentTime] = useState<string>('');
  const [newAppointmentType, setNewAppointmentType] = useState<AppointmentType>('registration');
  const [newAppointmentPerson, setNewAppointmentPerson] = useState('');
  const [newAppointmentEmail, setNewAppointmentEmail] = useState('');
  const [newAppointmentAdmin, setNewAppointmentAdmin] = useState('');
  const [newAppointmentNotes, setNewAppointmentNotes] = useState('');
  
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
    </AdminLayout>
  );
};

export default Planning;
