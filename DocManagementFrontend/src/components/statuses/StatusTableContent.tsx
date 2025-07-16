import { Table } from "@/components/ui/table";
import { StatusTableHeader } from "./StatusTableHeader";
import { StatusTableBody } from "./StatusTableBody";
import { StatusTableEmpty } from "./StatusTableEmpty";
import { ScrollArea } from "@/components/ui/scroll-area";
import PaginationWithBulkActions, { BulkAction } from "@/components/shared/PaginationWithBulkActions";
import { Loader2, Edit, Trash2 } from "lucide-react";
import { BulkSelectionState } from "@/hooks/useBulkSelection";

interface StatusTableContentProps {
    statuses: any[] | undefined;
    selectedStatuses: any[];
    bulkSelection: any; // Use any to avoid type complications
    pagination: {
        currentPage: number;
        pageSize: number;
        totalPages: number;
        totalItems: number;
        handlePageChange: (page: number) => void;
        handlePageSizeChange: (size: number) => void;
    };
    onEdit: (status: any) => void;
    onDelete: (statusId: number) => void;
    sortBy: string;
    sortDirection: string;
    onSort: (field: string) => void;
    onClearFilters: () => void;
    onBulkEdit?: () => void;
    onBulkDelete?: () => void;
    isLoading?: boolean;
    isError?: boolean;
    isCircuitActive: boolean;
}

export function StatusTableContent({
    statuses,
    selectedStatuses,
    bulkSelection,
    pagination,
    onEdit,
    onDelete,
    sortBy,
    sortDirection,
    onSort,
    onClearFilters,
    onBulkEdit,
    onBulkDelete,
    isLoading = false,
    isError = false,
    isCircuitActive,
}: StatusTableContentProps) {
    // Use pagination from props
    const {
        currentPage,
        pageSize,
        totalPages,
        totalItems,
        handlePageChange,
        handlePageSizeChange,
    } = pagination;

    // Check if we have statuses to display
    const hasStatuses = statuses && statuses.length > 0;

    // Define bulk actions - hide completely when circuit is active
    const bulkActions: BulkAction[] = isCircuitActive ? [] : [
        {
            id: 'edit',
            label: 'Bulk Edit',
            icon: <Edit className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => onBulkEdit?.(),
            shortcut: 'E',
        },
        {
            id: 'delete',
            label: 'Delete Statuses',
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
                            <p className="text-muted-foreground">Loading statuses...</p>
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
                <div className="relative overflow-hidden rounded-2xl border border-destructive/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-2xl">
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                                <span className="text-destructive font-bold">!</span>
                            </div>
                            <p className="text-destructive">
                                Failed to load statuses. Please try again.
                            </p>
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

                {hasStatuses ? (
                    <div className="relative h-full flex flex-col z-10">
                        {/* Fixed Header - Never Scrolls */}
                        <div className="flex-shrink-0 overflow-x-auto border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
                            <div className="min-w-[900px]">
                                <Table className="table-fixed w-full">
                                    <StatusTableHeader
                                        selectedCount={bulkSelection.currentPageSelectedCount}
                                        totalCount={statuses?.length || 0}
                                        onSelectAll={bulkSelection.toggleSelectCurrentPage}
                                        sortBy={sortBy}
                                        sortDirection={sortDirection}
                                        onSort={onSort}
                                        isCircuitActive={isCircuitActive}
                                    />
                                </Table>
                            </div>
                        </div>

                        {/* Scrollable Body - Only Content Scrolls - FILL REMAINING HEIGHT */}
                        <div
                            className="flex-1 overflow-hidden"
                            style={{ maxHeight: "calc(100vh - 320px)" }}
                        >
                            <ScrollArea className="table-scroll-area h-full w-full">
                                <div className="min-w-[900px] pb-4">
                                    <Table className="table-fixed w-full">
                                        <StatusTableBody
                                            statuses={statuses || []}
                                            selectedStatuses={selectedStatuses.map(status => {
                                                if (typeof status === 'object' && status !== null) {
                                                    return status.id || status.statusId || status.Id;
                                                }
                                                return status;
                                            })}
                                            onSelectStatus={(statusId) => {
                                                if (!isCircuitActive) {
                                                    const status = statuses?.find(s => {
                                                        const sId = s.id || s.statusId || s.Id;
                                                        return sId === statusId;
                                                    });
                                                    if (status) {
                                                        bulkSelection.toggleItem(status);
                                                    }
                                                }
                                            }}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                            isCircuitActive={isCircuitActive}
                                        />
                                    </Table>
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                ) : (
                    <div className="relative h-full flex items-center justify-center z-10">
                        <StatusTableEmpty onClearFilters={onClearFilters} />
                    </div>
                )}
            </div>

            {/* Smart Pagination with Bulk Actions - Hide bulk actions when circuit is active */}
            {hasStatuses && (
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