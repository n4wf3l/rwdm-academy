import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Loader, Globe, Key, Clipboard, Check } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

/* ------------------------- CONFIG API (LOCAL/DEV) ------------------------- */
// Vite: lire VITE_API_URL depuis ton .env; sinon fallback http://localhost:5000
const API_BASE =
  (typeof import.meta !== "undefined" && (import.meta as any)?.env?.VITE_API_URL) ||
  `${window.location.protocol}//${window.location.hostname}:5000`;

interface ApiSettingsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [baseUrl, setBaseUrl] = useState("");
  const [clubKey, setClubKey] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // État pour suivre les boutons de copie cliqués
  const [pasteStatus, setPasteStatus] = useState({
    baseUrl: false,
    clubKey: false,
    apiKey: false,
    apiSecret: false,
  });

  useEffect(() => {
    if (open) {
      loadApiSettings();
    }
  }, [open]);

  // Fonction pour gérer le collage du contenu du presse-papiers
  const handlePaste = async (
    field: "baseUrl" | "clubKey" | "apiKey" | "apiSecret"
  ) => {
    try {
      const text = await navigator.clipboard.readText();

      // Mettre à jour le champ correspondant
      switch (field) {
        case "baseUrl":
          setBaseUrl(text);
          break;
        case "clubKey":
          setClubKey(text);
          break;
        case "apiKey":
          setApiKey(text);
          break;
        case "apiSecret":
          setApiSecret(text);
          break;
      }

      // Afficher une animation de confirmation
      setPasteStatus((prev) => ({ ...prev, [field]: true }));

      // Réinitialiser le statut après 1,5 seconde
      setTimeout(() => {
        setPasteStatus((prev) => ({ ...prev, [field]: false }));
      }, 1500);
    } catch (err) {
      console.error("Erreur lors de la lecture du presse-papiers:", err);
      toast({
        title: "Erreur de collage",
        description: "Impossible d'accéder au presse-papiers",
        variant: "destructive",
      });
    }
  };

  const loadApiSettings = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${API_BASE}/api/api-settings`,
        { withCredentials: true }
      );
      setBaseUrl(data.base_url || "https://clubapi.prosoccerdata.com");
      setClubKey(data.club_key || "");
      setApiKey(data.api_key || "");
      setApiSecret(""); // Par sécurité, le secret n'est pas retourné par l'API
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des paramètres API:",
        error
      );

      // Initialiser avec des valeurs par défaut silencieusement sans toast
      setBaseUrl("https://clubapi.prosoccerdata.com");
      setClubKey("");
      setApiKey("");
      setApiSecret("");

      // Supprimez ou commentez le toast ci-dessous
      // toast({
      //   title: t("api.settings.loadError"),
      //   description: "Erreur serveur 500. Vous pouvez continuer en saisissant vos clés API manuellement.",
      //   variant: "destructive",
      // });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Ajouter cette ligne
    cleanApiValues();

    if (!baseUrl || !clubKey || !apiKey) {
      toast({
        title: t("api.settings.validationError"),
        description: t("api.settings.requiredFields"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Modifiez le port de 5000 à 5001
      const { data } = await axios.put(
        `${API_BASE}/api/api-settings`,
        {
          base_url: baseUrl,
          club_key: clubKey,
          api_key: apiKey,
          api_secret: apiSecret || undefined,
        },
        { withCredentials: true }
      );

      toast({
        title: t("api.settings.saveSuccess"),
        description: data.message,
      });

      if (data.connectionTested) {
        setTestResult({
          success: data.connectionTested,
          message: data.connectionMessage,
        });
      }

      onSave();
      // Ne pas fermer pour montrer le résultat du test
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement des paramètres API:",
        error
      );
      toast({
        title: t("api.settings.saveError"),
        description: t("api.settings.saveErrorDetails"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    // Ajouter cette ligne
    cleanApiValues();

    if (!baseUrl || !clubKey || !apiKey) {
      toast({
        title: t("api.settings.validationError"),
        description: t("api.settings.requiredFields"),
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    setTestResult(null);
    try {
      // Modifiez le port de 5000 à 5001
      const { data } = await axios.put(
        `${API_BASE}/api/api-settings/test`,
        {
          base_url: baseUrl,
          club_key: clubKey,
          api_key: apiKey,
          api_secret: apiSecret || undefined,
        },
        { withCredentials: true }
      );

      setTestResult({
        success: data.success,
        message: data.message,
      });

      if (data.success) {
        toast({
          title: t("api.settings.testSuccess"),
          description: data.message,
        });
      } else {
        toast({
          title: t("api.settings.testFailed"),
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors du test de connexion API:", error);
      setTestResult({
        success: false,
        message: error.response?.data?.message || t("api.settings.testError"),
      });
      toast({
        title: t("api.settings.testError"),
        description: t("api.settings.testErrorDetails"),
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  // Ajoutez cette fonction après les déclarations de state
  const cleanApiValues = () => {
    // Nettoyage de la clé du club (enlever les préfixes comme "eeew")
    if (clubKey.startsWith("eeee")) {
      setClubKey(clubKey.replace(/^e+w+/, ""));
    }

    // S'assurer que l'API secret ne contient pas le préfixe "bearer"
    if (apiSecret.toLowerCase().startsWith("bearer")) {
      setApiSecret(apiSecret.replace(/^bearer\s+/i, ""));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("api.settings.title")}</DialogTitle>
          <DialogDescription>{t("api.settings.description")}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader className="animate-spin h-8 w-8 text-gray-500" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="base_url" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {t("api.settings.baseUrl")}
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="base_url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://clubapi.prosoccerdata.com"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handlePaste("baseUrl")}
                  className="h-10 w-10 shrink-0"
                  title="Coller depuis le presse-papiers"
                >
                  {pasteStatus.baseUrl ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="club_key" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                {t("api.settings.clubKey")}
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="club_key"
                  value={clubKey}
                  onChange={(e) => setClubKey(e.target.value)}
                  placeholder="ewlcdd1fdhooj8pm8qyzj98kvrrxh6hn"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handlePaste("clubKey")}
                  className="h-10 w-10 shrink-0"
                  title="Coller depuis le presse-papiers"
                >
                  {pasteStatus.clubKey ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api_key" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                {t("api.settings.apiKey")}
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="api_key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="3UMU0HpTYjafC8lITNAt1812UJdx67Nq30pjbCtQ"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handlePaste("apiKey")}
                  className="h-10 w-10 shrink-0"
                  title="Coller depuis le presse-papiers"
                >
                  {pasteStatus.apiKey ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api_secret" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                {t("api.settings.apiSecret")}
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="api_secret"
                  type="password"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  placeholder="••••••••••••••••••••••••••••••"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handlePaste("apiSecret")}
                  className="h-10 w-10 shrink-0"
                  title="Coller depuis le presse-papiers"
                >
                  {pasteStatus.apiSecret ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                {t("api.settings.secretNote")}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="mr-2"
            disabled={loading}
          >
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader className="animate-spin h-4 w-4 mr-2" />
                {t("saving")}
              </>
            ) : (
              t("save")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiSettingsModal;