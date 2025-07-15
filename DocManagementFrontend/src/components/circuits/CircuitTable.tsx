// Circuit interface is globally available from vite-env.d.ts
import { CircuitTableContent } from "./table/CircuitTableContent";

interface CircuitTableProps {
    circuits: Circuit[];
    selectedItems: number[];
    onSelectCircuit: (circuit: Circuit) => void;
    onSelectAll: () => void;
    onEdit: (circuit: Circuit) => void;
    onDelete: (circuit: Circuit) => void;
    onView: (circuit: Circuit) => void;
    onToggleStatus: (circuit: Circuit) => void;
    onManageSteps: (circuit: Circuit) => void;
    sortBy: string;
    sortDirection: string;
    onSort: (field: string) => void;
    isSimpleUser?: boolean;
    isLoading?: boolean;
    isError?: boolean;
    searchQuery?: string;
}

export function CircuitTable({
    circuits,
    selectedItems,
    onSelectCircuit,
    onSelectAll,
    onEdit,
    onDelete,
    onView,
    onToggleStatus,
    onManageSteps,
    sortBy,
    sortDirection,
    onSort,
    isSimpleUser = false,
    isLoading = false,
    isError = false,
    searchQuery = "",
}: CircuitTableProps) {

    // Create mock bulk selection object that matches the pattern
    const bulkSelection = {
        selectedItems,
        currentPageSelectedCount: selectedItems.length,
        toggleSelectCurrentPage: onSelectAll,
        toggleItem: onSelectCircuit,
    };

    // Create mock pagination object
    const pagination = {
        currentPage: 1,
        pageSize: circuits.length,
        totalPages: 1,
        totalItems: circuits.length,
        handlePageChange: () => { },
        handlePageSizeChange: () => { },
    };

    const handleClearFilters = () => {
        // This would be handled by parent component
    };

    return (
        <CircuitTableContent
            circuits={circuits}
            selectedItems={selectedItems}
            bulkSelection={bulkSelection}
            pagination={pagination}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            onToggleStatus={onToggleStatus}
            onManageSteps={onManageSteps}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={onSort}
            onClearFilters={handleClearFilters}
            isLoading={isLoading}
            isError={isError}
            isSimpleUser={isSimpleUser}
            searchQuery={searchQuery}
        />
    );
} 