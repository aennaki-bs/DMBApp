import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { StepFormDialog } from '@/components/steps/dialogs/StepFormDialog';
import { DeleteStepDialog } from '@/components/steps/dialogs/DeleteStepDialog';
import { useAuth } from '@/context/AuthContext';
import { useCircuitSteps } from '@/hooks/useCircuitSteps';
import { toast } from 'sonner';
import stepService from '@/services/stepService';
import { PageLayout } from '@/components/layout/PageLayout';
import { Plus, GitBranch, ArrowLeft, List } from 'lucide-react';
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
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    circuit,
    steps,
    searchQuery,
    searchField,
    apiError,
    isLoading,
    isError,
    setSearchQuery,
    setSearchField,
    refetchSteps,
    searchStats
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

  const handleAddStatus = () => {
    if (isCircuitActive) {
      toast.error("Cannot add statuses to an active circuit");
      return;
    }
    // Navigate to the statuses page
    navigate(`/circuits/${circuitId}/statuses`);
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

  // Page actions
  const pageActions = [
    {
      label: "Back to Circuits",
      variant: "outline" as const,
      icon: ArrowLeft,
      onClick: () => navigate('/circuits'),
    },
    {
      label: "Circuit Statuses",
      variant: "outline" as const,
      icon: List,
      onClick: () => navigate(`/circuits/${circuitId}/statuses`),
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

  // Remove bulk actions from top - they'll be in the bottom bulk action bar now
  
  const allActions = [...pageActions];

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
        onEdit={handleEditStep}
        onDelete={handleDeleteStep}
        searchQuery={searchQuery}
        searchField={searchField}
        onSearchChange={setSearchQuery}
        onSearchFieldChange={setSearchField}
        isCircuitActive={isCircuitActive}
        isSimpleUser={isSimpleUser}
        circuit={circuit}
        searchStats={searchStats}
        onRefetch={refetchSteps}
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
    </PageLayout>
  );
}
