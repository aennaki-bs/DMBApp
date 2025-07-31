import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Calendar,
  User,
  GitBranch,
  Tag,
  History,
  ExternalLink,
  UserCheck,
  Package,
  Building2,
  Hash,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  MapPin,
} from "lucide-react";
import ErpArchivalStatus from "./ErpArchivalStatus";
import { Document, TierType, DocumentHistoryEvent } from "@/models/document";
import { WorkflowStatus } from "@/services/workflowService";
import { ApprovalHistoryItem } from "@/services/approvalService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import DocumentApprovalDetails from "./DocumentApprovalDetails";
import { CustomerVendorDetailsDialog } from "./dialogs/CustomerVendorDetailsDialog";
import api from "@/services/api";
import { toast } from "sonner";

interface DocumentDetailsTabProps {
  document: Document;
  workflowStatus?: WorkflowStatus;
  isLoadingWorkflow?: boolean;
  pendingApproval?: ApprovalHistoryItem;
  approvalHistory?: ApprovalHistoryItem[];
  isLoadingApproval?: boolean;
}

// Memoized Info Card Component for better performance
const InfoCard = React.memo(({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  copyable = false,
  actions = [],
}: {
  icon: any;
  title: string;
  value: string;
  subtitle?: string;
  copyable?: boolean;
  actions?: Array<{
    label: string;
    onClick: () => void;
    icon?: any;
  }>;
}) => {
  const copyToClipboard = useCallback(async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${fieldName} copied to clipboard`);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  }, []);

  return (
    <div className="bg-gradient-to-br from-slate-800/95 via-slate-700/90 to-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-xl p-4 hover:border-slate-500/70 transition-all duration-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <Icon className="h-4 w-4 text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
          {subtitle && (
            <p className="text-xs text-slate-400">{subtitle}</p>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1">
          {/* {copyable && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 bg-blue-500/10 hover:bg-blue-500/20"
              onClick={() => copyToClipboard(value, title)}
            >
              <Copy className="h-3 w-3 text-blue-400" />
            </Button>
          )} */}
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300"
              onClick={action.onClick}
            >
              {action.icon && <action.icon className="h-3 w-3 mr-1" />}
              {action.label}
            </Button>
          ))}
        </div>
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
});

InfoCard.displayName = 'InfoCard';

const DocumentDetailsTab = ({
  document,
  workflowStatus,
  isLoadingWorkflow,
  pendingApproval,
  approvalHistory,
  isLoadingApproval,
}: DocumentDetailsTabProps) => {
  const [documentHistory, setDocumentHistory] = useState<DocumentHistoryEvent[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [customerVendorDialogOpen, setCustomerVendorDialogOpen] = useState(false);

  // Memoized values to prevent unnecessary re-renders
  const memoizedDocumentInfo = useMemo(() => ({
    documentDate: new Date(document.docDate).toLocaleDateString(),
    postingDate: new Date(document.comptableDate).toLocaleDateString(),
    createdDate: new Date(document.createdAt).toLocaleDateString(),
    createdTime: new Date(document.createdAt).toLocaleTimeString(),
    updatedDate: new Date(document.updatedAt).toLocaleDateString(),
    updatedBy: document.updatedBy?.username || 'Unknown',
    documentTypeName: document.documentType?.typeName || 'Unknown',
    seriesName: document.subType?.name || 'No Series',
    seriesCode: document.subType?.subTypeKey,
    circuitTitle: document.circuit?.title || 'No Circuit',
    currentStatus: workflowStatus?.currentStatusTitle || 'Unknown',
    customerVendorName: document.customerVendorName,
    customerVendorCode: document.customerVendorCode,
    documentExterne: document.documentExterne,
    createdByUsername: document.createdBy?.username || 'Unknown',
    responsibilityCentre: document.responsibilityCentre,
  }), [document, workflowStatus]);

  // Fetch document history only when needed
  useEffect(() => {
    if (!document.id) return;

    const fetchDocumentHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const response = await api.get(`/Workflow/document/${document.id}/history`);
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

  // Memoized copy function
  const copyToClipboard = useCallback(async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${fieldName} copied to clipboard`);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  }, []);

  // Memoized info cards data
  const infoCardsData = useMemo(() => [
    {
      icon: Calendar,
      title: "Document Date",
      value: memoizedDocumentInfo.documentDate,
    },
    {
      icon: Calendar,
      title: "Posting Date",
      value: memoizedDocumentInfo.postingDate,
    },
    {
      icon: Tag,
      title: "Document Type",
      value: memoizedDocumentInfo.documentTypeName,
    },
    {
      icon: Hash,
      title: "Series",
      value: memoizedDocumentInfo.seriesName,
      subtitle: memoizedDocumentInfo.seriesCode ? `` : undefined,
    },
    {
      icon: GitBranch,
      title: "Circuit",
      value: `Status: ${memoizedDocumentInfo.currentStatus}`,
      subtitle: memoizedDocumentInfo.circuitTitle,
    },
    ...(memoizedDocumentInfo.customerVendorName ? [{
      icon: document.documentType?.tierType === 1 ? UserCheck : Package,
      title: document.documentType?.tierType === 1 ? 'Customer' : 'Vendor',
      value: memoizedDocumentInfo.customerVendorName,
      subtitle: memoizedDocumentInfo.customerVendorCode ? `Code: ${memoizedDocumentInfo.customerVendorCode}` : undefined,
      actions: [
        {
          label: "Show Details",
          icon: MapPin,
          onClick: () => setCustomerVendorDialogOpen(true),
        },
      ],
    }] : []),
    ...(memoizedDocumentInfo.documentExterne ? [{
      icon: ExternalLink,
      title: "External Document",
      value: memoizedDocumentInfo.documentExterne,
    }] : []),
    {
      icon: User,
      title: "Created By",
      value: memoizedDocumentInfo.createdByUsername,
      subtitle: `${memoizedDocumentInfo.createdDate} at ${memoizedDocumentInfo.createdTime}`,
    },
  ], [memoizedDocumentInfo, document.documentType?.tierType]);

  return (
    <div className="space-y-4 overflow-y-auto h-full pb-4">
      {/* Document Header */}
      <div className="bg-gradient-to-r from-slate-800/80 via-slate-700/60 to-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/15 border border-blue-500/30">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Document Information</h2>
              <p className="text-sm text-slate-300">
                Last Updated At {memoizedDocumentInfo.updatedDate} • By {memoizedDocumentInfo.updatedBy}
              </p>
            </div>
          </div>

          {memoizedDocumentInfo.responsibilityCentre && (
            <div className="flex items-center gap-3 bg-blue-500/15 border border-blue-500/30 rounded-lg px-4 py-2">
              <div className="p-1.5 rounded-md bg-blue-500/25 border border-blue-500/40">
                <Building2 className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <div className="text-xs font-medium text-blue-300 uppercase tracking-wider">Centre</div>
                <div className="font-semibold text-white text-sm">
                  {memoizedDocumentInfo.responsibilityCentre.descr || "No Centre"}
                </div>
                {memoizedDocumentInfo.responsibilityCentre.code && (
                  <div className="text-xs text-slate-300 font-medium">
                    Code: {memoizedDocumentInfo.responsibilityCentre.code}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approval Details */}
      {pendingApproval && (
          <DocumentApprovalDetails
            pendingApproval={pendingApproval}
            approvalHistory={approvalHistory}
            isLoadingApproval={isLoadingApproval}
          />
      )}

             {/* Document Content */}
       <div className="space-y-4">
            {/* ERP Archival Status */}
            {document.status === 2 && (
          <div className="bg-gradient-to-r from-slate-800/80 via-slate-700/60 to-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6">
                  <ErpArchivalStatus
                    documentId={document.id}
                    documentKey={document.documentKey}
                    isCompletedDocument={true}
                  />
                </div>
        )}

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {infoCardsData.map((card, index) => (
            <InfoCard key={index} {...card} />
          ))}
        </div>

        {/* Document Content Section */}
        <Card className="bg-gradient-to-r from-slate-800/80 via-slate-700/60 to-slate-800/80 backdrop-blur-sm border-slate-600/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
                        <FileText className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white">Document Content</CardTitle>
                        <p className="text-slate-300 text-sm">Full document description and details</p>
                      </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {document.content && document.content.trim() ? (
              <div className="bg-slate-900/50 border border-slate-600/50 rounded-xl p-6">
                        <div className="whitespace-pre-wrap text-slate-200 leading-relaxed">
                          {document.content}
                        </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                <div className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-8">
                        <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400 text-lg font-medium">No content available</p>
                        <p className="text-slate-500 text-sm mt-2">This document doesn't have any content description</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
      </div>

      {/* Document History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[85vh] bg-slate-900/95 backdrop-blur-xl border-slate-600/50">
          <DialogHeader className="border-b border-slate-600/50 pb-6">
            <DialogTitle className="flex items-center gap-4 text-2xl">
              <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-500/30">
                <History className="h-8 w-8 text-blue-400" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-white font-bold">Document History</span>
                <span className="text-slate-300 text-sm font-normal">
                  Complete workflow history and activity timeline
                </span>
              </div>
              {documentHistory.length > 0 && (
                <Badge variant="outline" className="ml-auto bg-blue-500/10 text-blue-300 border-blue-500/30 px-4 py-2 text-sm">
                  {documentHistory.length} entries
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-6 max-h-[60vh] overflow-y-auto pr-2 space-y-4">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-16">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <History className="h-8 w-8 text-blue-500/70" />
                  </div>
                </div>
                <span className="ml-6 text-white text-lg font-medium">Loading history...</span>
              </div>
            ) : documentHistory.length > 0 ? (
              <div className="space-y-4">
                {documentHistory.map((entry, index) => {
                  const getEventStyling = (eventType: string) => {
                    switch (eventType) {
                      case "Creation":
                        return {
                          badge: "bg-emerald-600",
                          icon: "🎉",
                          background: "bg-emerald-500/10",
                          border: "border-emerald-500/30",
                        };
                      case "Update":
                        return {
                          badge: "bg-amber-600",
                          icon: "✏️",
                          background: "bg-amber-500/10",
                          border: "border-amber-500/30",
                        };
                      case "Workflow":
                      default:
                        return {
                          badge: entry.isApproved ? "bg-green-600" : "bg-red-600",
                          icon: entry.isApproved ? "✅" : "❌",
                          background: entry.isApproved ? "bg-green-500/10" : "bg-red-500/10",
                          border: entry.isApproved ? "border-green-500/30" : "border-red-500/30",
                        };
                    }
                  };

                  const styling = getEventStyling(entry.eventType);

                  return (
                    <div
                      key={entry.id || index}
                      className={`p-6 ${styling.background} rounded-2xl border ${styling.border} backdrop-blur-sm`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{styling.icon}</span>
                          <div className="flex items-center gap-3">
                            <Badge className={`px-4 py-2 ${styling.badge} text-white border-0 font-semibold`}>
                              {entry.eventType === "Creation" ? "Created" :
                                entry.eventType === "Update" ? "Updated" :
                                  entry.isApproved ? "Approved" : "Rejected"}
                            </Badge>
                            <span className="text-white font-semibold">
                              {entry.stepTitle || "Unknown Step"}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm bg-slate-800/50 text-slate-300 px-3 py-2 rounded-lg border border-slate-600/50">
                          {new Date(entry.processedAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                          <span className="font-semibold text-slate-300">Status:</span>
                          <span className="text-white">{entry.statusTitle || "N/A"}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                          <span className="font-semibold text-slate-300">Processed by:</span>
                          <span className="text-white">{entry.processedBy || "Unknown"}</span>
                        </div>
                      </div>

                      {entry.comments && (
                        <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border-l-4 border-blue-500/50">
                          <div className="text-slate-300 mb-2 font-semibold">Comments:</div>
                          <p className="text-white">{entry.comments}</p>
                        </div>
                      )}

                      {entry.updateDetails && (
                        <div className="mt-4 p-4 bg-amber-500/10 rounded-xl border-l-4 border-amber-500/50">
                          <div className="text-amber-300 mb-2 font-semibold">Update Details:</div>
                          <p className="text-white">{entry.updateDetails}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-600/50 inline-flex flex-col items-center">
                  <div className="p-6 rounded-full bg-slate-700/50 border border-slate-600/50 mb-6">
                    <History className="h-16 w-16 text-slate-500" />
                  </div>
                  <p className="text-xl text-white font-semibold mb-3">No History Available</p>
                  <p className="text-slate-400 max-w-md leading-relaxed">
                    This document doesn't have any workflow history entries yet. History will appear here as the document progresses through its approval workflow.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-end border-t border-slate-600/50 pt-6">
            <Button
              variant="outline"
              onClick={() => setHistoryDialogOpen(false)}
              className="bg-slate-800/50 border-slate-600/50 text-white hover:bg-slate-700/50 px-6 py-2"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer/Vendor Details Dialog */}
      <CustomerVendorDetailsDialog
        document={document}
        isOpen={customerVendorDialogOpen}
        onOpenChange={setCustomerVendorDialogOpen}
      />
    </div>
  );
};

export default DocumentDetailsTab;
