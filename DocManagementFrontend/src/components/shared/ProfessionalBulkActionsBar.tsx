import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check,
    ChevronDown,
    Users,
    Eye,
    RotateCcw,
    Zap,
    X,
    Settings,
    Filter,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BulkSelectionState } from '@/hooks/useBulkSelection';

export interface ProfessionalBulkAction {
    id: string;
    label: string;
    icon?: React.ReactNode;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
    onClick: (selectedItems: any[]) => void;
    requiresConfirmation?: boolean;
    shortcut?: string;
}

interface ProfessionalBulkActionsBarProps<T> {
    selectionState: BulkSelectionState<T>;
    actions: ProfessionalBulkAction[];
    onSelectCurrentPage: () => void;
    onDeselectCurrentPage: () => void;
    onSelectAllPages: () => void;
    onDeselectAll: () => void;
    onInvertCurrentPage: () => void;
    getSelectedObjects: () => any[];
    totalItems: number;
    currentPageSize: number;
    currentPage: number;
    className?: string;
}

export function ProfessionalBulkActionsBar<T>({
    selectionState,
    actions,
    onSelectCurrentPage,
    onDeselectCurrentPage,
    onSelectAllPages,
    onDeselectAll,
    onInvertCurrentPage,
    getSelectedObjects,
    totalItems,
    currentPageSize,
    currentPage,
    className,
}: ProfessionalBulkActionsBarProps<T>) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [hoveredAction, setHoveredAction] = useState<string | null>(null);

    const {
        selectedCount,
        currentPageSelectedCount,
        isCurrentPageFullySelected,
        isAllDataFullySelected,
        isPartialSelection,
        selectionMode,
    } = selectionState;

    if (selectedCount === 0) return null;

    const getSelectionIcon = () => {
        if (isAllDataFullySelected) {
            return <Users className="h-4 w-4" />;
        } else if (isCurrentPageFullySelected) {
            return <Check className="h-4 w-4" />;
        } else if (isPartialSelection) {
            return <Filter className="h-4 w-4" />;
        } else {
            return <Eye className="h-4 w-4" />;
        }
    };

    const getSelectionText = () => {
        if (isAllDataFullySelected) {
            return `All ${totalItems} items selected`;
        } else if (isCurrentPageFullySelected && selectedCount === currentPageSize) {
            return `Page ${currentPage} selected (${currentPageSize} items)`;
        } else if (selectedCount > currentPageSize) {
            return `${selectedCount} items across multiple pages`;
        } else {
            return `${selectedCount} item${selectedCount !== 1 ? 's' : ''} selected`;
        }
    };

    const getProgressPercentage = () => {
        return Math.round((selectedCount / totalItems) * 100);
    };

    const percentage = getProgressPercentage();

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 100, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.9 }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    duration: 0.5
                }}
                className={cn(
                    "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-5xl w-[calc(100%-2rem)]",
                    className
                )}
            >
                <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 backdrop-blur-xl shadow-2xl bg-gradient-to-r from-white/95 via-slate-50/95 to-white/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95">
                    {/* Animated Background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20"
                        animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    <div className="relative z-10 p-4">
                        <div className="flex items-center justify-between">
                            {/* Left Section - Selection Info */}
                            <div className="flex items-center gap-4">
                                <motion.div
                                    className="flex items-center gap-3"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                >
                                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg text-white">
                                        <motion.div
                                            animate={{ rotate: isAllDataFullySelected ? 360 : 0 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            {getSelectionIcon()}
                                        </motion.div>
                                    </div>

                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-slate-800 dark:text-white">
                                                {getSelectionText()}
                                            </span>
                                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                                                {percentage}%
                                            </Badge>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-40 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 200,
                                                    damping: 20,
                                                    duration: 0.8
                                                }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Quick Selection Tools */}
                                <div className="flex items-center gap-2 border-l border-white/20 dark:border-slate-700 pl-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-3 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200"
                                            >
                                                <Settings className="h-3.5 w-3.5 mr-1" />
                                                Quick
                                                <ChevronDown className="h-3 w-3 ml-1" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            className="w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-700 shadow-2xl rounded-xl"
                                            align="start"
                                        >
                                            <DropdownMenuLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Selection Tools
                                            </DropdownMenuLabel>

                                            <DropdownMenuItem
                                                onClick={onSelectCurrentPage}
                                                disabled={isCurrentPageFullySelected}
                                                className="flex items-center gap-3 cursor-pointer"
                                            >
                                                <Eye className="h-4 w-4 text-blue-500" />
                                                <div>
                                                    <div className="font-medium">Select Page</div>
                                                    <div className="text-xs text-slate-500">{currentPageSize} items</div>
                                                </div>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={onSelectAllPages}
                                                disabled={isAllDataFullySelected}
                                                className="flex items-center gap-3 cursor-pointer"
                                            >
                                                <Users className="h-4 w-4 text-emerald-500" />
                                                <div>
                                                    <div className="font-medium">Select All</div>
                                                    <div className="text-xs text-slate-500">{totalItems} total items</div>
                                                </div>
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator />

                                            <DropdownMenuItem
                                                onClick={onInvertCurrentPage}
                                                className="flex items-center gap-3 cursor-pointer"
                                            >
                                                <RotateCcw className="h-4 w-4 text-amber-500" />
                                                <div>
                                                    <div className="font-medium">Invert</div>
                                                    <div className="text-xs text-slate-500">Toggle selection</div>
                                                </div>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onDeselectAll}
                                        className="h-8 px-3 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                                    >
                                        <X className="h-3.5 w-3.5 mr-1" />
                                        Clear
                                    </Button>
                                </div>
                            </div>

                            {/* Right Section - Action Buttons */}
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    {actions.map((action, index) => (
                                        <motion.div
                                            key={action.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            onMouseEnter={() => setHoveredAction(action.id)}
                                            onMouseLeave={() => setHoveredAction(null)}
                                        >
                                            <Button
                                                variant={action.variant || "default"}
                                                size="sm"
                                                onClick={() => action.onClick(getSelectedObjects())}
                                                className={cn(
                                                    "h-9 px-4 font-medium shadow-lg transition-all duration-200 relative overflow-hidden",
                                                    action.variant === "destructive"
                                                        ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-red-500 shadow-red-500/25"
                                                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-blue-500 shadow-blue-500/25",
                                                    hoveredAction === action.id && "scale-105 shadow-xl"
                                                )}
                                            >
                                                {/* Shimmer Effect */}
                                                {hoveredAction === action.id && (
                                                    <motion.div
                                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                                        initial={{ x: "-100%" }}
                                                        animate={{ x: "100%" }}
                                                        transition={{ duration: 0.6, ease: "easeInOut" }}
                                                    />
                                                )}

                                                <div className="relative flex items-center gap-2">
                                                    {action.icon}
                                                    {action.label}
                                                    {action.shortcut && (
                                                        <Badge variant="secondary" className="ml-2 text-xs">
                                                            {action.shortcut}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </Button>
                                        </motion.div>
                                    ))}
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="h-9 w-9 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200"
                                >
                                    <motion.div
                                        animate={{ rotate: isExpanded ? 180 : 0 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                    </motion.div>
                                </Button>
                            </div>
                        </div>

                        {/* Expandable Stats */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, y: -10 }}
                                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -10 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 20,
                                        duration: 0.3
                                    }}
                                    className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700"
                                >
                                    <div className="grid grid-cols-4 gap-4 text-sm">
                                        <div className="flex flex-col items-center p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                                            <Eye className="h-5 w-5 text-blue-500 mb-1" />
                                            <span className="font-semibold text-slate-800 dark:text-white">{currentPageSelectedCount}</span>
                                            <span className="text-xs text-slate-600 dark:text-slate-400">This Page</span>
                                        </div>
                                        <div className="flex flex-col items-center p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                                            <Check className="h-5 w-5 text-emerald-500 mb-1" />
                                            <span className="font-semibold text-slate-800 dark:text-white">{selectedCount}</span>
                                            <span className="text-xs text-slate-600 dark:text-slate-400">Selected</span>
                                        </div>
                                        <div className="flex flex-col items-center p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                                            <Users className="h-5 w-5 text-purple-500 mb-1" />
                                            <span className="font-semibold text-slate-800 dark:text-white">{totalItems}</span>
                                            <span className="text-xs text-slate-600 dark:text-slate-400">Total</span>
                                        </div>
                                        <div className="flex flex-col items-center p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                                            <Zap className="h-5 w-5 text-amber-500 mb-1" />
                                            <span className="font-semibold text-slate-800 dark:text-white">{percentage}%</span>
                                            <span className="text-xs text-slate-600 dark:text-slate-400">Complete</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Glowing Border Animation */}
                    <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-blue-400/30 dark:border-blue-500/50"
                        animate={{
                            opacity: [0.3, 0.8, 0.3],
                            scale: [1, 1.02, 1],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>
            </motion.div>
        </AnimatePresence>
    );
} 