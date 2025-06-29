import { ResponsibilityCentre } from "@/models/responsibilityCentre";
import { Table } from "@/components/ui/table";
import { ResponsibilityCentreTableHeader } from "./content/ResponsibilityCentreTableHeader";
import { ResponsibilityCentreTableBody } from "./content/ResponsibilityCentreTableBody";
import { ResponsibilityCentreTableEmpty } from "./ResponsibilityCentreTableEmpty";
import { ScrollArea } from "@/components/ui/scroll-area";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";
import { Loader2 } from "lucide-react";

interface ResponsibilityCentreTableContentProps {
  centres: ResponsibilityCentre[] | undefined;
  selectedCentres: number[];
  onSelectAll: () => void;
  onSelectCentre: (centreId: number) => void;
  onEdit: (centre: ResponsibilityCentre) => void;
  onDelete: (centre: ResponsibilityCentre) => void;
  onAssociateUsers: (centre: ResponsibilityCentre) => void;
  onViewDetails: (centre: ResponsibilityCentre) => void;
  sortBy: string;
  sortDirection: string;
  onSort: (field: string) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
  isError?: boolean;
}

export function ResponsibilityCentreTableContent({
  centres,
  selectedCentres,
  onSelectAll,
  onSelectCentre,
  onEdit,
  onDelete,
  onAssociateUsers,
  onViewDetails,
  sortBy,
  sortDirection,
  onSort,
  onClearFilters,
  isLoading = false,
  isError = false,
}: ResponsibilityCentreTableContentProps) {
  // Use pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedCentres,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: centres || [],
    initialPageSize: 15,
  });

  // Check if we have centres to display
  const hasCentres = centres && centres.length > 0;

  // Handle select all for paginated data
  const handleSelectAll = () => {
    const currentPageCentreIds = paginatedCentres.map((centre) => centre.id);
    const allCurrentSelected = currentPageCentreIds.every((id) =>
      selectedCentres.includes(id)
    );

    if (allCurrentSelected) {
      // Deselect all centres on current page
      currentPageCentreIds.forEach((centreId) => {
        if (selectedCentres.includes(centreId)) {
          onSelectCentre(centreId);
        }
      });
    } else {
      // Select all centres on current page only
      currentPageCentreIds.forEach((centreId) => {
        if (!selectedCentres.includes(centreId)) {
          onSelectCentre(centreId);
        }
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl table-glass-loading shadow-lg">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin table-glass-loading-spinner" />
              <p className="table-glass-loading-text">Loading centres...</p>
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
        <div className="relative overflow-hidden rounded-2xl table-glass-error shadow-lg">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 rounded-full table-glass-error-icon flex items-center justify-center">
                <span className="font-bold">!</span>
              </div>
              <p className="table-glass-error-text">
                Failed to load centres. Please try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3" style={{ minHeight: "100%" }}>
      <div className="flex-1 relative overflow-hidden rounded-2xl table-glass-container min-h-0">
        {hasCentres ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Fixed Header - Never Scrolls */}
            <div className="flex-shrink-0 overflow-x-auto table-glass-header">
              <div className="min-w-[930px]">
                <Table className="table-fixed w-full">
                  <ResponsibilityCentreTableHeader
                    selectedCount={
                      selectedCentres.filter((id) =>
                        paginatedCentres.some((centre) => centre.id === id)
                      ).length
                    }
                    totalCount={paginatedCentres.length}
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
              style={{ maxHeight: "calc(100vh - 280px)" }}
            >
              <ScrollArea className="h-full w-full">
                <div className="min-w-[930px] pb-2">
                  <Table className="table-fixed w-full">
                    <ResponsibilityCentreTableBody
                      centres={paginatedCentres}
                      selectedCentres={selectedCentres}
                      onSelectCentre={onSelectCentre}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onAssociateUsers={onAssociateUsers}
                      onViewDetails={onViewDetails}
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

      {/* Smart Pagination */}
      {hasCentres && (
        <div className="table-glass-pagination p-4 rounded-b-2xl">
          <SmartPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[10, 15, 25, 50, 100]}
          />
        </div>
      )}
    </div>
  );
}
