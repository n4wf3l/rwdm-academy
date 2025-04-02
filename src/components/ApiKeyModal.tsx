import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
  currentKey?: string;
  onSave: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  open,
  onClose,
  currentKey = "",
  onSave,
}) => {
  const [apiKey, setApiKey] = useState(currentKey);

  useEffect(() => {
    setApiKey(currentKey);
  }, [currentKey]);

  const handleSave = () => {
    onSave(apiKey);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la clé API</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Saisissez votre clé API"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
