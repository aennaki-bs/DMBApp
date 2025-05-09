import { DocumentWorkflowStatus } from '@/models/documentCircuit';
import { DocumentStatusCard } from './DocumentStatusCard';
import { StepRequirementsCard } from './StepRequirementsCard';
import { StatusTransitionCard } from './StatusTransitionCard';
import { useState } from 'react';

interface WorkflowStatusSectionProps {
  workflowStatus: DocumentWorkflowStatus | null | undefined;
  onWorkflowUpdate?: () => void;
}

export function WorkflowStatusSection({ 
  workflowStatus, 
  onWorkflowUpdate 
}: WorkflowStatusSectionProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  if (!workflowStatus) return null;

  const handleStatusChange = () => {
    setRefreshKey(prev => prev + 1);
    if (onWorkflowUpdate) {
      onWorkflowUpdate();
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 w-full">
        <DocumentStatusCard workflowStatus={workflowStatus} />
        <StepRequirementsCard workflowStatus={workflowStatus} />
      </div>
      
      <StatusTransitionCard 
        key={`transitions-${refreshKey}`}
        workflowStatus={workflowStatus} 
        onSuccess={handleStatusChange} 
      />
    </div>
  );
}
