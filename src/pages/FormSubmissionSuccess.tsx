import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface FormSubmissionSuccessProps {
  formType?:
    | "registration"
    | "selectionTests"
    | "accidentReport"
    | "responsibilityWaiver";
}

const formTypeNames = {
  registration: "d'inscription",
  selectionTests: "de tests de sélection",
  accidentReport: "de déclaration d'accident",
  responsibilityWaiver: "de décharge de responsabilité",
};

const FormSubmissionSuccess: React.FC<FormSubmissionSuccessProps> = ({
  formType = "registration",
}) => {
  const navigate = useNavigate();

  const formName = formTypeNames[formType] || "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-rwdm-lightblue/30 dark:from-rwdm-darkblue dark:to-rwdm-blue/40 p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel max-w-3xl w-full p-8 rounded-xl"
      >
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-rwdm-blue dark:text-white mb-4">
            Formulaire {formName} envoyé avec succès !
          </h1>

          <div className="space-y-4 mb-8">
            <p className="text-gray-600 dark:text-gray-300">
              Votre demande a été enregistrée et est en cours de traitement par
              notre équipe.
            </p>

            <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-300">
              <Mail className="h-5 w-5" />
              <p>
                Vous recevrez un email de confirmation et serez tenu informé des
                mises à jour concernant votre demande.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg mt-6">
              <Clock className="h-5 w-5" />
              <p>
                <strong>Attention :</strong> Pour des raisons de sécurité,
                veuillez attendre au moins 10 minutes avant de soumettre un
                nouveau formulaire.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              onClick={() => navigate("/")}
              className="bg-rwdm-blue hover:bg-rwdm-blue/90"
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FormSubmissionSuccess;
