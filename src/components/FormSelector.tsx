
import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, ClipboardList, AlertTriangle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FormType = 'registration' | 'selection-tests' | 'accident-report' | 'responsibility-waiver';

interface FormOption {
  id: FormType;
  name: string;
  description: string;
  icon: React.ElementType;
}

interface FormSelectorProps {
  currentForm: FormType;
  onSelectForm: (form: FormType) => void;
  className?: string;
}

const formOptions: FormOption[] = [
  {
    id: 'registration',
    name: 'Inscription à l\'académie',
    description: 'Formulaire d\'inscription pour rejoindre l\'académie RWDM',
    icon: ClipboardCheck,
  },
  {
    id: 'selection-tests',
    name: 'Tests de sélection',
    description: 'Inscription aux tests de sélection pour l\'académie',
    icon: ClipboardList,
  },
  {
    id: 'accident-report',
    name: 'Déclaration d\'accident',
    description: 'Formulaire pour déclarer un accident survenu',
    icon: AlertTriangle,
  },
  {
    id: 'responsibility-waiver',
    name: 'Décharge de responsabilité',
    description: 'Formulaire de décharge de responsabilité',
    icon: FileText,
  },
];

const FormSelector: React.FC<FormSelectorProps> = ({ 
  currentForm, 
  onSelectForm,
  className
}) => {
  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {formOptions.map((option) => {
          const isActive = currentForm === option.id;
          const Icon = option.icon;
          
          return (
            <motion.div
              key={option.id}
              onClick={() => onSelectForm(option.id)}
              className={cn(
                "relative cursor-pointer rounded-xl p-4 glass-panel card-hover",
                isActive ? "ring-2 ring-rwdm-blue" : "hover:ring-1 hover:ring-rwdm-blue/30"
              )}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-full mb-2",
                  isActive 
                    ? "bg-rwdm-blue text-white" 
                    : "bg-rwdm-blue/10 text-rwdm-blue"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-rwdm-blue dark:text-white">
                  {option.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </p>
              </div>
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl ring-2 ring-rwdm-blue"
                  layoutId="activeFormOutline"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FormSelector;
