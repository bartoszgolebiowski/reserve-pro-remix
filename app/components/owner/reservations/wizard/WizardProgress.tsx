import { CheckCircle } from "lucide-react";
import type { ReservationWizardStep } from "~/lib/types";

interface WizardProgressProps {
  currentStep: ReservationWizardStep;
}

export function WizardProgress({ currentStep }: WizardProgressProps) {
  const steps = [
    { key: "location", label: "Lokalizacja", icon: "1" },
    { key: "room", label: "Sala", icon: "2" },
    { key: "employee", label: "Pracownik", icon: "3" },
    { key: "details", label: "Szczegóły", icon: "4" },
    { key: "summary", label: "Podsumowanie", icon: "5" },
  ] as const;

  const getStepIndex = (step: ReservationWizardStep): number => {
    const stepKeys = ["location", "room", "employee", "details", "summary"];
    return stepKeys.indexOf(step);
  };

  const currentStepIndex = getStepIndex(currentStep);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStepIndex > index;
          const isCurrent = currentStep === step.key;

          return (
            <div key={step.key} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted
                    ? "bg-green-600 border-green-600 text-white"
                    : isCurrent
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span className="text-sm font-medium">{step.icon}</span>
                )}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    isCompleted ? "bg-green-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
