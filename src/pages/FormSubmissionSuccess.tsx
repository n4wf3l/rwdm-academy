import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Home, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "@/hooks/useTranslation";

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
  const [show, setShow] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 mt-20">
        <div
          className={`
            w-full max-w-md sm:max-w-lg md:max-w-xl 
            transform transition-all duration-700
            ${show ? "opacity-100 scale-100" : "opacity-0 scale-95"}
          `}
        >
          <div className="relative">
            {/* décor */}
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-red-900/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-red-900/20 rounded-full blur-2xl" />

            <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-xl border-t-4 border-red-700">
              <div className="flex flex-col items-center mb-6 animate-fade-in-up">
                <div className="flex items-center justify-center w-16 h-16 bg-red-700 rounded-full mb-4 animate-pulse">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center">
                  {t("form_submission_success").replace(
                    "{{formType}}",
                    t(`formType_${formType}`)
                  )}
                </h1>
              </div>

              <div className="space-y-4 sm:space-y-6 text-center animate-fade-in">
                <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
                  {t("form_submission_desc1")}
                </p>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                  {t("form_submission_desc2")}
                </p>

                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-red-700 text-left animate-fade-in delay-200">
                  <div className="flex items-center gap-2">
                    <span className="block w-2 h-2 bg-red-700 rounded-full animate-pulse" />
                    <strong>{t("form_submission_warning_title")}</strong>
                  </div>
                  <p className="mt-1 text-gray-800 dark:text-gray-200 text-sm">
                    {t("form_submission_warning_text")}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-center animate-fade-in delay-400">
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center px-6 py-3 bg-black hover:bg-gray-900 text-white text-base font-medium rounded-lg shadow-md transition"
                >
                  <Home className="w-5 h-5 mr-2" />
                  <span>{t("return_home")}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
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
