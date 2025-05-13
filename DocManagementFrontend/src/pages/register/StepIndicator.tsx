import React from "react";

interface StepIndicatorProps {
  currentStep: number;
  stepCount?: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  stepCount = 6,
}) => {
  return (
    <div className="flex justify-center mb-6">
      {Array.from({ length: stepCount }, (_, i) => i).map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              step === currentStep
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : step < currentStep
                ? "bg-blue-900/30 text-blue-400 border border-blue-500"
                : "bg-gray-800 text-gray-500 border border-gray-700"
            }`}
          >
            {step < currentStep ? "✓" : step === 0 ? "?" : step}
          </div>
          {step < stepCount - 1 && (
            <div
              className={`h-1.5 w-16 rounded-full transition-all ${
                step < currentStep ? "bg-blue-600" : "bg-gray-700"
              }`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
