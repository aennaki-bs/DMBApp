import React, { createContext, useContext, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DocumentType } from "@/models/document";
import { CreateSubTypeDto } from "@/models/subtype";
import subTypeService from "@/services/subTypeService";
import { useNavigate } from "react-router-dom";

interface FormData extends CreateSubTypeDto {
  // Additional fields for internal form state management if needed
}

interface FormContextType {
  currentStep: number;
  totalSteps: number;
  formData: FormData;
  isSubmitting: boolean;
  isSubmitSuccess: boolean | null;
  submitError: string | null;
  updateForm: (updates: Partial<FormData>) => void;
  setFormData: (updates: Partial<FormData>) => void;
  errors: Record<string, string>;
  goToStep: (stepNumber: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  submitForm: () => Promise<void>;
  resetForm: () => void;
}

const defaultFormData: Omit<FormData, "documentTypeId"> = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  isActive: true,
};

const FormContext = createContext<FormContextType | undefined>(undefined);

interface SubTypeFormProviderProps {
  children: React.ReactNode;
  documentType?: DocumentType;
  onSubmit?: (formData: FormData) => void;
  onClose?: () => void;
}

export const SubTypeFormProvider: React.FC<SubTypeFormProviderProps> = ({
  children,
  documentType,
  onSubmit,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    ...defaultFormData,
    documentTypeId: documentType?.id ? Number(documentType.id) : 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState<boolean | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateForm = (updates: Partial<FormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
      documentTypeId: documentType?.id
        ? Number(documentType.id)
        : prev.documentTypeId,
    }));

    // Clear any errors for the updated fields
    if (updates) {
      const updatedErrors = { ...errors };
      Object.keys(updates).forEach((key) => {
        delete updatedErrors[key];
      });
      setErrors(updatedErrors);
    }
  };

  const goToStep = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= 3) {
      setCurrentStep(stepNumber);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const resetForm = () => {
    setFormData({
      ...defaultFormData,
      documentTypeId: documentType?.id ? Number(documentType.id) : 0,
    });
    setCurrentStep(1);
    setIsSubmitSuccess(null);
    setSubmitError(null);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic validation
    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
      toast({
        title: "Error",
        description: "Start date is required",
        variant: "destructive",
      });
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
      toast({
        title: "Error",
        description: "End date is required",
        variant: "destructive",
      });
    }

    // Validate that end date is after start date
    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.endDate) <= new Date(formData.startDate)
    ) {
      newErrors.endDate = "End date must be after start date";
      toast({
        title: "Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setCurrentStep(1);
      return;
    }

    try {
      const payload: CreateSubTypeDto = {
        ...formData,
        documentTypeId: documentType?.id
          ? Number(documentType.id)
          : formData.documentTypeId,
      };

      setIsSubmitting(true);
      setSubmitError(null);
      setIsSubmitSuccess(null);

      if (onSubmit) {
        onSubmit(formData);
        setIsSubmitSuccess(true);

        if (onClose) {
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } else {
        await subTypeService.createSubType(payload);

        setIsSubmitSuccess(true);
        toast({
          title: "Success!",
          description: `Subtype "${formData.name}" was created successfully`,
          variant: "default",
        });

        setTimeout(() => {
          if (documentType?.id) {
            navigate(`/document-types/${documentType.id}/subtypes`);
          } else {
            navigate("/document-types");
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);

      setIsSubmitSuccess(false);
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create subtype"
      );

      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create subtype",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const value: FormContextType = {
    currentStep,
    totalSteps: 3,
    formData,
    isSubmitting,
    isSubmitSuccess,
    submitError,
    updateForm,
    setFormData: updateForm,
    errors,
    goToStep,
    nextStep,
    prevStep,
    submitForm: handleSubmit,
    resetForm,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

export const useSubTypeForm = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useSubTypeForm must be used within a SubTypeFormProvider");
  }
  return context;
};
