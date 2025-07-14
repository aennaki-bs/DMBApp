import React from "react";
import { SubType } from "@/models/subtype";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Lock, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SubTypesTableRowProps {
    subType: SubType;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
    index?: number;
    isRestricted?: boolean; // New prop to indicate if the parent document type is in use
    documentCount?: number; // Number of documents using this series
}

export function SubTypesTableRow({
    subType,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
    index = 0,
    isRestricted = false,
    documentCount = 0,
}: SubTypesTableRowProps) {
    const formatDate = (date: Date | string) => {
        try {
            return format(new Date(date), "MMM dd, yyyy");
        } catch {
            return "Invalid date";
        }
    };

    const handleSelect = () => {
        if (!isRestricted) {
            onSelect();
        }
    };

    const renderStatusBadge = (isActive: boolean) => {
        return (
            <Badge
                variant={isActive ? "default" : "secondary"}
                className={cn(
                    "font-medium shadow-sm",
                    isActive
                        ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30"
                        : "bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600/50"
                )}
            >
                {isActive ? "Active" : "Inactive"}
            </Badge>
        );
    };

    // Generate tooltip message based on restriction reason
    const getTooltipMessage = () => {
        if (isRestricted && documentCount > 0) {
            return `Series is protected - used by ${documentCount} document${documentCount === 1 ? '' : 's'}`;
        }
        return "Series locked - Document type is in use";
    };

    return (
        <TableRow
            className={cn(
                "border-slate-200/50 dark:border-slate-700/50 transition-all duration-200 group",
                isRestricted
                    ? "bg-slate-50/50 dark:bg-slate-800/10 hover:bg-slate-100/50 dark:hover:bg-slate-800/20 cursor-default"
                    : isSelected
                        ? "bg-blue-50/80 dark:bg-blue-900/20 border-l-2 border-l-blue-500 shadow-sm ring-1 ring-blue-200/50 dark:ring-blue-800/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer hover:shadow-sm"
            )}
            onClick={(e) => {
                // Don't allow selection of restricted types
                if (isRestricted) return;

                // Don't trigger row selection if clicking on interactive elements
                const target = e.target as HTMLElement;
                if (
                    target.closest('button') ||
                    target.closest('input') ||
                    target.closest('select') ||
                    target.closest('[role="button"]')
                ) {
                    return;
                }
                handleSelect();
            }}
        >
            {/* Selection Checkbox */}
            <TableCell className="w-[48px] text-center">
                <div className="flex items-center justify-center">
                    {isRestricted ? (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center justify-center w-6 h-6">
                                        <Lock className="h-4 w-4 text-slate-400" />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{getTooltipMessage()}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ) : (
                        <ProfessionalCheckbox
                            checked={isSelected}
                            onCheckedChange={handleSelect}
                            size="md"
                            variant="row"
                        />
                    )}
                </div>
            </TableCell>

            {/* Series Code */}
            <TableCell className="w-[200px] font-mono font-medium text-foreground">
                <div className="flex items-center gap-2">
                    {subType.subTypeKey}
                    {isRestricted && (
                        <Lock className="h-3 w-3 text-slate-400" />
                    )}
                </div>
            </TableCell>

            {/* Start Date */}
            <TableCell className="w-[200px] text-center text-muted-foreground">
                {formatDate(subType.startDate)}
            </TableCell>

            {/* End Date */}
            <TableCell className="w-[200px] text-center text-muted-foreground">
                {formatDate(subType.endDate)}
            </TableCell>

            {/* Status */}
            <TableCell className="w-[150px] text-center">
                {renderStatusBadge(subType.isActive)}
            </TableCell>

            {/* Actions */}
            <TableCell className="w-[100px] text-center">
                <div className="flex items-center justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 opacity-60 hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="bg-background/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-2xl"
                        >
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isRestricted) onEdit();
                                }}
                                className={cn(
                                    "rounded-lg",
                                    isRestricted
                                        ? "opacity-50 cursor-not-allowed text-slate-400"
                                        : "cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                                )}
                                disabled={isRestricted}
                            >
                                <Edit2 className="mr-2 h-4 w-4" />
                                <span>Edit{isRestricted ? ` (Used by ${documentCount} doc${documentCount === 1 ? '' : 's'})` : ''}</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isRestricted) onDelete();
                                }}
                                className={cn(
                                    "rounded-lg",
                                    isRestricted
                                        ? "opacity-50 cursor-not-allowed text-slate-400"
                                        : "text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                                )}
                                disabled={isRestricted}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete{isRestricted ? ` (Used by ${documentCount} doc${documentCount === 1 ? '' : 's'})` : ''}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </TableCell>
        </TableRow>
    );
} 