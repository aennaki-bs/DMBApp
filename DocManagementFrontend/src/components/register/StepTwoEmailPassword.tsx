
import React, { useState, useEffect } from 'react';
import { useMultiStepForm } from '@/context/form';
import { toast } from 'sonner';
import { validateEmailPasswordStep } from './utils/validation';
import { usePasswordStrength } from './hooks/usePasswordStrength';
import StepTwoFormFields from './step-two/StepTwoFormFields';
import StepTwoButtons from './step-two/StepTwoButtons';

const StepTwoEmailPassword = () => {
  const { formData, setFormData, prevStep, nextStep, validateEmail, validateUsername, stepValidation } = useMultiStepForm();
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const { calculatePasswordStrength } = usePasswordStrength();
  const passwordStrength = calculatePasswordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
    
    // Mark field as touched when the user interacts with it
    if (!touchedFields[name as keyof typeof touchedFields]) {
      setTouchedFields(prev => ({
        ...prev,
        [name]: true
      }));
    }
  };
  
  // Validate on data change
  useEffect(() => {
    const errors = validateEmailPasswordStep(formData);
    setLocalErrors(errors);
  }, [formData]);

  const validateStep = (showToast = true) => {
    const errors = validateEmailPasswordStep(formData);
    
    // Set all fields as touched when user tries to proceed
    setTouchedFields({
      username: true,
      email: true,
      password: true,
      confirmPassword: true
    });
    
    setLocalErrors(errors);
    
    if (showToast && Object.keys(errors).length > 0) {
      toast.error("Please correct all errors before proceeding");
    }
    
    return Object.keys(errors).length === 0;
  };

  // Filter errors to only show for touched fields
  const visibleErrors: Record<string, string> = {};
  Object.keys(localErrors).forEach(key => {
    if (touchedFields[key as keyof typeof touchedFields]) {
      visibleErrors[key] = localErrors[key];
    }
  });

  const handleNext = async () => {
    // Mark all fields as touched when user tries to proceed
    setTouchedFields({
      username: true,
      email: true,
      password: true,
      confirmPassword: true
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
    <div className="space-y-5">
      <StepTwoFormFields
        formData={formData}
        onChange={handleChange}
        localErrors={visibleErrors}
        validationErrors={stepValidation.errors}
        passwordStrength={passwordStrength}
      />

      <StepTwoButtons
        onBack={prevStep}
        onNext={handleNext}
        isLoading={stepValidation.isLoading}
      />
    </div>
  );
};

export default StepTwoEmailPassword;
