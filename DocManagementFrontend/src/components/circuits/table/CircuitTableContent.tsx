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

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl table-glass-loading shadow-lg">
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 table-glass-loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="relative overflow-hidden rounded-2xl table-glass-error shadow-lg">
        <div className="py-20 text-center">
          <div className="h-8 w-8 rounded-full table-glass-error-icon flex items-center justify-center mx-auto mb-4">
            <span className="font-bold">!</span>
          </div>
          <div className="text-lg font-medium table-glass-error-text">
            Error loading circuits
          </div>
          <div className="text-sm table-glass-error-text mt-2 opacity-70">
            Please try again later
          </div>
        </div>
      </div>
    );
  }

  if (!circuits || circuits.length === 0) {
    return <CircuitTableEmpty onClearFilters={onClearFilters} />;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl table-glass-container shadow-lg">
      <div className="flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0 overflow-x-auto table-glass-header">
          <div className="min-w-[960px]">
            <Table className="table-fixed w-full">
              <CircuitTableHeader
                circuits={paginatedCircuits}
                selectedCircuits={selectedCircuits}
                onSelectAll={onSelectAll}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={onSort}
                isSimpleUser={isSimpleUser}
              />
            </Table>
          </div>
        </div>

        {/* Scrollable Body */}
        <ScrollArea className="flex-1 max-h-[600px]">
          <div className="min-w-[960px]">
            <Table className="table-fixed w-full">
              <CircuitTableBody
                circuits={paginatedCircuits}
                selectedCircuits={selectedCircuits}
                onSelectCircuit={onSelectCircuit}
                onEdit={onEdit}
                onView={onView}
                onDelete={onDelete}
                onToggleActive={onToggleActive}
                loadingCircuits={loadingCircuits}
                isSimpleUser={isSimpleUser}
              />
            </Table>
          </div>
        </ScrollArea>

        {/* Pagination - Always show when there are items */}
        <div className="flex-shrink-0 table-glass-pagination p-4">
          <SmartPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[5, 10, 15, 25, 50]}
            showFirstLast={true}
            maxVisiblePages={5}
          />
        </div>
      </div>
    </div>
  );
}
