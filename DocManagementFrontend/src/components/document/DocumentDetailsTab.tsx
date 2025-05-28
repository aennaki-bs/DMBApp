import { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  User,
  Clock,
  GitBranch,
  Tag,
  Loader2,
  ChevronDown,
  ChevronUp,
  History,
  ExternalLink,
} from "lucide-react";
import { Document } from "@/models/document";
import { WorkflowStatus } from "@/services/workflowService";
import { ApprovalHistoryItem } from "@/services/approvalService";
import { Separator } from "@/components/ui/separator";
import { getStatusClass } from "./DocumentStatusUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DocumentApprovalDetails from "./DocumentApprovalDetails";
import api from "@/services/api";

interface DocumentDetailsTabProps {
  document: Document;
  workflowStatus?: WorkflowStatus;
  isLoadingWorkflow?: boolean;
  pendingApproval?: ApprovalHistoryItem;
  approvalHistory?: ApprovalHistoryItem[];
  isLoadingApproval?: boolean;
}

const DocumentDetailsTab = ({
  document,
  workflowStatus,
  isLoadingWorkflow,
  pendingApproval,
  approvalHistory,
  isLoadingApproval,
}: DocumentDetailsTabProps) => {
  const [circuitKey, setCircuitKey] = useState<string>("");
  const [isLoadingCircuitKey, setIsLoadingCircuitKey] = useState(false);
  const [documentHistory, setDocumentHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  // Get formatted progress display
  const progressDisplay = workflowStatus?.progressPercentage
    ? `${workflowStatus.progressPercentage}%`
    : "25% complete";

  // Fetch circuit key when circuitId is available
  useEffect(() => {
    const fetchCircuitKey = async () => {
      const circuitIdToFetch = workflowStatus?.circuitId || document.circuitId;
      if (!circuitIdToFetch) return;

      try {
        setIsLoadingCircuitKey(true);
        const response = await api.get(`/Circuit/${circuitIdToFetch}`);
        setCircuitKey(response.data.circuitKey || "");
      } catch (error) {
        console.error("Error fetching circuit details:", error);
        setCircuitKey(""); // Reset on error
      } finally {
        setIsLoadingCircuitKey(false);
      }
    };

    fetchCircuitKey();
  }, [workflowStatus?.circuitId, document.circuitId]);

  // Fetch document circuit history
  useEffect(() => {
    const fetchDocumentHistory = async () => {
      if (!document.id) return;

      try {
        setIsLoadingHistory(true);
        const response = await api.get(
          `/Workflow/document/${document.id}/history`
        );
        setDocumentHistory(response.data || []);
      } catch (error) {
        console.error("Error fetching document history:", error);
        setDocumentHistory([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchDocumentHistory();
  }, [document.id]);

  return (
    <div
      className={`overflow-hidden border-l-4 bg-gradient-to-br ${getStatusClass(
        document.status
      )} shadow-xl rounded-lg`}
    >
      <div className="bg-gradient-to-r from-blue-800/30 to-indigo-800/20 border-b border-white/5 px-6 py-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-300" />
            Document Details
          </h2>
          <div className="flex items-center gap-3">
            <p className="text-sm text-blue-300/80 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Last updated: {new Date(document.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 text-blue-100">
        {/* Approval Details Component */}
        <DocumentApprovalDetails
          pendingApproval={pendingApproval}
          approvalHistory={approvalHistory}
          isLoadingApproval={isLoadingApproval}
        />

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-blue-300 mb-1">
              Document Type
            </h3>
            <p className="font-medium">{document.documentType.typeName}</p>
          </div>

          {/* External Document field */}
          {document.documentExterne && (
            <div>
              <h3 className="text-sm font-medium text-blue-300 mb-1">
                External Document
              </h3>
              <p className="font-medium flex items-center gap-1">
                <FileText className="h-4 w-4 text-blue-400" />
                {document.documentExterne}
              </p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-blue-300 mb-1">
              Document Date
            </h3>
            <p className="font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4 text-blue-400" />
              {new Date(document.docDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-300 mb-1">
              Accounting Date
            </h3>
            <p className="font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4 text-blue-400" />
              {new Date(document.comptableDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-300 mb-1">Series</h3>
            <p className="font-medium flex items-center gap-1">
              <Tag className="h-4 w-4 text-blue-400" />
              AVAB26
            </p>
            <p className="text-sm text-blue-300/70">
              Valid: 19/05/2025 - 19/05/2026
            </p>
          </div>

          {/* Circuit section with workflow status data */}
          {(document.circuitId || workflowStatus) && (
            <div>
              <h3 className="text-sm font-medium text-blue-300 mb-1">
                Circuit
              </h3>
              {isLoadingWorkflow ? (
                <div className="flex items-center gap-2 text-blue-300/70">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading workflow information...
                </div>
              ) : workflowStatus ? (
                <>
                  <p className="font-medium flex items-center gap-1">
                    <GitBranch className="h-4 w-4 text-blue-400" />
                    {workflowStatus.circuitTitle}
                  </p>
                  <p className="text-sm text-blue-300/70 mt-1">
                    Code:{" "}
                    {isLoadingCircuitKey ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      circuitKey || workflowStatus.circuitId
                    )}
                  </p>
                  <p className="text-sm text-blue-300/70">
                    Current Status:{" "}
                    {workflowStatus.currentStatusTitle || "Processing"}
                  </p>
                  <div className="mt-2">
                    <div className="w-full bg-blue-950/40 rounded-full h-2">
                      {/* <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: progressDisplay }}
                      ></div> */}
                    </div>
                    {/* <p className="text-xs text-blue-300/70 mt-1 text-right">
                      {progressDisplay}
                    </p> */}
                  </div>
                </>
              ) : (
                <>
                  <p className="font-medium flex items-center gap-1">
                    <GitBranch className="h-4 w-4 text-blue-400" />
                    {document.circuit?.title || "Unknown Circuit"}
                  </p>
                  <p className="text-sm text-blue-300/70 mt-1">
                    Code:{" "}
                    {isLoadingCircuitKey ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      circuitKey || "N/A"
                    )}
                  </p>
                  <p className="text-sm text-blue-300/70">
                    Current Status: Processing
                  </p>
                </>
              )}
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-blue-300 mb-1">
              Created By
            </h3>
            <p className="font-medium flex items-center gap-1">
              <User className="h-4 w-4 text-blue-400" />
              {document.createdBy.firstName} {document.createdBy.lastName}
            </p>
            <p className="text-sm text-blue-300/70">
              ({document.createdBy.username})
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-300 mb-1">
              Created At
            </h3>
            <p className="font-medium flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-400" />
              {new Date(document.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <Separator className="my-6 bg-blue-400/20" />

        <div>
          <h3 className="text-sm font-medium text-blue-300 mb-3">Content</h3>
          <div className="p-4 bg-blue-950/40 rounded-md min-h-[200px] whitespace-pre-wrap border border-blue-400/20">
            {document.content || "No content available."}
          </div>
        </div>

        {/* Floating History Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setHistoryDialogOpen(true)}
            className="h-16 w-16 rounded-full shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 border-2 border-blue-400/30 flex items-center justify-center relative group history-button"
            style={{
              boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
            }}
          >
            <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 blur-md group-hover:opacity-30 transition-opacity"></div>
            <History className="h-8 w-8 text-white transform group-hover:scale-110 transition-transform duration-300" />
            {documentHistory.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-7 w-7 flex items-center justify-center shadow-lg border-2 border-white count-badge">
                {documentHistory.length}
              </span>
            )}
            <div className="absolute -bottom-12 right-0 transform translate-y-0 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
              <div className="bg-[#0a1033] text-white text-sm py-2 px-4 rounded-lg shadow-xl border border-blue-500/30 flex items-center gap-2 whitespace-nowrap">
                <History className="h-4 w-4 text-blue-400" />
                <span>View History</span>
                <div className="absolute -top-2 right-6 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-[#0a1033]"></div>
              </div>
            </div>
          </Button>
        </div>

        <style>
          {`
            @keyframes pulse-slow {
              0%, 100% {
                transform: scale(1);
                box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
              }
              50% {
                transform: scale(1.05);
                box-shadow: 0 0 30px rgba(59, 130, 246, 0.7);
              }
            }
            @keyframes bounce-gentle {
              0%, 100% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-3px);
              }
            }
            .history-button {
              animation: pulse-slow 3s infinite;
            }
            .count-badge {
              animation: bounce-gentle 2s infinite;
            }
          `}
        </style>

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
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-blue-400/30 border-t-blue-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <History className="h-6 w-6 text-blue-400/70" />
                    </div>
                  </div>
                  <span className="ml-4 text-blue-300 text-lg">
                    Loading history...
                  </span>
                </div>
              ) : documentHistory.length > 0 ? (
                <div className="space-y-4">
                  {documentHistory.map((entry, index) => (
                    <div
                      key={entry.id || index}
                      className="p-4 bg-blue-900/30 rounded-lg border border-blue-800/50 transition-all hover:bg-blue-800/30 hover:border-blue-700/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              entry.isApproved ? "default" : "destructive"
                            }
                            className={`px-3 py-1.5 ${
                              entry.isApproved
                                ? "bg-gradient-to-r from-green-600 to-emerald-600"
                                : "bg-gradient-to-r from-red-600 to-rose-600"
                            }`}
                          >
                            {entry.isApproved ? "Approved" : "Rejected"}
                          </Badge>
                          <span className="text-sm font-medium text-blue-200 ml-1">
                            {entry.stepTitle || "Unknown Step"}
                          </span>
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
                    </div>
                  ))}
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
    </div>
  );
};

export default DocumentDetailsTab;
