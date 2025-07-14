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
    seriesUsageMap: Record<number, { isUsed: boolean; documentCount: number }>;
    isSeriesRestricted: (seriesId: number) => boolean;
    getSeriesDocumentCount: (seriesId: number) => number;
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
    seriesUsageMap,
    isSeriesRestricted,
    getSeriesDocumentCount
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

    // Calculate selectable vs total counts
    const selectableSubTypes = subTypes?.filter(subType => subType.id && !isSeriesRestricted(subType.id)) || [];
    const selectableCount = selectableSubTypes.length;
    const selectedSelectableCount = selectedSubTypes.filter(id => !isSeriesRestricted(id)).length;

    // Custom select-all handler that only selects non-restricted series
    const handleSelectAll = () => {
        if (selectedSelectableCount === selectableCount && selectableCount > 0) {
            // Deselect all selectable items
            selectableSubTypes.forEach(subType => {
                if (selectedSubTypes.includes(subType.id)) {
                    bulkSelection.toggleItem(subType);
                }
            });
        } else {
            // Select all selectable items that aren't already selected
            selectableSubTypes.forEach(subType => {
                if (!selectedSubTypes.includes(subType.id)) {
                    bulkSelection.toggleItem(subType);
                }
            });
        }
    };

    // Define bulk actions
    const bulkActions: BulkAction[] = [
        {
            id: 'edit',
            label: 'Edit Series',
            icon: <Edit2 className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => {
                // Filter to only selectable series
                const selectableIds = selectedSubTypes.filter(id => !isSeriesRestricted(id));
                if (selectableIds.length === 0) {
                    console.log("No selectable series available for editing");
                    return;
                }
                console.log("Bulk edit series:", selectableIds);
                // Handle bulk edit if needed
            },
            shortcut: 'E',
        },
        {
            id: 'delete',
            label: 'Delete Series',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive',
            onClick: () => {
                // Filter to only selectable series
                const selectableIds = selectedSubTypes.filter(id => !isSeriesRestricted(id));
                if (selectableIds.length === 0) {
                    console.log("No selectable series available for deletion");
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
                                        selectedCount={selectedSelectableCount}
                                        totalCount={selectableCount}
                                        onSelectAll={handleSelectAll}
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
                                            selectedSubTypes={selectedSubTypes}
                                            onSelectSubType={(subType) => {
                                                // Only allow selection if series is not restricted
                                                if (subType.id && !isSeriesRestricted(subType.id)) {
                                                    bulkSelection.toggleItem(subType);
                                                } else if (subType.id && isSeriesRestricted(subType.id)) {
                                                    // Show feedback for restricted selection attempt
                                                    const docCount = getSeriesDocumentCount(subType.id);
                                                    console.log(`Cannot select series ${subType.subTypeKey} - used by ${docCount} document${docCount === 1 ? '' : 's'}`);
                                                }
                                            }}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                            seriesUsageMap={seriesUsageMap}
                                            isSeriesRestricted={isSeriesRestricted}
                                            getSeriesDocumentCount={getSeriesDocumentCount}
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
                    bulkSelection={bulkSelection}
                    bulkActions={bulkActions}
                />
            )}
        </div>
    );
} 