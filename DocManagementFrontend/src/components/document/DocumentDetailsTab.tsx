import { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  User,
  Clock,
  GitBranch,
  Tag,
  Loader2,
  History,
  ExternalLink,
  UserCheck,
  Package,
  Users,
  Building2,
  Archive,
  Hash,
} from "lucide-react";
import ErpArchivalStatus from "./ErpArchivalStatus";
import { Document, TierType, DocumentHistoryEvent } from "@/models/document";
import { WorkflowStatus } from "@/services/workflowService";
import { ApprovalHistoryItem } from "@/services/approvalService";
import { Separator } from "@/components/ui/separator";
import { getStatusClass } from "./DocumentStatusUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [documentHistory, setDocumentHistory] = useState<DocumentHistoryEvent[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  // Get formatted progress display
  const progressDisplay = workflowStatus?.progressPercentage
    ? `${workflowStatus.progressPercentage}%`
    : "25% complete";

  // Helper function to determine if customer/vendor section should be shown
  const shouldShowCustomerVendor = () => {
    return (
      document.documentType?.tierType === TierType.Customer ||
      document.documentType?.tierType === TierType.Vendor
    );
  };

  // Helper function to get tier type string
  const getTierTypeString = (tierType?: TierType): string => {
    switch (tierType) {
      case TierType.Customer:
        return "Customer";
      case TierType.Vendor:
        return "Vendor";
      default:
        return "None";
    }
  };

  // Helper function to get tier type icon
  const getTierTypeIcon = (tierType?: TierType) => {
    switch (tierType) {
      case TierType.Customer:
        return <UserCheck className="h-4 w-4 text-green-400" />;
      case TierType.Vendor:
        return <Package className="h-4 w-4 text-orange-400" />;
      default:
        return <Users className="h-4 w-4 text-gray-400" />;
    }
  };

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
    <div className="space-y-6">
      {/* Optimized Compact Document Header with Enhanced Visibility */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background/30 backdrop-blur-xl border border-primary/20 shadow-lg rounded-xl p-4 hover:from-primary/15 hover:via-primary/8 hover:to-background/40 hover:border-primary/30 transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Document Info */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/15 backdrop-blur-sm border border-primary/30 group-hover:bg-primary/25 transition-colors">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Document Information</h2>
              <p className="text-sm text-muted-foreground">
                Updated {new Date(document.updatedAt).toLocaleDateString()} • {document.updatedBy?.username || 'Unknown'}
              </p>
            </div>
          </div>

          {/* Center: Responsibility Center (if exists) */}
          {document.responsibilityCentre && (
            <div className="flex items-center gap-3 bg-primary/15 backdrop-blur-sm border border-primary/30 rounded-lg px-4 py-2 shadow-sm hover:bg-primary/20 hover:border-primary/40 hover:shadow-md transition-all duration-300">
              <div className="p-1.5 rounded-md bg-primary/25 border border-primary/40">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-xs font-medium text-primary uppercase tracking-wider">Centre</div>
                <div className="font-semibold text-foreground text-sm">
                  {document.responsibilityCentre.descr || "No Centre"}
                </div>
                {document.responsibilityCentre.code && (
                  <div className="text-xs text-foreground/70 font-medium">
                    Code: {document.responsibilityCentre.code}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approval Details - Compact */}
      <DocumentApprovalDetails
        pendingApproval={pendingApproval}
        approvalHistory={approvalHistory}
        isLoadingApproval={isLoadingApproval}
      />

      {/* ERP Archival Status - Compact */}
      {document.status === 2 && (
        <div className="bg-gradient-to-r from-background/50 via-background/30 to-background/50 backdrop-blur-xl border border-border/50 shadow-lg rounded-xl p-4">
          <ErpArchivalStatus
            documentId={document.id}
            documentKey={document.documentKey}
            isCompletedDocument={true}
          />
        </div>
      )}

      {/* Enhanced Grid Layout with Better Visibility */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">

        {/* Document Type */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/70 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 rounded-xl p-6 group cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors border border-purple-500/30 group-hover:border-purple-500/50">
              <Tag className="h-5 w-5 text-purple-400 group-hover:text-purple-300" />
            </div>
            <h3 className="text-sm font-medium text-slate-300 group-hover:text-slate-200">Document Type</h3>
          </div>
          <p className="font-bold text-white text-lg group-hover:text-purple-100">{document.documentType.typeName}</p>
        </div>

        {/* Document Date */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/70 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 rounded-xl p-6 group cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors border border-blue-500/30 group-hover:border-blue-500/50">
              <Calendar className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
            </div>
            <h3 className="text-sm font-medium text-slate-300 group-hover:text-slate-200">Document Date</h3>
          </div>
          <p className="font-bold text-white text-lg group-hover:text-blue-100">{new Date(document.docDate).toLocaleDateString()}</p>
        </div>

        {/* Posting Date */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/70 hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 rounded-xl p-6 group cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors border border-green-500/30 group-hover:border-green-500/50">
              <Calendar className="h-5 w-5 text-green-400 group-hover:text-green-300" />
            </div>
            <h3 className="text-sm font-medium text-slate-300 group-hover:text-slate-200">Posting Date</h3>
          </div>
          <p className="font-bold text-white text-lg group-hover:text-green-100">{new Date(document.comptableDate).toLocaleDateString()}</p>
        </div>

        {/* External Document - Only show if exists */}
        {document.documentExterne && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/70 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 rounded-xl p-6 group cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors border border-orange-500/30 group-hover:border-orange-500/50">
                <ExternalLink className="h-5 w-5 text-orange-400 group-hover:text-orange-300" />
              </div>
              <h3 className="text-sm font-medium text-slate-300 group-hover:text-slate-200">External Document</h3>
            </div>
            <p className="font-bold text-white text-lg break-all group-hover:text-orange-100">{document.documentExterne}</p>
          </div>
        )}

        {/* Series */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/70 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 rounded-xl p-6 group cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors border border-cyan-500/30 group-hover:border-cyan-500/50">
              <Hash className="h-5 w-5 text-cyan-400 group-hover:text-cyan-300" />
            </div>
            <h3 className="text-sm font-medium text-slate-300 group-hover:text-slate-200">Series</h3>
          </div>
          <div>
            <p className="font-bold text-white text-lg group-hover:text-cyan-100">{document.subType?.name || 'No Series'}</p>
            {document.subType?.subTypeKey && (
              <p className="text-xs text-slate-400 group-hover:text-slate-300 mt-1 font-medium">Code: {document.subType.subTypeKey}</p>
            )}
          </div>
        </div>

        {/* Circuit */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/70 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 rounded-xl p-6 group cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 group-hover:bg-indigo-500/30 transition-colors border border-indigo-500/30 group-hover:border-indigo-500/50">
              <GitBranch className="h-5 w-5 text-indigo-400 group-hover:text-indigo-300" />
            </div>
            <h3 className="text-sm font-medium text-slate-300 group-hover:text-slate-200">Circuit</h3>
          </div>
          <div>
            <p className="font-bold text-white text-lg group-hover:text-indigo-100">{document.circuit?.title || 'No Circuit'}</p>
            {document.circuit && (
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border transition-colors ${
                  document.circuit.isActive 
                    ? "bg-green-500/20 text-green-300 border-green-500/30 group-hover:bg-green-500/30 group-hover:border-green-500/50"
                    : "bg-red-500/20 text-red-300 border-red-500/30 group-hover:bg-red-500/30 group-hover:border-red-500/50"
                }`}>
                  {document.circuit.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Created By */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/70 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 rounded-xl p-6 group cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-500/20 group-hover:bg-amber-500/30 transition-colors border border-amber-500/30 group-hover:border-amber-500/50">
              <User className="h-5 w-5 text-amber-400 group-hover:text-amber-300" />
            </div>
            <h3 className="text-sm font-medium text-slate-300 group-hover:text-slate-200">Created By</h3>
          </div>
          <div>
            <p className="font-bold text-white text-lg group-hover:text-amber-100">{document.createdBy.username}</p>
            <p className="text-xs text-slate-400 group-hover:text-slate-300 mt-1 font-medium">
              {new Date(document.createdAt).toLocaleDateString()} at {new Date(document.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Customer/Vendor (if exists) */}
        {(document.customerVendorName || document.customerVendorCode) && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/70 hover:border-pink-500/50 hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-300 rounded-xl p-6 group cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-pink-500/20 group-hover:bg-pink-500/30 transition-colors border border-pink-500/30 group-hover:border-pink-500/50">
                <Users className="h-5 w-5 text-pink-400 group-hover:text-pink-300" />
              </div>
              <h3 className="text-sm font-medium text-slate-300 group-hover:text-slate-200">
                {document.documentType?.tierType === 1 ? 'Customer' : 'Vendor'}
              </h3>
            </div>
            <div>
              <p className="font-bold text-white text-lg group-hover:text-pink-100">{document.customerVendorName}</p>
              {document.customerVendorCode && (
                <p className="text-xs text-slate-400 group-hover:text-slate-300 mt-1 font-medium">Code: {document.customerVendorCode}</p>
              )}
              {document.customerVendorAddress && (
                <p className="text-xs text-slate-400 group-hover:text-slate-300 mt-1">{document.customerVendorAddress}</p>
              )}
              {(document.customerVendorCity || document.customerVendorCountry) && (
                <p className="text-xs text-slate-400 group-hover:text-slate-300 mt-1">
                  {document.customerVendorCity}{document.customerVendorCity && document.customerVendorCountry && ', '}{document.customerVendorCountry}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Content Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/70 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 rounded-xl p-6 group">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors border border-blue-500/30 group-hover:border-blue-500/50">
            <FileText className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-300 group-hover:text-slate-200">Content</h3>
        </div>
        
        <div className="space-y-3">
          {document.content && document.content.trim() ? (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-slate-200 group-hover:text-white leading-relaxed bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 group-hover:bg-slate-900/70 group-hover:border-slate-600/50 transition-all duration-300">
                {showFullContent ? document.content : document.content.length > 300 ? `${document.content.substring(0, 300)}...` : document.content}
              </div>
              
              {document.content.length > 300 && (
                <button
                  onClick={() => setShowFullContent(!showFullContent)}
                  className="mt-3 text-xs font-medium text-blue-400 hover:text-blue-300 underline group-hover:text-blue-200 transition-colors"
                >
                  {showFullContent ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          ) : (
            <p className="text-slate-400 group-hover:text-slate-300 italic bg-slate-900/30 border border-slate-700/30 rounded-lg p-4 text-center">
              No content available
            </p>
          )}
        </div>
      </div>

      {/* Document History Dialog - Enhanced */}
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
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-12">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <History className="h-6 w-6 text-primary/70" />
                  </div>
                </div>
                <span className="ml-4 text-foreground text-lg">Loading history...</span>
              </div>
            ) : documentHistory.length > 0 ? (
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
    </div>
  );
};

export default DocumentDetailsTab;
