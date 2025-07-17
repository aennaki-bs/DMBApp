import { motion } from "framer-motion";
import { Check, AlertCircle, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepConfig {
    id: number;
    title: string;
    description: string;
    icon: LucideIcon;
    color: string;
}

interface EnhancedSeriesStepIndicatorProps {
    steps: StepConfig[];
    currentStep: number;
    errors: Record<string, string>;
}

export const EnhancedSeriesStepIndicator = ({
    steps,
    currentStep,
    errors,
}: EnhancedSeriesStepIndicatorProps) => {
    const hasErrors = Object.keys(errors).length > 0;

    const getStepStatus = (stepId: number) => {
        if (stepId < currentStep) return "completed";
        if (stepId === currentStep) {
            return hasErrors ? "error" : "current";
        }
        return "upcoming";
    };

    return (
        <div className="w-full">
            {/* Progress Bar Background */}
            <div className="relative mb-8">
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-700/50" />

                {/* Active Progress */}
                <motion.div
                    className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400"
                    initial={{ width: "0%" }}
                    animate={{
                        width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />

                {/* Steps */}
                <div className="relative flex justify-between">
                    {steps.map((step, index) => {
                        const status = getStepStatus(step.id);
                        const StepIcon = step.icon;

                        return (
                            <div key={step.id} className="flex flex-col items-center">
                                {/* Step Circle */}
                                <motion.div
                                    className={cn(
                                        "relative w-12 h-12 rounded-full border-2 flex items-center justify-center",
                                        "transition-all duration-300 shadow-lg",
                                        {
                                            "bg-gradient-to-r from-blue-500 to-blue-600 border-blue-400 text-white":
                                                status === "current" && !hasErrors,
                                            "bg-gradient-to-r from-red-500 to-red-600 border-red-400 text-white":
                                                status === "current" && hasErrors,
                                            "bg-gradient-to-r from-green-500 to-green-600 border-green-400 text-white":
                                                status === "completed",
                                            "bg-slate-800 border-slate-600 text-slate-400":
                                                status === "upcoming"
                                        }
                                    )}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    {/* Glow Effect for Current Step */}
                                    {status === "current" && (
                                        <motion.div
                                            className="absolute inset-0 rounded-full bg-blue-400/20 blur-lg"
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    )}

                                    {/* Step Content */}
                                    <div className="relative z-10">
                                        {status === "completed" ? (
                                            <Check className="w-5 h-5" />
                                        ) : status === "current" && hasErrors ? (
                                            <AlertCircle className="w-5 h-5" />
                                        ) : (
                                            <StepIcon className="w-5 h-5" />
                                        )}
                                    </div>
                                </motion.div>

                                {/* Step Info */}
                                <motion.div
                                    className="mt-3 text-center max-w-[120px]"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 + 0.2 }}
                                >
                                    <h3 className={cn(
                                        "text-sm font-semibold transition-colors duration-300",
                                        {
                                            "text-white": status === "current" || status === "completed",
                                            "text-slate-400": status === "upcoming"
                                        }
                                    )}>
                                        {step.title}
                                    </h3>
                                    <p className={cn(
                                        "text-xs mt-1 transition-colors duration-300",
                                        {
                                            "text-blue-300": status === "current" && !hasErrors,
                                            "text-red-300": status === "current" && hasErrors,
                                            "text-green-300": status === "completed",
                                            "text-slate-500": status === "upcoming"
                                        }
                                    )}>
                                        {step.description}
                                    </p>
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Step Progress Summary */}
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                    <span>Step {currentStep} of {steps.length}</span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Completion Percentage */}
                    <div className="text-slate-400">
                        {Math.round(((currentStep - 1) / (steps.length - 1)) * 100)}% Complete
                    </div>

                    {/* Error Count */}
                    {hasErrors && (
                        <div className="flex items-center gap-1 text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            <span>{Object.keys(errors).length} error{Object.keys(errors).length !== 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}; 