
import React, { useState } from 'react';
import { FormType } from './FormSelector';
import AnimatedTransition from './AnimatedTransition';
import RegistrationForm from './RegistrationForm';

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
        return (
          <div className="flex items-center justify-center h-64 text-center p-8 animate-slide-up">
            <p className="text-gray-500">Le formulaire d'inscription aux tests de sélection sera disponible prochainement.</p>
          </div>
        );
      case 'accident-report':
        return (
          <div className="flex items-center justify-center h-64 text-center p-8 animate-slide-up">
            <p className="text-gray-500">Le formulaire de déclaration d'accident sera disponible prochainement.</p>
          </div>
        );
      case 'responsibility-waiver':
        return (
          <div className="flex items-center justify-center h-64 text-center p-8 animate-slide-up">
            <p className="text-gray-500">Le formulaire de décharge de responsabilité sera disponible prochainement.</p>
          </div>
        );
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
