import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
// Circuit interface is globally available from vite-env.d.ts
import {
  GitBranch,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageLayout } from "@/components/layout/PageLayout";
import { useCircuitManagement } from "@/hooks/useCircuitManagement";
import { CircuitsTable } from "@/components/circuits/CircuitsTable";
import CreateCircuitDialog from "@/components/circuits/CreateCircuitDialog";
import EditCircuitDialog from "@/components/circuits/EditCircuitDialog";
import CircuitActivationDialog from "@/components/circuits/CircuitActivationDialog";
import CircuitDeactivationDialog from "@/components/circuits/CircuitDeactivationDialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { useQuery } from "@tanstack/react-query";
import documentTypeService from "@/services/documentTypeService";
import circuitService from "@/services/circuitService";

const CircuitsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Use the new circuit management hook
  const {
    circuits: filteredCircuits,
    paginatedCircuits,
    isLoading,
    isError,
    refetch,
    selectedItems,
    bulkSelection,
    pagination,
    editingCircuit,
    setEditingCircuit,
    viewingCircuit,
    setViewingCircuit,
    deletingCircuit,
    setDeletingCircuit,
    deleteMultipleOpen,
    setDeleteMultipleOpen,
    searchQuery,
    setSearchQuery,
    searchField,
    setSearchField,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    showAdvancedFilters,
    setShowAdvancedFilters,
    sortBy,
    sortDirection,
    handleSort,
    handleSelectCircuit,
    handleSelectAll,
    handleCircuitEdited,
    handleCircuitDeleted,
    handleMultipleDeleted,
    clearAllFilters,
    getActiveFiltersCount,
    getFilterBadges,
  } = useCircuitManagement();

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedCircuit, setSelectedCircuit] = useState<Circuit | null>(null);
  const [circuitToActivate, setCircuitToActivate] = useState<Circuit | null>(null);
  const [circuitToDeactivate, setCircuitToDeactivate] = useState<Circuit | null>(null);

  const isSimpleUser = user?.role === "SimpleUser";

  // Fetch document types for filtering
  const { data: documentTypes } = useQuery({
    queryKey: ["documentTypes"],
    queryFn: () => documentTypeService.getAllDocumentTypes(),
    retry: 1,
  });

  // Circuit actions
  const handleCircuitCreated = () => {
    refetch();
    setCreateOpen(false);
  };

  const handleEdit = (circuit: Circuit) => {
    setSelectedCircuit(circuit);
    setEditingCircuit(circuit);
    setEditOpen(true);
  };

  const handleDelete = (circuit: Circuit) => {
    setSelectedCircuit(circuit);
    setDeletingCircuit(circuit);
    setDeleteOpen(true);
  };

  const handleView = (circuit: Circuit) => {
    navigate(`/circuits/${circuit.id}/statuses`);
  };

  const handleManageSteps = (circuit: Circuit) => {
    navigate(`/circuits/${circuit.id}/steps`);
  };

  const handleToggleStatus = async (circuit: Circuit) => {
    if (circuit.isActive) {
      setCircuitToDeactivate(circuit);
    } else {
      setCircuitToActivate(circuit);
    }
  };

  const performToggle = async (circuit: Circuit) => {
    try {
      // For now, just update the circuit status locally
      // TODO: Implement actual API calls when available
      toast.success(circuit.isActive ? "Circuit deactivated successfully" : "Circuit activated successfully");
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Failed to toggle circuit status");
    }
  };

  const performDelete = async () => {
    if (!selectedCircuit) return;

    try {
      await circuitService.deleteCircuit(selectedCircuit.id);
      toast.success("Circuit deleted successfully");
      handleCircuitDeleted();
      setDeleteOpen(false);
      setSelectedCircuit(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete circuit");
    }
  };

  const performBulkDelete = async () => {
    try {
      // For now, delete circuits one by one
      // TODO: Implement bulk delete API when available
      await Promise.all(selectedItems.map(id => circuitService.deleteCircuit(id)));
      toast.success(`${selectedItems.length} circuits deleted successfully`);
      handleMultipleDeleted();
      setBulkDeleteOpen(false);
    } catch (error: any) {
      toast.error("Failed to delete circuits");
    }
  };

  // Page actions
  const pageActions = [
    ...(isSimpleUser
      ? []
      : [
        {
          label: "New Circuit",
          variant: "default" as const,
          icon: Plus,
          onClick: () => setCreateOpen(true),
        },
      ]),
  ];

  return (
    <PageLayout
      title="Circuit Management"
      subtitle={
        isSimpleUser
          ? "View document workflow circuits"
          : "Create and manage document workflow circuits"
      }
      icon={GitBranch}
      actions={pageActions}
    >
      {/* Circuit Table with Search and Filters like Document Types */}
      <CircuitsTable
        onCreateCircuit={() => setCreateOpen(true)}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onManageSteps={handleManageSteps}
      />

      {/* Dialogs */}
      <CreateCircuitDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleCircuitCreated}
      />

      {editingCircuit && (
        <EditCircuitDialog
          circuit={editingCircuit}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={() => {
            handleCircuitEdited();
            setEditOpen(false);
          }}
        />
      )}

      <DeleteConfirmDialog
        title="Delete Circuit"
        description={`Are you sure you want to delete the circuit "${selectedCircuit?.title}"? This action cannot be undone.`}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={performDelete}
        confirmText="Delete"
        destructive={true}
      />

      <DeleteConfirmDialog
        title="Delete Circuits"
        description={`Are you sure you want to delete ${selectedItems.length} circuits? This action cannot be undone.`}
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onConfirm={performBulkDelete}
        confirmText="Delete"
        destructive={true}
      />

      {/* Circuit Activation Dialog */}
      {circuitToActivate && (
        <CircuitActivationDialog
          isOpen={true}
          onClose={() => setCircuitToActivate(null)}
          circuit={circuitToActivate}
          onActivate={() => {
            performToggle(circuitToActivate);
            setCircuitToActivate(null);
          }}
        />
      )}

      {/* Circuit Deactivation Dialog */}
      {circuitToDeactivate && (
        <CircuitDeactivationDialog
          isOpen={true}
          onClose={() => setCircuitToDeactivate(null)}
          circuit={circuitToDeactivate}
          onDeactivate={() => {
            performToggle(circuitToDeactivate);
            setCircuitToDeactivate(null);
          }}
        />
      )}
    </PageLayout>
  );
};

export default CircuitsPage;
