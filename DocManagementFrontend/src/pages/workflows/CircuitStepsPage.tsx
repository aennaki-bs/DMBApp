import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { StepFormDialog } from '@/components/steps/dialogs/StepFormDialog';
import { DeleteStepDialog } from '@/components/steps/dialogs/DeleteStepDialog';
import { useAuth } from '@/context/AuthContext';
import { useCircuitSteps } from '@/hooks/useCircuitSteps';
import { toast } from 'sonner';
import stepService from '@/services/stepService';
import { PageLayout } from '@/components/layout/PageLayout';
import { Plus, GitBranch, ArrowLeft } from 'lucide-react';
import { CircuitStepsTableView } from '@/components/steps/CircuitStepsTableView';
import { useNavigate } from 'react-router-dom';
import { Step } from '@/models/step';

export default function CircuitStepsPage() {
  const { circuitId = '' } = useParams<{ circuitId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSimpleUser = user?.role === 'SimpleUser';

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    circuit,
    steps,
    searchQuery,
    selectedSteps,
    apiError,
    isLoading,
    isError,
    setSearchQuery,
    handleStepSelection,
    handleSelectAll,
    setSelectedSteps,
    refetchSteps
  } = useCircuitSteps(circuitId);

  const isCircuitActive = circuit?.isActive || false;

  const handleAddStep = () => {
    if (isCircuitActive) {
      toast.error("Cannot add steps to an active circuit");
      return;
    }
    setSelectedStep(null);
    setFormDialogOpen(true);
  };

  const handleEditStep = (step: Step) => {
    if (isCircuitActive) {
      toast.error("Cannot edit steps in an active circuit");
      return;
    }
    setSelectedStep(step);
    setFormDialogOpen(true);
  };

  const handleDeleteStep = (step: Step) => {
    if (isCircuitActive) {
      toast.error("Cannot delete steps from an active circuit");
      return;
    }
    setSelectedStep(step);
    setDeleteDialogOpen(true);
  };

  const handleBulkDelete = async () => {
    if (isCircuitActive) {
      toast.error("Cannot delete steps from an active circuit");
      return;
    }

    if (selectedSteps.length === 0) {
      toast.error("No steps selected for deletion");
      return;
    }

    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      setIsDeleting(true);
      setBulkDeleteDialogOpen(false);
      await stepService.deleteMultipleSteps(selectedSteps);
      setSelectedSteps([]);
      refetchSteps();
      toast.success(`Successfully deleted ${selectedSteps.length} steps`);
    } catch (error) {
      console.error('Failed to delete steps:', error);
      toast.error('Failed to delete selected steps');
    } finally {
      setIsDeleting(false);
    }
  };

  // Page actions
  const pageActions = [
    {
      label: "Back to Circuits",
      variant: "outline" as const,
      icon: ArrowLeft,
      onClick: () => navigate('/circuits'),
    },
    {
      label: "Add Step",
      variant: "default" as const,
      icon: Plus,
      onClick: handleAddStep,
      disabled: isSimpleUser || isCircuitActive,
      tooltip: isSimpleUser
        ? "You don't have permission to add steps"
        : isCircuitActive
          ? "Cannot add steps to an active circuit"
          : undefined,
    },
  ];

  // Add bulk actions when steps are selected
  const bulkActions = selectedSteps.length > 0 && !isCircuitActive && !isSimpleUser ? [
    {
      label: `Delete ${selectedSteps.length} Steps`,
      variant: "destructive" as const,
      onClick: handleBulkDelete,
    }
  ] : [];

  const allActions = [...pageActions, ...bulkActions];

  // If circuit not found
  if (!isLoading && !isError && !circuit) {
    return (
      <PageLayout
        title="Circuit Not Found"
        subtitle="The requested circuit could not be found"
        icon={GitBranch}
        actions={pageActions.slice(0, 1)}
      >
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            The circuit you're looking for doesn't exist or has been removed.
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={circuit ? `${circuit.title} - Steps` : "Circuit Steps"}
      subtitle={
        circuit
          ? `Manage steps for circuit: ${circuit.circuitKey}${isCircuitActive ? ' (Active Circuit)' : ''}`
          : "Loading circuit information..."
      }
      icon={GitBranch}
      actions={allActions}
    >
      <CircuitStepsTableView
        steps={steps}
        selectedSteps={selectedSteps}
        onSelectStep={handleStepSelection}
        onSelectAll={handleSelectAll}
        onEdit={handleEditStep}
        onDelete={handleDeleteStep}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isCircuitActive={isCircuitActive}
        isSimpleUser={isSimpleUser}
        circuit={circuit}
      />

      <StepFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSuccess={refetchSteps}
        editStep={selectedStep ?? undefined}
        circuitId={parseInt(circuitId, 10)}
      />

      {selectedStep && (
        <DeleteStepDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          stepId={selectedStep.id}
          stepTitle={selectedStep.title}
          onSuccess={refetchSteps}
        />
      )}

      <DeleteStepDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        stepId={0}
        stepTitle={`${selectedSteps.length} selected steps`}
        onSuccess={refetchSteps}
        onConfirm={confirmBulkDelete}
        isBulk={true}
        count={selectedSteps.length}
      />
    </PageLayout>
  );
}
