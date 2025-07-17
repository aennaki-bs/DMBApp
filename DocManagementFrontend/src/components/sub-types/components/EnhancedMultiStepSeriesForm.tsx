import { useSubTypeForm } from "./SubTypeFormProvider";
import { EnhancedSeriesStepIndicator } from "./EnhancedSeriesStepIndicator";
import { EnhancedSeriesDatesStep } from "./EnhancedSeriesDatesStep";
import { EnhancedSeriesBasicInfoStep } from "./EnhancedSeriesBasicInfoStep";
import { EnhancedSeriesReviewStep } from "./EnhancedSeriesReviewStep";
import { EnhancedSeriesFormActions } from "./EnhancedSeriesFormActions";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Clock, FileText, CheckCircle } from "lucide-react";

interface EnhancedMultiStepSeriesFormProps {
    onCancel: () => void;
}

const stepConfig = [
    {
        id: 1,
        title: "Date Range",
        description: "Set validity period",
        icon: Clock,
        color: "from-blue-500 to-blue-600"
    },
    {
        id: 2,
        title: "Basic Information",
        description: "Series details",
        icon: FileText,
        color: "from-purple-500 to-purple-600"
    },
    {
        id: 3,
        title: "Review & Create",
        description: "Confirm settings",
        icon: CheckCircle,
        color: "from-green-500 to-green-600"
    }
];

export const EnhancedMultiStepSeriesForm = ({
    onCancel,
}: EnhancedMultiStepSeriesFormProps) => {
    const { currentStep, errors, isLoading } = useSubTypeForm();

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <EnhancedSeriesDatesStep />;
            case 2:
                return <EnhancedSeriesBasicInfoStep />;
            case 3:
                return <EnhancedSeriesReviewStep />;
            default:
                return <EnhancedSeriesDatesStep />;
        }
    };

    const currentStepConfig = stepConfig.find(step => step.id === currentStep);
    const hasErrors = Object.keys(errors).length > 0;

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Enhanced Step Indicator */}
            <div className="mb-8">
                <EnhancedSeriesStepIndicator
                    steps={stepConfig}
                    currentStep={currentStep}
                    errors={errors}
                />
            </div>

            {/* Current Step Header */}
            <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                    {currentStepConfig?.icon && (
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${currentStepConfig.color} shadow-lg`}>
                            <currentStepConfig.icon className="w-6 h-6 text-white" />
                        </div>
                    )}
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            {currentStepConfig?.title}
                        </h2>
                        <p className="text-slate-400 text-sm">
                            {currentStepConfig?.description}
                        </p>
                    </div>
                </div>

                {/* Error Indicator */}
                {hasErrors && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400"
                    >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium">
                            Please fix the errors below to continue
                        </span>
                    </motion.div>
                )}
            </div>

            {/* Form Content */}
            <div className="min-h-[400px] mb-8">
                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
                        <div className="flex items-center gap-3 px-6 py-4 bg-slate-800/90 rounded-lg border border-slate-700/50">
                            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                            <span className="text-white font-medium">Validating...</span>
                        </div>
                    </div>
                )}

                {/* Step Content with Animation */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.98 }}
                        transition={{
                            duration: 0.3,
                            ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        className="relative"
                    >
                        {/* Content Background */}
                        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 shadow-xl">
                            {renderStepContent()}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Enhanced Form Actions */}
            <div className="mt-auto">
                <EnhancedSeriesFormActions onCancel={onCancel} />
            </div>
        </div>
    );
}; 