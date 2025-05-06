import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import circuitService from '@/services/circuitService';
import { useAuth } from '@/context/AuthContext';
import { DocumentStatus } from '@/models/documentCircuit';
import { useStepStatuses } from '@/hooks/useStepStatuses';

import { StepStatusesHeader } from './step-statuses/StepStatusesHeader';
import { StepStatusesTableContent } from './step-statuses/StepStatusesTableContent';
import { StepStatusesModals } from './step-statuses/StepStatusesModals';
import { StepStatusesNotFound } from './step-statuses/StepStatusesNotFound';

export default function StepStatusesPage() {
  const { circuitId, stepId } = useParams<{ circuitId: string; stepId: string }>();
  const { user } = useAuth();
  const isSimpleUser = user?.role === 'SimpleUser';
  
  const [apiError, setApiError] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | null>(null);

  // Fetch circuit details
  const { 
    data: circuit,
    isLoading: isCircuitLoading,
    isError: isCircuitError
  } = useQuery({
    queryKey: ['circuit', circuitId],
    queryFn: () => circuitService.getCircuitById(Number(circuitId)),
    enabled: !!circuitId
  });

  // Fetch steps for the circuit
  const {
    data: steps = [],
    isLoading: isStepsLoading,
    isError: isStepsError
  } = useQuery({
    queryKey: ['circuit-steps', circuitId],
    queryFn: () => circuitService.getCircuitDetailsByCircuitId(Number(circuitId)),
    enabled: !!circuitId
  });

  // Find the current step
  const currentStep = steps.find(s => s.id === Number(stepId));

  // Fetch statuses for the step
  const {
    statuses = [],
    isLoading: isStatusesLoading,
    isError: isStatusesError,
    refetch: refetchStatuses
  } = useStepStatuses(Number(stepId));

  // Handler logic for add/edit/delete
  const handleAddStatus = () => {
    if (circuit?.isActive) return; // Don't allow adding statuses if circuit is active
    setSelectedStatus(null);
    setFormDialogOpen(true);
  };

  const handleEditStatus = (status: DocumentStatus) => {
    if (circuit?.isActive) return; // Don't allow editing statuses if circuit is active
    setSelectedStatus(status);
    setFormDialogOpen(true);
  };

  const handleDeleteStatus = (status: DocumentStatus) => {
    if (circuit?.isActive) return; // Don't allow deleting statuses if circuit is active
    setSelectedStatus(status);
    setDeleteDialogOpen(true);
  };

  const isLoading = isCircuitLoading || isStepsLoading || isStatusesLoading;
  const isError = isCircuitError || isStepsError || isStatusesError;

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-blue-900/30 rounded w-1/3"></div>
          <div className="h-4 bg-blue-900/30 rounded w-1/4"></div>
          <div className="h-64 bg-blue-900/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <StepStatusesNotFound circuitId={circuitId} type="error" apiError={apiError} />
    );
  }

  if (!circuit || !currentStep) {
    return (
      <StepStatusesNotFound circuitId={circuitId} type="notFound" />
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 overflow-x-hidden">
      <StepStatusesHeader
        circuitId={circuitId!}
        circuitTitle={circuit.title}
        stepTitle={currentStep.title}
        circuitDetailKey={currentStep.circuitDetailKey}
        isSimpleUser={isSimpleUser}
        onAddStatus={handleAddStatus}
        isCircuitActive={circuit.isActive}
      />
      <StepStatusesTableContent
        statuses={statuses}
        onEdit={handleEditStatus}
        onDelete={handleDeleteStatus}
        isSimpleUser={isSimpleUser}
        apiError={apiError}
        isCircuitActive={circuit.isActive}
      />
      <StepStatusesModals
        isSimpleUser={isSimpleUser}
        formDialogOpen={formDialogOpen}
        setFormDialogOpen={setFormDialogOpen}
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        selectedStatus={selectedStatus}
        onSuccess={refetchStatuses}
        stepId={Number(stepId)}
      />
    </div>
  );
}
