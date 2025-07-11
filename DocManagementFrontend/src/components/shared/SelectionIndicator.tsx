import React from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    FileText,
    Eye,
    EyeOff,
    RotateCcw,
    CheckSquare,
    Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BulkSelectionState } from '@/hooks/useBulkSelection';

interface SelectionIndicatorProps<T> {
    selectionState: BulkSelectionState<T>;
    totalItems: number;
    currentPageSize: number;
    currentPage: number;
    onSelectCurrentPage: () => void;
    onDeselectCurrentPage: () => void;
    onSelectAllPages: () => void;
    onDeselectAll: () => void;
    onInvertCurrentPage: () => void;
    compact?: boolean;
    className?: string;
}

export function SelectionIndicator<T>({
    selectionState,
    totalItems,
    currentPageSize,
    currentPage,
    onSelectCurrentPage,
    onDeselectCurrentPage,
    onSelectAllPages,
    onDeselectAll,
    onInvertCurrentPage,
    compact = false,
    className,
}: SelectionIndicatorProps<T>) {
    const {
        selectedCount,
        currentPageSelectedCount,
        isCurrentPageFullySelected,
        isAllDataFullySelected,
        isPartialSelection,
        selectionMode,
    } = selectionState;

    if (selectedCount === 0) return null;

    const getSelectionPercentage = () => {
        return Math.round((selectedCount / totalItems) * 100);
    };

    const getCurrentPagePercentage = () => {
        return Math.round((currentPageSelectedCount / currentPageSize) * 100);
    };

    if (compact) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 bg-blue-800/30 rounded-lg border border-blue-700/50 backdrop-blur-sm",
                    className
                )}
            >
                <div className="flex items-center gap-1.5">
                    {isAllDataFullySelected ? (
                        <CheckSquare className="h-3.5 w-3.5 text-green-400" />
                    ) : isPartialSelection ? (
                        <div className="h-3.5 w-3.5 bg-yellow-500 rounded-sm flex items-center justify-center">
                            <div className="h-1 w-2.5 bg-white rounded" />
                        </div>
                    ) : (
                        <CheckSquare className="h-3.5 w-3.5 text-blue-400" />
                    )}
                    <span className="text-xs font-medium text-blue-100">
                        {selectedCount}
                    </span>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDeselectAll}
                    className="h-5 w-5 p-0 text-blue-400 hover:text-blue-200 hover:bg-blue-800/40"
                >
                    <Square className="h-3 w-3" />
                </Button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
                "bg-gradient-to-r from-blue-900/40 via-blue-800/40 to-blue-900/40 border border-blue-700/50 rounded-xl p-4 backdrop-blur-sm",
                className
            )}
        >
            {/* Main Selection Info */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        {isAllDataFullySelected ? (
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-green-400" />
                                <Badge className="bg-green-800/60 text-green-200 text-xs">
                                    All Selected
                                </Badge>
                            </div>
                        ) : isCurrentPageFullySelected && selectedCount === currentPageSize ? (
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-400" />
                                <Badge className="bg-blue-800/60 text-blue-200 text-xs">
                                    Page Selected
                                </Badge>
                            </div>
                        ) : isPartialSelection ? (
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 bg-yellow-600 rounded-md flex items-center justify-center">
                                    <div className="h-1.5 w-3 bg-white rounded" />
                                </div>
                                <Badge className="bg-yellow-800/60 text-yellow-200 text-xs">
                                    Partial
                                </Badge>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <CheckSquare className="h-5 w-5 text-blue-400" />
                                <Badge className="bg-blue-800/60 text-blue-200 text-xs">
                                    Selected
                                </Badge>
                            </div>
                        )}
                    </div>

                    <div className="text-blue-100">
                        <span className="font-semibold text-lg">{selectedCount}</span>
                        <span className="text-blue-300 ml-1">
                            of {totalItems} items ({getSelectionPercentage()}%)
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onInvertCurrentPage}
                        className="text-blue-300 hover:text-blue-100 hover:bg-blue-800/40 h-8 px-2"
                    >
                        <RotateCcw className="h-3.5 w-3.5 mr-1" />
                        Invert
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDeselectAll}
                        className="text-red-300 hover:text-red-100 hover:bg-red-800/40 h-8 px-2"
                    >
                        <Square className="h-3.5 w-3.5 mr-1" />
                        Clear
                    </Button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
                <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${getSelectionPercentage()}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={cn(
                            "h-full rounded-full transition-colors duration-200",
                            isAllDataFullySelected
                                ? "bg-gradient-to-r from-green-500 to-green-400"
                                : isCurrentPageFullySelected
                                    ? "bg-gradient-to-r from-blue-500 to-blue-400"
                                    : "bg-gradient-to-r from-yellow-500 to-yellow-400"
                        )}
                    />
                </div>
            </div>

            {/* Page-specific info */}
            {selectedCount !== totalItems && (
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-blue-300">
                        <Eye className="h-4 w-4" />
                        <span>
                            Page {currentPage}: {currentPageSelectedCount} of {currentPageSize} selected
                            ({getCurrentPagePercentage()}%)
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {!isCurrentPageFullySelected && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onSelectCurrentPage}
                                className="text-blue-300 hover:text-blue-100 hover:bg-blue-800/40 h-6 text-xs px-2"
                            >
                                <CheckSquare className="h-3 w-3 mr-1" />
                                Select Page
                            </Button>
                        )}

                        {currentPageSelectedCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDeselectCurrentPage}
                                className="text-blue-300 hover:text-blue-100 hover:bg-blue-800/40 h-6 text-xs px-2"
                            >
                                <EyeOff className="h-3 w-3 mr-1" />
                                Deselect Page
                            </Button>
                        )}

                        {!isAllDataFullySelected && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onSelectAllPages}
                                className="text-green-300 hover:text-green-100 hover:bg-green-800/40 h-6 text-xs px-2"
                            >
                                <Users className="h-3 w-3 mr-1" />
                                Select All ({totalItems})
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
} 