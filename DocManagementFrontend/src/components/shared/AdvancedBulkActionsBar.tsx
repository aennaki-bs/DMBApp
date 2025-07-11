import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check,
    CheckSquare,
    Square,
    Minus,
    ChevronDown,
    Users,
    Eye,
    RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BulkSelectionState } from '@/hooks/useBulkSelection';

export interface BulkAction {
    id: string;
    label: string;
    icon?: React.ReactNode;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
    onClick: (selectedItems: any[]) => void;
    requiresConfirmation?: boolean;
}

interface AdvancedBulkActionsBarProps<T> {
    selectionState: BulkSelectionState<T>;
    actions: BulkAction[];
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

export function AdvancedBulkActionsBar<T>({
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
}: AdvancedBulkActionsBarProps<T>) {
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
            return <CheckSquare className="h-4 w-4 text-blue-400" />;
        } else if (isCurrentPageFullySelected) {
            return <CheckSquare className="h-4 w-4 text-blue-400" />;
        } else if (isPartialSelection) {
            return <Minus className="h-4 w-4 text-yellow-400" />;
        } else {
            return <Square className="h-4 w-4 text-blue-400" />;
        }
    };

    const getSelectionText = () => {
        if (isAllDataFullySelected) {
            return `All ${totalItems} items selected`;
        } else if (isCurrentPageFullySelected && selectedCount === currentPageSize) {
            return `All ${currentPageSize} items on this page selected`;
        } else if (selectedCount > currentPageSize) {
            return `${selectedCount} items selected across multiple pages`;
        } else {
            return `${selectedCount} item${selectedCount !== 1 ? 's' : ''} selected`;
        }
    };

    const getSelectionBadgeColor = () => {
        if (isAllDataFullySelected) return 'bg-green-800/60 text-green-200';
        if (isCurrentPageFullySelected) return 'bg-blue-800/60 text-blue-200';
        if (isPartialSelection) return 'bg-yellow-800/60 text-yellow-200';
        return 'bg-blue-800/60 text-blue-200';
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                    "px-6 py-4 bg-gradient-to-r from-blue-800/40 via-blue-900/40 to-blue-800/40 border-b border-blue-900/30 backdrop-blur-sm",
                    className
                )}
            >
                <div className="flex items-center justify-between">
                    {/* Selection Info */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            {getSelectionIcon()}
                            <div className="flex items-center gap-2">
                                <span className="text-blue-100 font-medium">
                                    {getSelectionText()}
                                </span>
                                <Badge className={cn("text-xs", getSelectionBadgeColor())}>
                                    {selectionMode === 'all' ? 'All Pages' :
                                        selectionMode === 'page' ? 'Current Page' : 'Mixed'}
                                </Badge>
                            </div>
                        </div>

                        {/* Advanced Selection Controls */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-300 hover:text-blue-100 hover:bg-blue-800/30 transition-all duration-200 h-8 px-2"
                                >
                                    <ChevronDown className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56 bg-slate-800/95 text-blue-100 border border-blue-900/50 backdrop-blur-md"
                                align="start"
                            >
                                <DropdownMenuItem
                                    onClick={onSelectCurrentPage}
                                    disabled={isCurrentPageFullySelected}
                                    className="hover:bg-blue-800/40 focus:bg-blue-800/40 cursor-pointer"
                                >
                                    <CheckSquare className="mr-2 h-4 w-4" />
                                    Select All on This Page ({currentPageSize})
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={onSelectAllPages}
                                    disabled={isAllDataFullySelected}
                                    className="hover:bg-blue-800/40 focus:bg-blue-800/40 cursor-pointer"
                                >
                                    <Users className="mr-2 h-4 w-4" />
                                    Select All Items ({totalItems})
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="bg-blue-900/50" />

                                <DropdownMenuItem
                                    onClick={onInvertCurrentPage}
                                    className="hover:bg-blue-800/40 focus:bg-blue-800/40 cursor-pointer"
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Invert Selection on Page
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={onDeselectCurrentPage}
                                    disabled={currentPageSelectedCount === 0}
                                    className="hover:bg-blue-800/40 focus:bg-blue-800/40 cursor-pointer"
                                >
                                    <Square className="mr-2 h-4 w-4" />
                                    Deselect All on This Page
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={onDeselectAll}
                                    className="hover:bg-red-800/40 focus:bg-red-800/40 cursor-pointer text-red-300"
                                >
                                    <Square className="mr-2 h-4 w-4" />
                                    Deselect All Items
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        {actions.map((action) => (
                            <Button
                                key={action.id}
                                variant={action.variant || "outline"}
                                size="sm"
                                onClick={() => action.onClick(getSelectedObjects())}
                                className={cn(
                                    "transition-all duration-200 shadow-sm font-medium",
                                    action.variant === "destructive"
                                        ? "bg-red-900/50 text-red-200 border-red-800/60 hover:bg-red-800/60 hover:text-red-100 hover:border-red-700/80 hover:shadow-md"
                                        : "bg-blue-900/50 text-blue-200 border-blue-800/60 hover:bg-blue-800/60 hover:text-blue-100 hover:border-blue-700/80 hover:shadow-md"
                                )}
                            >
                                {action.icon}
                                <span className="ml-1">{action.label}</span>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Selection Summary for Multiple Pages */}
                {selectedCount > currentPageSize && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className="mt-3 pt-3 border-t border-blue-900/30"
                    >
                        <div className="flex items-center gap-2 text-sm text-blue-300">
                            <Eye className="h-3 w-3" />
                            <span>
                                {currentPageSelectedCount} of {currentPageSize} items on page {currentPage} selected
                                {selectedCount > currentPageSelectedCount &&
                                    ` • ${selectedCount - currentPageSelectedCount} additional items selected on other pages`
                                }
                            </span>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
} 