import { ResponsibilityCentre } from "@/models/responsibilityCentre";
import { Table } from "@/components/ui/table";
import { ResponsibilityCentreTableHeader } from "./content/ResponsibilityCentreTableHeader";
import { ResponsibilityCentreTableBody } from "./content/ResponsibilityCentreTableBody";
import { ResponsibilityCentreTableEmpty } from "./ResponsibilityCentreTableEmpty";
import { ScrollArea } from "@/components/ui/scroll-area";
import PaginationWithBulkActions, { BulkAction } from "@/components/shared/PaginationWithBulkActions";
import { Loader2, Trash2 } from "lucide-react";
import { BulkSelectionState } from "@/hooks/useBulkSelection";

interface ResponsibilityCentreTableContentProps {
  centres: ResponsibilityCentre[] | undefined;
  allCentres?: ResponsibilityCentre[] | undefined;
  selectedCentres: any[];
  bulkSelection: BulkSelectionState<ResponsibilityCentre> & {
    toggleItem: (item: ResponsibilityCentre) => void;
    toggleSelectCurrentPage: () => void;
    isSelected: (item: ResponsibilityCentre) => boolean;
  };
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    handlePageChange: (page: number) => void;
    handlePageSizeChange: (size: number) => void;
  };
  onToggleStatus: (centreId: number, currentStatus: boolean) => void;
  onEdit: (centre: ResponsibilityCentre) => void;
  onDelete: (centreId: number) => void;
  onViewDetails: (centre: ResponsibilityCentre) => void;
  onAssociateUsers: (centre: ResponsibilityCentre) => void;
  onRemoveUsers?: (centre: ResponsibilityCentre) => void;
  userCounts?: Record<number, number>;
  sortBy: string;
  sortDirection: string;
  onSort: (field: string) => void;
  onClearFilters: () => void;
  onBulkDelete?: () => void;
  isLoading?: boolean;
  isError?: boolean;
}

export function ResponsibilityCentreTableContent({
  centres,
  allCentres,
  selectedCentres,
  bulkSelection,
  pagination,
  onToggleStatus,
  onEdit,
  onDelete,
  onViewDetails,
  onAssociateUsers,
  onRemoveUsers,
  userCounts = {},
  sortBy,
  sortDirection,
  onSort,
  onClearFilters,
  onBulkDelete,
  isLoading = false,
  isError = false,
}: ResponsibilityCentreTableContentProps) {
  // Use pagination from props
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    handlePageChange,
    handlePageSizeChange,
  } = pagination;

  // Check if we have centres to display
  const hasCentres = centres && centres.length > 0;

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      id: 'delete',
      label: 'Delete Centres',
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
              <p className="text-muted-foreground">Loading centres...</p>
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
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-destructive" />
              </div>
              <p className="text-destructive">Error loading centres</p>
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

        {hasCentres ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Fixed Header - Never Scrolls */}
            <div className="flex-shrink-0 overflow-x-auto border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
              <div className="min-w-[800px]">
                <Table className="table-fixed w-full">
                  <ResponsibilityCentreTableHeader
                    selectedCount={bulkSelection.currentPageSelectedCount}
                    totalCount={centres?.length || 0}
                    onSelectAll={bulkSelection.toggleSelectCurrentPage}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={onSort}
                  />
                </Table>
              </div>
            </div>

            {/* Scrollable Body - Only Content Scrolls */}
            <div
              className="flex-1 overflow-hidden"
              style={{ maxHeight: "calc(100vh - 300px)" }}
            >
              <ScrollArea className="table-scroll-area h-full w-full">
                <div className="min-w-[800px] pb-4">
                  <Table className="table-fixed w-full">
                    <ResponsibilityCentreTableBody
                      centres={centres || []}
                      selectedCentres={selectedCentres}
                      onSelectCentre={(centreId) => {
                        const centre = centres?.find(c => c.id === centreId);
                        if (centre) bulkSelection.toggleItem(centre);
                      }}
                      onToggleStatus={onToggleStatus}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onViewDetails={onViewDetails}
                      onAssociateUsers={onAssociateUsers}
                      onRemoveUsers={onRemoveUsers}
                      userCounts={userCounts}
                    />
                  </Table>
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="relative h-full flex items-center justify-center z-10">
            <ResponsibilityCentreTableEmpty onClearFilters={onClearFilters} />
          </div>
        )}
      </div>

      {/* Smart Pagination with Bulk Actions */}
      {hasCentres && (
        <PaginationWithBulkActions
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
                     bulkSelection={bulkSelection as any}
          bulkActions={bulkActions}
        />
      )}
    </div>
  );
} 