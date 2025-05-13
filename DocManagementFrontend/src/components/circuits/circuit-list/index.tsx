import { useAuth } from "@/context/AuthContext";
import { useCircuitList } from "./hooks/useCircuitList";
import { CircuitListContent } from "./CircuitListContent";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { CircuitBulkActionsBar } from "./CircuitBulkActionsBar";
import { AnimatePresence } from "framer-motion";

interface CircuitsListProps {
  onApiError?: (errorMessage: string) => void;
  searchQuery?: string;
  statusFilter?: string;
}

export default function CircuitsList({
  onApiError,
  searchQuery = "",
  statusFilter = "any",
}: CircuitsListProps) {
  const { user } = useAuth();
  const isSimpleUser = user?.role === "SimpleUser";

  const {
    circuits,
    isLoading,
    isError,
    selectedCircuit,
    selectedCircuits,
    sortConfig,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    detailsDialogOpen,
    setDetailsDialogOpen,
    bulkDeleteDialogOpen,
    setBulkDeleteDialogOpen,
    handleEdit,
    handleDelete,
    handleViewDetails,
    handleSelectCircuit,
    handleSelectAll,
    openBulkDeleteDialog,
    confirmBulkDelete,
    requestSort,
    confirmDelete,
    refetch,
  } = useCircuitList({
    onApiError,
    searchQuery,
    statusFilter,
  });

  return (
    <>
      <CircuitListContent
        circuits={circuits}
        isLoading={isLoading}
        isError={isError}
        isSimpleUser={isSimpleUser}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        selectedCircuit={selectedCircuit}
        selectedCircuits={selectedCircuits}
        sortConfig={sortConfig}
        editDialogOpen={editDialogOpen}
        deleteDialogOpen={deleteDialogOpen}
        detailsDialogOpen={detailsDialogOpen}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
        onSelectCircuit={handleSelectCircuit}
        onSelectAll={handleSelectAll}
        onSort={requestSort}
        onBulkDelete={openBulkDeleteDialog}
        setEditDialogOpen={setEditDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        setDetailsDialogOpen={setDetailsDialogOpen}
        confirmDelete={confirmDelete}
        refetch={refetch}
      />

      {/* Bulk actions bar */}
      {!isSimpleUser && (
        <AnimatePresence>
          {selectedCircuits.length > 0 && (
            <CircuitBulkActionsBar
              selectedCount={selectedCircuits.length}
              onDelete={openBulkDeleteDialog}
            />
          )}
        </AnimatePresence>
      )}

      {/* Bulk delete confirmation dialog */}
      <DeleteConfirmDialog
        title="Delete Circuits"
        description={`Are you sure you want to delete ${selectedCircuits.length} selected circuits? This action cannot be undone.`}
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        onConfirm={confirmBulkDelete}
        confirmText="Delete"
        destructive={true}
      />
    </>
  );
}
