import React, { createContext, useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import stepService from "@/services/stepService";

interface StepFormData {
  title: string;
  descriptif: string;
  orderIndex: number;
  circuitId: number;
  responsibleRoleId?: number;
  isFinalStep: boolean;
}

interface StepFormContextType {
  currentStep: number;
  formData: StepFormData;
  setFormData: (data: Partial<StepFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetForm: () => void;
  submitForm: () => Promise<boolean>;
  isSubmitting: boolean;
  isEditMode: boolean;
  stepId?: number;
  totalSteps: number;
}

const initialFormData: StepFormData = {
  title: "",
  descriptif: "",
  orderIndex: 10,
  circuitId: 0,
  responsibleRoleId: undefined,
  isFinalStep: false,
};

const StepFormContext = createContext<StepFormContextType | undefined>(
  undefined
);

export const useStepForm = () => {
  const context = useContext(StepFormContext);
  if (!context) {
    throw new Error("useStepForm must be used within a StepFormProvider");
  }
  return context;
};

interface StepFormProviderProps {
  children: React.ReactNode;
  editStep?: Step;
  onSuccess?: () => void;
  circuitId?: number;
}

export const StepFormProvider: React.FC<StepFormProviderProps> = ({
  children,
  editStep,
  onSuccess,
  circuitId: propCircuitId,
}) => {
  const navigate = useNavigate();
  const { circuitId: urlCircuitId } = useParams<{ circuitId: string }>();

  // Determine if we're within a circuit context (either from props or URL params)
  const contextCircuitId =
    propCircuitId || (urlCircuitId ? parseInt(urlCircuitId, 10) : undefined);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormDataState] = useState<StepFormData>(() => {
    if (editStep) {
      return {
        title: editStep.title,
        descriptif: editStep.descriptif,
        orderIndex: editStep.orderIndex,
        circuitId: editStep.circuitId,
        responsibleRoleId: editStep.responsibleRoleId,
        isFinalStep: editStep.isFinalStep,
      };
    }

    // If we have a circuit context, pre-fill the circuitId
    if (contextCircuitId) {
      return {
        ...initialFormData,
        circuitId: contextCircuitId,
      };
    }

    return initialFormData;
  });

  // We now have a simplified 2-step process
  const totalSteps = 2;

  const isEditMode = !!editStep;

  const setFormData = (data: Partial<StepFormData>) => {
    setFormDataState((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(1, prev - 1));

  const resetForm = () => {
    setCurrentStep(1);
    setFormDataState(initialFormData);
  };

  const submitForm = async (): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      if (isEditMode && editStep) {
        const success = await stepService.updateStep(editStep.id, {
          title: formData.title,
          descriptif: formData.descriptif,
          // orderIndex: formData.orderIndex,
          // responsibleRoleId: formData.responsibleRoleId,
          isFinalStep: formData.isFinalStep,
        });

        if (success) {
          toast.success("Step updated successfully");
          if (onSuccess) onSuccess();
          return true;
        }
      } else {
        const createdStep = await stepService.createStep({
          title: formData.title,
          descriptif: formData.descriptif,
          orderIndex: formData.orderIndex,
          circuitId: formData.circuitId,
          responsibleRoleId: formData.responsibleRoleId,
        });

        if (createdStep) {
          toast.success("Step created successfully");
          if (onSuccess) onSuccess();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error saving step:", error);
      toast.error(
        isEditMode ? "Failed to update step" : "Failed to create step"
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StepFormContext.Provider
      value={{
        currentStep,
        formData,
        setFormData,
        nextStep,
        prevStep,
        resetForm,
        submitForm,
        isSubmitting,
        isEditMode,
        stepId: editStep?.id,
        totalSteps,
      }}
    >
      {children}
    </StepFormContext.Provider>
  );
};
