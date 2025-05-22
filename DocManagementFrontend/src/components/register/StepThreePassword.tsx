import React, { useState, useEffect } from "react";
import { useMultiStepForm } from "@/context/form";
import { toast } from "sonner";
import { validatePasswordStep } from "./utils/validation";
import { usePasswordStrength } from "./hooks/usePasswordStrength";
import PasswordFields from "./fields/PasswordFields";
import StepContainer from "./utils/StepContainer";

const StepThreePassword = () => {
  const { formData, setFormData, prevStep, nextStep } = useMultiStepForm();
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState({
    password: false,
    confirmPassword: false,
  });

  const { calculatePasswordStrength } = usePasswordStrength();
  const passwordStrength = calculatePasswordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });

    // Mark field as touched when the user interacts with it
    if (!touchedFields[name as keyof typeof touchedFields]) {
      setTouchedFields((prev) => ({
        ...prev,
        [name]: true,
      }));
    }
  };

  // Validate on data change
  useEffect(() => {
    const errors = validatePasswordStep(formData);
    setLocalErrors(errors);
  }, [formData]);

  const validateStep = (showToast = true) => {
    const errors = validatePasswordStep(formData);

    // Set all fields as touched when user tries to proceed
    setTouchedFields({
      password: true,
      confirmPassword: true,
    });

    setLocalErrors(errors);

    if (showToast && Object.keys(errors).length > 0) {
      toast.error("Please correct all errors before proceeding");
    }

    return Object.keys(errors).length === 0;
  };

  // Filter errors to only show for touched fields
  const visibleErrors: Record<string, string> = {};
  Object.keys(localErrors).forEach((key) => {
    if (touchedFields[key as keyof typeof touchedFields]) {
      visibleErrors[key] = localErrors[key];
    }
  });

  const handleNext = () => {
    // Mark all fields as touched when user tries to proceed
    setTouchedFields({
      password: true,
      confirmPassword: true,
    });

    if (!validateStep()) {
      return;
    }

    nextStep();
  };

  return (
    <StepContainer onNext={handleNext} onBack={prevStep}>
      <PasswordFields
        password={formData.password}
        confirmPassword={formData.confirmPassword}
        onChange={handleChange}
        localErrors={visibleErrors}
        passwordStrength={passwordStrength}
      />
    </StepContainer>
  );
};

export default StepThreePassword;
