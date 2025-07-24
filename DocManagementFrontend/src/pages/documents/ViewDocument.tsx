import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import documentService from "@/services/documentService";
import workflowService from "@/services/workflowService";
import approvalService, { ApprovalHistoryItem } from "@/services/approvalService";
import { navigateToDocumentList } from "@/utils/navigationUtils";
import api from "@/services/api";
import { DocumentHistoryEvent } from "@/models/document";
import { useDocumentEditingStatus } from "@/hooks/useDocumentEditingStatus";

// Component imports
import DocumentTitle from "@/components/document/DocumentTitle";
import DocumentActions from "@/components/document/DocumentActions";
import DocumentTabsView from "@/components/document/DocumentTabsView";
import DocumentLoadingState from "@/components/document/DocumentLoadingState";
import DocumentNotFoundCard from "@/components/document/DocumentNotFoundCard";
import DeleteDocumentDialog from "@/components/document/DeleteDocumentDialog";
import { PageLayout } from "@/components/layout/PageLayout";
import { WorkflowDialog } from "@/components/document-flow/WorkflowDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  History,
  Loader2,
  Edit,
  Trash2,
  GitBranch,
  Eye,
  FileText,
  ArrowLeft
} from "lucide-react";

const ViewDocument = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [documentHistory, setDocumentHistory] = useState<DocumentHistoryEvent[]>([]);

  // Check if user has permissions to edit/delete documents
  const canManageDocuments =
    user?.role === "Admin" || user?.role === "FullUser";

  // Check if document editing should be disabled due to pending approval
  const { isEditingDisabled, disabledReason } = useDocumentEditingStatus(Number(id) || 0);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  // Fetch document details with optimized caching
  const {
    data: document,
    isLoading: isLoadingDocument,
    error: documentError,
  } = useQuery({
    queryKey: ["document", Number(id)],
    queryFn: () => documentService.getDocumentById(Number(id)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch workflow status for this document
  const {
    data: workflowStatus,
    isLoading: isLoadingWorkflow,
    error: workflowError
  } = useQuery({
    queryKey: ["documentWorkflow", Number(id)],
    queryFn: () => workflowService.getDocumentWorkflowStatus(Number(id)),
    enabled: !!id && !!document?.circuitId,
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch approval history for this document
  const {
    data: approvalHistory,
    isLoading: isLoadingApprovalHistory,
    error: approvalHistoryError
  } = useQuery({
    queryKey: ["documentApprovalHistory", Number(id)],
    queryFn: () => approvalService.getApprovalHistory(Number(id)),
    enabled: !!id,
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch pending approvals for this document
  const {
    data: pendingApprovals,
    isLoading: isLoadingApproval,
    error: approvalError
  } = useQuery({
    queryKey: ["documentApprovals", Number(id)],
    queryFn: () => approvalService.getDocumentApprovals(Number(id)),
    enabled: !!id,
    retry: false,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch lignes for this document with lazy loading
  const {
    data: lignes = [],
    isLoading: isLoadingLignes,
    error: lignesError,
  } = useQuery({
    queryKey: ["documentLignes", Number(id)],
    queryFn: () => documentService.getLignesByDocumentId(Number(id)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Handle errors from queries using useEffect
  useEffect(() => {
    if (documentError) {
      console.error(`Failed to fetch document with ID ${id}:`, documentError);
      toast.error("Failed to load document");
      navigateToDocumentList(navigate);
    }

    if (lignesError) {
      console.error(`Failed to fetch lignes for document ${id}:`, lignesError);
      toast.error("Failed to load document lignes");
    }

    if (workflowError && document?.circuitId) {
      console.error(`Failed to fetch workflow status for document ${id}:`, workflowError);
      toast.error("Failed to load workflow status");
    }

    if (approvalHistoryError) {
      console.error(`Failed to fetch approval history for document ${id}:`, approvalHistoryError);
    }

    if (approvalError) {
      console.error(`Failed to fetch pending approvals for document ${id}:`, approvalError);
    }
  }, [documentError, lignesError, workflowError, approvalError, approvalHistoryError, id, navigate, document]);

  // Cleanup document context when component unmounts or navigates away
  useEffect(() => {
    return () => {
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/documents/')) {
        sessionStorage.removeItem('documentContext');
      }
    };
  }, []);

  // Fetch document circuit history
  useEffect(() => {
    const fetchDocumentHistory = async () => {
      if (!document?.id) return;

      try {
        const response = await api.get(
          `/Workflow/document/${document.id}/history`
        );
        setDocumentHistory(response.data || []);
      } catch (error) {
        console.error("Error fetching document history:", error);
        setDocumentHistory([]);
      }
    };

    fetchDocumentHistory();
  }, [document?.id]);

  const handleShowHistory = () => {
    setHistoryDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!canManageDocuments) {
      toast.error("You do not have permission to delete documents");
      return;
    }

    try {
      if (document) {
        await documentService.deleteDocument(document.id);
        toast.success("Document deleted successfully");
        navigateToDocumentList(navigate);
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast.error("Failed to delete document");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleDocumentFlow = () => {
    if (document) {
      setWorkflowDialogOpen(true);
    }
  };

  const handleWorkflowUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ["document", Number(id)] });
    queryClient.invalidateQueries({ queryKey: ["documentWorkflow", Number(id)] });
    queryClient.invalidateQueries({ queryKey: ["documentApprovalHistory", Number(id)] });
    queryClient.invalidateQueries({ queryKey: ["documentApprovals", Number(id)] });
    queryClient.invalidateQueries({ queryKey: ["documentLignes", Number(id)] });
    queryClient.invalidateQueries({ queryKey: ["documents"] });
  };

  if (!id) {
    navigate("/documents");
    return null;
  }

  // Find active approval
  const directPendingApproval = pendingApprovals && pendingApprovals.length > 0
    ? pendingApprovals[0]
    : undefined;

  const historyPendingApproval = !directPendingApproval
    ? approvalHistory?.find(approval =>
      approval.status === "Pending" ||
      approval.status === "InProgress" ||
      approval.status === "Waiting" ||
      approval.status.toLowerCase().includes("wait") ||
      approval.status.toLowerCase().includes("progress")
    )
    : undefined;

  const effectiveApproval = directPendingApproval || historyPendingApproval;

  // Check if document is waiting for approval (from the new isWaitingForApproval field)
  const isWaitingForApproval = document?.isWaitingForApproval || false;
  
  // Combine both conditions for disabling edit/delete actions
  const shouldDisableActions = isEditingDisabled || isWaitingForApproval;
  const actionDisabledReason = isWaitingForApproval 
    ? "Document is waiting for approval and cannot be modified" 
    : disabledReason;

  // Page actions for the PageLayout
  const pageActions = [
    {
      label: "Back to Documents",
      variant: "outline" as const,
      icon: ArrowLeft,
      onClick: () => navigateToDocumentList(navigate),
    },
    ...(document && canManageDocuments ? [
      {
        label: "Edit Document",
        variant: "outline" as const,
        icon: Edit,
        onClick: () => navigate(`/documents/${document.id}/edit`),
        disabled: shouldDisableActions,
        tooltip: shouldDisableActions ? actionDisabledReason : undefined,
      },
      {
        label: "Execute Steps",
        variant: "outline" as const,
        icon: GitBranch,
        onClick: handleDocumentFlow,
      },
      {
        label: "Show History",
        variant: "outline" as const,
        icon: History,
        onClick: handleShowHistory,
      },
      {
        label: "Delete",
        variant: "destructive" as const,
        icon: Trash2,
        onClick: () => setDeleteDialogOpen(true),
        disabled: shouldDisableActions,
        tooltip: shouldDisableActions ? actionDisabledReason : undefined,
      },
    ] : document ? [
      {
        label: "View Flow",
        variant: "outline" as const,
        icon: Eye,
        onClick: handleDocumentFlow,
      },
      {
        label: "Show History",
        variant: "outline" as const,
        icon: History,
        onClick: handleShowHistory,
      },
    ] : []),
  ];

  // Get document title and subtitle
  
  // Get current status information
  const getCurrentStatus = () => {
    if (!document) return "Unknown Status";
    
    // Priority 1: Check workflow status for more detailed info
    if (workflowStatus?.currentStatusTitle) {
      return workflowStatus.currentStatusTitle;
    }
    
    // Priority 2: Check if there's an effective approval with status
    if (effectiveApproval?.status) {
      return effectiveApproval.status;
    }
    
    // Priority 3: Map document status number to text
    // switch (document.status) {
      //   case 0:
      //     return "Draft";
      //   case 1:
      //     return "In Progress";
      //   case 2:
      //     return "Completed";
      //   case 3:
      //     return "Cancelled";
      //   default:
      //     return "Unknown";
      // }
    };
    
  const documentTitle = document ? document.documentKey : "Loading Document...";
  const documentStatus = document ? getCurrentStatus() : undefined;
  const documentSubtitle = document
    ? `Created At ${new Date(document.createdAt).toLocaleDateString()}`
    : "Document details and information";

  return (
    <PageLayout
      title={documentTitle}
      subtitle={documentSubtitle}
      icon={FileText}
      actions={pageActions}
      status={documentStatus}
      statusColor="text-green-500"
    >
      {/* Main Content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        {isLoadingDocument ? (
          <motion.div variants={itemVariants}>
            <DocumentLoadingState />
          </motion.div>
        ) : document ? (
          <motion.div variants={itemVariants}>
            <DocumentTabsView
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              document={document}
              lignes={lignes}
              canManageDocuments={canManageDocuments}
              isCreateDialogOpen={isCreateDialogOpen}
              setIsCreateDialogOpen={setIsCreateDialogOpen}
              workflowStatus={workflowStatus}
              isLoadingWorkflow={isLoadingWorkflow}
              pendingApproval={effectiveApproval as ApprovalHistoryItem | undefined}
              approvalHistory={approvalHistory}
              isLoadingApproval={isLoadingApproval}
            />
          </motion.div>
        ) : (
          <motion.div variants={itemVariants}>
            <DocumentNotFoundCard />
          </motion.div>
        )}
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <DeleteDocumentDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      />

      {/* Document History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-xl border-border/50">
          <DialogHeader className="border-b border-border/30 pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <History className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-foreground">Document History</span>
                <span className="text-sm font-normal text-muted-foreground">
                  View workflow history and activity
                </span>
              </div>
              {documentHistory.length > 0 && (
                <Badge variant="outline" className="ml-auto bg-primary/10 text-primary border-primary/30 px-3 py-1">
                  {documentHistory.length} entries
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2 space-y-3">
            {documentHistory.length > 0 ? (
              documentHistory.map((entry, index) => {
                const getEventStyling = (eventType: string) => {
                  switch (eventType) {
                    case "Creation":
                      return {
                        badge: "bg-gradient-to-r from-blue-600 to-cyan-600",
                        icon: "🎉",
                        background: "bg-blue-500/10",
                        border: "border-blue-500/30"
                      };
                    case "Update":
                      return {
                        badge: "bg-gradient-to-r from-amber-600 to-orange-600",
                        icon: "✏️",
                        background: "bg-amber-500/10",
                        border: "border-amber-500/30"
                      };
                    case "Workflow":
                    default:
                      return {
                        badge: entry.isApproved
                          ? "bg-gradient-to-r from-green-600 to-emerald-600"
                          : "bg-gradient-to-r from-red-600 to-rose-600",
                        icon: entry.isApproved ? "✅" : "❌",
                        background: entry.isApproved ? "bg-green-500/10" : "bg-red-500/10",
                        border: entry.isApproved ? "border-green-500/30" : "border-red-500/30"
                      };
                  }
                };

                const styling = getEventStyling(entry.eventType);

                return (
                  <div
                    key={entry.id || index}
                    className={`p-4 ${styling.background} rounded-xl border ${styling.border} transition-all hover:border-opacity-60 backdrop-blur-sm`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{styling.icon}</span>
                        <div className="flex items-center gap-2">
                          <Badge className={`px-3 py-1 ${styling.badge} text-white border-0`}>
                            {entry.eventType === "Creation" ? "Created" :
                              entry.eventType === "Update" ? "Updated" :
                                entry.isApproved ? "Approved" : "Rejected"}
                          </Badge>
                          <span className="text-sm font-medium text-foreground">
                            {entry.stepTitle || "Unknown Step"}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded-md border border-border/30">
                        {new Date(entry.processedAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="font-medium text-muted-foreground">Status:</span>
                        <span className="text-foreground">{entry.statusTitle || "N/A"}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="font-medium text-muted-foreground">Processed by:</span>
                        <span className="text-foreground">{entry.processedBy || "Unknown"}</span>
                      </div>
                    </div>

                    {entry.comments && (
                      <div className="mt-3 p-3 bg-muted/30 rounded-lg border-l-2 border-primary/50 backdrop-blur-sm">
                        <div className="text-muted-foreground mb-2 font-medium">Comments:</div>
                        <p className="text-foreground">{entry.comments}</p>
                      </div>
                    )}

                    {entry.updateDetails && (
                      <div className="mt-3 p-3 bg-amber-500/10 rounded-lg border-l-2 border-amber-500/50 backdrop-blur-sm">
                        <div className="text-amber-600 mb-2 font-medium">Update Details:</div>
                        <p className="text-foreground">{entry.updateDetails}</p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 px-6">
                <div className="bg-muted/30 p-6 rounded-xl border border-border/30 inline-flex flex-col items-center backdrop-blur-sm">
                  <div className="p-4 rounded-full bg-muted/30 border border-border/30 mb-4">
                    <History className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-lg text-foreground mb-2">No History Available</p>
                  <p className="text-sm text-muted-foreground max-w-md">
                    This document doesn't have any circuit history entries yet.
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end border-t border-border/30 pt-4">
            <Button
              variant="outline"
              onClick={() => setHistoryDialogOpen(false)}
              className="bg-background/50 border-border/50 text-foreground hover:bg-muted/50 backdrop-blur-sm"
            >
              Close Dialog
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Workflow Dialog */}
      <WorkflowDialog
        open={workflowDialogOpen}
        onOpenChange={setWorkflowDialogOpen}
        documentId={document?.id || 0}
        onWorkflowUpdate={handleWorkflowUpdate}
      />
    </PageLayout>
  );
};

export default ViewDocument;
