import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Home, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <main className="flex-grow flex items-center justify-center p-4 mt-40">
        <div
          className={`max-w-2xl w-full transform ${
            show ? "opacity-100 scale-100" : "opacity-0 scale-95"
          } transition-all duration-1000`}
        >
          <div className="relative">
            {/* Background decorative elements */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-900/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-red-900/20 rounded-full blur-3xl" />

            {/* Main content */}
            <div className="relative bg-white dark:bg-gray-900 rounded-xl p-8 shadow-2xl border-t-4 border-red-700">
              <div
                className="text-center mb-8"
                style={{ animation: "slideUp 0.8s ease-out" }}
              >
                <div
                  className="inline-flex items-center justify-center w-20 h-20 bg-red-700 rounded-full mb-6 shadow-lg"
                  style={{ animation: "pulse 2s infinite" }}
                >
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Formulaire {formName} envoyé avec succès !
                </h1>

                <div className="space-y-6">
                  <p
                    className="text-lg text-gray-700 dark:text-gray-300"
                    style={{ animation: "fadeIn 1s ease-out 0.3s both" }}
                  >
                    Votre demande a été enregistrée et est en cours de
                    traitement par notre équipe.
                  </p>
                  <p
                    className="text-lg text-gray-600 dark:text-gray-400"
                    style={{ animation: "fadeIn 1s ease-out 0.6s both" }}
                  >
                    Vous recevrez un email de confirmation et serez tenu informé
                    des mises à jour concernant votre demande.
                  </p>

                  <div
                    className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-l-4 border-l-red-700"
                    style={{ animation: "fadeIn 1s ease-out 0.9s both" }}
                  >
                    <p className="text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <span className="block w-2 h-2 bg-red-700 rounded-full animate-pulse" />
                      <strong>Attention</strong> Pour des raisons de sécurité,
                      veuillez attendre au moins 10 minutes avant de soumettre
                      un nouveau formulaire.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="text-center"
                style={{ animation: "slideUp 0.8s ease-out 1.2s both" }}
              >
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-black hover:bg-gray-900 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Home className="w-6 h-6 mr-2" />
                  Retour à l'accueil
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FormSubmissionSuccess;
