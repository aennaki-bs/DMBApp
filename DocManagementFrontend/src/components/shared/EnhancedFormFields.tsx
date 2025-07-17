import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Eye,
    EyeOff,
    Check,
    X,
    AlertCircle,
    Info,
    Calendar,
    ChevronDown,
    Search,
    Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Base props for all enhanced form fields
interface BaseFieldProps {
    label?: string;
    description?: string;
    error?: string;
    success?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    id?: string;
}

// Enhanced Input Field
interface EnhancedInputProps extends BaseFieldProps {
    type?: 'text' | 'email' | 'tel' | 'url' | 'search';
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    maxLength?: number;
    autoComplete?: string;
    isValidating?: boolean;
    validationMessage?: string;
    showCharCount?: boolean;
}

export const EnhancedInput: React.FC<EnhancedInputProps> = ({
    label,
    description,
    error,
    success,
    required,
    disabled,
    className,
    id,
    type = 'text',
    value,
    onChange,
    placeholder,
    icon,
    rightIcon,
    maxLength,
    autoComplete,
    isValidating,
    validationMessage,
    showCharCount,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const fieldId = id || `enhanced-input-${Math.random().toString(36).substr(2, 9)}`;

    const getFieldStatus = () => {
        if (error) return 'error';
        if (success) return 'success';
        if (isValidating) return 'validating';
        return 'default';
    };

    const status = getFieldStatus();

    const getStatusColors = () => {
        switch (status) {
            case 'error':
                return {
                    border: 'border-red-500/50 focus-within:border-red-500',
                    bg: 'bg-red-500/5',
                    text: 'text-red-400',
                    icon: 'text-red-400'
                };
            case 'success':
                return {
                    border: 'border-emerald-500/50 focus-within:border-emerald-500',
                    bg: 'bg-emerald-500/5',
                    text: 'text-emerald-400',
                    icon: 'text-emerald-400'
                };
            case 'validating':
                return {
                    border: 'border-blue-500/50 focus-within:border-blue-500',
                    bg: 'bg-blue-500/5',
                    text: 'text-blue-400',
                    icon: 'text-blue-400'
                };
            default:
                return {
                    border: 'border-slate-600 focus-within:border-blue-500',
                    bg: 'bg-slate-800/50',
                    text: 'text-slate-300',
                    icon: 'text-slate-400'
                };
        }
    };

    const colors = getStatusColors();

    return (
        <motion.div
            className={cn('space-y-2', className)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            {/* Label */}
            {label && (
                <motion.label
                    htmlFor={fieldId}
                    className={cn(
                        'block text-sm font-medium transition-colors',
                        colors.text,
                        disabled && 'opacity-50'
                    )}
                    animate={{
                        scale: isFocused ? 1.02 : 1,
                    }}
                    transition={{ duration: 0.15 }}
                >
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </motion.label>
            )}

            {/* Description */}
            {description && (
                <motion.p
                    className="text-xs text-slate-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    {description}
                </motion.p>
            )}

            {/* Input wrapper */}
            <motion.div
                className={cn(
                    'relative rounded-lg border transition-all duration-200',
                    colors.border,
                    colors.bg,
                    isFocused && 'ring-2 ring-blue-500/20',
                    disabled && 'opacity-50 cursor-not-allowed'
                )}
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.15 }}
            >
                {/* Left icon */}
                {icon && (
                    <div className={cn('absolute left-3 top-1/2 -translate-y-1/2', colors.icon)}>
                        {icon}
                    </div>
                )}

                {/* Input */}
                <Input
                    ref={inputRef}
                    id={fieldId}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    disabled={disabled}
                    maxLength={maxLength}
                    autoComplete={autoComplete}
                    className={cn(
                        'border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0',
                        'text-slate-200 placeholder:text-slate-500',
                        icon && 'pl-10',
                        (rightIcon || isValidating || status === 'success' || status === 'error') && 'pr-10',
                        showCharCount && maxLength && 'pr-16'
                    )}
                    {...props}
                />

                {/* Right side icons/indicators */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {/* Validation indicator */}
                    <AnimatePresence>
                        {isValidating && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                            >
                                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                            </motion.div>
                        )}

                        {status === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                            >
                                <Check className="w-4 h-4 text-emerald-400" />
                            </motion.div>
                        )}

                        {status === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                            >
                                <AlertCircle className="w-4 h-4 text-red-400" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Custom right icon */}
                    {rightIcon && (
                        <div className={colors.icon}>
                            {rightIcon}
                        </div>
                    )}
                </div>

                {/* Character count */}
                {showCharCount && maxLength && (
                    <div className="absolute right-3 bottom-1 text-xs text-slate-500">
                        {value.length}/{maxLength}
                    </div>
                )}
            </motion.div>

            {/* Messages */}
            <AnimatePresence>
                {(error || success || validationMessage) && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-2 text-xs"
                    >
                        {error && (
                            <>
                                <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                                <span className="text-red-400">{error}</span>
                            </>
                        )}
                        {success && (
                            <>
                                <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                <span className="text-emerald-400">{success}</span>
                            </>
                        )}
                        {validationMessage && !error && !success && (
                            <>
                                <Info className="w-3 h-3 text-blue-400 flex-shrink-0" />
                                <span className="text-blue-400">{validationMessage}</span>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Enhanced Password Field
interface EnhancedPasswordProps extends Omit<EnhancedInputProps, 'type' | 'rightIcon'> {
    showStrengthIndicator?: boolean;
    strengthScore?: number;
    strengthText?: string;
}

export const EnhancedPassword: React.FC<EnhancedPasswordProps> = ({
    showStrengthIndicator,
    strengthScore = 0,
    strengthText,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const getStrengthColor = () => {
        if (strengthScore >= 4) return 'text-emerald-400 bg-emerald-500';
        if (strengthScore >= 3) return 'text-blue-400 bg-blue-500';
        if (strengthScore >= 2) return 'text-yellow-400 bg-yellow-500';
        return 'text-red-400 bg-red-500';
    };

    return (
        <div className="space-y-3">
            <EnhancedInput
                {...props}
                type={showPassword ? 'text' : 'password'}
                rightIcon={
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="h-auto p-0 text-slate-400 hover:text-slate-300"
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <Eye className="w-4 h-4" />
                        )}
                    </Button>
                }
            />

            {/* Password strength indicator */}
            {showStrengthIndicator && props.value && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                >
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">Strength:</span>
                        <span className={getStrengthColor().split(' ')[0]}>
                            {strengthText || 'Weak'}
                        </span>
                    </div>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                            <motion.div
                                key={level}
                                className={cn(
                                    'h-2 flex-1 rounded-full transition-colors duration-300',
                                    level <= strengthScore
                                        ? getStrengthColor().split(' ')[1]
                                        : 'bg-slate-700'
                                )}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: level * 0.1 }}
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

// Enhanced Textarea
interface EnhancedTextareaProps extends BaseFieldProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    maxLength?: number;
    showCharCount?: boolean;
    autoResize?: boolean;
}

export const EnhancedTextarea: React.FC<EnhancedTextareaProps> = ({
    label,
    description,
    error,
    success,
    required,
    disabled,
    className,
    id,
    value,
    onChange,
    placeholder,
    rows = 4,
    maxLength,
    showCharCount,
    autoResize,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const fieldId = id || `enhanced-textarea-${Math.random().toString(36).substr(2, 9)}`;

    useEffect(() => {
        if (autoResize && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [value, autoResize]);

    const getFieldStatus = () => {
        if (error) return 'error';
        if (success) return 'success';
        return 'default';
    };

    const status = getFieldStatus();

    const getStatusColors = () => {
        switch (status) {
            case 'error':
                return {
                    border: 'border-red-500/50 focus-within:border-red-500',
                    bg: 'bg-red-500/5',
                    text: 'text-red-400'
                };
            case 'success':
                return {
                    border: 'border-emerald-500/50 focus-within:border-emerald-500',
                    bg: 'bg-emerald-500/5',
                    text: 'text-emerald-400'
                };
            default:
                return {
                    border: 'border-slate-600 focus-within:border-blue-500',
                    bg: 'bg-slate-800/50',
                    text: 'text-slate-300'
                };
        }
    };

    const colors = getStatusColors();

    return (
        <motion.div
            className={cn('space-y-2', className)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            {/* Label */}
            {label && (
                <motion.label
                    htmlFor={fieldId}
                    className={cn(
                        'block text-sm font-medium transition-colors',
                        colors.text,
                        disabled && 'opacity-50'
                    )}
                    animate={{
                        scale: isFocused ? 1.02 : 1,
                    }}
                    transition={{ duration: 0.15 }}
                >
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </motion.label>
            )}

            {/* Description */}
            {description && (
                <motion.p
                    className="text-xs text-slate-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    {description}
                </motion.p>
            )}

            {/* Textarea wrapper */}
            <motion.div
                className={cn(
                    'relative rounded-lg border transition-all duration-200',
                    colors.border,
                    colors.bg,
                    isFocused && 'ring-2 ring-blue-500/20',
                    disabled && 'opacity-50 cursor-not-allowed'
                )}
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.15 }}
            >
                <Textarea
                    ref={textareaRef}
                    id={fieldId}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={rows}
                    maxLength={maxLength}
                    className={cn(
                        'border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 resize-none',
                        'text-slate-200 placeholder:text-slate-500',
                        showCharCount && maxLength && 'pb-8'
                    )}
                    style={autoResize ? { overflow: 'hidden' } : {}}
                    {...props}
                />

                {/* Character count */}
                {showCharCount && maxLength && (
                    <div className="absolute right-3 bottom-3 text-xs text-slate-500">
                        {value.length}/{maxLength}
                    </div>
                )}
            </motion.div>

            {/* Messages */}
            <AnimatePresence>
                {(error || success) && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-2 text-xs"
                    >
                        {error && (
                            <>
                                <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                                <span className="text-red-400">{error}</span>
                            </>
                        )}
                        {success && (
                            <>
                                <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                <span className="text-emerald-400">{success}</span>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Enhanced Select Field
interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
    icon?: React.ReactNode;
}

interface EnhancedSelectProps extends BaseFieldProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    searchable?: boolean;
    loading?: boolean;
}

export const EnhancedSelect: React.FC<EnhancedSelectProps> = ({
    label,
    description,
    error,
    success,
    required,
    disabled,
    className,
    id,
    value,
    onChange,
    options,
    placeholder = 'Select an option...',
    searchable,
    loading,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const fieldId = id || `enhanced-select-${Math.random().toString(36).substr(2, 9)}`;

    const filteredOptions = searchable
        ? options.filter(option =>
            option.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : options;

    const selectedOption = options.find(option => option.value === value);

    const getFieldStatus = () => {
        if (error) return 'error';
        if (success) return 'success';
        return 'default';
    };

    const status = getFieldStatus();

    const getStatusColors = () => {
        switch (status) {
            case 'error':
                return {
                    border: 'border-red-500/50 focus-within:border-red-500',
                    bg: 'bg-red-500/5',
                    text: 'text-red-400'
                };
            case 'success':
                return {
                    border: 'border-emerald-500/50 focus-within:border-emerald-500',
                    bg: 'bg-emerald-500/5',
                    text: 'text-emerald-400'
                };
            default:
                return {
                    border: 'border-slate-600 focus-within:border-blue-500',
                    bg: 'bg-slate-800/50',
                    text: 'text-slate-300'
                };
        }
    };

    const colors = getStatusColors();

    return (
        <motion.div
            className={cn('space-y-2 relative', className)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            {/* Label */}
            {label && (
                <motion.label
                    htmlFor={fieldId}
                    className={cn(
                        'block text-sm font-medium transition-colors',
                        colors.text,
                        disabled && 'opacity-50'
                    )}
                    animate={{
                        scale: isFocused ? 1.02 : 1,
                    }}
                    transition={{ duration: 0.15 }}
                >
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </motion.label>
            )}

            {/* Description */}
            {description && (
                <motion.p
                    className="text-xs text-slate-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    {description}
                </motion.p>
            )}

            {/* Select trigger */}
            <motion.div
                className={cn(
                    'relative rounded-lg border transition-all duration-200 cursor-pointer',
                    colors.border,
                    colors.bg,
                    isFocused && 'ring-2 ring-blue-500/20',
                    disabled && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                whileTap={{ scale: 0.99 }}
            >
                <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-2">
                        {selectedOption?.icon}
                        <span className={cn(
                            selectedOption ? 'text-slate-200' : 'text-slate-500'
                        )}>
                            {selectedOption?.label || placeholder}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {loading && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
                        <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 z-50 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                    >
                        {searchable && (
                            <div className="p-2 border-b border-slate-700">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search options..."
                                        className="pl-10 bg-slate-900 border-slate-600 text-slate-200"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="py-1">
                            {filteredOptions.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-slate-400">
                                    No options found
                                </div>
                            ) : (
                                filteredOptions.map((option) => (
                                    <motion.div
                                        key={option.value}
                                        className={cn(
                                            'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors',
                                            'hover:bg-slate-700',
                                            option.value === value && 'bg-blue-600/20 text-blue-300',
                                            option.disabled && 'opacity-50 cursor-not-allowed'
                                        )}
                                        onClick={() => {
                                            if (!option.disabled) {
                                                onChange(option.value);
                                                setIsOpen(false);
                                                setSearchQuery('');
                                            }
                                        }}
                                        whileHover={{ x: option.disabled ? 0 : 4 }}
                                        transition={{ duration: 0.1 }}
                                    >
                                        {option.icon}
                                        <span className="text-slate-200">{option.label}</span>
                                        {option.value === value && (
                                            <Check className="w-4 h-4 ml-auto text-blue-400" />
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages */}
            <AnimatePresence>
                {(error || success) && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-2 text-xs"
                    >
                        {error && (
                            <>
                                <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                                <span className="text-red-400">{error}</span>
                            </>
                        )}
                        {success && (
                            <>
                                <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                <span className="text-emerald-400">{success}</span>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Click outside handler */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </motion.div>
    );
};

export default {
    EnhancedInput,
    EnhancedPassword,
    EnhancedTextarea,
    EnhancedSelect,
}; 