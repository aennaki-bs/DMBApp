import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MultiStepFormContext from "./MultiStepFormContext";
import { FormData, StepValidation, initialFormData } from "./types";
import {
  validateUsername as validateUsernameUtil,
  validateEmail as validateEmailUtil,
  debounceUsernameValidation,
  debounceEmailValidation,
} from "./utils/validationUtils";
import {
  registerUser as registerUserUtil,
  verifyEmail as verifyEmailUtil,
} from "./utils/registerUtils";

export const MultiStepFormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormDataState] = useState<FormData>(initialFormData);
  const [stepValidation, setStepValidation] = useState<StepValidation>({
    isLoading: false,
    errors: {},
  });
  const navigate = useNavigate();

  // Use debounced validation for username and email as they change
  useEffect(() => {
    if (formData.username && formData.username.length >= 4) {
      debounceUsernameValidation(formData.username, setStepValidation);
    }
  }, [formData.username]);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && emailRegex.test(formData.email)) {
      debounceEmailValidation(formData.email, setStepValidation);
    }
  }, [formData.email]);

  const setFormData = (data: Partial<FormData>) => {
    setFormDataState((prev) => ({ ...prev, ...data }));

    // Clear registration error when user updates any field
    // This allows resubmission after fixing the error
    if (stepValidation.errors.registration) {
      setStepValidation((prev) => ({
        ...prev,
        errors: { ...prev.errors, registration: undefined },
      }));
    }

    // Clear validation error when user updates any field
    if (data.validationError === undefined && formData.validationError) {
      setFormDataState((prev) => ({ ...prev, validationError: undefined }));
    }

    // If admin secret key is changed, clear any related errors
    if ("adminSecretKey" in data) {
      setStepValidation((prev) => ({
        ...prev,
        errors: { ...prev.errors, registration: undefined },
      }));
    }

    // Clear specific field validation errors when the field changes
    const fieldKeys = Object.keys(data);
    if (fieldKeys.includes("username") && stepValidation.errors.username) {
      setStepValidation((prev) => ({
        ...prev,
        errors: { ...prev.errors, username: undefined },
      }));
    }

    if (fieldKeys.includes("email") && stepValidation.errors.email) {
      setStepValidation((prev) => ({
        ...prev,
        errors: { ...prev.errors, email: undefined },
      }));
    }
  };

  // Next step logic, handle extra steps.
  const nextStep = () => {
    // Clear all validation errors when moving to next step
    setStepValidation((prev) => ({
      ...prev,
      errors: {},
    }));
    setFormData({ validationError: undefined });

    // Both flows now have 6 steps (including type selection)
    // Personal flow: 0. Type Selection, 1. Info, 2. Address, 3. Credentials, 4. Admin Key, 5. Summary
    // Company flow: 0. Type Selection, 1. Info, 2. Address, 3. Credentials, 4. Admin Key, 5. Summary
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  // Previous step logic
  const prevStep = () => {
    // Clear all validation errors when moving back
    setStepValidation((prev) => ({
      ...prev,
      errors: {},
    }));
    setFormData({ validationError: undefined });

    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const resetForm = () => {
    setCurrentStep(0);
    setFormDataState(initialFormData);
    setStepValidation({ isLoading: false, errors: {} });
  };

  const validateUsername = async (): Promise<boolean> => {
    return validateUsernameUtil(formData.username, setStepValidation);
  };

  const validateEmail = async (): Promise<boolean> => {
    return validateEmailUtil(formData.email, setStepValidation);
  };

  const registerUser = async (): Promise<boolean> => {
    // Clear any previous validation errors before attempting registration
    setStepValidation((prev) => ({
      ...prev,
      errors: {},
    }));

    return registerUserUtil(formData, setStepValidation, navigate);
  };

  const verifyEmail = async (code: string): Promise<boolean> => {
    // Clear verification errors before attempting verification
    setStepValidation((prev) => ({
      ...prev,
      errors: { ...prev.errors, verification: undefined },
    }));

    return verifyEmailUtil(formData.email, code, setStepValidation, navigate);
  };

  return (
    <MultiStepFormContext.Provider
      value={{
        currentStep,
        formData,
        stepValidation,
        nextStep,
        prevStep,
        setCurrentStep,
        setFormData,
        validateUsername,
        validateEmail,
        registerUser,
        verifyEmail,
        resetForm,
      }}
    >
      {children}
    </MultiStepFormContext.Provider>
  );
};
