import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import documentService from "@/services/documentService";
import workflowService from "@/services/workflowService";
import approvalService from "@/services/approvalService";
import { navigateToDocumentList } from "@/utils/navigationUtils";
import api from "@/services/api";
import { DocumentHistoryEvent } from "@/models/document";

// Component imports
import DocumentTitle from "@/components/document/DocumentTitle";
import DocumentActions from "@/components/document/DocumentActions";
import DocumentTabsView from "@/components/document/DocumentTabsView";
import DocumentLoadingState from "@/components/document/DocumentLoadingState";
import DocumentNotFoundCard from "@/components/document/DocumentNotFoundCard";
import DeleteDocumentDialog from "@/components/document/DeleteDocumentDialog";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Loader2 } from "lucide-react";

const ViewDocument = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [documentHistory, setDocumentHistory] = useState<DocumentHistoryEvent[]>([]);

  // Check if user has permissions to edit/delete documents
  const canManageDocuments =
    user?.role === "Admin" || user?.role === "FullUser";

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

  // Fetch document details
  const {
    data: document,
    isLoading: isLoadingDocument,
    error: documentError,
  } = useQuery({
    queryKey: ["document", Number(id)],
    queryFn: () => documentService.getDocumentById(Number(id)),
    enabled: !!id,
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
    retry: false,  // Don't retry if the document isn't in a workflow
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
  });

  // Fetch lignes for this document
  const {
    data: lignes = [],
    isLoading: isLoadingLignes,
    error: lignesError,
  } = useQuery({
    queryKey: ["documentLignes", Number(id)],
    queryFn: () => documentService.getLignesByDocumentId(Number(id)),
    enabled: !!id,
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
      // Don't show error toast for approval history as it might not exist for all documents
    }
    
    if (approvalError) {
      console.error(`Failed to fetch pending approvals for document ${id}:`, approvalError);
      // Don't show error toast for pending approvals as it might not exist for all documents
    }
  }, [documentError, lignesError, workflowError, approvalError, approvalHistoryError, id, navigate, document]);

  // Cleanup document context when component unmounts or navigates away
  useEffect(() => {
    return () => {
      // Only clear if we're actually navigating away from document pages
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

  // Add a method to handle navigation to document flow
  const handleDocumentFlow = () => {
    if (document) {
      navigate(`/documents/${document.id}/flow`);
    }
  };

  // Handle workflow updates - refresh all document-related data
  const handleWorkflowUpdate = () => {
    // Invalidate and refetch all document-related queries
    queryClient.invalidateQueries({ queryKey: ["document", Number(id)] });
    queryClient.invalidateQueries({ queryKey: ["documentWorkflow", Number(id)] });
    queryClient.invalidateQueries({ queryKey: ["documentApprovalHistory", Number(id)] });
    queryClient.invalidateQueries({ queryKey: ["documentApprovals", Number(id)] });
    queryClient.invalidateQueries({ queryKey: ["documentLignes", Number(id)] });
    
    // Also invalidate the documents list for when user navigates back
    queryClient.invalidateQueries({ queryKey: ["documents"] });
  };

  if (!id) {
    navigate("/documents");
    return null;
  }

  // Find active approval - prefer direct pending approvals query result
  const directPendingApproval = pendingApprovals && pendingApprovals.length > 0 
    ? pendingApprovals[0] 
    : undefined;
  
  // Fallback to approval history if direct pending approvals query returned nothing
  const historyPendingApproval = !directPendingApproval 
    ? approvalHistory?.find(approval =>
        approval.status === "Pending" ||
        approval.status === "InProgress" ||
        approval.status === "Waiting" ||
        approval.status.toLowerCase().includes("wait") ||
        approval.status.toLowerCase().includes("progress")
      ) 
    : undefined;

  // If there's no explicit pending approval but workflow has status, create a synthetic one
  const syntheticApproval = !directPendingApproval && !historyPendingApproval &&
    workflowStatus?.currentStatusTitle && workflowStatus?.currentStepId && workflowStatus?.currentStepRequiresApproval
      ? {
          approvalId: 0,
          documentId: Number(id),
          documentKey: document?.documentKey || '',
          documentTitle: document?.title || '',
          stepId: workflowStatus.currentStepId,
          stepTitle: workflowStatus.currentStatusTitle,
          assignedTo: "Approval Required",
          status: "Waiting",
          createdAt: new Date().toISOString(),
          isRequired: true
        } 
      : undefined;

  // Use the most specific approval information available
  const effectiveApproval = directPendingApproval || historyPendingApproval || syntheticApproval;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900/20 to-blue-950/30">
      {/* Main Content */}
      <motion.main
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          variants={itemVariants}
          className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <DocumentTitle document={document} isLoading={isLoadingDocument} />

          {document && (
            <DocumentActions
              document={document}
              canManageDocuments={canManageDocuments}
              onDelete={() => setDeleteDialogOpen(true)}
              onDocumentFlow={handleDocumentFlow}
              onWorkflowUpdate={handleWorkflowUpdate}
              onShowHistory={handleShowHistory}
              historyCount={documentHistory.length}
            />
          )}
        </motion.div>

        {isLoadingDocument ? (
          <motion.div variants={itemVariants}>
            <DocumentLoadingState />
          </motion.div>
        ) : document ? (
          <motion.div variants={itemVariants} className="mb-6">
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
              pendingApproval={effectiveApproval}
              approvalHistory={approvalHistory}
              isLoadingApproval={isLoadingApproval}
            />
          </motion.div>
        ) : (
          <motion.div variants={itemVariants}>
            <DocumentNotFoundCard />
          </motion.div>
        )}
      </motion.main>

      {/* Delete Confirmation Dialog */}
      <DeleteDocumentDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      />

      {/* Document History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[700px] backdrop-blur-md bg-gradient-to-b from-[#0a1033]/95 to-[#131f4f]/95 border-blue-500/30">
          <DialogHeader className="border-b border-blue-500/20 pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-3 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-400/30">
                <History className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-white">Document History</span>
                <span className="text-sm font-normal text-blue-300/80">
                  View workflow history and activity
                </span>
              </div>
              {documentHistory.length > 0 && (
                <Badge
                  variant="outline"
                  className="ml-auto bg-blue-800/30 text-blue-300 border-blue-500/30 px-3 py-1"
                >
                  {documentHistory.length} entries
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {documentHistory.length > 0 ? (
              <div className="space-y-4">
                {documentHistory.map((entry, index) => {
                  // Function to get event styling based on event type
                  const getEventStyling = (eventType: string) => {
                    switch (eventType) {
                      case "Creation":
                        return {
                          badge: "bg-gradient-to-r from-blue-600 to-cyan-600",
                          icon: "🎉",
                          background: "bg-blue-900/30",
                          border: "border-blue-800/50",
                          hoverBg: "hover:bg-blue-800/30",
                          hoverBorder: "hover:border-blue-700/50"
                        };
                      case "Update":
                        return {
                          badge: "bg-gradient-to-r from-amber-600 to-orange-600",
                          icon: "✏️",
                          background: "bg-amber-900/20",
                          border: "border-amber-800/40",
                          hoverBg: "hover:bg-amber-800/20",
                          hoverBorder: "hover:border-amber-700/40"
                        };
                      case "Workflow":
                      default:
                        return {
                          badge: entry.isApproved 
                            ? "bg-gradient-to-r from-green-600 to-emerald-600"
                            : "bg-gradient-to-r from-red-600 to-rose-600",
                          icon: entry.isApproved ? "✅" : "❌",
                          background: "bg-blue-900/30",
                          border: "border-blue-800/50",
                          hoverBg: "hover:bg-blue-800/30",
                          hoverBorder: "hover:border-blue-700/50"
                        };
                    }
                  };

                  const styling = getEventStyling(entry.eventType);

                  return (
                    <div
                      key={entry.id || index}
                      className={`p-4 ${styling.background} rounded-lg border ${styling.border} transition-all ${styling.hoverBg} ${styling.hoverBorder}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{styling.icon}</span>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`px-3 py-1.5 ${styling.badge}`}
                            >
                              {entry.eventType === "Creation" ? "Created" :
                               entry.eventType === "Update" ? "Updated" :
                               entry.isApproved ? "Approved" : "Rejected"}
                            </Badge>
                            <span className="text-sm font-medium text-blue-200 ml-1">
                              {entry.stepTitle || "Unknown Step"}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded-md border border-blue-800/50">
                          {new Date(entry.processedAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-sm text-blue-300 mb-2 flex items-center gap-2">
                        <div className="bg-blue-800/40 p-1 rounded-md">
                          <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1"></span>
                          <span className="font-medium">Status:</span>
                        </div>
                        <span className="text-white">
                          {entry.statusTitle || "N/A"}
                        </span>
                      </div>

                      <div className="text-sm text-blue-300 mb-3 flex items-center gap-2">
                        <div className="bg-blue-800/40 p-1 rounded-md">
                          <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1"></span>
                          <span className="font-medium">Processed by:</span>
                        </div>
                        <span className="text-white">
                          {entry.processedBy || "Unknown"}
                        </span>
                      </div>

                      {entry.comments && (
                        <div className="text-sm text-blue-200 bg-blue-800/30 p-3 rounded-lg border-l-2 border-blue-500/50 mt-3">
                          <div className="flex items-center text-blue-300 mb-2">
                            <span className="font-medium">Comments:</span>
                          </div>
                          <p className="mt-1 text-blue-100">{entry.comments}</p>
                        </div>
                      )}

                      {entry.updateDetails && (
                        <div className="text-sm text-amber-200 bg-amber-800/20 p-3 rounded-lg border-l-2 border-amber-500/50 mt-3">
                          <div className="flex items-center text-amber-300 mb-2">
                            <span className="font-medium">Update Details:</span>
                          </div>
                          <p className="mt-1 text-amber-100">{entry.updateDetails}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 px-6">
                <div className="bg-blue-900/20 p-6 rounded-lg border border-blue-800/30 inline-flex flex-col items-center">
                  <div className="p-4 rounded-full bg-blue-900/30 border border-blue-700/30 mb-4">
                    <History className="h-10 w-10 text-blue-400/50" />
                  </div>
                  <p className="text-lg text-blue-300 mb-2">
                    No History Available
                  </p>
                  <p className="text-sm text-blue-400/70 max-w-md">
                    This document doesn't have any circuit history entries
                    yet. History will appear here when workflow actions are
                    taken.
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end border-t border-blue-500/20 pt-4">
            <Button
              variant="outline"
              onClick={() => setHistoryDialogOpen(false)}
              className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-blue-500/30 text-blue-300 hover:bg-blue-700/20 transition-all px-6 py-2 rounded-full flex items-center gap-2"
            >
              Close Dialog
            </Button>
          </div>

          <style>
            {`
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              
              .custom-scrollbar::-webkit-scrollbar-track {
                background: rgba(30, 41, 59, 0.2);
                border-radius: 4px;
              }
              
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(59, 130, 246, 0.3);
                border-radius: 4px;
              }
              
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(59, 130, 246, 0.5);
              }
            `}
          </style>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewDocument;
