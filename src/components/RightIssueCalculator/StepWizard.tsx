import React from 'react';
import { Check } from 'lucide-react';

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
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="card-calculator !p-4 mb-1">
      {/* Progress bar background */}
      <div className="relative">
        <div className="absolute top-4 left-4 right-4 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step nodes */}
        <div className="relative flex items-start justify-between">
          {Array.from({ length: totalSteps }, (_, i) => {
            const step = i + 1;
            const isActive = step === currentStep;
            const isCompleted = step < currentStep;
            const isReachable = step <= currentStep + 1;

            return (
              <button
                key={step}
                onClick={() => isReachable && onStepClick(step)}
                disabled={!isReachable}
                className="flex flex-col items-center gap-1.5 group transition-all duration-300 disabled:cursor-not-allowed"
                style={{ width: `${100 / totalSteps}%` }}
              >
                <div
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/40 scale-110'
                      : isCompleted
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> : step}
                  {isActive && (
                    <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                  )}
                </div>
                <span
                  className={`text-[10px] leading-tight text-center transition-colors duration-300 ${
                    isActive
                      ? 'text-primary font-bold'
                      : isCompleted
                      ? 'text-foreground/70 font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {stepLabels[i]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepWizard;
