import { DocumentWorkflowStatus, DocumentStatus, StatusDto } from '@/models/documentCircuit';
import { DocumentStatusCard } from './DocumentStatusCard';
import { useState } from 'react';
import { MoveDocumentButton } from './MoveDocumentButton';
import { useDocumentApproval } from '@/hooks/document-workflow/useDocumentApproval';

interface WorkflowStatusSectionProps {
  workflowStatus: DocumentWorkflowStatus | null | undefined;
  onWorkflowUpdate?: () => void;
  onMoveToStatus?: (statusId: number) => void;
}

export function WorkflowStatusSection({ 
  workflowStatus, 
  onWorkflowUpdate,
  onMoveToStatus
}: WorkflowStatusSectionProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  // Use the document approval hook to check for pending approvals
  const {
    hasPendingApprovals,
  } = useDocumentApproval(workflowStatus?.documentId || 0);

  if (!workflowStatus) return null;

  const handleStatusChange = () => {
    setRefreshKey(prev => prev + 1);
    if (onWorkflowUpdate) {
      onWorkflowUpdate();
    }
  };

  const handleMoveToStatus = (statusId: number) => {
    if (onMoveToStatus) {
      onMoveToStatus(statusId);
    }
  };

  // Determine if document status is complete and no pending approvals
  const isStatusComplete = workflowStatus.isCircuitCompleted;
  const isDisabled = !isStatusComplete || hasPendingApprovals;

  return (
    <div className="space-y-4 w-full">
      <div className="grid grid-cols-1 gap-4">
        <DocumentStatusCard 
          workflowStatus={workflowStatus} 
          onStatusChange={handleStatusChange}
        />

        <div className="mt-4">
          <MoveDocumentButton
            documentId={workflowStatus.documentId}
            onStatusChange={handleStatusChange}
            disabled={isDisabled}
            disabledReason={
              !isStatusComplete 
                ? "You must mark the current status as complete before moving the document"
                : hasPendingApprovals 
                ? "Document cannot be moved while approval is pending"
                : undefined
            }
            transitions={workflowStatus.availableStatusTransitions || []}
          />
        </div>
      </div>
    </div>
  );
}
