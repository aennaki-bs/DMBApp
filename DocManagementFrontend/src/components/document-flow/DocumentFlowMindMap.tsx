import { useWorkflowStepStatuses } from "@/hooks/useWorkflowStepStatuses";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Circle,
  ArrowRight,
  Clock,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import circuitService from "@/services/circuitService";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface DocumentFlowMindMapProps {
  workflowStatus: any;
  documentId: number;
  onStatusComplete: () => void;
  onMoveToStatus: (statusId: number) => void;
  hasPendingApprovals?: boolean;
}

export function DocumentFlowMindMap({
  workflowStatus,
  documentId,
  onStatusComplete,
  onMoveToStatus,
  hasPendingApprovals = false,
}: DocumentFlowMindMapProps) {
  const { completeStatus } = useWorkflowStepStatuses(documentId);
  const [nextStatuses, setNextStatuses] = useState<any[]>([]);
  const [completedStatuses, setCompletedStatuses] = useState<any[]>([]);
  const [requiresApproval, setRequiresApproval] = useState(false);

  const currentStatusId = workflowStatus?.currentStatusId;
  const currentStatus = workflowStatus?.statuses?.find(
    (s: any) => s.statusId === currentStatusId
  );

  // Extract completed statuses
  useEffect(() => {
    if (workflowStatus?.statuses) {
      const completed = workflowStatus.statuses.filter(
        (s: any) => s.isComplete && s.statusId !== currentStatusId
      );
      setCompletedStatuses(completed);
    }
  }, [workflowStatus?.statuses, currentStatusId]);

  // Check if current status requires approval
  useEffect(() => {
    if (workflowStatus?.currentStatusId) {
      // Only set approval status for already processed steps
      // This ensures we don't show approval status when just marking complete
      // Approval status should only show after clicking Move
      if (workflowStatus.message && workflowStatus.message.includes('approval')) {
        setRequiresApproval(true);
        return;
      }
      
      // Only consider a status as requiring approval if it has been explicitly
      // moved to that status (not just marked complete)
      const statusInfo = workflowStatus.availableStatusTransitions?.find(
        (s: any) => s.statusId === workflowStatus.currentStatusId
      );
      
      // Clear requiresApproval by default
      setRequiresApproval(false);
    }
  }, [workflowStatus, currentStatus]);

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
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Handle clicking on a next status
  const handleNextStatusClick = async (statusId: number) => {
    try {
      // Check if the target status requires approval
      const statusInfo = workflowStatus.availableStatusTransitions?.find(
        (s: any) => s.statusId === statusId
      );
      
      // Check if the next status requires approval by checking multiple indicators
      let requiresApproval = false;
      
      // Explicit flag
      if (statusInfo?.requiresApproval) {
        requiresApproval = true;
      }
      
      // Check title and description
      if (statusInfo) {
        const titleLower = (statusInfo.title || '').toLowerCase();
        const descLower = (statusInfo.description || '').toLowerCase();
        if (titleLower.includes('approv') || descLower.includes('approv')) {
          requiresApproval = true;
        }
      }
      
      // Call the parent's move function
      onMoveToStatus(statusId);
      
      // Notify the user if approval is required
      if (requiresApproval) {
        setRequiresApproval(true);
        toast.info("This step requires approval. An approval request will be initiated.");
      } else {
        setRequiresApproval(false);
      }
    } catch (error) {
      console.error("Error moving to next status:", error);
      toast.error("Failed to move to next status");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4">
      {/* Left column - Status History Stack */}
      <div className="lg:w-1/3">
        <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Completed Status History
        </h3>

        <div className="space-y-3">
          {completedStatuses.length > 0 ? (
            completedStatuses.map((status, index) => (
              <motion.div
                key={status.statusId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <Card
                  className={cn(
                    "border border-green-500/30 bg-gradient-to-r from-green-900/20 to-blue-900/10 overflow-hidden",
                    "transform hover:-translate-y-1 transition-all duration-200"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="font-medium text-green-300">
                          {status.title}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-900/30 text-green-300 border-green-500/30"
                      >
                        Completed
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      {status.completedAt && (
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(status.completedAt), "PPp")}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-10">
                  <div className="w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center">
                    <ChevronRight className="h-4 w-4 text-blue-300" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <Card className="border border-blue-900/30 bg-blue-900/10 p-4">
              <p className="text-sm text-gray-400 text-center">
                No completed statuses yet
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Middle column - Current Status */}
      <div className="lg:w-1/3">
        <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Current Status
        </h3>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-full"
        >
          <Card
            className={cn(
              "border border-blue-500/50 bg-gradient-to-br from-blue-900/40 to-indigo-900/30 h-full",
              currentStatus?.isComplete && !requiresApproval &&
                "border-green-500/50 bg-gradient-to-br from-green-900/30 to-blue-900/20",
              requiresApproval &&
                "border-amber-500/70 bg-gradient-to-br from-amber-700/40 to-blue-900/20"
            )}
          >
            <CardContent className="p-6 flex flex-col items-center">
              {currentStatus ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-blue-900/50 flex items-center justify-center mb-4">
                    {currentStatus.isComplete ? (
                      requiresApproval ? (
                        <Clock className="h-8 w-8 text-amber-300" />
                      ) : (
                        <CheckCircle className="h-8 w-8 text-green-400" />
                      )
                    ) : (
                      <Circle className="h-8 w-8 text-blue-400" />
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 text-center">
                    {currentStatus.title}
                    {requiresApproval && (
                      <span className="text-amber-300 ml-2">(Awaiting Approval)</span>
                    )}
                  </h3>

                  <div className="flex items-center gap-2 mb-4">
                    <Badge
                      variant={currentStatus.isRequired ? "default" : "outline"}
                      className="mb-1"
                    >
                      {currentStatus.isRequired ? "Required" : "Optional"}
                    </Badge>

                    <Badge
                      variant={currentStatus.isComplete ? "default" : "outline"}
                      className={
                        currentStatus.isComplete && !requiresApproval
                          ? "bg-green-700 hover:bg-green-700"
                          : requiresApproval
                          ? "bg-amber-500 hover:bg-amber-500 text-black font-medium"
                          : ""
                      }
                    >
                      {currentStatus.isComplete 
                        ? requiresApproval 
                          ? "Waiting for Approval" 
                          : "Completed" 
                        : "In Progress"}
                    </Badge>
                  </div>

                  {requiresApproval && (
                    <p className="text-amber-300 text-sm font-medium border border-amber-500/30 rounded-md p-2 mb-4 text-center bg-amber-900/20">
                      This step requires approval. An approval request has been initiated.
                    </p>
                  )}

                  {currentStatus.description && (
                    <p className="text-gray-300 text-sm mb-6 text-center">
                      {currentStatus.description}
                    </p>
                  )}

                  <Button
                    variant={currentStatus.isComplete ? "outline" : "default"}
                    onClick={handleMarkComplete}
                    className={cn(
                      "w-full",
                      currentStatus.isComplete && !requiresApproval
                        ? "border-green-500/50 text-green-300 hover:bg-green-900/20"
                        : requiresApproval
                        ? "border-amber-500/50 text-amber-300 hover:bg-amber-900/20"
                        : "bg-blue-600 hover:bg-blue-700"
                    )}
                  >
                    {currentStatus.isComplete ? (
                      <>
                        <Circle className="mr-2 h-4 w-4" />
                        Mark as Incomplete
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Complete
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  No current status
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Right column - Next Steps */}
      <div className="lg:w-1/3">
        <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center">
          <ArrowRight className="h-5 w-5 mr-2" />
          Next Steps
        </h3>

        <div className="space-y-3">
          {nextStatuses && nextStatuses.length > 0 ? (
            nextStatuses.map((status, index) => (
              <motion.div
                key={status.statusId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={cn(
                    "border border-blue-500/30 bg-gradient-to-r from-blue-900/20 to-indigo-900/10 overflow-hidden",
                    "transform hover:-translate-y-1 hover:border-blue-400/50 transition-all duration-200",
                    hasPendingApprovals ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  )}
                  onClick={() => {
                    if (!hasPendingApprovals) {
                      handleNextStatusClick(status.statusId);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ArrowRight className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="font-medium text-blue-300">
                          {status.title}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        disabled={hasPendingApprovals}
                        className={cn(
                          "bg-blue-600 hover:bg-blue-700",
                          status.requiresApproval && "bg-amber-600 hover:bg-amber-700",
                          hasPendingApprovals && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!hasPendingApprovals) {
                            handleNextStatusClick(status.statusId);
                          }
                        }}
                        title={hasPendingApprovals ? "Document cannot be moved while approval is pending" : undefined}
                      >
                        Move
                      </Button>
                    </div>

                    {status.requiresApproval && (
                      <div className="mt-2 text-xs text-amber-300 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        This step will require approval
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="border border-blue-900/30 bg-blue-900/10 p-4">
              <p className="text-sm text-gray-400 text-center">
                {currentStatus?.isComplete
                  ? "No next steps available"
                  : "Complete current status to see next steps"}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
