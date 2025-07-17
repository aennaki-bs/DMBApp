import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, Save, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import EnhancedStepIndicator, { Step } from './EnhancedStepIndicator';

interface WizardAction {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'destructive' | 'secondary';
    disabled?: boolean;
    loading?: boolean;
    icon?: ReactNode;
}

interface EnhancedWizardLayoutProps {
    // Dialog props
    open: boolean;
    onOpenChange: (open: boolean) => void;

    // Header content
    title: string;
    description?: string;
    icon?: ReactNode;

    // Steps
    steps: Step[];
    currentStep: number;
    onStepChange?: (stepId: number) => void;
    allowStepNavigation?: boolean;

    // Content
    children: ReactNode;

    // Actions
    onNext?: () => void;
    onPrevious?: () => void;
    onCancel?: () => void;
    onSubmit?: () => void;

    // Action customization
    nextLabel?: string;
    previousLabel?: string;
    cancelLabel?: string;
    submitLabel?: string;

    // State
    isSubmitting?: boolean;
    canGoNext?: boolean;
    canGoPrevious?: boolean;

    // Validation
    stepErrors?: Record<number, string>;
    globalError?: string;
    globalWarning?: string;

    // Layout options
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    showStepPreview?: boolean;
    stepIndicatorVariant?: 'horizontal' | 'vertical';

    // Accessibility
    'aria-label'?: string;
}

export const EnhancedWizardLayout: React.FC<EnhancedWizardLayoutProps> = ({
    open,
    onOpenChange,
    title,
    description,
    icon,
    steps,
    currentStep,
    onStepChange,
    allowStepNavigation = false,
    children,
    onNext,
    onPrevious,
    onCancel,
    onSubmit,
    nextLabel = 'Next',
    previousLabel = 'Previous',
    cancelLabel = 'Cancel',
    submitLabel = 'Submit',
    isSubmitting = false,
    canGoNext = true,
    canGoPrevious = true,
    stepErrors = {},
    globalError,
    globalWarning,
    maxWidth = 'lg',
    showStepPreview = true,
    stepIndicatorVariant = 'horizontal',
    'aria-label': ariaLabel,
}) => {
    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === steps.length;

    // Add error status to steps
    const enhancedSteps = steps.map(step => ({
        ...step,
        hasError: !!stepErrors[step.id]
    }));

    const getMaxWidthClass = () => {
        switch (maxWidth) {
            case 'sm': return 'sm:max-w-[500px]';
            case 'md': return 'sm:max-w-[650px]';
            case 'lg': return 'sm:max-w-[800px]';
            case 'xl': return 'sm:max-w-[900px]';
            case '2xl': return 'sm:max-w-[1000px]';
            default: return 'sm:max-w-[650px]';
        }
    };

    // Animation variants for step content
    const contentVariants = {
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

    // Determine animation direction
    const getDirection = () => {
        // This would need to be managed by parent component
        return 1; // Default forward direction
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    'flex flex-col max-h-[90vh] overflow-hidden',
                    'bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95',
                    'backdrop-blur-lg border border-slate-700/50',
                    'shadow-2xl shadow-slate-900/50',
                    getMaxWidthClass()
                )}
                aria-label={ariaLabel || `${title} wizard`}
            >
                {/* Header */}
                <DialogHeader className="flex-shrink-0 space-y-4 pb-6 border-b border-slate-700/50">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                            {icon && (
                                <motion.div
                                    className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 15,
                                        delay: 0.1
                                    }}
                                >
                                    {icon}
                                </motion.div>
                            )}
                            <div className="flex-1 min-w-0">
                                <DialogTitle className="text-xl font-semibold text-slate-100 mb-1">
                                    {title}
                                </DialogTitle>
                                {description && (
                                    <DialogDescription className="text-slate-400 text-sm leading-relaxed">
                                        {description}
                                    </DialogDescription>
                                )}
                            </div>
                        </div>

                        {/* Close button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 h-8 w-8 p-0"
                            aria-label="Close dialog"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Global alerts */}
                    <AnimatePresence>
                        {globalError && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <Alert className="border-red-500/50 bg-red-500/10">
                                    <AlertTriangle className="h-4 w-4 text-red-400" />
                                    <AlertDescription className="text-red-300">
                                        {globalError}
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        )}

                        {globalWarning && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                                    <AlertDescription className="text-yellow-300">
                                        {globalWarning}
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </DialogHeader>

                {/* Step Indicator */}
                <div className="flex-shrink-0 py-6 border-b border-slate-700/30">
                    <EnhancedStepIndicator
                        steps={enhancedSteps}
                        currentStep={currentStep}
                        onStepClick={onStepChange}
                        allowStepNavigation={allowStepNavigation}
                        showStepPreview={showStepPreview}
                        variant={stepIndicatorVariant}
                        size="md"
                    />
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto min-h-0 py-6">
                    <AnimatePresence mode="wait" custom={getDirection()}>
                        <motion.div
                            key={currentStep}
                            custom={getDirection()}
                            variants={contentVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                                mass: 0.8,
                            }}
                            className="focus:outline-none"
                            tabIndex={-1}
                        >
                            {/* Step error display */}
                            {stepErrors[currentStep] && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mb-6"
                                >
                                    <Alert className="border-red-500/50 bg-red-500/10">
                                        <AlertTriangle className="h-4 w-4 text-red-400" />
                                        <AlertDescription className="text-red-300">
                                            {stepErrors[currentStep]}
                                        </AlertDescription>
                                    </Alert>
                                </motion.div>
                            )}

                            {/* Step content */}
                            <div className="space-y-6">
                                {children}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <div className="flex-shrink-0 pt-6 border-t border-slate-700/30">
                    <div className="flex items-center justify-between gap-4">
                        {/* Previous button */}
                        <div className="flex-1">
                            {!isFirstStep && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onPrevious}
                                    disabled={!canGoPrevious || isSubmitting}
                                    className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800/50 hover:text-slate-200"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    {previousLabel}
                                </Button>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-3">
                            {/* Cancel button */}
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onCancel}
                                disabled={isSubmitting}
                                className="text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                            >
                                {cancelLabel}
                            </Button>

                            {/* Next/Submit button */}
                            {isLastStep ? (
                                <Button
                                    type="button"
                                    onClick={onSubmit}
                                    disabled={isSubmitting || !canGoNext}
                                    className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white border-emerald-500/20 min-w-[120px]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <motion.div
                                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            {submitLabel}
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={onNext}
                                    disabled={!canGoNext || isSubmitting}
                                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-blue-500/20 min-w-[100px]"
                                >
                                    {nextLabel}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Progress info */}
                    <div className="flex items-center justify-center mt-4 text-xs text-slate-400">
                        <span>
                            Step {currentStep} of {steps.length}
                        </span>
                        {steps[currentStep - 1]?.required && (
                            <span className="ml-2 text-red-400">* Required</span>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EnhancedWizardLayout; 