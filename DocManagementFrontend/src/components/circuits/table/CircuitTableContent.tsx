import { usePagination } from "@/hooks/usePagination";
import { CircuitTableHeader } from "./content/CircuitTableHeader";
import { CircuitTableBody } from "./content/CircuitTableBody";
import { CircuitTableEmpty } from "./content/CircuitTableEmpty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table } from "@/components/ui/table";
import SmartPagination from "@/components/shared/SmartPagination";
import { SortField, SortDirection } from "../hooks/useCircuitManagement";

interface CircuitTableContentProps {
  circuits: Circuit[];
  selectedCircuits: number[];
  onSelectAll: () => void;
  onSelectCircuit: (circuitId: number, checked: boolean) => void;
  onEdit: (circuit: Circuit) => void;
  onView: (circuit: Circuit) => void;
  onViewStatuses: (circuit: Circuit) => void;
  onDelete: (circuit: Circuit) => void;
  onToggleActive: (circuit: Circuit) => void;
  sortBy: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onClearFilters: () => void;
  isLoading: boolean;
  isError: boolean;
  loadingCircuits: number[];
  isSimpleUser: boolean;
}

export function CircuitTableContent({
  circuits,
  selectedCircuits,
  onSelectAll,
  onSelectCircuit,
  onEdit,
  onView,
  onViewStatuses,
  onDelete,
  onToggleActive,
  sortBy,
  sortDirection,
  onSort,
  onClearFilters,
  isLoading,
  isError,
  loadingCircuits,
  isSimpleUser,
}: CircuitTableContentProps) {
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedCircuits,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: circuits || [],
    initialPageSize: 5, // Small page size to ensure pagination is visible
  });

  // Check if we have circuits to display
  const hasCircuits = circuits && circuits.length > 0;

  // Handle select all for paginated data
  const handleSelectAll = () => {
    const currentPageCircuitIds = paginatedCircuits.map(
      (circuit) => circuit.id
    );
    const allCurrentSelected = currentPageCircuitIds.every((id) =>
      selectedCircuits.includes(id)
    );

    if (allCurrentSelected) {
      // Deselect all circuits on current page
      currentPageCircuitIds.forEach((circuitId) => {
        if (selectedCircuits.includes(circuitId)) {
          onSelectCircuit(circuitId, false);
        }
      });
    } else {
      // Select all circuits on current page only
      currentPageCircuitIds.forEach((circuitId) => {
        if (!selectedCircuits.includes(circuitId)) {
          onSelectCircuit(circuitId, true);
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col gap-3" style={{ minHeight: "100%" }}>
        <div className="flex-1 relative overflow-hidden rounded-2xl table-glass-container min-h-0">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex flex-col gap-3" style={{ minHeight: "100%" }}>
        <div className="flex-1 relative overflow-hidden rounded-2xl table-glass-container min-h-0">
          <div className="py-20 text-center">
            <div className="h-8 w-8 rounded-full bg-destructive/20 text-destructive flex items-center justify-center mx-auto mb-4">
              <span className="font-bold">!</span>
            </div>
            <div className="text-lg font-medium text-foreground">
              Error loading circuits
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Please try again later
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!circuits || circuits.length === 0) {
    return <CircuitTableEmpty onClearFilters={onClearFilters} />;
  }

  return (
    <div className="h-full flex flex-col gap-3" style={{ minHeight: "100%" }}>
      {/* Circuit Table */}
      <div className="flex-1 relative overflow-hidden rounded-2xl table-glass-container min-h-0">
        {hasCircuits ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Single Scroll Container for Both Header and Body */}
            <div className="flex-1 overflow-auto">
              <Table className="table-fixed w-full min-w-[940px]">
                {/* Fixed Header */}
                <div className="table-glass-header sticky top-0 z-20">
                  <CircuitTableHeader
                    circuits={paginatedCircuits}
                    selectedCircuits={selectedCircuits}
                    onSelectAll={handleSelectAll}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={onSort}
                    isSimpleUser={isSimpleUser}
                  />
                </div>

                {/* Scrollable Body */}
                <CircuitTableBody
                  circuits={paginatedCircuits}
                  selectedCircuits={selectedCircuits}
                  onSelectCircuit={onSelectCircuit}
                  onEdit={onEdit}
                  onView={onView}
                  onViewStatuses={onViewStatuses}
                  onDelete={onDelete}
                  onToggleActive={onToggleActive}
                  loadingCircuits={loadingCircuits}
                  isSimpleUser={isSimpleUser}
                />
              </Table>
            </div>
          </div>
        ) : (
          <div className="relative h-full flex items-center justify-center z-10">
            <CircuitTableEmpty onClearFilters={onClearFilters} />
          </div>
        )}
      </div>

      {/* Pagination */}
      {circuits.length > 0 && (
        <div className="mt-3 sm:mt-4">
          <SmartPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            className="justify-center"
            pageSizeOptions={[5, 10, 15, 25, 50]}
            showFirstLast={true}
            maxVisiblePages={3}
          />
        </div>
      )}
    </div>
  );
}
