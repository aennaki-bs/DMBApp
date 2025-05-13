import { ArrowLeft, ChevronRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubTypeForm } from "./SubTypeFormProvider";
import { motion } from "framer-motion";

interface SubTypeFormActionsProps {
  onCancel: () => void;
}

export const SubTypeFormActions = ({ onCancel }: SubTypeFormActionsProps) => {
  const {
    currentStep,
    nextStep,
    prevStep,
    submitForm,
    totalSteps,
    isSubmitting,
  } = useSubTypeForm();

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <motion.div
      className="flex justify-between gap-2 py-2 border-t border-blue-900/30 bg-gradient-to-r from-blue-900/20 to-blue-800/10 px-2 rounded-b-md"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Button
        type="button"
        variant="outline"
        onClick={isFirstStep ? onCancel : prevStep}
        className="flex-1 h-8 bg-blue-900/20 border-blue-800/40 hover:bg-blue-900/40 text-blue-300 text-xs font-medium transition-all hover:text-blue-200"
      >
        {isFirstStep ? (
          "Cancel"
        ) : (
          <span className="flex items-center justify-center">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back
          </span>
        )}
      </Button>

      <Button
        type="button"
        disabled={isSubmitting}
        onClick={isLastStep ? submitForm : nextStep}
        className="flex-1 h-8 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all relative overflow-hidden group"
      >
        {isSubmitting && (
          <motion.div
            className="absolute inset-0 bg-blue-400/20"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "loop" }}
          />
        )}
        <span className="relative z-10 flex items-center justify-center">
          {isLastStep ? (
            <>
              <Save className="mr-1.5 h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
              {isSubmitting ? "Creating..." : "Create Strain"}
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </span>
      </Button>
    </motion.div>
  );
};
