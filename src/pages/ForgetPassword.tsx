import React, { useState } from "react";
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
import Navbar from "../components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const [errorHighlight, setErrorHighlight] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/forget-password", // ✅ Bonne URL
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Veuillez réessayer");
      }

      toast({
        title: t("auth.resetEmailSentTitle"),
        description: t("auth.resetEmailSentDescription"),
      });

      setEmail("");
    } catch (error: any) {
      console.error("Erreur de réinitialisation:", error);
      setErrorShake(true);
      setErrorHighlight(true);
      setTimeout(() => {
        setErrorShake(false);
        setErrorHighlight(false);
      }, 3000);

      toast({
        title: t("common.error"),
        description: error.message || t("auth.resetEmailError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rwdm-lightblue/30 dark:from-rwdm-darkblue dark:to-rwdm-blue/40">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="glass-panel">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center text-rwdm-blue dark:text-white">
                {t("auth.forgotPassword")}
              </CardTitle>
              <CardDescription className="text-center">
                {t("auth.resetPasswordDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-4"
                animate={errorShake ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="email">{t("passwordReset.emailLabel")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("passwordReset.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`transition-all ${
                      errorHighlight ? "border-red-500 ring-2 ring-red-500" : ""
                    }`}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-rwdm-blue hover:bg-rwdm-blue/90"
                  disabled={isLoading}
                >
                  {isLoading
                    ? t("passwordReset.sending")
                    : t("passwordReset.send")}
                </Button>
              </motion.form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default ForgetPassword;
