import React from 'react';
import { motion } from 'framer-motion';
import { Check, Minus, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdvancedSelectionCheckboxProps {
    checked: boolean;
    indeterminate?: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'header' | 'row';
    showLabel?: boolean;
    label?: string;
    className?: string;
}

export function AdvancedSelectionCheckbox({
    checked,
    indeterminate = false,
    onCheckedChange,
    disabled = false,
    size = 'md',
    variant = 'default',
    showLabel = false,
    label,
    className,
}: AdvancedSelectionCheckboxProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };

    const iconSizeClasses = {
        sm: 'h-3 w-3',
        md: 'h-3.5 w-3.5',
        lg: 'h-4 w-4',
    };

    const getCheckboxState = () => {
        if (indeterminate) return 'indeterminate';
        if (checked) return 'checked';
        return 'unchecked';
    };

    const getIcon = () => {
        const iconClass = cn(iconSizeClasses[size], "text-white");

        if (indeterminate) {
            return <Minus className={iconClass} />;
        }
        if (checked) {
            return <Check className={iconClass} />;
        }
        return null;
    };

    const getBackgroundColor = () => {
        if (disabled) {
            return 'bg-slate-600/50 border-slate-500/50';
        }

        if (indeterminate) {
            return 'bg-yellow-600 border-yellow-500 shadow-yellow-500/20';
        }

        if (checked) {
            return 'bg-blue-600 border-blue-500 shadow-blue-500/20';
        }

        return 'bg-transparent border-blue-500/50 hover:border-blue-400 hover:bg-blue-900/20';
    };

    const handleClick = () => {
        if (disabled) return;

        // If indeterminate, clicking should check all
        // If checked, clicking should uncheck all
        // If unchecked, clicking should check all
        if (indeterminate || !checked) {
            onCheckedChange(true);
        } else {
            onCheckedChange(false);
        }
    };

    return (
        <div className={cn("flex items-center", className)}>
            <motion.button
                type="button"
                onClick={handleClick}
                disabled={disabled}
                className={cn(
                    "relative flex items-center justify-center rounded-md border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:ring-offset-slate-900",
                    sizeClasses[size],
                    getBackgroundColor(),
                    !disabled && "cursor-pointer hover:scale-110 hover:shadow-lg",
                    disabled && "cursor-not-allowed opacity-50",
                    variant === 'header' && "shadow-md",
                    variant === 'row' && "shadow-sm"
                )}
                whileHover={!disabled ? { scale: 1.05 } : undefined}
                whileTap={!disabled ? { scale: 0.95 } : undefined}
                aria-checked={indeterminate ? 'mixed' : checked}
                aria-label={label || (indeterminate ? 'Partially selected' : checked ? 'Selected' : 'Not selected')}
            >
                {/* Animated background for checked/indeterminate states */}
                <motion.div
                    initial={false}
                    animate={{
                        opacity: checked || indeterminate ? 1 : 0,
                        scale: checked || indeterminate ? 1 : 0.8,
                    }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute inset-0 rounded-md"
                />

                {/* Icon */}
                <motion.div
                    initial={false}
                    animate={{
                        opacity: checked || indeterminate ? 1 : 0,
                        scale: checked || indeterminate ? 1 : 0.5,
                    }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                >
                    {getIcon()}
                </motion.div>

                {/* Ripple effect on click */}
                <motion.div
                    className="absolute inset-0 rounded-md bg-white/20"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                />
            </motion.button>

            {/* Label */}
            {showLabel && label && (
                <span className={cn(
                    "ml-2 text-sm font-medium transition-colors duration-150",
                    disabled ? "text-slate-500" : "text-blue-100",
                    !disabled && "cursor-pointer"
                )} onClick={handleClick}>
                    {label}
                </span>
            )}
        </div>
    );
} 