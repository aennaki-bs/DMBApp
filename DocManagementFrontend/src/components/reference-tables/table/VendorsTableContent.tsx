import { Vendor } from "@/models/vendor";
import { Table } from "@/components/ui/table";
import { VendorsTableHeader } from "./content/VendorsTableHeader";
import { VendorsTableBody } from "./content/VendorsTableBody";
import { VendorTableEmpty } from "./VendorTableEmpty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import PaginationWithBulkActions, { BulkAction } from "@/components/shared/PaginationWithBulkActions";
import { Loader2, Trash2, Edit } from "lucide-react";

interface VendorsTableContentProps {
    vendors: Vendor[] | undefined;
    allVendors?: Vendor[] | undefined;
    selectedItems: string[]; // Array of vendor codes from bulk selection
    bulkSelection: any; // Using any to match pattern
    pagination: {
        currentPage: number;
        pageSize: number;
        totalPages: number;
        totalItems: number;
        handlePageChange: (page: number) => void;
        handlePageSizeChange: (size: number) => void;
    };
    onEdit: (vendor: Vendor) => void;
    onView: (vendor: Vendor) => void;
    onDelete: (vendorCode: string) => void;
    sortBy: string;
    sortDirection: string;
    onSort: (field: string) => void;
    onClearFilters: () => void;
    onBulkEdit?: () => void;
    onBulkDelete?: () => void;
    isLoading?: boolean;
    isError?: boolean;
    searchQuery?: string;
}

export function VendorsTableContent({
    vendors,
    allVendors,
    selectedItems,
    bulkSelection,
    pagination,
    onEdit,
    onView,
    onDelete,
    sortBy,
    sortDirection,
    onSort,
    onClearFilters,
    onBulkEdit,
    onBulkDelete,
    isLoading = false,
    isError = false,
    searchQuery = "",
}: VendorsTableContentProps) {
    // Use pagination from props
    const {
        currentPage,
        pageSize,
        totalPages,
        totalItems,
        handlePageChange,
        handlePageSizeChange,
    } = pagination;

    // Check if we have vendors to display
    const hasVendors = vendors && vendors.length > 0;

    // Define bulk actions
    const bulkActions: BulkAction[] = [
        {
            id: 'edit',
            label: 'Edit Vendors',
            icon: <Edit className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => onBulkEdit?.(),
            shortcut: 'E',
        },
        {
            id: 'delete',
            label: 'Delete Vendors',
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
                <div className="relative overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-lg">
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Loading vendors...</p>
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
                <div className="relative overflow-hidden rounded-xl border border-destructive/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-lg">
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                                <span className="text-destructive font-bold">!</span>
                            </div>
                            <p className="text-destructive">
                                Failed to load vendors. Please try again.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => window.location.reload()}
                                className="border-destructive/30 text-destructive hover:bg-destructive/5"
                            >
                                Reload Page
                            </Button>
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

                {hasVendors ? (
                    <div className="relative h-full flex flex-col z-10">
                        {/* Fixed Header - Never Scrolls */}
                        <div className="flex-shrink-0 overflow-x-auto border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
                            <div className="min-w-[1088px]">
                                <Table className="table-fixed w-full">
                                    <VendorsTableHeader
                                        selectedCount={bulkSelection.currentPageSelectedCount}
                                        totalCount={vendors?.length || 0}
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
                            style={{ maxHeight: "calc(100vh - 300px)" }}
                        >
                            <ScrollArea className="table-scroll-area h-full w-full">
                                <div className="min-w-[1088px] pb-4">
                                    <Table className="table-fixed w-full">
                                        <VendorsTableBody
                                            vendors={vendors || []}
                                            selectedItems={bulkSelection.selectedItems}
                                            onSelectVendor={(vendorCode) => {
                                                const vendor = vendors?.find(v => v.vendorCode === vendorCode);
                                                if (vendor) bulkSelection.toggleItem(vendor);
                                            }}
                                            onEdit={onEdit}
                                            onView={onView}
                                            onDelete={onDelete}
                                        />
                                    </Table>
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                ) : (
                    <div className="relative h-full flex items-center justify-center z-10">
                        <VendorTableEmpty onClearFilters={onClearFilters} />
                    </div>
                )}
            </div>

            {/* Smart Pagination with Bulk Actions */}
            {hasVendors && (
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