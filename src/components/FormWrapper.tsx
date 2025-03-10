
import React, { useState } from 'react';
import { FormType } from './FormSelector';
import AnimatedTransition from './AnimatedTransition';
import RegistrationForm from './RegistrationForm';
import SelectionTestsForm from './SelectionTestsForm';
import AccidentReportForm from './AccidentReportForm';
import ResponsibilityWaiverForm from './ResponsibilityWaiverForm';

interface FormWrapperProps {
  formType: FormType;
}

const FormWrapper: React.FC<FormWrapperProps> = ({ formType }) => {
  // State to determine if the form has loaded
  const [formLoaded, setFormLoaded] = useState(false);
  
  // Set the form as loaded after a short delay to trigger animations
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFormLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [formType]);
  
  const renderForm = () => {
    switch (formType) {
      case 'registration':
        return <RegistrationForm />;
      case 'selection-tests':
        return <SelectionTestsForm />;
      case 'accident-report':
        return <AccidentReportForm />;
      case 'responsibility-waiver':
        return <ResponsibilityWaiverForm />;
      default:
        return null;
    }
  };
  
  return (
    <AnimatedTransition
      show={formLoaded}
      animateIn="animate-fade-in"
      animateOut="animate-fade-out"
      className="w-full py-8"
    >
      {renderForm()}
    </AnimatedTransition>
  );
};

export default FormWrapper;
