
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Mail, User } from 'lucide-react';
import { Appointment } from './planningUtils';

interface AppointmentDetailsDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  appointment: Appointment | null;
}

const AppointmentDetailsDialog: React.FC<AppointmentDetailsDialogProps> = ({
  isOpen,
  setIsOpen,
  appointment
}) => {
  if (!appointment) return null;

  const getAppointmentBadge = (type: string) => {
    switch (type) {
      case 'registration': return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent text-white bg-green-500">Inscription</span>;
      case 'selection-tests': return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent text-white bg-blue-500">Tests</span>;
      case 'accident-report': return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent text-white bg-red-500">Accident</span>;
      case 'responsibility-waiver': return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent text-white bg-purple-500">Décharge</span>;
      case 'other': return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent text-white bg-gray-500">Autre</span>;
      default: return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent text-gray-500">Inconnu</span>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Détails du rendez-vous</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-xl">{appointment.personName}</h3>
              <p className="text-gray-600">
                {format(appointment.date, 'EEEE d MMMM yyyy', { locale: fr })}
                {' à '}
                {format(appointment.date, 'HH:mm')}
              </p>
            </div>
            <div>
              {getAppointmentBadge(appointment.type)}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{appointment.email || 'Aucun email'}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span>Administrateur: {appointment.adminName}</span>
            </div>
          </div>
          
          {appointment.notes && (
            <div className="mt-4">
              <h4 className="font-semibold mb-1">Notes:</h4>
              <p className="text-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-300 p-3 rounded-md">
                {appointment.notes}
              </p>
            </div>
          )}
          
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => {
                // Implémenter la modification de rendez-vous ici
                // Pour le moment, nous fermons simplement le modal
                setIsOpen(false);
              }}
            >
              Modifier
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                // Implémenter la suppression de rendez-vous ici
                // Pour le moment, nous fermons simplement le modal
                setIsOpen(false);
              }}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailsDialog;
