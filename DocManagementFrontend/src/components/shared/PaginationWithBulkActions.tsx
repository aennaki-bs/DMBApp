import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MoreHorizontal,
    CheckSquare,
    Square,
    RotateCcw,
    X,
    Globe,
    ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface BulkAction {
    id: string;
    label: string;
    icon: React.ReactNode;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    onClick: () => void;
    requiresConfirmation?: boolean;
    shortcut?: string;
}

export interface BulkSelectionState {
    selectedItems: number[];
    selectedCount: number;
    currentPageSelectedCount: number;
    allPagesSelectedCount: number;
    isPartialSelection: boolean;
    isCurrentPageFullySelected: boolean;
    isAllDataFullySelected: boolean;
    selectionMode: 'page' | 'all' | 'none';
    toggleItem: (item: any) => void;
    selectCurrentPage: () => void;
    deselectCurrentPage: () => void;
    selectAllPages: () => void;
    deselectAll: () => void;
    invertCurrentPage: () => void;
    toggleSelectCurrentPage: () => void;
    clearSelection: () => void;
    getSelectedObjects: () => any[];
    getSelectedObjectsFromCurrentPage: () => any[];
    isSelected: (item: any) => boolean;
    isIndeterminate: boolean;
}

interface PaginationWithBulkActionsProps {
    // Pagination props
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    className?: string;
    pageSizeOptions?: (number | "all")[];
    showFirstLast?: boolean;
    maxVisiblePages?: number;

    // Bulk actions props
    bulkSelection?: BulkSelectionState;
    bulkActions?: BulkAction[];
}

const PaginationWithBulkActions: React.FC<PaginationWithBulkActionsProps> = ({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
    className = "",
    pageSizeOptions = [10, 15, 25, 50, 100, "all"],
    showFirstLast = true,
    maxVisiblePages = 7,
    bulkSelection,
    bulkActions = [],
}) => {
    // Calculate visible page numbers with smart ellipsis
    const getVisiblePages = () => {
        if (totalPages <= maxVisiblePages) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | "ellipsis")[] = [];
        const sidePages = Math.floor((maxVisiblePages - 3) / 2);

        if (currentPage <= sidePages + 2) {
            for (let i = 1; i <= Math.min(maxVisiblePages - 2, totalPages); i++) {
                pages.push(i);
            }
            if (totalPages > maxVisiblePages - 2) {
                pages.push("ellipsis");
                pages.push(totalPages);
            }
        } else if (currentPage >= totalPages - sidePages - 1) {
            pages.push(1);
            if (totalPages > maxVisiblePages - 2) {
                pages.push("ellipsis");
            }
            for (
                let i = Math.max(totalPages - maxVisiblePages + 3, 2);
                i <= totalPages;
                i++
            ) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            pages.push("ellipsis");
            for (let i = currentPage - sidePages; i <= currentPage + sidePages; i++) {
                pages.push(i);
            }
            pages.push("ellipsis");
            pages.push(totalPages);
        }

        return pages;
    };

    const visiblePages = getVisiblePages();
    const hasBulkSelection = bulkSelection && bulkSelection.selectedCount > 0;

    // Handle page size change with "all" option
    const handlePageSizeChange = (value: string) => {
        if (value === "all") {
            onPageSizeChange(totalItems);
        } else {
            onPageSizeChange(Number(value));
        }
    };

    // Get current page size value for display
    const getCurrentPageSizeValue = () => {
        if (pageSize >= totalItems) {
            return "all";
        }
        return pageSize.toString();
    };

    return (
        <div
            className={cn(
                "flex flex-col lg:flex-row items-center justify-between gap-4 p-4 bg-gradient-to-r from-primary/5 via-background/50 to-primary/5 backdrop-blur-xl rounded-xl border border-primary/20 shadow-lg",
                className
            )}
        >
            {/* Left side - Bulk Actions (when active) */}
            <div className="flex items-center gap-4">
                {hasBulkSelection && (
                    <>
                        {/* Selection Info */}
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="secondary"
                                className="bg-primary text-primary-foreground font-semibold shadow-md"
                            >
                                {bulkSelection.selectedCount} selected
                            </Badge>

                            {bulkSelection.selectionMode === 'all' && (
                                <Badge
                                    variant="outline"
                                    className="bg-blue-500 text-white border-blue-500 font-medium shadow-md"
                                >
                                    <Globe className="h-3 w-3 mr-1" />
                                    All pages
                                </Badge>
                            )}
                        </div>

                        {/* Selection Controls */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-background hover:bg-primary/10 border-primary/30 text-foreground font-medium shadow-sm"
                                >
                                    <CheckSquare className="h-4 w-4 mr-1" />
                                    Select
                                    <ChevronDown className="h-3 w-3 ml-1" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                className="w-52 bg-popover/95 backdrop-blur-sm border-border shadow-lg"
                            >
                                <DropdownMenuItem
                                    onClick={bulkSelection.selectCurrentPage}
                                    className="cursor-pointer hover:bg-primary/10"
                                >
                                    <CheckSquare className="h-4 w-4 mr-2" />
                                    Select current page ({pageSize})
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={bulkSelection.selectAllPages}
                                    className="cursor-pointer hover:bg-primary/10"
                                >
                                    <Globe className="h-4 w-4 mr-2" />
                                    Select all pages ({totalItems})
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={bulkSelection.invertCurrentPage}
                                    className="cursor-pointer hover:bg-primary/10"
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Invert current page
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={bulkSelection.deselectAll}
                                    className="cursor-pointer hover:bg-destructive/10"
                                >
                                    <Square className="h-4 w-4 mr-2" />
                                    Deselect all
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            {bulkActions.map((action) => (
                                <Button
                                    key={action.id}
                                    variant={action.variant || 'outline'}
                                    size="sm"
                                    onClick={action.onClick}
                                    className={cn(
                                        "h-9 px-4 text-sm font-medium transition-all duration-200 shadow-sm",
                                        action.variant === 'destructive'
                                            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 border-destructive"
                                            : "bg-background hover:bg-accent border-primary/30",
                                    )}
                                >
                                    {action.icon}
                                    <span className="ml-1.5">{action.label}</span>
                                    {action.shortcut && (
                                        <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-muted/80 text-muted-foreground rounded border border-border/50 shadow-inner">
                                            {action.shortcut}
                                        </kbd>
                                    )}
                                </Button>
                            ))}
                        </div>

                        {/* Close Bulk Selection */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={bulkSelection.deselectAll}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all duration-200"
                            title="Clear selection"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </>
                )}
            </div>

            {/* Right side - Page Size Selector + Page Navigation */}
            <div className="flex items-center gap-4">
                {/* Page size selector */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-foreground font-medium whitespace-nowrap">
                        Show
                    </span>
                    <Select
                        value={getCurrentPageSizeValue()}
                        onValueChange={handlePageSizeChange}
                    >
                        <SelectTrigger className="w-[60px] h-8 bg-background text-foreground border border-primary/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-accent shadow-md rounded-lg z-10">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background text-foreground border border-primary/20 rounded-lg shadow-xl z-50">
                            {pageSizeOptions.map((size) => (
                                <SelectItem
                                    key={size}
                                    value={size.toString()}
                                    className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary rounded-md text-sm"
                                >
                                    {size === "all" ? "All" : size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Page navigation */}
                {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        {showFirstLast && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(1)}
                                disabled={currentPage === 1}
                                className="h-8 w-8 p-0 bg-background text-foreground border border-primary/20 hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm z-10"
                                title="First page"
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0 bg-background text-foreground border border-primary/20 hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm z-10"
                            title="Previous page"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {visiblePages.map((page, index) => {
                            if (page === "ellipsis") {
                                return (
                                    <div
                                        key={`ellipsis-${index}`}
                                        className="h-8 w-8 flex items-center justify-center text-primary"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </div>
                                );
                            }

                            return (
                                <Button
                                    key={page}
                                    variant={page === currentPage ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onPageChange(page)}
                                    className={
                                        page === currentPage
                                            ? "h-8 min-w-[32px] px-2 bg-primary text-primary-foreground hover:bg-primary/90 border border-primary shadow-md font-semibold z-10"
                                            : "h-8 min-w-[32px] px-2 bg-background text-foreground border border-primary/20 hover:bg-primary/10 hover:text-primary transition-all duration-200 shadow-sm z-10"
                                    }
                                    title={`Page ${page}`}
                                >
                                    {page}
                                </Button>
                            );
                        })}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0 bg-background text-foreground border border-primary/20 hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm z-10"
                            title="Next page"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>

                        {showFirstLast && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(totalPages)}
                                disabled={currentPage === totalPages}
                                className="h-8 w-8 p-0 bg-background text-foreground border border-primary/20 hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm z-10"
                                title="Last page"
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaginationWithBulkActions; 