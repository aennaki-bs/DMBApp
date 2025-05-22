import React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import documentService from "@/services/documentService";
import circuitService from "@/services/circuitService";
import { DocumentFlowMindMap } from "./DocumentFlowMindMap";
import { MoveDocumentButton } from "./MoveDocumentButton";
import { useDocumentWorkflow } from "@/hooks/useDocumentWorkflow";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircuitBoard, ArrowLeft } from "lucide-react";
import { LoadingState } from "@/components/circuits/document-flow/LoadingState";
import { NoCircuitAssignedCard } from "@/components/circuits/document-flow/NoCircuitAssignedCard";
import { ErrorMessage } from "./ErrorMessage";

interface WorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: number;
}

export function WorkflowDialog({
  open,
  onOpenChange,
  documentId,
}: WorkflowDialogProps) {
  const { user } = useAuth();
  const isSimpleUser = user?.role === "SimpleUser";

  // Use the document flow hook to manage all workflow-related state and operations
  const {
    workflowStatus,
    isLoading: isLoadingWorkflow,
    isError: isWorkflowError,
    error: workflowError,
    refreshAllData,
  } = useDocumentWorkflow(documentId);

  // Fetch the document information
  const {
    data: document,
    isLoading: isLoadingDocument,
    error: documentError,
  } = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => documentService.getDocumentById(documentId),
    enabled: open && !!documentId, // Only fetch when dialog is open
  });

  // Handle move to status
  const handleMoveToStatus = (statusId: number) => {
    if (workflowStatus && statusId) {
      circuitService
        .moveToStatus(documentId, statusId, `Moving to status ID ${statusId}`)
        .then(() => {
          toast.success("Document status updated successfully");
          refreshAllData();
        })
        .catch((error) => {
          console.error("Error moving document to status:", error);
          toast.error("Failed to update document status");
        });
    }
  };

  // Collect all errors
  const errorMessage =
    (documentError instanceof Error
      ? documentError.message
      : documentError
      ? String(documentError)
      : "") ||
    (workflowError instanceof Error
      ? workflowError.message
      : workflowError
      ? String(workflowError)
      : "");

  // Overall loading state
  const isLoading = isLoadingDocument || isLoadingWorkflow;

  // Check if the document has been loaded and doesn't have a circuit assigned
  const isNoCircuit = !isLoading && document && !document.circuitId;

  const isCircuitCompleted = workflowStatus?.isCircuitCompleted;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 max-h-[90vh] overflow-hidden flex flex-col bg-[#0a1033]">
        <DialogHeader className="px-4 py-2 border-b border-blue-900/30">
          <div className="flex items-center">
            <div>
              <DialogTitle className="text-lg font-medium text-white">
                Document Workflow
              </DialogTitle>
              <DialogDescription className="text-blue-300/70">
                {document?.title || "Document workflow status"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          <ErrorMessage error={errorMessage} />

          {/* Loading state */}
          {isLoading ? (
            <LoadingState />
          ) : isNoCircuit ? (
            <NoCircuitAssignedCard
              documentId={documentId}
              navigateToDocument={() => onOpenChange(false)}
            />
          ) : (
            <div className="flex flex-col gap-3 w-full">
              {/* Circuit Status Summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <Card
                  className={cn(
                    "border overflow-hidden",
                    isCircuitCompleted
                      ? "border-green-500/30 bg-gradient-to-r from-green-900/20 to-blue-900/10"
                      : "border-blue-500/30 bg-gradient-to-r from-blue-900/20 to-indigo-900/10"
                  )}
                >
                  <CardContent className="p-3 flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center mb-2 md:mb-0">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center mr-3",
                          isCircuitCompleted
                            ? "bg-green-900/30 border border-green-500/30"
                            : "bg-blue-900/30 border border-blue-500/30"
                        )}
                      >
                        <CircuitBoard
                          className={cn(
                            "h-5 w-5",
                            isCircuitCompleted
                              ? "text-green-400"
                              : "text-blue-400"
                          )}
                        />
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-white">
                          {document?.circuit?.title || "Document Circuit"}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={isCircuitCompleted ? "default" : "outline"}
                            className={
                              isCircuitCompleted
                                ? "bg-green-700 hover:bg-green-700 text-xs"
                                : "text-xs"
                            }
                          >
                            {isCircuitCompleted ? "Completed" : "In Progress"}
                          </Badge>
                          {workflowStatus && (
                            <span className="text-xs text-blue-300">
                              {
                                workflowStatus.statuses.filter(
                                  (s) => s.isComplete
                                ).length
                              }{" "}
                              of {workflowStatus.statuses.length} steps
                              completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Move Document Button - Only show if workflow completed and user has permission */}
                    {workflowStatus?.isCircuitCompleted && !isSimpleUser && (
                      <MoveDocumentButton
                        documentId={documentId}
                        onStatusChange={refreshAllData}
                        disabled={false}
                        transitions={
                          workflowStatus?.availableStatusTransitions || []
                        }
                      />
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Main content area - Mind Map */}
              <div className="w-full">
                <DocumentFlowMindMap
                  workflowStatus={workflowStatus}
                  documentId={documentId}
                  onStatusComplete={refreshAllData}
                  onMoveToStatus={handleMoveToStatus}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-4 py-2 border-t border-blue-900/30">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
