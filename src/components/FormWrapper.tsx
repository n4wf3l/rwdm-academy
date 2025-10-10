import React, { useState, useEffect } from "react";
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
  const getFormComponent = (formType: FormType) => {
    switch (formType) {
      case "registration":
        return <RegistrationForm formData={formData} onFormDataChange={onFormDataChange} />;
      case "befa-registration":
        return <RegistrationForm formData={formData} onFormDataChange={onFormDataChange} preselectedAcademy="Brussels Eagles Football Academy" disableAcademy={true} />;
      case "selectionTests":
        return <SelectionTestsForm formData={formData} onFormDataChange={onFormDataChange} />;
      case "accidentReport":
        return <AccidentReportForm formData={formData} onFormDataChange={onFormDataChange} />;
      case "waiver":
        return <ResponsibilityWaiverForm formData={formData} onFormDataChange={onFormDataChange} />;
      default:
        return <RegistrationForm formData={formData} onFormDataChange={onFormDataChange} />;
    }
  };

  return (
    <AnimatedTransition
      show={formLoaded}
      animateIn="animate-fade-in"
      animateOut="animate-fade-out"
      className="w-full py-8"
    >
      {getFormComponent(formType)}
    </AnimatedTransition>
  );
};

export default FormWrapper;
