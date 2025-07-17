import { ArrowLeft, Loader2, Save, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStepForm } from "./StepFormProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface StepFormActionsProps {
  onCancel: () => void;
}

export const StepFormActions = ({ onCancel }: StepFormActionsProps) => {
  const {
    currentStep,
    nextStep,
    prevStep,
    submitForm,
    isSubmitting,
    isEditMode,
    totalSteps,
    formErrors,
    formData,
  } = useStepForm();

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  // Check if there are errors for the current step
  const currentStepErrors = formErrors[currentStep] || [];
  const hasErrors = currentStepErrors.length > 0;

  // Check if all required data is present for submission
  const canSubmit = formData.title.trim() &&
    formData.circuitId &&
    formData.currentStatusId &&
    formData.nextStatusId &&
    (!formData.requiresApproval ||
      (formData.approvalType === "user" && formData.approvalUserId) ||
      (formData.approvalType === "group" && formData.approvalGroupId));

  const handleNext = async () => {
    if (isLastStep) {
      await submitForm();
    } else {
      await nextStep();
    }
  };

  const handlePrev = () => {
    prevStep();
  };

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
    >
      {/* Display form errors */}
      {hasErrors && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="mb-3"
        >
          <Alert className="bg-red-950/20 border-red-500/30 backdrop-blur-sm">
            <AlertCircle className="h-3.5 w-3.5 text-red-400" />
            <AlertDescription className="text-red-300">
              <div className="space-y-0.5">
                {currentStepErrors.map((error, index) => (
                  <div key={index} className="text-sm">{error}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Compact Action Buttons */}
      <div className="flex items-center justify-between gap-3">
        {/* Back/Cancel Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={isFirstStep ? onCancel : handlePrev}
            className="h-9 px-4 bg-slate-800/60 border-slate-700/50 hover:bg-slate-700/80 hover:border-slate-600/50 text-slate-300 hover:text-white transition-all duration-200 backdrop-blur-sm"
            disabled={isSubmitting}
            size="sm"
          >
            {isFirstStep ? (
              <>
                <X className="mr-1.5 h-3.5 w-3.5" />
                Cancel
              </>
            ) : (
              <>
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Back
              </>
            )}
          </Button>
        </motion.div>

        {/* Compact Progress Indicator */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/40 border border-slate-700/50 rounded-full backdrop-blur-sm">
            <div className="text-xs text-slate-400">
              Step {currentStep} of {totalSteps}
            </div>
            <div className="w-12 h-1 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Next/Submit Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting || (isLastStep && !canSubmit)}
            className={`h-9 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white border-0 shadow-lg shadow-blue-500/25 transition-all duration-200 backdrop-blur-sm ${isSubmitting || (isLastStep && !canSubmit)
                ? "opacity-50 cursor-not-allowed shadow-none"
                : "hover:shadow-xl hover:shadow-blue-500/30"
              }`}
            size="sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                {isLastStep ? "Saving..." : "Processing..."}
              </>
            ) : isLastStep ? (
              <>
                <Save className="mr-1.5 h-3.5 w-3.5" />
                {isEditMode ? "Update Step" : "Create Step"}
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Compact Additional Info for Final Step */}
      {isLastStep && !canSubmit && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg backdrop-blur-sm"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-300">
              <p className="font-medium mb-0.5">Please complete all required fields:</p>
              <ul className="text-xs text-amber-200/80 space-y-0.5">
                {!formData.title.trim() && <li>• Step title is required</li>}
                {!formData.currentStatusId && <li>• Current status must be selected</li>}
                {!formData.nextStatusId && <li>• Next status must be selected</li>}
                {formData.requiresApproval && formData.approvalType === "user" && !formData.approvalUserId && (
                  <li>• Approval user must be selected</li>
                )}
                {formData.requiresApproval && formData.approvalType === "group" && !formData.approvalGroupId && (
                  <li>• Approval group must be selected</li>
                )}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
