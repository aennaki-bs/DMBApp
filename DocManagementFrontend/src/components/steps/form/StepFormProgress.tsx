import { CheckCircle, Circle, ArrowRight } from "lucide-react";
import { useStepForm } from "./StepFormProvider";
import { motion } from "framer-motion";

interface StepFormProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const StepFormProgress = ({
  currentStep,
  totalSteps,
}: StepFormProgressProps) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return "Basic Information";
      case 2:
        return "Status Selection";
      case 3:
        return "Step Options";
      case 4:
        return "Review";
      default:
        return "Step";
    }
  };

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1:
        return "Enter the basic information for your step";
      case 2:
        return "Define current and next status for this step";
      case 3:
        return "Configure approval settings";
      case 4:
        return "Review your step before creating it";
      default:
        return "";
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1:
        return <Circle className="h-3 w-3" />;
      case 2:
        return <ArrowRight className="h-3 w-3" />;
      case 3:
        return <Circle className="h-3 w-3" />;
      case 4:
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Circle className="h-3 w-3" />;
    }
  };

  return (
    <div className="mb-4 space-y-3">
      {/* Compact Step Indicators */}
      <div className="relative">
        {/* Background Progress Line */}
        <div className="absolute top-4 left-4 right-4 h-[1px] bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {/* Step Indicators */}
        <div className="relative flex justify-between items-center">
          {steps.map((step) => {
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;

            return (
              <motion.div
                key={step}
                className="flex flex-col items-center relative z-10"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: step * 0.05, duration: 0.2 }}
              >
                {/* Compact Step Circle */}
                <motion.div
                  className={`
                    relative flex items-center justify-center w-8 h-8 rounded-full
                    border backdrop-blur-sm transition-all duration-200
                    ${isCompleted
                      ? "bg-gradient-to-br from-blue-500/90 to-blue-600/90 border-blue-400/50 shadow-md shadow-blue-500/20"
                      : isCurrent
                        ? "bg-gradient-to-br from-blue-600/80 to-blue-700/80 border-blue-400 shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/20"
                        : "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-600/50"
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle className="h-3.5 w-3.5 text-white" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`
                        ${isCurrent ? "text-white" : "text-slate-400"}
                      `}
                    >
                      {getStepIcon(step)}
                    </motion.div>
                  )}

                  {/* Compact Pulse Effect for Current Step */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-blue-500/20"
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.3, 0, 0.3],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </motion.div>

                {/* Compact Step Number Badge */}
                <motion.div
                  className={`
                    absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center
                    text-xs font-bold backdrop-blur-sm border transition-all duration-200
                    ${isCompleted
                      ? "bg-blue-500/90 text-white border-blue-400/50"
                      : isCurrent
                        ? "bg-blue-600/90 text-white border-blue-400"
                        : "bg-slate-700/80 text-slate-300 border-slate-600/50"
                    }
                  `}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: step * 0.05 + 0.1, type: "spring" }}
                >
                  {step}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Compact Current Step Information */}
      <motion.div
        className="text-center space-y-1"
        key={currentStep}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Step Title */}
        <div className="relative">
          <h3 className="text-base font-medium bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
            {getStepTitle(currentStep)}
          </h3>
          <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-6 h-[1px] bg-gradient-to-r from-blue-500 to-blue-400" />
        </div>

        {/* Compact Step Description */}
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          {getStepDescription(currentStep)}
        </p>

        {/* Compact Progress Text */}
        <div className="flex items-center justify-center gap-1.5 text-xs pt-1">
          <span className="text-blue-400 font-medium">Step {currentStep}</span>
          <span className="text-slate-500">of</span>
          <span className="text-slate-400">{totalSteps}</span>
          <div className="ml-1.5 bg-slate-800/50 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-slate-700/50">
            <span className="text-blue-400 text-xs">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
