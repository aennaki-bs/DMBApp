// Circuit interface is globally available from vite-env.d.ts
import { Table } from "@/components/ui/table";
import { CircuitTableHeader } from "./CircuitTableHeader";
import { CircuitTableBody } from "./CircuitTableBody";
import { CircuitTableEmpty } from "./CircuitTableEmpty";
import { ScrollArea } from "@/components/ui/scroll-area";
import PaginationWithBulkActions, { BulkAction } from "@/components/shared/PaginationWithBulkActions";
import { Loader2, Trash2, GitBranch } from "lucide-react";
import { BulkSelectionState } from "@/hooks/useBulkSelection";

interface CircuitTableContentProps {
    circuits: Circuit[] | undefined;
    allCircuits?: Circuit[] | undefined;
    selectedItems: number[];
    bulkSelection: ReturnType<typeof import('@/hooks/useBulkSelection').useBulkSelection<Circuit>>;
    pagination: {
        currentPage: number;
        pageSize: number;
        totalPages: number;
        totalItems: number;
        handlePageChange: (page: number) => void;
        handlePageSizeChange: (size: number) => void;
    };
    onEdit: (circuit: Circuit) => void;
    onDelete: (circuitId: number) => void;
    onView: (circuit: Circuit) => void;
    onToggleStatus: (circuit: Circuit) => void;
    onManageSteps: (circuit: Circuit) => void;
    sortBy: string;
    sortDirection: string;
    onSort: (field: string) => void;
    onClearFilters: () => void;
    onBulkDelete?: () => void;
    onCreateCircuit?: () => void;
    isLoading?: boolean;
    isError?: boolean;
    isSimpleUser?: boolean;
}

export function CircuitTableContent({
    circuits,
    allCircuits,
    selectedItems,
    bulkSelection,
    pagination,
    onEdit,
    onDelete,
    onView,
    onToggleStatus,
    onManageSteps,
    sortBy,
    sortDirection,
    onSort,
    onClearFilters,
    onBulkDelete,
    onCreateCircuit,
    isLoading = false,
    isError = false,
    isSimpleUser = false,
}: CircuitTableContentProps) {
    // Use pagination from props
    const {
        currentPage,
        pageSize,
        totalPages,
        totalItems,
        handlePageChange,
        handlePageSizeChange,
    } = pagination;

    // Check if we have circuits to display
    const hasCircuits = circuits && circuits.length > 0;

    // Define bulk actions - only delete, no edit
    const bulkActions: BulkAction[] = [
        {
            id: 'delete',
            label: 'Delete Circuits',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive',
            onClick: () => onBulkDelete?.(),
            requiresConfirmation: true,
            shortcut: 'Del',
        },
    ];

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-2xl">
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Loading circuits...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl border border-destructive/10 bg-gradient-to-br from-destructive/5 via-background/60 to-background/80 backdrop-blur-xl shadow-2xl">
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 text-destructive" />
                            </div>
                            <p className="text-destructive">Failed to load circuits</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col gap-4" style={{ minHeight: "100%" }}>
            <div className="flex-1 relative overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-lg min-h-0">
                {/* Subtle animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/2 via-transparent to-primary/2 animate-pulse"></div>

                {hasCircuits ? (
                    <div className="relative h-full flex flex-col z-10">
                        {/* Fixed Header - Never Scrolls */}
                        <div className="flex-shrink-0 overflow-x-auto border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
                            <div className="min-w-[1000px]">
                                <Table className="table-fixed w-full table-compact">
                                    <CircuitTableHeader
                                        selectedCount={bulkSelection.currentPageSelectedCount}
                                        totalCount={circuits?.length || 0}
                                        onSelectAll={bulkSelection.toggleSelectCurrentPage}
                                        sortBy={sortBy}
                                        sortDirection={sortDirection}
                                        onSort={onSort}
                                    />
                                </Table>
                            </div>
                        </div>

                        {/* Scrollable Body - Only Content Scrolls - FILL REMAINING HEIGHT */}
                        <div
                            className="flex-1 overflow-hidden"
                            style={{ maxHeight: "calc(100vh - 260px)" }}
                        >
                            <ScrollArea className="table-scroll-area h-full w-full">
                                <div className="min-w-[1000px] pb-4">
                                    <Table className="table-fixed w-full table-compact">
                                        <CircuitTableBody
                                            circuits={circuits || []}
                                            selectedItems={selectedItems}
                                            onSelectCircuit={(circuit) => {
                                                bulkSelection.toggleItem(circuit);
                                            }}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                            onView={onView}
                                            onToggleStatus={onToggleStatus}
                                            onManageSteps={onManageSteps}
                                            isSimpleUser={isSimpleUser}
                                        />
                                    </Table>
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                ) : (
                <div className="relative h-full flex items-center justify-center z-10">
                        <CircuitTableEmpty
                            onClearFilters={onClearFilters}
                            onCreateCircuit={onCreateCircuit}
                            isSimpleUser={isSimpleUser}
                        />
                    </div>
                )}
            </div>

            {/* Smart Pagination with Bulk Actions */}
            {hasCircuits && (
                <PaginationWithBulkActions
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    bulkSelection={bulkSelection}
                    bulkActions={bulkActions}
                />
            )}
        </div>
    );
} 