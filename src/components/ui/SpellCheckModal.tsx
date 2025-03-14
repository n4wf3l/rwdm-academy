
import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SpellCheckField {
  label: string;
  value: string;
}

interface SpellCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fields: SpellCheckField[];
  title?: string;
}

const SpellCheckModal: React.FC<SpellCheckModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fields,
  title = "Vérification des informations"
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Veuillez vérifier attentivement l'orthographe des informations suivantes avant de soumettre le formulaire.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-5">
            {fields.map((field, index) => (
              <div key={index} className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {field.label}:
                </p>
                <p className="text-lg font-medium px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  {field.value || <span className="text-gray-400 italic">Non renseigné</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Modifier
          </Button>
          <Button 
            onClick={onConfirm} 
            className="gap-1 bg-rwdm-blue hover:bg-rwdm-blue/90"
          >
            <Check className="h-4 w-4" />
            Confirmer et soumettre
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SpellCheckModal;
