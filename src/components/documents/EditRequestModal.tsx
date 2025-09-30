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
import { Request } from "@/components/RequestDetailsModal";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useTranslation } from "@/hooks/useTranslation";

interface RequestDetails {
  [key: string]: any;
}

interface EditRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request | null;
  onSaved: (updated: Request & { email?: string }) => void; // Ajout d'email comme propriété optionnelle
}

const EditRequestModal: React.FC<EditRequestModalProps> = ({
  isOpen,
  onClose,
  request,
  onSaved,
}) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  // Map des labels traduits
  const LABELS: Record<string, string> = {
    clubName: t("clubName"),
    playerLastName: t("playerLastName"),
    playerFirstName: t("playerFirstName"),
    email: t("email"),
    phone: t("phone"),
    accidentDate: t("accidentDate"),
    description: t("description"),
    filePaths: t("filePaths"),
    signature: t("signature"),
    category: t("category"),
    codeDossier: t("codeDossier"),
    documentLabel: t("documentLabel"),
    parentLastName: t("parentLastName"),
    parentFirstName: t("parentFirstName"),
    parentPhone: t("parentPhone"),
    parentEmail: t("parentEmail"),
    playerBirthDate: t("playerBirthDate"),
    currentClub: t("currentClub"),
    previousClub: t("previousClub"),
    signatureDate: t("signatureDate"),
    approvalText: t("approvalText"),
    filePath: t("filePath"),
    season: t("season"),
    academy: t("academy"),
    lastName: t("lastName"),
    firstName: t("firstName"),
    birthDate: t("birthDate"),
    birthPlace: t("birthPlace"),
    address: t("address"),
    postalCode: t("postalCode"),
    city: t("city"),
    position: t("position"),
    parentRelation: t("parentRelation"),
    parent1Type: t("parent1Type"),
    parent1LastName: t("parent1LastName"),
    parent1FirstName: t("parent1FirstName"),
    parent1Phone: t("parent1Phone"),
    parent1Email: t("parent1Email"),
    parent1Address: t("parent1Address"),
    parent1PostalCode: t("parent1PostalCode"),
    parent1Gsm: t("parent1Gsm"),
    parent2Type: t("parent2Type"),
    parent2LastName: t("parent2LastName"),
    parent2FirstName: t("parent2FirstName"),
    parent2Phone: t("parent2Phone"),
    parent2Email: t("parent2Email"),
    parent2Address: t("parent2Address"),
    parent2PostalCode: t("parent2PostalCode"),
    parent2Gsm: t("parent2Gsm"),
    imageConsent: t("imageConsent"),
    createdAt: t("createdAt"),
  };

  // Map explicite des placeholders
  const PLACEHOLDERS: Record<string, string> = {
    clubName: t("enterClubName"),
    playerLastName: t("enterPlayerLastName"),
    playerFirstName: t("enterPlayerFirstName"),
    email: t("enterEmail"),
    phone: t("enterPhone"),
    accidentDate: t("enterAccidentDate"),
    description: t("enterDescription"),
    filePaths: t("enterFilePaths"),
    signature: t("enterSignature"),
    category: t("enterCategory"),
    codeDossier: t("enterCodeDossier"),
    documentLabel: t("enterDocumentLabel"),
    parentLastName: t("enterParentLastName"),
    parentFirstName: t("enterParentFirstName"),
    parentPhone: t("enterParentPhone"),
    parentEmail: t("enterParentEmail"),
    playerBirthDate: t("enterPlayerBirthDate"),
    currentClub: t("enterCurrentClub"),
    previousClub: t("enterPreviousClub"),
    signatureDate: t("enterSignatureDate"),
    approvalText: t("enterApprovalText"),
    filePath: t("enterFilePath"),
    season: t("enterSeason"),
    academy: t("enterAcademy"),
    lastName: t("enterLastName"),
    firstName: t("enterFirstName"),
    birthDate: t("enterBirthDate"),
    birthPlace: t("enterBirthPlace"),
    address: t("enterAddress"),
    postalCode: t("enterPostalCode"),
    city: t("enterCity"),
    position: t("enterPosition"),
    parentRelation: t("enterParentRelation"),
    parent1Type: t("enterParent1Type"),
    parent1LastName: t("enterParent1LastName"),
    parent1FirstName: t("enterParent1FirstName"),
    parent1Phone: t("enterParent1Phone"),
    parent1Email: t("enterParent1Email"),
    parent1Address: t("enterParent1Address"),
    parent1PostalCode: t("enterParent1PostalCode"),
    parent1Gsm: t("enterParent1Gsm"),
    parent2Type: t("enterParent2Type"),
    parent2LastName: t("enterParent2LastName"),
    parent2FirstName: t("enterParent2FirstName"),
    parent2Phone: t("enterParent2Phone"),
    parent2Email: t("enterParent2Email"),
    parent2Address: t("enterParent2Address"),
    parent2PostalCode: t("enterParent2PostalCode"),
    parent2Gsm: t("enterParent2Gsm"),
    imageConsent: t("enterImageConsent"),
    createdAt: t("enterCreatedAt"),
  };

  const excludedKeys = [
    "signature",
    "filePaths",
    "filePath",
    "testStartDate",
    "testEndDate",
  ];

  const [details, setDetails] = useState<RequestDetails>({});

  useEffect(() => {
    if (request) {
      setDetails(request.details ?? {});
    }
  }, [request]);

  if (!request) return null;

  const handleChange = (key: string, value: any) =>
    setDetails((d) => ({ ...d, [key]: value }));

  const handleSave = async () => {
    if (!details || Object.keys(details).length === 0) {
      toast({
        title: t("toast.error"),
        description: t("toast.emptyDetails"),
        variant: "destructive",
      });
      return;
    }
    try {
      // Stocker les détails locaux avant l'appel API
      const detailsToUpdate = { ...details };

      const res = await fetch(
        `https://daringbrusselsacademy.be/node/api/requests/${request.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ details: detailsToUpdate }),
        }
      );

      if (!res.ok) throw new Error((await res.json()).message);

      const updated = await res.json();
      console.log("Réponse de l'API après mise à jour:", updated);

      // Si la réponse ne contient pas les détails, utiliser nos détails locaux
      const updatedDetails = updated.details || detailsToUpdate;

      // Construction du nom avec vérification de l'existence des propriétés
      let updatedName = request.name;

      if (updatedDetails.playerFirstName && updatedDetails.playerLastName) {
        updatedName = `${updatedDetails.playerFirstName} ${updatedDetails.playerLastName}`;
      } else if (updatedDetails.firstName && updatedDetails.lastName) {
        updatedName = `${updatedDetails.firstName} ${updatedDetails.lastName}`;
      } else if (
        updatedDetails.parentFirstName &&
        updatedDetails.parentLastName
      ) {
        updatedName = `${updatedDetails.parentFirstName} ${updatedDetails.parentLastName}`;
      }

      // Utiliser TS type assertion pour résoudre le problème de typage
      const updatedRequest = {
        ...request,
        details: updatedDetails,
        name: updatedName,
        email: updatedDetails.email || updatedDetails.parentEmail || "",
      } as Request & { email: string };

      // Déclencher la mise à jour dans le parent
      onSaved(updatedRequest);

      toast({
        title: t("toast.updated"),
        description: t("toast.updatedDesc"),
      });

      onClose();
    } catch (err: any) {
      console.error("Erreur lors de la sauvegarde:", err);
      toast({
        title: t("toast.error"),
        description: err.message || t("toast.saveFailed"),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("dialog.editRequest.title")} {request.id}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          {Object.entries(details)
            .filter(([key]) => !excludedKeys.includes(key))
            .map(([key, value]) => {
              const isReadOnly = [
                "createdAt",
                "codeDossier",
                "documentLabel",
                "approvalText",
              ].includes(key);
              const formatted =
                key.toLowerCase().includes("date") && value
                  ? format(
                      new Date(value as string | number | Date),
                      "dd MMMM yyyy",
                      { locale: fr }
                    )
                  : value ?? "";

              return (
                <div key={key} className="space-y-1">
                  <Label htmlFor={key}>{LABELS[key] ?? key}</Label>
                  <Input
                    id={key}
                    value={String(formatted)} // Convertir explicitement en string
                    placeholder={PLACEHOLDERS[key] ?? ""}
                    onChange={(e) => handleChange(key, e.target.value)}
                    disabled={isReadOnly}
                    className={
                      (isReadOnly
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "") + (value == null ? " border-red-500" : "")
                    }
                  />
                </div>
              );
            })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSave}>{t("save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditRequestModal;
