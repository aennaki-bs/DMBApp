import { useWorkflowStepStatuses } from "@/hooks/useWorkflowStepStatuses";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import circuitService from "@/services/circuitService";

interface DocumentFlowMindMapProps {
  workflowStatus: any;
  documentId: number;
  onStatusComplete: () => void;
  onMoveToStatus: (statusId: number) => void;
}

export function DocumentFlowMindMap({
  workflowStatus,
  documentId,
  onStatusComplete,
  onMoveToStatus,
}: DocumentFlowMindMapProps) {
  const { completeStatus } = useWorkflowStepStatuses(documentId);
  const [nextStatuses, setNextStatuses] = useState<any[]>([]);

  const currentStatusId = workflowStatus?.currentStatusId;
  const currentStatus = workflowStatus?.statuses?.find(
    (s: any) => s.statusId === currentStatusId
  );

  // Always fetch next statuses if current status is complete
  useEffect(() => {
    if (currentStatus?.isComplete) {
      circuitService.getNextStatuses(documentId).then(setNextStatuses);
    } else {
      setNextStatuses([]);
    }
  }, [currentStatus?.isComplete, documentId]);

  const handleMarkComplete = async () => {
    if (!currentStatus) return;
    try {
      await completeStatus({
        statusId: currentStatus.statusId,
        isComplete: !currentStatus.isComplete,
        comments: `Status ${currentStatus.title} marked as ${
          currentStatus.isComplete ? "incomplete" : "complete"
        }`,
      });
      toast.success(
        `Status ${
          currentStatus.isComplete
            ? "marked as incomplete"
            : "marked as complete"
        }`
      );
      onStatusComplete();
      // No need to fetch next statuses here, useEffect will handle it
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="flex flex-col items-center p-8">
      <div className="bg-blue-900/40 border border-blue-500/40 rounded-xl p-6 w-full max-w-md flex flex-col items-center mb-8">
        <div className="text-lg font-bold text-white mb-2">Current Status</div>
        {currentStatus ? (
          <>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-200 font-semibold text-base">
                {currentStatus.title}
              </span>
              {currentStatus.isComplete ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-gray-500" />
              )}
            </div>
            <div className="mb-2 text-sm text-gray-300">
              Required:{" "}
              <Badge variant={currentStatus.isRequired ? "default" : "outline"}>
                {currentStatus.isRequired ? "Yes" : "No"}
              </Badge>
            </div>
            <Button
              variant={currentStatus.isComplete ? "secondary" : "default"}
              onClick={handleMarkComplete}
              className="mb-2"
            >
              {currentStatus.isComplete
                ? "Mark as Incomplete"
                : "Mark as Complete"}
            </Button>
          </>
        ) : (
          <div className="text-gray-400">No current status</div>
        )}
      </div>

      {/* Next Steps */}
      {nextStatuses.length > 0 && (
        <div className="bg-blue-900/30 border border-blue-700/30 rounded-lg p-6 w-full max-w-md flex flex-col items-center">
          <div className="text-white font-semibold mb-2">Next Steps</div>
          <ul className="w-full">
            {nextStatuses.map((transition: any) => (
              <li
                key={transition.statusId}
                className="flex items-center justify-between mb-2"
              >
                <span className="text-blue-200">{transition.title}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMoveToStatus(transition.statusId)}
                  className="ml-2"
                >
                  <ArrowRight className="h-4 w-4 mr-1" /> Move
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
