import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfessionalCheckboxProps {
    checked: boolean;
    indeterminate?: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'header' | 'row';
    hoverEffect?: boolean;
    rippleEffect?: boolean;
    className?: string;
}

export function ProfessionalCheckbox({
    checked,
    indeterminate = false,
    onCheckedChange,
    disabled = false,
    size = 'md',
    variant = 'default',
    hoverEffect = true,
    rippleEffect = true,
    className,
}: ProfessionalCheckboxProps) {
    const [isHovered, setIsHovered] = React.useState(false);
    const [ripples, setRipples] = React.useState<Array<{ id: string; x: number; y: number }>>([]);

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    const iconSizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-3.5 h-3.5',
        lg: 'w-4 h-4',
    };

    const handleClick = (event: React.MouseEvent) => {
        if (disabled) return;

        // Create ripple effect
        if (rippleEffect) {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const newRipple = { id: Date.now().toString(), x, y };

            setRipples(prev => [...prev, newRipple]);

            // Remove ripple after animation
            setTimeout(() => {
                setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
            }, 600);
        }

        onCheckedChange(!checked);
    };

    const getCheckboxColors = () => {
        if (disabled) {
            return {
                bg: 'bg-slate-300 dark:bg-slate-600',
                border: 'border-slate-300 dark:border-slate-600',
                icon: 'text-slate-500',
            };
        }

        if (indeterminate) {
            return {
                bg: 'bg-gradient-to-br from-amber-500 to-amber-600',
                border: 'border-amber-500 dark:border-amber-400',
                icon: 'text-white',
                shadow: 'shadow-amber-500/25',
            };
        }

        if (checked) {
            return {
                bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
                border: 'border-blue-500 dark:border-blue-400',
                icon: 'text-white',
                shadow: 'shadow-blue-500/25',
            };
        }

        return {
            bg: 'bg-white dark:bg-slate-800',
            border: 'border-slate-300 dark:border-slate-600',
            icon: 'text-transparent',
            hoverBg: 'hover:bg-slate-50 dark:hover:bg-slate-700',
            hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-500',
        };
    };

    const colors = getCheckboxColors();

    return (
        <motion.button
            type="button"
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={disabled}
            className={cn(
                'relative flex items-center justify-center rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 overflow-hidden',
                sizeClasses[size],
                colors.bg,
                colors.border,
                colors.shadow && `shadow-lg ${colors.shadow}`,
                !disabled && colors.hoverBg,
                !disabled && colors.hoverBorder,
                !disabled && 'cursor-pointer',
                disabled && 'cursor-not-allowed opacity-60',
                variant === 'header' && 'shadow-md ring-1 ring-black/5',
                variant === 'row' && 'shadow-sm',
                className
            )}
            whileHover={!disabled && hoverEffect ? {
                scale: 1.05,
                rotateZ: 1,
            } : undefined}
            whileTap={!disabled ? { scale: 0.95 } : undefined}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                duration: 0.15
            }}
            aria-checked={indeterminate ? 'mixed' : checked}
            aria-label={indeterminate ? 'Partially selected' : checked ? 'Selected' : 'Not selected'}
        >
            {/* Background Pattern */}
            <motion.div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                    backgroundSize: '8px 8px',
                }}
                animate={{
                    backgroundPosition: isHovered ? ['0px 0px', '8px 8px'] : '0px 0px',
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />

            {/* Ripple Effects */}
            <AnimatePresence>
                {ripples.map((ripple) => (
                    <motion.div
                        key={ripple.id}
                        className="absolute rounded-full bg-white/30 pointer-events-none"
                        style={{
                            left: ripple.x,
                            top: ripple.y,
                            transform: 'translate(-50%, -50%)',
                        }}
                        initial={{ width: 0, height: 0, opacity: 1 }}
                        animate={{
                            width: size === 'lg' ? 48 : size === 'md' ? 40 : 32,
                            height: size === 'lg' ? 48 : size === 'md' ? 40 : 32,
                            opacity: 0
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                ))}
            </AnimatePresence>

            {/* Check Icon */}
            <AnimatePresence mode="wait">
                {(checked || indeterminate) && (
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{
                            scale: 1,
                            rotate: 0,
                        }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 25,
                            duration: 0.2
                        }}
                        className={cn(iconSizeClasses[size], colors.icon)}
                    >
                        {indeterminate ? (
                            <Minus className="w-full h-full" strokeWidth={3} />
                        ) : (
                            <Check className="w-full h-full" strokeWidth={3} />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hover Glow Effect */}
            {hoverEffect && isHovered && !disabled && (
                <motion.div
                    className={cn(
                        "absolute inset-0 rounded-lg opacity-20",
                        indeterminate ? "bg-amber-400" : checked ? "bg-blue-400" : "bg-slate-400"
                    )}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.2, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                />
            )}

            {/* Selection State Indicator */}
            {(checked || indeterminate) && (
                <motion.div
                    className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-500/20 via-transparent to-blue-500/20 blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                />
            )}
        </motion.button>
    );
} 