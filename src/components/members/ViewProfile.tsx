// components/ViewProfile.tsx
import React, { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { translations } from "@/lib/i18n";

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
  const { t, lang } = useTranslation();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const currentUserId = localStorage.getItem("adminId");
  const isSelf = String(user.id) === currentUserId;

  // Récupérer le rôle de l'utilisateur connecté
  useEffect(() => {
    const fetchCurrentUserRole = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("http://localhost:5000/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Erreur de récupération");

        const data = await response.json();
        setCurrentUserRole(data.role);
      } catch (error) {
        console.error("Erreur lors de la récupération du rôle:", error);
      }
    };

    fetchCurrentUserRole();
  }, []);

  // Vérifier si l'utilisateur courant peut changer le mot de passe de l'utilisateur affiché
  const canChangePassword = () => {
    // Owner peut changer tous les mots de passe
    if (currentUserRole === "owner") return true;

    // Superadmin peut changer les mots de passe des admins, mais pas ceux des superadmins ou owners
    if (currentUserRole === "superadmin") {
      return user.role === "admin" || isSelf;
    }

    // Admin ne peut changer que son propre mot de passe
    if (currentUserRole === "admin") {
      return isSelf;
    }

    return false;
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: t("error"),
        description: t("passwords_do_not_match"),
        variant: "destructive",
      });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const endpoint = isSelf
        ? "http://localhost:5000/api/change-password"
        : `http://localhost:5000/api/users/${user.id}/reset-password`;

      const response = await fetch(endpoint, {
        method: isSelf ? "PATCH" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await response.json();

      if (response.ok) {
        toast({
          title: t("success"),
          description: t("password_update_success"),
        });
        setNewPassword("");
        setConfirmPassword("");
        setIsChangingPassword(false);
      } else {
        toast({
          title: t("error"),
          description: data.message || t("password_update_error"),
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: t("error"),
        description: t("server_error_password_update"),
        variant: "destructive",
      });
    }
  };
  const roleKey =
    `role_${user.role.toLowerCase()}` as keyof typeof translations.fr;
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
            {t("account")}
          </DialogTitle>
          <DialogDescription>
            <motion.div
              className="flex items-center gap-4"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <img
                src={user.profilePicture || "/avatar.jpg"}
                alt="Avatar"
                className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (target.src !== window.location.origin + "/avatar.jpg") {
                    target.src = "/avatar.jpg";
                  }
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold">
                    {user.firstName} {user.lastName}
                  </span>
                  <Badge variant={badgeVariant} className="text-xs rounded">
                    <span>{t(roleKey)}</span>
                  </Badge>
                </div>
                <div className="text-gray-600">{user.email}</div>
                {user.function && (
                  <div className="text-gray-500 text-sm">
                    {t("function_label")}: {user.function}
                  </div>
                )}
              </div>
            </motion.div>
          </DialogDescription>
        </DialogHeader>

        {/* Changer mot de passe - affiché uniquement si autorisé */}
        {canChangePassword() && (
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
                  {isSelf ? t("change_password") : t("reset_user_password")}
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
                  {isSelf
                    ? t("enter_new_password")
                    : t("enter_new_password_for_user")}
                </p>
                <Input
                  type="password"
                  placeholder={t("new_password")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mb-3"
                />
                <Input
                  type="password"
                  placeholder={t("confirm_password")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mb-3"
                />
                <div className="flex gap-3">
                  <Button onClick={handlePasswordUpdate} className="flex-1">
                    {t("update")}
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
                    {t("cancel")}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Assignations */}
        <motion.div
          className="my-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col items-center">
            <div className="bg-blue-900 text-white text-4xl font-bold rounded-full h-24 w-24 flex items-center justify-center shadow-xl">
              {user.assignmentsCount ?? 0}
            </div>
            <p className="mt-2 text-gray-700 font-medium">{t("assignments")}</p>
          </div>
          {user.createdAt && (
            <div className="mt-4 space-y-1 text-center text-gray-500 text-sm">
              <div>
                <span className="font-semibold text-gray-600">
                  {t("created_on")}:
                </span>{" "}
                {new Intl.DateTimeFormat(lang, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(user.createdAt))}
              </div>
            </div>
          )}
        </motion.div>

        <DialogFooter className="mt-6">
          <Button onClick={onClose} className="w-full">
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewProfile;
