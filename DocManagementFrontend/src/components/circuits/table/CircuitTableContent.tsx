import { usePagination } from "@/hooks/usePagination";
import { CircuitTableHeader } from "./content/CircuitTableHeader";
import { CircuitTableBody } from "./content/CircuitTableBody";
import { CircuitTableEmpty } from "./content/CircuitTableEmpty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table } from "@/components/ui/table";
import SmartPagination from "@/components/shared/SmartPagination";
import { SortField, SortDirection } from "../hooks/useCircuitManagement";
import { Loader2, AlertTriangle } from "lucide-react";

interface CircuitTableContentProps {
  circuits: Circuit[] | undefined;
  selectedCircuits: number[];
  onSelectAll: () => void;
  onSelectCircuit: (circuitId: number) => void;
  onEdit: (circuit: Circuit) => void;
  onView: (circuit: Circuit) => void;
  onViewStatuses: (circuit: Circuit) => void;
  onDelete: (circuit: Circuit) => void;
  onToggleActive: (circuit: Circuit) => void;
  sortBy: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onClearFilters?: () => void;
  isLoading?: boolean;
  isError?: boolean;
  loadingCircuits?: number[];
  isSimpleUser?: boolean;
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
  isLoading = false,
  isError = false,
  loadingCircuits = [],
  isSimpleUser = false,
}: CircuitTableContentProps) {
  // Use pagination hook
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
    initialPageSize: 15,
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
          onSelectCircuit(circuitId);
        }
      });
    } else {
      // Select all circuits on current page only
      currentPageCircuitIds.forEach((circuitId) => {
        if (!selectedCircuits.includes(circuitId)) {
          onSelectCircuit(circuitId);
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
              <p className="table-glass-loading-text">Loading circuits...</p>
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
                Failed to load circuits. Please try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-full flex flex-col gap-4 w-full px-1`}
      style={{ minHeight: "100%" }}
    >
      {/* Modern Circuit Table */}
      <div className="flex-1 relative overflow-hidden rounded-2xl table-glass-container min-h-0 shadow-xl">
        {hasCircuits ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Fixed Header with Glass Effect */}
            <div className="flex-shrink-0 overflow-x-auto table-glass-header border-b border-border/20">
              <div className="min-w-[930px]">
                <Table className="table-fixed w-full">
                  <CircuitTableHeader
                    circuits={paginatedCircuits}
                    selectedCircuits={selectedCircuits.filter((id) =>
                      paginatedCircuits.some((circuit) => circuit.id === id)
                    )}
                    onSelectAll={handleSelectAll}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={onSort}
                    isSimpleUser={isSimpleUser}
                  />
                </Table>
              </div>
            </div>

            {/* Scrollable Body with Better Height Management */}
            <div
              className="flex-1 overflow-hidden"
              style={{ maxHeight: "calc(100vh - 320px)" }}
            >
              <ScrollArea className="h-full w-full">
                <div className="min-w-[930px]">
                  <Table className="table-fixed w-full">
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
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="relative h-full flex items-center justify-center z-10">
            <CircuitTableEmpty onClearFilters={onClearFilters} />
          </div>
        )}
      </div>

      {/* Enhanced Pagination with Glass Effect */}
      {hasCircuits && (
        <div className="flex-shrink-0 table-glass-pagination p-4 rounded-2xl shadow-lg backdrop-blur-md">
          <SmartPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            className="justify-center"
            pageSizeOptions={[10, 15, 25, 50, 100]}
            showFirstLast={true}
            maxVisiblePages={5}
          />
        </div>
      )}
    </div>
  );
}
