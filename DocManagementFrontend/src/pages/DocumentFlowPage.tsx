import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import documentService from '@/services/documentService';
import circuitService from '@/services/circuitService';
import { DocumentFlowHeader } from '@/components/circuits/document-flow/DocumentFlowHeader';
import { NoCircuitAssignedCard } from '@/components/circuits/document-flow/NoCircuitAssignedCard';
import { LoadingState } from '@/components/circuits/document-flow/LoadingState';
import { ErrorMessage } from '@/components/document-flow/ErrorMessage';
import { WorkflowStatusSection } from '@/components/document-flow/WorkflowStatusSection';
import { useDocumentWorkflow } from '@/hooks/useDocumentWorkflow';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, AlertCircle, Bug } from 'lucide-react';
import { WorkflowHistorySection } from '@/components/document-flow/WorkflowHistorySection';
import { DocumentStatusCard } from '@/components/document-flow/DocumentStatusCard';
import { MoveDocumentButton } from '@/components/document-flow/MoveDocumentButton';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

const DocumentFlowPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSimpleUser = user?.role === 'SimpleUser';
  
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

  // Collect all errors
  const errorMessage = 
    (documentError instanceof Error ? documentError.message : documentError ? String(documentError) : '') || 
    (workflowError instanceof Error ? workflowError.message : workflowError ? String(workflowError) : '') || 
    (historyError instanceof Error ? historyError.message : historyError ? String(historyError) : '');
  
  // Overall loading state
  const isLoading = isLoadingDocument || isLoadingWorkflow || isLoadingHistory;

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
        <div className="flex flex-col gap-4 w-full">
          {/* Current Status Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <DocumentStatusCard workflowStatus={workflowStatus} />
            </div>
            <div className="space-y-4">
              {/* Status Requirements */}
              <Card className="overflow-hidden bg-gradient-to-b from-black/70 to-black/40 border-b border-t border-l border-r border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-white">Status Requirements</CardTitle>
                </CardHeader>
                
                <CardContent className="px-6 pb-4">
                  <ScrollArea className="h-[100px] pr-4">
                    {(workflowStatus?.statuses || []).length > 0 ? (
                      <div className="space-y-2">
                        {(workflowStatus?.statuses || []).map((status) => (
                          <div key={status.statusId} className="flex items-center text-sm">
                            {status.isComplete ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0" />
                            )}
                            <span className={status.isComplete ? "text-green-400" : "text-gray-200"}>
                              {status.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm italic">No requirements for current status</p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
              
              {/* Move Document Button */}
              <MoveDocumentButton 
                documentId={Number(id)}
                onStatusChange={refreshAllData}
                disabled={isSimpleUser || !workflowStatus?.isCircuitCompleted}
                transitions={workflowStatus?.availableStatusTransitions || []}
              />
            </div>
          </div>
          
          <Separator className="bg-gray-800" />
          
          {/* Document History Section - Collapsible */}
          <WorkflowHistorySection 
            history={circuitHistory || []} 
            isLoading={isLoadingHistory}
          />
        </div>
      )}
    </div>
  );
};

export default DocumentFlowPage;
