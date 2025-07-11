import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check,
    CheckSquare,
    Square,
    Minus,
    ChevronDown,
    Users,
    Eye,
    RotateCcw,
    Zap,
    MousePointer,
    Layers,
    Target
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

interface EnhancedBulkSelectionProps<T> {
    selectionState: BulkSelectionState<T>;
    onSelectCurrentPage: () => void;
    onDeselectCurrentPage: () => void;
    onSelectAllPages: () => void;
    onDeselectAll: () => void;
    onInvertCurrentPage: () => void;
    totalItems: number;
    currentPageSize: number;
    currentPage: number;
    className?: string;
}

export function EnhancedBulkSelection<T>({
    selectionState,
    onSelectCurrentPage,
    onDeselectCurrentPage,
    onSelectAllPages,
    onDeselectAll,
    onInvertCurrentPage,
    totalItems,
    currentPageSize,
    currentPage,
    className,
}: EnhancedBulkSelectionProps<T>) {
    const [isExpanded, setIsExpanded] = useState(false);

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
            return <Users className="h-4 w-4 text-emerald-400" />;
        } else if (isCurrentPageFullySelected) {
            return <CheckSquare className="h-4 w-4 text-blue-400" />;
        } else if (isPartialSelection) {
            return <Minus className="h-4 w-4 text-amber-400" />;
        } else {
            return <Target className="h-4 w-4 text-blue-400" />;
        }
    };

    const getSelectionText = () => {
        if (isAllDataFullySelected) {
            return `All ${totalItems} items selected`;
        } else if (isCurrentPageFullySelected && selectedCount === currentPageSize) {
            return `All ${currentPageSize} items on page ${currentPage} selected`;
        } else if (selectedCount > currentPageSize) {
            return `${selectedCount} items across ${Math.ceil(selectedCount / currentPageSize)} pages`;
        } else {
            return `${selectedCount} item${selectedCount !== 1 ? 's' : ''} selected`;
        }
    };

    const getProgressPercentage = () => {
        return Math.round((selectedCount / totalItems) * 100);
    };

    const getSelectionColor = () => {
        if (isAllDataFullySelected) return 'emerald';
        if (isCurrentPageFullySelected) return 'blue';
        if (isPartialSelection) return 'amber';
        return 'blue';
    };

    const color = getSelectionColor();
    const percentage = getProgressPercentage();

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    duration: 0.3
                }}
                className={cn(
                    "relative overflow-hidden rounded-2xl border border-blue-200/50 dark:border-blue-800/50 shadow-2xl backdrop-blur-xl",
                    "bg-gradient-to-br from-white/90 via-blue-50/30 to-white/90 dark:from-slate-900/90 dark:via-blue-950/30 dark:to-slate-900/90",
                    className
                )}
            >
                {/* Animated Background Gradient */}
                <motion.div
                    className={cn(
                        "absolute inset-0 opacity-20",
                        color === 'emerald' && "bg-gradient-to-r from-emerald-400/20 via-emerald-500/30 to-emerald-600/20",
                        color === 'blue' && "bg-gradient-to-r from-blue-400/20 via-blue-500/30 to-blue-600/20",
                        color === 'amber' && "bg-gradient-to-r from-amber-400/20 via-amber-500/30 to-amber-600/20"
                    )}
                    animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                <div className="relative z-10 p-4">
                    <div className="flex items-center justify-between">
                        {/* Left Side - Selection Status */}
                        <div className="flex items-center gap-4">
                            <motion.div
                                className="flex items-center gap-3"
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                                <motion.div
                                    className={cn(
                                        "flex items-center justify-center w-10 h-10 rounded-xl shadow-lg",
                                        color === 'emerald' && "bg-gradient-to-br from-emerald-500 to-emerald-600",
                                        color === 'blue' && "bg-gradient-to-br from-blue-500 to-blue-600",
                                        color === 'amber' && "bg-gradient-to-br from-amber-500 to-amber-600"
                                    )}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                >
                                    {getSelectionIcon()}
                                </motion.div>

                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            {getSelectionText()}
                                        </span>
                                        <Badge
                                            className={cn(
                                                "text-xs font-medium px-2 py-1 rounded-full shadow-sm",
                                                color === 'emerald' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
                                                color === 'blue' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                                                color === 'amber' && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                            )}
                                        >
                                            {percentage}%
                                        </Badge>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-48 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                                        <motion.div
                                            className={cn(
                                                "h-full rounded-full shadow-sm",
                                                color === 'emerald' && "bg-gradient-to-r from-emerald-400 to-emerald-500",
                                                color === 'blue' && "bg-gradient-to-r from-blue-400 to-blue-500",
                                                color === 'amber' && "bg-gradient-to-r from-amber-400 to-amber-500"
                                            )}
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

                            {/* Quick Actions */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onInvertCurrentPage}
                                    className="h-8 px-3 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
                                >
                                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                    Invert
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onDeselectAll}
                                    className="h-8 px-3 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                                >
                                    <Square className="h-3.5 w-3.5 mr-1" />
                                    Clear
                                </Button>
                            </div>
                        </div>

                        {/* Right Side - Advanced Controls */}
                        <div className="flex items-center gap-3">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-4 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-lg backdrop-blur-sm rounded-xl transition-all duration-200"
                                    >
                                        <Layers className="h-4 w-4 mr-2" />
                                        Quick Select
                                        <ChevronDown className="h-3 w-3 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-2xl rounded-xl"
                                    align="end"
                                >
                                    <DropdownMenuLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2">
                                        Selection Options
                                    </DropdownMenuLabel>

                                    <DropdownMenuItem
                                        onClick={onSelectCurrentPage}
                                        disabled={isCurrentPageFullySelected}
                                        className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer rounded-lg mx-1 transition-all duration-150"
                                    >
                                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                            <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                Select Current Page
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                {currentPageSize} items on page {currentPage}
                                            </div>
                                        </div>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={onSelectAllPages}
                                        disabled={isAllDataFullySelected}
                                        className="flex items-center gap-3 px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer rounded-lg mx-1 transition-all duration-150"
                                    >
                                        <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                            <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                Select All Items
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                All {totalItems} items across all pages
                                            </div>
                                        </div>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator className="mx-2 my-1 bg-slate-200 dark:bg-slate-700" />

                                    <DropdownMenuItem
                                        onClick={onInvertCurrentPage}
                                        className="flex items-center gap-3 px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 cursor-pointer rounded-lg mx-1 transition-all duration-150"
                                    >
                                        <div className="flex items-center justify-center w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                            <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                Invert Selection
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                Toggle all items on current page
                                            </div>
                                        </div>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={onDeselectCurrentPage}
                                        disabled={currentPageSelectedCount === 0}
                                        className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer rounded-lg mx-1 transition-all duration-150"
                                    >
                                        <div className="flex items-center justify-center w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                            <Square className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                Deselect Current Page
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                Clear selection on this page
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
                            >
                                <motion.div
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                >
                                    <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                </motion.div>
                            </Button>
                        </div>
                    </div>

                    {/* Expandable Details */}
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
                                className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50"
                            >
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="flex flex-col items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                        <Eye className="h-5 w-5 text-blue-500 mb-1" />
                                        <span className="font-semibold text-blue-700 dark:text-blue-300">{currentPageSelectedCount}</span>
                                        <span className="text-xs text-blue-600 dark:text-blue-400">Current Page</span>
                                    </div>
                                    <div className="flex flex-col items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                        <Users className="h-5 w-5 text-emerald-500 mb-1" />
                                        <span className="font-semibold text-emerald-700 dark:text-emerald-300">{selectedCount}</span>
                                        <span className="text-xs text-emerald-600 dark:text-emerald-400">Total Selected</span>
                                    </div>
                                    <div className="flex flex-col items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                        <Target className="h-5 w-5 text-slate-500 mb-1" />
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">{totalItems}</span>
                                        <span className="text-xs text-slate-600 dark:text-slate-400">Available</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Subtle Border Animation */}
                <motion.div
                    className={cn(
                        "absolute inset-0 rounded-2xl opacity-50",
                        color === 'emerald' && "border border-emerald-300 dark:border-emerald-700",
                        color === 'blue' && "border border-blue-300 dark:border-blue-700",
                        color === 'amber' && "border border-amber-300 dark:border-amber-700"
                    )}
                    animate={{
                        opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </motion.div>
        </AnimatePresence>
    );
} 