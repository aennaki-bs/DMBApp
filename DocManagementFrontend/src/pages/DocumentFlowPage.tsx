import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import documentService from "@/services/documentService";
import circuitService from "@/services/circuitService";
import { DocumentFlowHeader } from "@/components/circuits/document-flow/DocumentFlowHeader";
import { NoCircuitAssignedCard } from "@/components/circuits/document-flow/NoCircuitAssignedCard";
import { LoadingState } from "@/components/circuits/document-flow/LoadingState";
import { ErrorMessage } from "@/components/document-flow/ErrorMessage";
import { WorkflowHistorySection } from "@/components/document-flow/WorkflowHistorySection";
import { MoveDocumentButton } from "@/components/document-flow/MoveDocumentButton";
import { DocumentFlowMindMap } from "@/components/document-flow/DocumentFlowMindMap";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle, FileText, CircuitBoard } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDocumentWorkflow } from "@/hooks/useDocumentWorkflow";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const DocumentFlowPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSimpleUser = user?.role === "SimpleUser";

  // Use the document flow hook to manage all workflow-related state and operations
  const {
    workflowStatus,
    isLoading: isLoadingWorkflow,
    isError: isWorkflowError,
    error: workflowError,
    refetch: refetchWorkflow,
    refreshAllData,
  } = useDocumentWorkflow(Number(id));

  // Fetch the document information
  const {
    data: document,
    isLoading: isLoadingDocument,
    error: documentError,
  } = useQuery({
    queryKey: ["document", Number(id)],
    queryFn: () => documentService.getDocumentById(Number(id)),
    enabled: !!id,
  });

  // Fetch document circuit history
  const {
    data: circuitHistory,
    isLoading: isLoadingHistory,
    error: historyError,
  } = useQuery({
    queryKey: ["document-circuit-history", Number(id)],
    queryFn: () => circuitService.getDocumentCircuitHistory(Number(id)),
    enabled: !!id,
  });

  // Handle move to status
  const handleMoveToStatus = (statusId: number) => {
    if (workflowStatus && statusId) {
      circuitService
        .moveToStatus(Number(id), statusId, `Moving to status ID ${statusId}`)
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
      : "") ||
    (historyError instanceof Error
      ? historyError.message
      : historyError
      ? String(historyError)
      : "");

  // Overall loading state
  const isLoading = isLoadingDocument || isLoadingWorkflow || isLoadingHistory;

  if (!id) {
    navigate("/documents");
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

  const isCircuitCompleted = workflowStatus?.isCircuitCompleted;

  return (
    <div className="p-2 sm:p-3 md:p-4 space-y-4 w-full">
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
        <div className="flex flex-col gap-6 w-full">
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
              <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center mr-4",
                      isCircuitCompleted
                        ? "bg-green-900/30 border border-green-500/30"
                        : "bg-blue-900/30 border border-blue-500/30"
                    )}
                  >
                    <CircuitBoard
                      className={cn(
                        "h-6 w-6",
                        isCircuitCompleted ? "text-green-400" : "text-blue-400"
                      )}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      {document?.circuitName || "Document Circuit"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={isCircuitCompleted ? "default" : "outline"}
                        className={
                          isCircuitCompleted
                            ? "bg-green-700 hover:bg-green-700"
                            : ""
                        }
                      >
                        {isCircuitCompleted ? "Completed" : "In Progress"}
                      </Badge>
                      {workflowStatus && (
                        <span className="text-sm text-blue-300">
                          {
                            workflowStatus.statuses.filter((s) => s.isComplete)
                              .length
                          }{" "}
                          of {workflowStatus.statuses.length} steps completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Move Document Button - Only show if workflow completed and user has permission */}
                {workflowStatus?.isCircuitCompleted && !isSimpleUser && (
                  <MoveDocumentButton
                    documentId={Number(id)}
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

          {/* New Mind Map Visualization */}
          <div className="mind-map-container">
            <DocumentFlowMindMap
              workflowStatus={workflowStatus}
              documentId={Number(id)}
              onStatusComplete={refreshAllData}
              onMoveToStatus={handleMoveToStatus}
            />
          </div>

          <Separator className="bg-blue-900/30" />

          {/* Document History Section */}
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
