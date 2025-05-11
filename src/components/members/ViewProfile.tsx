import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { AnimatePresence, motion } from "framer-motion";

interface ViewProfileProps {
  open: boolean;
  onClose: () => void;
  user: {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role: string;
    function?: string;
    profilePicture: string;
    createdAt?: string;
    reset_token?: string;
    reset_expires?: string;
    deleted?: boolean;
    deletedAt?: string;
    assignmentsCount?: number;
  };
}

const ViewProfile: React.FC<ViewProfileProps> = ({ open, onClose, user }) => {
  const { toast } = useToast();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/change-password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newPassword }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Mot de passe mis à jour avec succès.",
        });
        setNewPassword("");
        setConfirmPassword("");
        setIsChangingPassword(false);
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors de la mise à jour.",
        });
      }
    } catch (error) {
      console.error("Erreur serveur:", error);
      toast({
        title: "Erreur",
        description: "Erreur serveur lors de la mise à jour du mot de passe.",
      });
    }
  };

  const badgeVariant =
    user.role.toLowerCase() === "owner"
      ? "default"
      : user.role.toLowerCase() === "superadmin"
      ? "secondary"
      : "outline";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-2">
            Mon compte
          </DialogTitle>
          <DialogDescription>
            <motion.div
              className="flex items-center gap-4"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <img
                src={
                  user.profilePicture
                    ? user.profilePicture
                    : "https://via.placeholder.com/150"
                }
                alt="Avatar"
                className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold">
                    {user.firstName} {user.lastName}
                  </span>
                  <Badge variant={badgeVariant} className="text-xs rounded">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
                <div className="text-gray-600">{user.email}</div>
                {user.function && (
                  <div className="text-gray-500 text-sm">
                    Fonction : {user.function}
                  </div>
                )}
              </div>
            </motion.div>
          </DialogDescription>
        </DialogHeader>

        {/* Zone changer mot de passe avec animation */}
        <AnimatePresence mode="wait">
          {!isChangingPassword ? (
            <motion.div
              key="show-button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mt-6 p-4 bg-gray-50 rounded-lg shadow"
            >
              <Button
                variant="outline"
                onClick={() => setIsChangingPassword(true)}
                className="w-full"
              >
                Changer le mot de passe
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="change-password"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 p-4 bg-gray-50 rounded-lg shadow"
            >
              <p className="mb-3 text-sm text-gray-600">
                Entrez votre nouveau mot de passe et confirmez-le
              </p>
              <Input
                type="password"
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mb-3"
              />
              <Input
                type="password"
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mb-3"
              />
              <div className="flex gap-3">
                <Button onClick={handlePasswordUpdate} className="flex-1">
                  Mettre à jour
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zone assignations avec animation */}
        <motion.div
          className="my-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col items-center">
            <div className="bg-blue-900 text-white text-4xl font-bold rounded-full h-24 w-24 flex items-center justify-center shadow-xl">
              {user.assignmentsCount != null ? user.assignmentsCount : 0}
            </div>
            <p className="mt-2 text-gray-700 font-medium">Assignations</p>
          </div>
          <div className="mt-4 space-y-1 text-center text-gray-500 text-sm">
            {user.createdAt && (
              <div>
                <span className="font-semibold text-gray-600">Créé le :</span>{" "}
                {new Intl.DateTimeFormat("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(user.createdAt))}
              </div>
            )}
          </div>
        </motion.div>

        <DialogFooter className="mt-6">
          <Button onClick={onClose} className="w-full">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewProfile;
