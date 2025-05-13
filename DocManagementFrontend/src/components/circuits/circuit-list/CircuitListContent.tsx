import { ScrollArea } from "@/components/ui/scroll-area";
import EditCircuitDialog from "../EditCircuitDialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import CircuitDetailsDialog from "../CircuitDetailsDialog";
import { CircuitLoadingState } from "./CircuitLoadingState";
import { CircuitEmptyState } from "./CircuitEmptyState";
import { CircuitsTable } from "./CircuitsTable";
import { Trash } from "lucide-react";

interface CircuitListContentProps {
  circuits: Circuit[] | undefined;
  isLoading: boolean;
  isError: boolean;
  isSimpleUser: boolean;
  searchQuery: string;
  statusFilter?: string;
  selectedCircuit: Circuit | null;
  selectedCircuits: number[];
  sortConfig: { key: string; direction: "asc" | "desc" } | null;
  editDialogOpen: boolean;
  deleteDialogOpen: boolean;
  detailsDialogOpen: boolean;
  onEdit: (circuit: Circuit) => void;
  onDelete: (circuit: Circuit) => void;
  onViewDetails: (circuit: Circuit) => void;
  onSelectCircuit: (id: number) => void;
  onSelectAll: () => void;
  onSort: (key: string) => void;
  onBulkDelete: () => void;
  setEditDialogOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
  setDetailsDialogOpen: (open: boolean) => void;
  confirmDelete: () => Promise<void>;
  refetch: () => void;
  hasNoSearchResults?: boolean;
}

export function CircuitListContent({
  circuits,
  isLoading,
  isError,
  isSimpleUser,
  searchQuery,
  statusFilter = "any",
  selectedCircuit,
  selectedCircuits,
  sortConfig,
  editDialogOpen,
  deleteDialogOpen,
  detailsDialogOpen,
  onEdit,
  onDelete,
  onViewDetails,
  onSelectCircuit,
  onSelectAll,
  onSort,
  onBulkDelete,
  setEditDialogOpen,
  setDeleteDialogOpen,
  setDetailsDialogOpen,
  confirmDelete,
  refetch,
  hasNoSearchResults,
}: CircuitListContentProps) {
  if (isLoading) {
    return <CircuitLoadingState />;
  }

  if (isError) {
    return <div className="text-red-500 p-8">Error loading circuits</div>;
  }

  return (
    <div className="rounded-xl border border-blue-900/30 overflow-hidden bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
      <ScrollArea className="h-[calc(100vh-280px)] min-h-[400px]">
        <div className="min-w-[800px]">
          {circuits && circuits.length > 0 ? (
            <CircuitsTable
              circuits={circuits}
              isSimpleUser={isSimpleUser}
              selectedCircuits={selectedCircuits}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetails={onViewDetails}
              onSelectCircuit={onSelectCircuit}
              onSelectAll={onSelectAll}
              sortConfig={sortConfig}
              onSort={onSort}
              onBulkDelete={onBulkDelete}
            />
          ) : (
            <CircuitEmptyState
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              isSimpleUser={isSimpleUser}
            />
          )}
        </div>
      </ScrollArea>

      {selectedCircuit && (
        <>
          {!isSimpleUser && (
            <>
              <EditCircuitDialog
                circuit={selectedCircuit}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSuccess={refetch}
              />

              <DeleteConfirmDialog
                title="Delete Circuit"
                description={`Are you sure you want to delete the circuit "${selectedCircuit.title}"? This action cannot be undone.`}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                confirmText="Delete"
                destructive={true}
              />
            </>
          )}

          <CircuitDetailsDialog
            circuit={selectedCircuit}
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
          />
        </>
      )}
    </div>
  );
}
