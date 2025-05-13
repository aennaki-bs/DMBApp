import React from "react";
import { useMultiStepForm } from "@/context/form";

interface StepTitleProps {
  currentStep: number;
  stepCount?: number;
}

const StepTitle: React.FC<StepTitleProps> = ({
  currentStep,
  stepCount = 6,
}) => {
  const { formData } = useMultiStepForm();
  const isPersonal = formData.userType === "personal";

  const getTitleForStep = (step: number) => {
    // Step 0 is the user type selection for both flows
    if (step === 0) return "Choose Account Type";

    if (isPersonal) {
      // Personal flow
      switch (step) {
        case 1:
          return "Account Details";
        case 2:
          return "Personal Address";
        case 3:
          return "Credentials";
        case 4:
          return "Admin Access (Optional)";
        case 5:
          return "Review Information";
        default:
          return "Account Details";
      }
    } else {
      // Company flow
      switch (step) {
        case 1:
          return "Company Details";
        case 2:
          return "Company Address (Optional)";
        case 3:
          return "Credentials";
        case 4:
          return "Admin Access (Optional)";
        case 5:
          return "Review Information";
        default:
          return "Company Details";
      }
    }
  };

  return (
    <h3 className="text-xl font-semibold text-white">
      {getTitleForStep(currentStep)}
    </h3>
  );
};

export default StepTitle;
