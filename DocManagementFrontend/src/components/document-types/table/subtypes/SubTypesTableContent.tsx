import React from "react";
import { SubType } from "@/models/subtype";
import { Table } from "@/components/ui/table";
import { SubTypesTableHeader } from "@/components/document-types/table/subtypes/content/SubTypesTableHeader";
import { SubTypesTableBody } from "@/components/document-types/table/subtypes/content/SubTypesTableBody";
import { SubTypesTableEmpty } from "@/components/document-types/table/subtypes/SubTypesTableEmpty";
import { ScrollArea } from "@/components/ui/scroll-area";
import PaginationWithBulkActions, { BulkAction } from "@/components/shared/PaginationWithBulkActions";
import { Loader2, Edit2, Trash2 } from "lucide-react";
import { BulkSelectionState } from "@/hooks/useBulkSelection";
import { useBulkSelection } from "@/hooks/useBulkSelection";

interface SubTypesTableContentProps {
    subTypes: SubType[] | undefined;
    allSubTypes?: SubType[] | undefined;
    selectedSubTypes: any[];
    bulkSelection: ReturnType<typeof import('@/hooks/useBulkSelection').useBulkSelection<SubType>>;
    pagination: {
        currentPage: number;
        pageSize: number;
        totalPages: number;
        totalItems: number;
        handlePageChange: (page: number) => void;
        handlePageSizeChange: (size: number) => void;
    };
    onEdit: (subType: SubType) => void;
    onDelete: (id: number) => void;
    sortBy: string;
    sortDirection: string;
    onSort: (field: string) => void;
    onClearFilters: () => void;
    onBulkDelete?: () => void;
    onCreateSeries?: () => void;
    isLoading?: boolean;
    isError?: boolean;
}

export function SubTypesTableContent({
    subTypes,
    allSubTypes,
    selectedSubTypes,
    bulkSelection,
    pagination,
    onEdit,
    onDelete,
    sortBy,
    sortDirection,
    onSort,
    onClearFilters,
    onBulkDelete,
    onCreateSeries,
    isLoading = false,
    isError = false,
}: SubTypesTableContentProps) {
    // Use pagination from props
    const {
        currentPage,
        pageSize,
        totalPages,
        totalItems,
        handlePageChange,
        handlePageSizeChange,
    } = pagination;

    // Check if we have subTypes to display
    const hasSubTypes = subTypes && subTypes.length > 0;

    // Filter series into selectable and non-selectable
    const selectableSubTypes = subTypes?.filter(subType => !subType.isAssigned) || [];
    const nonSelectableSubTypes = subTypes?.filter(subType => subType.isAssigned) || [];

    // Get currently selected objects from the bulk selection hook
    const selectedObjects = bulkSelection.getSelectedObjects();
    const selectedSelectableObjects = selectedObjects.filter(obj => !obj.isAssigned);

    // Create a separate bulk selection hook for only selectable items
    const selectableBulkSelection = useBulkSelection({
        data: allSubTypes?.filter(st => !st.isAssigned) || [],
        paginatedData: selectableSubTypes,
        keyField: "id" as keyof SubType,
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
    });

    // Define bulk actions that work with selected selectable items
    const bulkActions: BulkAction[] = [
        {
            id: 'edit',
            label: 'Edit Series',
            icon: <Edit2 className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => {
                const selectedItems = selectableBulkSelection.getSelectedObjects();
                if (selectedItems.length === 0) {
                    console.log("No series selected for editing");
                    return;
                }
                console.log("Bulk edit series:", selectedItems.map(item => item.id));
                // Handle bulk edit logic here
            },
            shortcut: 'E',
        },
        {
            id: 'delete',
            label: 'Delete Series',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive',
            onClick: () => {
                const selectedItems = selectableBulkSelection.getSelectedObjects();
                if (selectedItems.length === 0) {
                    console.log("No series selected for deletion");
                    return;
                }
                onBulkDelete?.();
            },
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
                            <p className="text-muted-foreground">Loading series...</p>
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
                            <p className="text-destructive">Failed to load series</p>
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

                {hasSubTypes ? (
                    <div className="relative h-full flex flex-col z-10">
                        {/* Fixed Header - Never Scrolls */}
                        <div className="flex-shrink-0 overflow-x-auto border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
                            <div className="min-w-[800px]">
                                <Table className="table-fixed w-full">
                                    <SubTypesTableHeader
                                        selectedCount={selectableBulkSelection.currentPageSelectedCount}
                                        totalCount={selectableSubTypes.length}
                                        onSelectAll={selectableBulkSelection.toggleSelectCurrentPage}
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
                            style={{ maxHeight: "calc(100vh - 300px)" }}
                        >
                            <ScrollArea className="table-scroll-area h-full w-full">
                                <div className="min-w-[800px] pb-4">
                                    <Table className="table-fixed w-full">
                                        <SubTypesTableBody
                                            subTypes={subTypes || []}
                                            selectedSubTypes={selectableBulkSelection.selectedItems}
                                            onSelectSubType={(subType) => {
                                                // Only allow selection if series is not assigned
                                                if (!subType.isAssigned) {
                                                    selectableBulkSelection.toggleItem(subType);
                                                } else {
                                                    // Show feedback for assigned selection attempt
                                                    console.log(`Cannot select series ${subType.subTypeKey} - it is assigned`);
                                                }
                                            }}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                        />
                                    </Table>
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                ) : (
                    <div className="relative h-full flex items-center justify-center z-10">
                        <SubTypesTableEmpty
                            onClearFilters={onClearFilters}
                            onCreateSeries={onCreateSeries}
                        />
                    </div>
                )}
            </div>

            {/* Smart Pagination with Bulk Actions */}
            {hasSubTypes && (
                <PaginationWithBulkActions
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    bulkSelection={selectableBulkSelection}
                    bulkActions={bulkActions}
                />
            )}
        </div>
    );
} 