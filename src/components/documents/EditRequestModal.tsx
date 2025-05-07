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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Request, RequestDetails } from "@/components/RequestDetailsModal";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const LABELS_FR: Record<string, string> = {
  clubName: "Club",
  playerLastName: "Nom du joueur",
  playerFirstName: "Prénom du joueur",
  email: "E‑mail",
  phone: "Téléphone",
  accidentDate: "Date de l’accident",
  description: "Description",
  filePaths: "Documents justificatifs",
  signature: "Signature",
  category: "Catégorie",
  codeDossier: "Code dossier",
  documentLabel: "Type de document",
  parentLastName: "Nom du parent",
  parentFirstName: "Prénom du parent",
  parentPhone: "Téléphone du parent",
  parentEmail: "E‑mail du parent",

  playerBirthDate: "Date de naissance du joueur",
  currentClub: "Club actuel",
  previousClub: "Club précédent",

  signatureDate: "Date de signature",
  approvalText: "Mention approuvée",

  filePath: "Chemin du fichier",
  season: "Saison d’inscription",
  academy: "Académie",

  // joueur
  lastName: "Nom du joueur",
  firstName: "Prénom du joueur",
  birthDate: "Date de naissance",
  birthPlace: "Lieu de naissance",
  address: "Adresse",
  postalCode: "Code postal",
  city: "Ville",
  position: "Position",
  parentRelation: "Relation",

  // parent 1
  parent1Type: "Lien du parent 1",
  parent1LastName: "Nom du parent 1",
  parent1FirstName: "Prénom du parent 1",
  parent1Phone: "Téléphone du parent 1",
  parent1Email: "Email du parent 1",
  parent1Address: "Adresse du parent 1",
  parent1PostalCode: "CP du parent 1",
  parent1Gsm: "GSM du parent 1",

  // parent 2
  parent2Type: "Lien du parent 2",
  parent2LastName: "Nom du parent 2",
  parent2FirstName: "Prénom du parent 2",
  parent2Phone: "Téléphone du parent 2",
  parent2Email: "Email du parent 2",
  parent2Address: "Adresse du parent 2",
  parent2PostalCode: "CP du parent 2",
  parent2Gsm: "GSM du parent 2",

  // accident

  // consentement & signature
  imageConsent: "Consentement à l’image",

  createdAt: "Date de création",
  // … complétez avec vos autres champs …
};

interface EditRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request | null;
  onSaved: (updated: Request) => void;
}

const EditRequestModal: React.FC<EditRequestModalProps> = ({
  isOpen,
  onClose,
  request,
  onSaved,
}) => {
  const { toast } = useToast();
  const excludedKeys = [
    "signature",
    "filePaths",
    "filePath",
    "testStartDate",
    "testEndDate",
  ];
  // 1) toujours un objet, jamais `undefined`
  const [details, setDetails] = useState<RequestDetails>({});

  // 2) dès que la request arrive, on hydrate details
  useEffect(() => {
    if (request) {
      // si request.details n’existe pas, on regarde request.data
      setDetails(request.details ?? {});
    }
  }, [request]);

  // 3) guard pour ne rien rendre tant qu'on n'a pas de request
  if (!request) return null;

  const handleChange = (key: string, value: any) => {
    setDetails((d) => ({ ...d, [key]: value }));
  };

  const handleSave = async () => {
    try {
      // Validation des données avant envoi
      if (!details || Object.keys(details).length === 0) {
        toast({
          title: "Erreur",
          description: "Les détails ne peuvent pas être vides.",
          variant: "destructive",
        });
        return;
      }

      const res = await fetch(
        `http://localhost:5000/api/requests/${request.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ details }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Échec mise à jour");
      }

      const updatedRequest = await res.json();

      // Mise à jour locale et notification
      onSaved({ ...request, details: updatedRequest.details });
      toast({ title: "Modifié", description: "Données mises à jour." });
      onClose();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erreur",
        description: err.message || "Impossible de sauvegarder.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier la demande #{request.id}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          {Object.entries(details)
            .filter(([key]) => !excludedKeys.includes(key)) // Exclure les champs
            .map(([key, value]) => (
              <div key={key} className="space-y-1">
                <Label>
                  {LABELS_FR[key] ?? key.replace(/([A-Z])/g, " $1")}
                </Label>
                <Input
                  value={
                    key === "createdAt" && value
                      ? format(new Date(value), "dd MMMM yyyy", { locale: fr }) // Formater la date
                      : key.toLowerCase().includes("date") && value
                      ? format(new Date(value), "dd MMMM yyyy", { locale: fr }) // Formater les autres dates
                      : value ?? ""
                  }
                  placeholder={`Entrez ${LABELS_FR[key] ?? key}`}
                  onChange={(e) => handleChange(key, e.target.value)}
                  disabled={
                    key === "createdAt" ||
                    key === "codeDossier" ||
                    key === "documentLabel" ||
                    key === "approvalText" // Désactiver "Mention approuvée"
                  }
                  className={`${
                    key === "createdAt" ||
                    key === "codeDossier" ||
                    key === "documentLabel" ||
                    key === "approvalText"
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed" // Styles pour les champs désactivés
                      : ""
                  } ${value ? "" : "border-red-500"}`} // Exemple de validation visuelle
                />
              </div>
            ))}
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

export default EditRequestModal;
