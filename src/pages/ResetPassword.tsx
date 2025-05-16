import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar"; // Navbar ajoutée ici
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const [errorHighlight, setErrorHighlight] = useState(false);
  const { t } = useTranslation();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erreur lors du changement de mot de passe."
        );
      }

      toast({
        title: t("passwordReset.toastTitle"),
        description: t("passwordReset.toastDescription"),
      });

      navigate("/auth");
    } catch (error: any) {
      console.error("Erreur de réinitialisation :", error);

      setErrorShake(true);
      setErrorHighlight(true);
      setTimeout(() => {
        setErrorShake(false);
        setErrorHighlight(false);
      }, 3000); // Effet actif pendant 3 secondes

      toast({
        title: t("toast.errorTitle"),
        description: error.message || t("toast.errorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rwdm-lightblue/30">
      <Navbar /> {/* Assurez-vous que cette ligne est bien là */}
      <main className="container mx-auto px-4 pt-28 pb-20 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="glass-panel shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold text-rwdm-blue dark:text-white">
                {t("passwordReset.headerTitle")}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {t("passwordReset.headerDescription")}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-4"
                animate={errorShake ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-2 relative">
                  <Label htmlFor="newPassword">
                    {t("passwordReset.newPasswordLabel")}
                  </Label>

                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className={`transition-all pr-10 ${
                      errorHighlight ? "border-red-500 ring-2 ring-red-500" : ""
                    }`}
                  />

                  <div
                    className="absolute top-[38px] right-3 cursor-pointer text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-rwdm-blue hover:bg-rwdm-blue/90 dark:bg-blue-500 dark:hover:bg-blue-400"
                  disabled={isLoading}
                >
                  {isLoading
                    ? t("passwordReset.changing")
                    : t("passwordReset.changePassword")}
                </Button>
              </motion.form>

              <div className="mt-4 text-center text-sm">
                <p className="text-gray-500 dark:text-gray-400">
                  {t("passwordReset.postChangeInfo")}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default ResetPassword;
