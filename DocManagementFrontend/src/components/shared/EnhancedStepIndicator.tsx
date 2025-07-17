import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
    id: number;
    title: string;
    description: string;
    icon?: React.ReactNode;
    completed?: boolean;
    hasError?: boolean;
    required?: boolean;
}

interface EnhancedStepIndicatorProps {
    steps: Step[];
    currentStep: number;
    onStepClick?: (stepId: number) => void;
    allowStepNavigation?: boolean;
    showStepPreview?: boolean;
    variant?: 'horizontal' | 'vertical';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const EnhancedStepIndicator: React.FC<EnhancedStepIndicatorProps> = ({
    steps,
    currentStep,
    onStepClick,
    allowStepNavigation = false,
    showStepPreview = true,
    variant = 'horizontal',
    size = 'md',
    className
}) => {
    const [hoveredStep, setHoveredStep] = useState<number | null>(null);

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return {
                    circle: 'w-8 h-8',
                    icon: 'w-3 h-3',
                    text: 'text-xs',
                    description: 'text-xs'
                };
            case 'lg':
                return {
                    circle: 'w-12 h-12',
                    icon: 'w-5 h-5',
                    text: 'text-base',
                    description: 'text-sm'
                };
            default:
                return {
                    circle: 'w-10 h-10',
                    icon: 'w-4 h-4',
                    text: 'text-sm',
                    description: 'text-xs'
                };
        }
    };

    const sizeClasses = getSizeClasses();

    const getStepStatus = (step: Step) => {
        if (step.hasError) return 'error';
        if (step.completed || step.id < currentStep) return 'completed';
        if (step.id === currentStep) return 'current';
        return 'pending';
    };

    const getStepColors = (status: string, isHovered: boolean = false) => {
        const baseClasses = {
            error: {
                circle: 'bg-red-500/20 border-red-500 text-red-300',
                line: 'bg-red-500/30',
                text: 'text-red-300',
                pulse: 'animate-pulse'
            },
            completed: {
                circle: 'bg-emerald-500/20 border-emerald-400 text-emerald-300',
                line: 'bg-emerald-500/40',
                text: 'text-emerald-300',
                pulse: ''
            },
            current: {
                circle: 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-lg shadow-blue-500/20',
                line: 'bg-gradient-to-r from-blue-500/40 to-slate-600/20',
                text: 'text-blue-300',
                pulse: 'animate-pulse'
            },
            pending: {
                circle: 'bg-slate-800/50 border-slate-600 text-slate-400',
                line: 'bg-slate-600/20',
                text: 'text-slate-400',
                pulse: ''
            }
        };

        if (isHovered && allowStepNavigation) {
            return {
                ...baseClasses[status as keyof typeof baseClasses],
                circle: `${baseClasses[status as keyof typeof baseClasses].circle} ring-2 ring-blue-500/30 scale-110`,
            };
        }

        return baseClasses[status as keyof typeof baseClasses];
    };

    const handleStepClick = (stepId: number) => {
        if (allowStepNavigation && onStepClick) {
            onStepClick(stepId);
        }
    };

    const renderStepIcon = (step: Step, status: string) => {
        if (status === 'error') {
            return <AlertCircle className={cn(sizeClasses.icon, 'text-red-400')} />;
        }

        if (status === 'completed') {
            return <Check className={cn(sizeClasses.icon, 'text-emerald-400')} />;
        }

        if (status === 'current') {
            return step.icon || <Clock className={cn(sizeClasses.icon, 'text-blue-400')} />;
        }

        return step.icon || <div className={cn('rounded-full bg-slate-600', size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-2.5 h-2.5')} />;
    };

    if (variant === 'vertical') {
        return (
            <div className={cn('space-y-4', className)}>
                {steps.map((step, index) => {
                    const status = getStepStatus(step);
                    const colors = getStepColors(status, hoveredStep === step.id);
                    const isClickable = allowStepNavigation && (step.completed || step.id <= currentStep);

                    return (
                        <div key={step.id} className="relative">
                            {/* Connecting line */}
                            {index < steps.length - 1 && (
                                <div className="absolute left-5 top-10 w-0.5 h-8 bg-slate-600/20" />
                            )}

                            <motion.div
                                className={cn(
                                    'flex items-start gap-4 p-3 rounded-lg transition-all duration-200',
                                    isClickable && 'cursor-pointer hover:bg-slate-800/30',
                                    status === 'current' && 'bg-slate-800/20 border border-blue-500/20'
                                )}
                                onHoverStart={() => setHoveredStep(step.id)}
                                onHoverEnd={() => setHoveredStep(null)}
                                onClick={() => handleStepClick(step.id)}
                                whileHover={isClickable ? { scale: 1.02 } : {}}
                                whileTap={isClickable ? { scale: 0.98 } : {}}
                            >
                                {/* Step circle */}
                                <div className={cn(
                                    'flex items-center justify-center rounded-full border-2 transition-all duration-300',
                                    sizeClasses.circle,
                                    colors.circle,
                                    colors.pulse
                                )}>
                                    {renderStepIcon(step, status)}
                                </div>

                                {/* Step content */}
                                <div className="flex-1 min-w-0">
                                    <div className={cn('font-medium transition-colors', sizeClasses.text, colors.text)}>
                                        {step.title}
                                        {step.required && <span className="text-red-400 ml-1">*</span>}
                                    </div>
                                    {showStepPreview && (
                                        <div className={cn('text-slate-400 mt-1', sizeClasses.description)}>
                                            {step.description}
                                        </div>
                                    )}
                                </div>

                                {/* Navigation arrow */}
                                {status === 'current' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-blue-400"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </motion.div>
                                )}
                            </motion.div>
                        </div>
                    );
                })}
            </div>
        );
    }

    // Horizontal variant
    return (
        <div className={cn('w-full', className)}>
            {/* Step indicators */}
            <div className="flex items-center justify-between mb-6">
                {steps.map((step, index) => {
                    const status = getStepStatus(step);
                    const colors = getStepColors(status, hoveredStep === step.id);
                    const isClickable = allowStepNavigation && (step.completed || step.id <= currentStep);

                    return (
                        <React.Fragment key={step.id}>
                            <motion.div
                                className="flex flex-col items-center text-center max-w-[120px]"
                                onHoverStart={() => setHoveredStep(step.id)}
                                onHoverEnd={() => setHoveredStep(null)}
                                onClick={() => handleStepClick(step.id)}
                                whileHover={isClickable ? { scale: 1.05 } : {}}
                                whileTap={isClickable ? { scale: 0.95 } : {}}
                                style={{ cursor: isClickable ? 'pointer' : 'default' }}
                            >
                                {/* Step circle */}
                                <motion.div
                                    className={cn(
                                        'flex items-center justify-center rounded-full border-2 transition-all duration-300 relative',
                                        sizeClasses.circle,
                                        colors.circle,
                                        colors.pulse
                                    )}
                                    layout
                                >
                                    {renderStepIcon(step, status)}

                                    {/* Pulsing ring for current step */}
                                    {status === 'current' && (
                                        <motion.div
                                            className="absolute inset-0 rounded-full border-2 border-blue-400"
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.5, 0, 0.5],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    )}
                                </motion.div>

                                {/* Step title */}
                                <div className={cn(
                                    'font-medium mt-3 transition-colors leading-tight',
                                    sizeClasses.text,
                                    colors.text
                                )}>
                                    {step.title}
                                    {step.required && <span className="text-red-400 ml-1">*</span>}
                                </div>

                                {/* Step description - only show for current step or on hover */}
                                <AnimatePresence>
                                    {showStepPreview && (status === 'current' || hoveredStep === step.id) && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className={cn(
                                                'text-slate-400 text-center leading-tight',
                                                sizeClasses.description
                                            )}
                                        >
                                            {step.description}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Connecting line */}
                            {index < steps.length - 1 && (
                                <div className="flex-1 px-2">
                                    <div className="relative h-0.5 mx-2">
                                        <div className="absolute inset-0 bg-slate-600/20 rounded-full" />
                                        <motion.div
                                            className={cn(
                                                'absolute inset-0 rounded-full transition-all duration-500',
                                                colors.line
                                            )}
                                            initial={{ width: '0%' }}
                                            animate={{
                                                width: step.id < currentStep ? '100%' : step.id === currentStep ? '50%' : '0%'
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Progress bar */}
            <div className="relative h-1 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{
                        width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
                    }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                />

                {/* Animated glow effect */}
                <motion.div
                    className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                        x: [`-32px`, `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% + 8px)`],
                    }}
                    transition={{
                        duration: 1,
                        ease: 'easeInOut',
                        delay: 0.5
                    }}
                />
            </div>
        </div>
    );
};

export default EnhancedStepIndicator; 