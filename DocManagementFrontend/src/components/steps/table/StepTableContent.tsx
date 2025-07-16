import { Table } from "@/components/ui/table";
import { StepTableHeader } from "./StepTableHeader";
import { StepTableBody } from "./StepTableBody";
import { StepTableEmpty } from "./StepTableEmpty";
import { ScrollArea } from "@/components/ui/scroll-area";
import PaginationWithBulkActions, { BulkAction } from "@/components/shared/PaginationWithBulkActions";
import { Loader2, Edit, Trash2 } from "lucide-react";
import { BulkSelectionState } from "@/hooks/useBulkSelection";
import { Step } from "@/models/step";

interface Circuit {
    id: number;
    title: string;
    circuitKey: string;
    isActive: boolean;
}

interface StepTableContentProps {
    steps: Step[] | undefined;
    selectedSteps: Step[];
    bulkSelection: any; // Use any to avoid type complications
    pagination: {
        currentPage: number;
        pageSize: number;
        totalPages: number;
        totalItems: number;
        handlePageChange: (page: number) => void;
        handlePageSizeChange: (size: number) => void;
    };
    onEdit: (step: Step) => void;
    onDelete: (step: Step) => void;
    sortBy: string;
    sortDirection: "asc" | "desc";
    onSort: (field: string) => void;
    onClearFilters: () => void;
    onBulkEdit?: () => void;
    onBulkDelete?: () => void;
    isLoading?: boolean;
    isError?: boolean;
    isCircuitActive?: boolean;
    isSimpleUser?: boolean;
    circuit?: Circuit;
}

export function StepTableContent({
    steps,
    selectedSteps,
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
    isCircuitActive = false,
    isSimpleUser = false,
    circuit,
}: StepTableContentProps) {
    // Use pagination from props
    const {
        currentPage,
        pageSize,
        totalPages,
        totalItems,
        handlePageChange,
        handlePageSizeChange,
    } = pagination;

    // Check if we have steps to display
    const hasSteps = steps && steps.length > 0;

    // Define bulk actions - hide completely when circuit is active or user is SimpleUser
    const bulkActions: BulkAction[] = (isCircuitActive || isSimpleUser) ? [] : [
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
            label: 'Delete Steps',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive',
            onClick: () => onBulkDelete?.(),
            requiresConfirmation: true,
            shortcut: 'Del',
        },
    ];

    // Handle loading state
    if (isLoading) {
        return (
            <div className="h-full flex flex-col gap-4" style={{ minHeight: "100%" }}>
                <div className="flex-1 relative overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-lg min-h-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/2 via-transparent to-primary/2 animate-pulse"></div>
                    <div className="relative h-full flex items-center justify-center z-10">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
                            <p className="text-muted-foreground font-medium">Loading steps...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Handle error state
    if (isError) {
        return (
            <div className="h-full flex flex-col gap-4" style={{ minHeight: "100%" }}>
                <div className="flex-1 relative overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-lg min-h-0">
                    <div className="relative h-full flex items-center justify-center z-10">
                        <div className="text-center text-muted-foreground">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 text-destructive/50" />
                            </div>
                            <p className="text-lg font-medium text-foreground mb-2">Failed to load steps</p>
                            <p className="text-sm text-muted-foreground mb-4">
                                There was an error loading the steps data.
                            </p>
                            <button
                                onClick={onClearFilters}
                                className="text-sm text-primary hover:text-primary/80 font-medium underline"
                            >
                                Try refreshing the page
                            </button>
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

                {hasSteps ? (
                    <div className="relative h-full flex flex-col z-10">
                        {/* Fixed Header - Never Scrolls */}
                        <div className="flex-shrink-0 overflow-x-auto border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
                            <div className="min-w-[900px]">
                                <Table className="table-fixed w-full">
                                    <StepTableHeader
                                        selectedCount={bulkSelection.currentPageSelectedCount}
                                        totalCount={steps?.length || 0}
                                        onSelectAll={bulkSelection.toggleSelectCurrentPage}
                                        sortBy={sortBy}
                                        sortDirection={sortDirection}
                                        onSort={onSort}
                                        isCircuitActive={isCircuitActive}
                                        isSimpleUser={isSimpleUser}
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
                                        <StepTableBody
                                            steps={steps || []}
                                            selectedSteps={selectedSteps.map(step => step.id)}
                                            onSelectStep={(stepId) => {
                                                if (!isCircuitActive && !isSimpleUser) {
                                                    const step = steps?.find(s => s.id === stepId);
                                                    if (step) {
                                                        bulkSelection.toggleItem(step);
                                                    }
                                                }
                                            }}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                            isCircuitActive={isCircuitActive}
                                            isSimpleUser={isSimpleUser}
                                            circuit={circuit}
                                        />
                                    </Table>
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                ) : (
                    <div className="relative h-full flex items-center justify-center z-10">
                        <StepTableEmpty
                            onCreateStep={() => { }}
                        />
                    </div>
                )}
            </div>

            {/* Pagination with Bulk Actions */}
            {hasSteps && (
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