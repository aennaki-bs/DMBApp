import React, { useState, useEffect } from "react";
import { useMultiStepForm } from "@/context/form";
import { toast } from "sonner";
import { validateUsernameEmailStep } from "./utils/validation";
import UsernameField from "./fields/UsernameField";
import EmailField from "./fields/EmailField";
import StepContainer from "./utils/StepContainer";

const StepTwoUsernameEmail = () => {
  const {
    formData,
    setFormData,
    prevStep,
    nextStep,
    validateEmail,
    validateUsername,
    stepValidation,
  } = useMultiStepForm();
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState({
    username: false,
    email: false,
  });

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
    const errors = validateUsernameEmailStep(formData);
    setLocalErrors(errors);
  }, [formData]);

  const validateStep = (showToast = true) => {
    const errors = validateUsernameEmailStep(formData);

    // Set all fields as touched when user tries to proceed
    setTouchedFields({
      username: true,
      email: true,
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

  const handleNext = async () => {
    // Mark all fields as touched when user tries to proceed
    setTouchedFields({
      username: true,
      email: true,
    });

    if (!validateStep()) {
      return;
    }

    try {
      const isUsernameValid = await validateUsername();
      if (!isUsernameValid) {
        return;
      }

      const isEmailValid = await validateEmail();
      if (!isEmailValid) {
        return;
      }

      nextStep();
    } catch (error) {
      toast.error("An error occurred during validation.");
      console.error("Validation error:", error);
    }
  };

  return (
    <StepContainer
      onNext={handleNext}
      onBack={prevStep}
      isNextLoading={stepValidation.isLoading}
      isNextDisabled={stepValidation.isLoading}
      nextLabel={stepValidation.isLoading ? "Validating..." : "Next"}
    >
      <UsernameField
        value={formData.username}
        onChange={handleChange}
        localErrors={visibleErrors}
        validationErrors={stepValidation.errors}
      />

      <EmailField
        value={formData.email}
        onChange={handleChange}
        localErrors={visibleErrors}
        validationErrors={stepValidation.errors}
      />
    </StepContainer>
  );
};

export default StepTwoUsernameEmail;
