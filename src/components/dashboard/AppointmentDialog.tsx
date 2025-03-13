
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarIcon, FileCheck } from "lucide-react";

interface AppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAppointmentType: (type: 'test' | 'secretariat') => void;
}

const AppointmentDialog: React.FC<AppointmentDialogProps> = ({
  isOpen,
  onClose,
  onSelectAppointmentType
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choisir le type de rendez-vous</DialogTitle>
          <DialogDescription>
            Veuillez sélectionner le type de rendez-vous pour le joueur.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4">
          <Button 
            onClick={() => onSelectAppointmentType('test')}
            className="flex items-center justify-center gap-2 h-20"
          >
            <FileCheck className="h-6 w-6" />
            <span className="text-lg">Fixer un test technique</span>
          </Button>
          <Button 
            onClick={() => onSelectAppointmentType('secretariat')}
            className="flex items-center justify-center gap-2 h-20"
            variant="outline"
          >
            <CalendarIcon className="h-6 w-6" />
            <span className="text-lg">Rendez-vous au secrétariat</span>
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDialog;
