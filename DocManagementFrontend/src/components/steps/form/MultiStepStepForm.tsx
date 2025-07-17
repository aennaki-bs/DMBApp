import { useStepForm } from "./StepFormProvider";
import { StepFormProgress } from "./StepFormProgress";
import { StepBasicInfo } from "./StepBasicInfo";
import StepReview from "./StepReview";
import { StepFormActions } from "./StepFormActions";
import { StepOptions } from "./StepOptions";
import { StepStatusSelection } from "./StepStatusSelection";
import { AnimatePresence, motion } from "framer-motion";

interface MultiStepStepFormProps {
  onCancel: () => void;
}

export const MultiStepStepForm = ({ onCancel }: MultiStepStepFormProps) => {
  const { currentStep, totalSteps } = useStepForm();

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StepBasicInfo />;
      case 2:
        return <StepStatusSelection />;
      case 3:
        return <StepOptions />;
      case 4:
        return <StepReview />;
      default:
        return <StepBasicInfo />;
    }
  };

  // Enhanced transition variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div className="w-full max-w-full mx-auto">
      {/* Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <StepFormProgress currentStep={currentStep} totalSteps={totalSteps} />
      </motion.div>

      {/* Content Section with Enhanced Container */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-blue-800/5" />
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />
        </div>

        {/* Form Content */}
        <div className="relative min-h-[280px] py-4">
          <AnimatePresence mode="wait" custom={currentStep}>
            <motion.div
              key={currentStep}
              custom={currentStep}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
              }}
              className="w-full"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Actions Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mt-4 pt-4 border-t border-slate-800/50"
      >
        <StepFormActions onCancel={onCancel} />
      </motion.div>
    </div>
  );
};
