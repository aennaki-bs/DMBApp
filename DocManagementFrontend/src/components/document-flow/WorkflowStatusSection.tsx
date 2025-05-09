import { DocumentWorkflowStatus, DocumentStatus, StatusDto } from '@/models/documentCircuit';
import { DocumentStatusCard } from './DocumentStatusCard';
import { useState } from 'react';
import { MoveDocumentButton } from './MoveDocumentButton';

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

  // Determine if document status is complete
  const isStatusComplete = workflowStatus.isCircuitCompleted;

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
            disabled={!isStatusComplete}
            transitions={workflowStatus.availableStatusTransitions || []}
          />
        </div>
      </div>
    </div>
  );
}
