import React from "react";
import { Table } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UnitCodesTableHeader } from "./content/UnitCodesTableHeader";
import { UnitCodesTableBody } from "./content/UnitCodesTableBody";
import { UnitCodesTableEmpty } from "./UnitCodesTableEmpty";
import { Loader2, Trash2 } from "lucide-react";
import PaginationWithBulkActions, { BulkAction } from "@/components/shared/PaginationWithBulkActions";
import { UniteCode } from "@/models/lineElements";

interface UnitCodesTableContentProps {
  unitCodes: UniteCode[] | undefined;
  allUnitCodes?: UniteCode[] | undefined;
  selectedItems: string[]; // Array of unit code codes from bulk selection
  bulkSelection: any; // Using any to match ElementTypes pattern
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    handlePageChange: (page: number) => void;
    handlePageSizeChange: (size: number) => void;
  };
  onEdit: (unitCode: UniteCode) => void;
  onView: (unitCode: UniteCode) => void;
  onDelete: (code: string) => void;
  sortBy: string;
  sortDirection: string;
  onSort: (field: string) => void;
  onClearFilters: () => void;
  onBulkDelete?: () => void;
  isLoading?: boolean;
  isError?: boolean;
}

export function UnitCodesTableContent({
  unitCodes,
  allUnitCodes,
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
  onBulkDelete,
  isLoading = false,
  isError = false,
}: UnitCodesTableContentProps) {
  // Use pagination from props
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    handlePageChange,
    handlePageSizeChange,
  } = pagination;

  // Check if we have unit codes to display
  const hasUnitCodes = unitCodes && unitCodes.length > 0;

  // Define bulk actions (disabled)
  const bulkActions: BulkAction[] = [
    {
      id: 'delete',
      label: 'Delete Unit Codes (Disabled)',
      icon: <Trash2 className="h-4 w-4 opacity-50" />,
      variant: 'outline', // Use outline instead of destructive to appear disabled
      onClick: () => {
        // Disabled - no action
      },
      requiresConfirmation: false,
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
              <p className="text-muted-foreground">Loading unit codes...</p>
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
                Failed to load unit codes. Please try again.
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

        {hasUnitCodes ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Fixed Header - Never Scrolls */}
            <div className="flex-shrink-0 overflow-x-auto border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
              <div className="min-w-[778px]">
                <Table className="table-fixed w-full table-compact">
                  <UnitCodesTableHeader
                    selectedCount={bulkSelection.currentPageSelectedCount}
                    totalCount={unitCodes?.length || 0} // Current page items count
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
                <div className="min-w-[778px] pb-4">
                  <Table className="table-fixed w-full table-compact">
                    <UnitCodesTableBody
                      unitCodes={unitCodes || []}
                      selectedItems={bulkSelection.selectedItems} // Pass keys array directly
                      onSelectItem={(code) => {
                        const unitCode = unitCodes?.find(u => u.code === code);
                        if (unitCode) bulkSelection.toggleItem(unitCode);
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
            <UnitCodesTableEmpty hasSearchQuery={false} onClearSearch={onClearFilters} />
          </div>
        )}
      </div>

      {/* Smart Pagination with Bulk Actions */}
      {hasUnitCodes && (
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

export default UnitCodesTableContent; 