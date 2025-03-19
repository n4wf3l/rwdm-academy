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
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const [errorHighlight, setErrorHighlight] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Envoyer une requête POST à votre backend pour l'authentification
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Veuillez réessayer");
      }

      // Stocker le token dans le localStorage
      localStorage.setItem("token", data.token);

      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur le panneau d'administration",
      });

      // Rediriger vers le dashboard
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Erreur de connexion:", error);

      // Déclencher les effets de vibration et de surlignage rouge
      setErrorShake(true);
      setErrorHighlight(true);
      setTimeout(() => {
        setErrorShake(false);
        setErrorHighlight(false);
      }, 3000); // Effet actif pendant 3 secondes

      toast({
        title: "Erreur de connexion",
        description: error.message || "Veuillez vérifier vos identifiants.",
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
                Authentification
              </CardTitle>
              <CardDescription className="text-center">
                Accès réservé au personnel autorisé
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
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre.email@rwdm.be"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`transition-all ${
                      errorHighlight ? "border-red-500 ring-2 ring-red-500" : ""
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Link
                      to="/forget-password"
                      className="text-xs text-rwdm-blue hover:text-rwdm-red dark:text-blue-400 dark:hover:text-red-400 transition-colors"
                    >
                      Mot de passe oublié?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  {isLoading ? "Connexion en cours..." : "Se connecter"}
                </Button>
              </motion.form>

              <div className="mt-4 text-center text-sm">
                <p className="text-gray-500 dark:text-gray-400">
                  Cette page est réservée aux administrateurs de l'Académie
                  RWDM.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Auth;
