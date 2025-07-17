import { useSubTypeForm } from "./SubTypeFormProvider";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Plus, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EnhancedSeriesFormActionsProps {
    onCancel: () => void;
}

export const EnhancedSeriesFormActions = ({ onCancel }: EnhancedSeriesFormActionsProps) => {
    const { currentStep, nextStep, prevStep, handleSubmit, isLoading } = useSubTypeForm();

    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === 3;

    const getActionButtonText = () => {
        if (isLastStep) return "Create Series";
        return "Continue";
    };

    const getActionButtonIcon = () => {
        if (isLastStep) return <Plus className="w-4 h-4" />;
        return <ArrowRight className="w-4 h-4" />;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
        >
            {/* Background with glassmorphism */}
            <div className="absolute inset-0 bg-slate-800/30 backdrop-blur-sm border-t border-slate-700/50 rounded-t-xl" />

            <div className="relative px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Left Side - Back and Cancel */}
                    <div className="flex items-center gap-3">
                        {/* Back Button */}
                        {!isFirstStep && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                disabled={isLoading}
                                className={cn(
                                    "h-10 px-4 bg-slate-700/50 border-slate-600/50 text-slate-300",
                                    "hover:bg-slate-600/50 hover:border-slate-500/50 hover:text-white",
                                    "focus:ring-2 focus:ring-blue-400/20 transition-all duration-200",
                                    "disabled:opacity-50 disabled:cursor-not-allowed"
                                )}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        )}

                        {/* Cancel Button */}
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onCancel}
                            disabled={isLoading}
                            className={cn(
                                "h-10 px-4 text-slate-400 hover:text-red-400",
                                "hover:bg-red-500/10 hover:border-red-500/20",
                                "focus:ring-2 focus:ring-red-400/20 transition-all duration-200",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    </div>

                    {/* Right Side - Action Button */}
                    <div className="flex items-center gap-3">
                        {/* Step Progress Indicator */}
                        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
                            <span>Step {currentStep} of 3</span>
                            <div className="w-20 h-1 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${(currentStep / 3) * 100}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>

                        {/* Main Action Button */}
                        <Button
                            type="button"
                            onClick={isLastStep ? handleSubmit : nextStep}
                            disabled={isLoading}
                            className={cn(
                                "h-10 px-6 font-medium transition-all duration-200",
                                "focus:ring-2 focus:ring-blue-400/20",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                isLastStep
                                    ? "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg hover:shadow-green-500/25"
                                    : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg hover:shadow-blue-500/25"
                            )}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>
                                        {isLastStep ? "Creating..." : "Validating..."}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span>{getActionButtonText()}</span>
                                    {getActionButtonIcon()}
                                </div>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Loading Progress Bar */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-700 overflow-hidden"
                    >
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                ease: "easeInOut"
                            }}
                        />
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}; 