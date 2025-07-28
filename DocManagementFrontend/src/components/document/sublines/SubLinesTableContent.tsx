import { Table } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { SousLigne } from "@/models/document";
import { SubLinesTableHeader } from "./SubLinesTableHeader";
import { SubLinesTableBody } from "./SubLinesTableBody";
import PaginationWithBulkActions, { BulkAction } from "@/components/shared/PaginationWithBulkActions";
import { usePagination } from "@/hooks/usePagination";
import { useBulkSelection } from "@/hooks/useBulkSelection";

interface SubLinesTableContentProps {
    subLines: SousLigne[];
    allSubLines: SousLigne[];
    isLoading: boolean;
    error: string | null;
    bulkSelection: ReturnType<typeof useBulkSelection<SousLigne>>;
    pagination: ReturnType<typeof usePagination<SousLigne>>;
    sortBy: keyof SousLigne | null;
    sortDirection: "asc" | "desc" | null;
    onSort: (column: keyof SousLigne) => void;
    onEdit: (subLine: SousLigne) => void;
    onDelete: (subLine: SousLigne) => void;
    onBulkDelete: () => void;
    canManageDocuments: boolean;
    onCreateNew: () => void;
}

export function SubLinesTableContent({
    subLines,
    allSubLines,
    isLoading,
    error,
    bulkSelection,
    pagination,
    sortBy,
    sortDirection,
    onSort,
    onEdit,
    onDelete,
    onBulkDelete,
    canManageDocuments,
    onCreateNew,
}: SubLinesTableContentProps) {
    // Define bulk actions
    const bulkActions: BulkAction[] = [
        ...(canManageDocuments ? [{
            id: 'delete',
            label: 'Delete Sub-Lines',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const,
            onClick: onBulkDelete,
            requiresConfirmation: true,
            shortcut: 'Del',
        }] : []),
    ];

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading sub-lines...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
                    <p className="text-destructive font-medium">Failed to load sub-lines</p>
                    <p className="text-muted-foreground text-sm mt-1">{error}</p>
                </div>
            </div>
        );
    }

    // Empty state
    if (allSubLines.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16"
            >
                <div className="text-center">
                    <div className="p-4 rounded-full bg-muted/30 border border-border/30 mb-4 inline-block">
                        <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No Sub-Lines Found</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        This line doesn't have any sub-lines yet. Create your first sub-line to get started.
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="space-y-4 h-full flex flex-col">
            {/* Main Table structure */}
            <div className="flex-1 relative overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-lg min-h-0">
                {/* Gradient overlay for visual depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-background/5 pointer-events-none z-0"></div>

                {/* Header and Scrollable Body */}
                <div className="relative flex flex-col h-full z-10">
                    {/* Fixed Table Header */}
                    <div className="flex-shrink-0 overflow-x-auto border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
                        <div className="min-w-[1000px]">
                            <Table className="table-fixed w-full table-compact">
                                <SubLinesTableHeader
                                    bulkSelection={bulkSelection}
                                    sortBy={sortBy}
                                    sortDirection={sortDirection}
                                    onSort={onSort}
                                />
                            </Table>
                        </div>
                    </div>

                    {/* Scrollable Table Body - Fixed Height */}
                    <div className="flex-1 overflow-hidden min-h-0">
                        <ScrollArea className="h-full w-full">
                            <div className="min-w-[1000px] pb-4">
                                <Table className="table-fixed w-full table-compact">
                                    <SubLinesTableBody
                                        subLines={subLines}
                                        bulkSelection={bulkSelection}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        canManageDocuments={canManageDocuments}
                                    />
                                </Table>
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>

            {/* Pagination with Bulk Actions - Always Visible */}
            {allSubLines.length > 0 && (
                <div className="flex-shrink-0">
                    <PaginationWithBulkActions
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        pageSize={pagination.pageSize}
                        totalItems={pagination.totalItems}
                        onPageChange={pagination.handlePageChange}
                        onPageSizeChange={pagination.handlePageSizeChange}
                        bulkSelection={bulkSelection}
                        bulkActions={bulkActions}
                    />
                </div>
            )}
        </div>
    );
} 