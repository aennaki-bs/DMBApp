import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import documentService from '@/services/documentService';
import circuitService from '@/services/circuitService';
import { DocumentFlowHeader } from '@/components/circuits/document-flow/DocumentFlowHeader';
import { NoCircuitAssignedCard } from '@/components/circuits/document-flow/NoCircuitAssignedCard';
import { LoadingState } from '@/components/circuits/document-flow/LoadingState';
import { CircuitStepsSection } from '@/components/circuits/document-flow/CircuitStepsSection';
import { ErrorMessage } from '@/components/document-flow/ErrorMessage';
import { WorkflowStatusSection } from '@/components/document-flow/WorkflowStatusSection';
import { DocumentDialogs } from '@/components/document-flow/DocumentDialogs';
import { useDocumentWorkflow } from '@/hooks/useDocumentWorkflow';
import { Button } from '@/components/ui/button';
import { ArrowLeftCircle } from 'lucide-react';

const DocumentFlowPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use the document flow hook to manage all workflow-related state and operations
  const {
    workflowStatus,
    isLoading: isLoadingWorkflow,
    isError: isWorkflowError,
    error: workflowError,
    refetch: refetchWorkflow,
    refreshAllData
  } = useDocumentWorkflow(Number(id));
  
  // Fetch the document information
  const { 
    data: document, 
    isLoading: isLoadingDocument,
    error: documentError,
  } = useQuery({
    queryKey: ['document', Number(id)],
    queryFn: () => documentService.getDocumentById(Number(id)),
    enabled: !! id
  });

  // Fetch circuit details for visualization
  const { 
    data: circuitDetails, 
    isLoading: isLoadingCircuitDetails,
    error: circuitDetailsError,
  } = useQuery({
    queryKey: ['circuit-details', document?.circuitId],
    queryFn: () => circuitService.getCircuitDetailsByCircuitId(document?.circuitId || 0),
    enabled: !!document?.circuitId
  });

  // Fetch document circuit history
  const {
    data: circuitHistory,
    isLoading: isLoadingHistory,
    error: historyError,
  } = useQuery({
    queryKey: ['document-circuit-history', Number(id)],
    queryFn: () => circuitService.getDocumentCircuitHistory(Number(id)),
    enabled: !!id
  });

  // Dialog state management
  const [dialogState, setDialogState] = useState({
    moveOpen: false,
    processOpen: false,
    nextStepOpen: false,
    previousStepOpen: false
  });

  // Collect all errors
  const errorMessage = 
    (documentError instanceof Error ? documentError.message : documentError ? String(documentError) : '') || 
    (workflowError instanceof Error ? workflowError.message : workflowError ? String(workflowError) : '') || 
    (circuitDetailsError instanceof Error ? circuitDetailsError.message : circuitDetailsError ? String(circuitDetailsError) : '') || 
    (historyError instanceof Error ? historyError.message : historyError ? String(historyError) : '');
  
  // Overall loading state
  const isLoading = isLoadingDocument || isLoadingWorkflow || 
                    isLoadingCircuitDetails || isLoadingHistory;

  const openDialog = (type: 'move' | 'process' | 'nextStep' | 'previousStep') => {
    setDialogState(prev => ({
      ...prev,
      [`${type}Open`]: true
    }));
  };

  const closeDialog = (type: 'move' | 'process' | 'nextStep' | 'previousStep') => {
    setDialogState(prev => ({
      ...prev,
      [`${type}Open`]: false
    }));
  };

  const handleSuccess = () => {
    // Use our refreshAllData function to update all relevant data
    refreshAllData();
    toast.success("Operation completed successfully");
  };

  if (!id) {
    navigate('/documents');
    return null;
  }

  // Check if the document has been loaded and doesn't have a circuit assigned
  const isNoCircuit = !isLoading && document && !document.circuitId;

  // If document is not in a circuit
  if (isNoCircuit) {
    return (
      <div className="p-3 sm:p-4 md:p-6 space-y-3 md:space-y-4 h-full">
        <DocumentFlowHeader  
          documentId={id} 
          document={document}
          navigateBack={() => navigate(`/documents/${id}`)}
        />
        
        <NoCircuitAssignedCard 
          documentId={id}
          navigateToDocument={() => navigate(`/documents/${id}`)}
        />
      </div>
    );
  }

  const isSimpleUser = user?.role === 'SimpleUser';

  // Find current step details for processing
  const currentStepId = workflowStatus?.currentStepId;
  const currentStepDetail = circuitDetails?.find(d => d.id === currentStepId);

  return (
    <div className="p-2 sm:p-3 md:p-4 space-y-3 w-full">
      <DocumentFlowHeader 
        documentId={id} 
        document={document}
        navigateBack={() => navigate(`/documents/${id}`)}
      />
      
      <ErrorMessage error={errorMessage} />
      
      {/* Loading state */}
      {isLoading ? (
        <LoadingState />
      ) : (
         <div className="flex flex-col gap-3 w-full h-full">
          {/* Document workflow status section */}
          <WorkflowStatusSection workflowStatus={workflowStatus} />

          {/* Return to Previous Step Button - direct access */}
          {!isSimpleUser && workflowStatus?.canReturnToPreviousStep && (
            <div className="bg-[#0a1033]/50 rounded-lg p-4 border border-amber-700/30 flex justify-between items-center">
              <div>
                <h3 className="text-white font-medium">Return Document to Previous Step</h3>
                <p className="text-gray-400 text-sm">Click the button to return this document to its previous workflow step.</p>
              </div>
              <Button 
                onClick={() => openDialog('previousStep')}
                variant="outline"
                className="border-amber-700/30 text-white hover:bg-amber-700/20"
              >
                <ArrowLeftCircle className="mr-1.5 h-4 w-4" /> Return to Previous Step
              </Button>
            </div>
          )}

          {/* Circuit Steps */}
          {circuitDetails && circuitDetails.length > 0 && document && workflowStatus && (
            <CircuitStepsSection
              document={document}
              circuitDetails={circuitDetails}
              circuitHistory={circuitHistory || []}
              workflowStatus={workflowStatus}
              isSimpleUser={isSimpleUser}
              onMoveClick={() => openDialog('move')}
              onProcessClick={() => openDialog('process')}
              onNextStepClick={() => openDialog('nextStep')}
              onPreviousStepClick={() => openDialog('previousStep')}
              onDocumentMoved={handleSuccess}
            />
          )}
        </div>
       )}
      
      {/* Dialogs for document actions */}
      {document && workflowStatus && (
        <DocumentDialogs
          document={document}
          workflowStatus={workflowStatus}
          moveDialogOpen={dialogState.moveOpen}
          processDialogOpen={dialogState.processOpen}
          nextStepDialogOpen={dialogState.nextStepOpen}
          previousStepDialogOpen={dialogState.previousStepOpen}
          setMoveDialogOpen={(open) => open ? openDialog('move') : closeDialog('move')}
          setProcessDialogOpen={(open) => open ? openDialog('process') : closeDialog('process')}
          setNextStepDialogOpen={(open) => open ? openDialog('nextStep') : closeDialog('nextStep')}
          setPreviousStepDialogOpen={(open) => open ? openDialog('previousStep') : closeDialog('previousStep')}
          handleMoveSuccess={handleSuccess}
          handleProcessSuccess={handleSuccess}
          handleNextStepSuccess={handleSuccess}
          handlePreviousStepSuccess={handleSuccess}
          currentStepDetail={currentStepDetail}
          availableActions={workflowStatus?.availableActions}
        />
      )}
    </div>
  );
};

export default DocumentFlowPage;
