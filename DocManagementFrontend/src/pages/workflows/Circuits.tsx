import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  GitBranch,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout/PageLayout";
import { CircuitsTable } from "@/components/circuits/CircuitsTable";
import CreateCircuitDialog from "@/components/circuits/CreateCircuitDialog";
import EditCircuitDialog from "@/components/circuits/EditCircuitDialog";
import CircuitActivationDialog from "@/components/circuits/CircuitActivationDialog";
import CircuitDeactivationDialog from "@/components/circuits/CircuitDeactivationDialog";
import { useQuery } from "@tanstack/react-query";
import documentTypeService from "@/services/documentTypeService";

const CircuitsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
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
    setCreateOpen(false);
  };

  const handleEdit = (circuit: Circuit) => {
    setSelectedCircuit(circuit);
    setEditOpen(true);
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
    } catch (error: any) {
      toast.error(error?.message || "Failed to toggle circuit status");
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
        onToggleStatus={handleToggleStatus}
        onManageSteps={handleManageSteps}
      />

      {/* Dialogs */}
      <CreateCircuitDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleCircuitCreated}
      />

      {selectedCircuit && (
        <EditCircuitDialog
          circuit={selectedCircuit}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={() => {
            setEditOpen(false);
          }}
        />
      )}

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
