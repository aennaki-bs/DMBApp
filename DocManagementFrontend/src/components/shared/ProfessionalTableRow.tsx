import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MousePointer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfessionalCheckbox } from './ProfessionalCheckbox';

interface ProfessionalTableRowProps {
    children: React.ReactNode;
    isSelected: boolean;
    onSelect: () => void;
    disabled?: boolean;
    showCheckbox?: boolean;
    clickToSelect?: boolean;
    index: number;
    className?: string;
}

export function ProfessionalTableRow({
    children,
    isSelected,
    onSelect,
    disabled = false,
    showCheckbox = true,
    clickToSelect = true,
    index,
    className,
}: ProfessionalTableRowProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const handleRowClick = (e: React.MouseEvent) => {
        // Don't trigger row selection if clicking on interactive elements
        const target = e.target as HTMLElement;
        if (
            target.closest('button') ||
            target.closest('a') ||
            target.closest('input') ||
            target.closest('select') ||
            target.closest('[role="button"]') ||
            target.closest('.no-row-select')
        ) {
            return;
        }

        if (clickToSelect && !disabled) {
            onSelect();
        }
    };

    return (
        <motion.tr
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                delay: index * 0.02 // Stagger animation based on row index
            }}
            className={cn(
                "group relative border-b border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 ease-out",
                clickToSelect && !disabled && "cursor-pointer",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onClick={handleRowClick}
        >
            {/* Row Background */}
            <motion.div
                className={cn(
                    "absolute inset-0 pointer-events-none transition-all duration-300",
                    isSelected
                        ? "bg-gradient-to-r from-blue-50/80 via-blue-100/40 to-blue-50/80 dark:from-blue-900/20 dark:via-blue-800/10 dark:to-blue-900/20"
                        : isHovered
                            ? "bg-gradient-to-r from-slate-50/80 via-slate-100/40 to-slate-50/80 dark:from-slate-800/40 dark:via-slate-700/20 dark:to-slate-800/40"
                            : "bg-transparent"
                )}
                layoutId={`row-bg-${index}`}
            />

            {/* Selection Indicator */}
            <AnimatePresence>
                {isSelected && (
                    <motion.div
                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500"
                        initial={{ scaleY: 0, opacity: 0 }}
                        animate={{ scaleY: 1, opacity: 1 }}
                        exit={{ scaleY: 0, opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25,
                            duration: 0.3
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Hover Glow Effect */}
            <AnimatePresence>
                {(isHovered || isPressed) && !disabled && (
                    <motion.div
                        className={cn(
                            "absolute inset-0 pointer-events-none rounded-lg",
                            isPressed
                                ? "bg-blue-200/30 dark:bg-blue-800/30"
                                : "bg-slate-100/50 dark:bg-slate-700/30"
                        )}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            boxShadow: isPressed
                                ? "inset 0 2px 4px 0 rgba(59, 130, 246, 0.1)"
                                : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
                        }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </AnimatePresence>

            {/* Checkbox Cell */}
            {showCheckbox && (
                <td className="relative w-12 p-4">
                    <div className="flex items-center justify-center">
                        <ProfessionalCheckbox
                            checked={isSelected}
                            onCheckedChange={onSelect}
                            disabled={disabled}
                            size="md"
                            variant="row"
                            className="z-10"
                        />

                        {/* Selection Helper */}
                        {isHovered && !isSelected && !disabled && (
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="w-5 h-5 border-2 border-blue-300 dark:border-blue-600 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 flex items-center justify-center">
                                    <MousePointer className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                                </div>
                            </motion.div>
                        )}
                    </div>
                </td>
            )}

            {/* Content Cells */}
            {React.Children.map(children, (child, cellIndex) => {
                if (React.isValidElement(child) && child.type === 'td') {
                    return React.cloneElement(child, {
                        ...child.props,
                        className: cn(
                            "relative z-10 transition-all duration-300",
                            isSelected && "text-blue-900 dark:text-blue-100 font-medium",
                            child.props.className
                        ),
                        children: (
                            <motion.div
                                className="relative"
                                animate={{
                                    x: isSelected ? 2 : 0,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 25,
                                    duration: 0.2
                                }}
                            >
                                {child.props.children}

                                {/* Selected Content Highlight */}
                                {isSelected && (
                                    <motion.div
                                        className="absolute -inset-1 bg-blue-100/30 dark:bg-blue-800/20 rounded-md pointer-events-none"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                )}
                            </motion.div>
                        ),
                    });
                }
                return child;
            })}

            {/* Selection Count Badge (for multiple selections) */}
            <AnimatePresence>
                {isSelected && (
                    <motion.div
                        className="absolute top-2 right-2 z-20"
                        initial={{ opacity: 0, scale: 0, rotate: -180 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0, rotate: 180 }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 25,
                            duration: 0.3
                        }}
                    >
                        <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ripple Effect on Click */}
            {isPressed && clickToSelect && !disabled && (
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="absolute inset-0 bg-blue-400/20 rounded-lg"
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 1.02, opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                </motion.div>
            )}
        </motion.tr>
    );
} 