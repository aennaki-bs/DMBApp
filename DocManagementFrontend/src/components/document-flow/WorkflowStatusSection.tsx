
import { DocumentWorkflowStatus } from '@/models/documentCircuit';
import { DocumentStatusCard } from './DocumentStatusCard';
import { StepRequirementsCard } from './StepRequirementsCard';

interface WorkflowStatusSectionProps {
  workflowStatus: DocumentWorkflowStatus | null | undefined;
}

export function WorkflowStatusSection({ workflowStatus }: WorkflowStatusSectionProps) {
  if (!workflowStatus) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 w-full">
      <DocumentStatusCard workflowStatus={workflowStatus} />
      <StepRequirementsCard workflowStatus={workflowStatus} />
    </div>
  );
}
