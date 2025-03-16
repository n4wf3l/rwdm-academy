import React, { useState, useEffect, ReactElement } from "react";
import { FormType } from "./FormSelector";
import AnimatedTransition from "./AnimatedTransition";
import RegistrationForm from "./RegistrationForm";
import SelectionTestsForm from "./SelectionTestsForm";
import AccidentReportForm from "./AccidentReportForm";
import ResponsibilityWaiverForm from "./ResponsibilityWaiverForm";

interface FormWrapperProps {
  formType: FormType;
  formData: { [key: string]: any };
  onFormDataChange: (key: string, value: any) => void;
}

const FormWrapper: React.FC<FormWrapperProps> = ({
  formType,
  formData,
  onFormDataChange,
}) => {
  const [formLoaded, setFormLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFormLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [formType]);

  // Associer chaque type de formulaire à son composant
  const formComponents: { [key in FormType]: ReactElement } = {
    registration: <RegistrationForm />,
    "selection-tests": <SelectionTestsForm />,
    "accident-report": <AccidentReportForm />,
    "responsibility-waiver": <ResponsibilityWaiverForm />,
  };

  return (
    <AnimatedTransition
      show={formLoaded}
      animateIn="animate-fade-in"
      animateOut="animate-fade-out"
      className="w-full py-8"
    >
      {React.cloneElement(formComponents[formType], {
        formData,
        onFormDataChange,
      })}
    </AnimatedTransition>
  );
};

export default FormWrapper;
