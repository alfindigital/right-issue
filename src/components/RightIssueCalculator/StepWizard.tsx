import React from 'react';
import { Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface StepWizardProps {
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
  stepLabels: string[];
}

const StepWizard: React.FC<StepWizardProps> = ({
  currentStep,
  totalSteps,
  onStepClick,
  stepLabels,
}) => {
  return (
    <div className="flex items-center justify-between mb-4 px-1">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <React.Fragment key={step}>
            <button
              onClick={() => onStepClick(step)}
              className={`relative flex flex-col items-center group transition-all duration-300`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110'
                    : isCompleted
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step}
              </div>
              <span
                className={`text-[9px] mt-1 transition-colors duration-300 max-w-[60px] text-center leading-tight ${
                  isActive ? 'text-primary font-bold' : 'text-muted-foreground'
                }`}
              >
                {stepLabels[i]}
              </span>
            </button>
            {i < totalSteps - 1 && (
              <div className="flex-1 mx-1 mt-[-12px]">
                <div
                  className={`h-0.5 rounded-full transition-all duration-500 ${
                    step < currentStep ? 'bg-primary/50' : 'bg-border'
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepWizard;
