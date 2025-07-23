import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronRight,
  Eye,
  EyeOff,
  Copy,
  Download,
  Share2,
  MoreHorizontal,
  TrendingUp,
  Activity,
  Zap,
  Shield,
  Target,
  MapPin,
  Globe,
  Phone,
  Mail,
  CreditCard,
  FileCheck,
  Timer,
  Star,
  Award,
  Lightbulb,
  Rocket,
  Sparkles,
} from "lucide-react";
import ErpArchivalStatus from "./ErpArchivalStatus";
import { Document, TierType, DocumentHistoryEvent } from "@/models/document";
import { WorkflowStatus } from "@/services/workflowService";
import { ApprovalHistoryItem } from "@/services/approvalService";
import { Separator } from "@/components/ui/separator";
import { getStatusClass } from "./DocumentStatusUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DocumentApprovalDetails from "./DocumentApprovalDetails";
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
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showDocumentDetails, setShowDocumentDetails] = useState(true);

  // Reset showDocumentDetails when document changes
  useEffect(() => {
    setShowDocumentDetails(true);
  }, [document.id]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15,
        duration: 0.6 
      }
    }
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0, rotateX: -10 },
    visible: { 
      y: 0, 
      opacity: 1, 
      rotateX: 0,
      transition: { 
        type: "spring", 
        stiffness: 80, 
        damping: 20,
        duration: 0.8 
      }
    }
  };

  // Get formatted progress display
  const progressDisplay = workflowStatus?.progressPercentage || 25;

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
        return <UserCheck className="h-4 w-4 text-emerald-400" />;
      case TierType.Vendor:
        return <Package className="h-4 w-4 text-orange-400" />;
      default:
        return <Users className="h-4 w-4 text-slate-400" />;
    }
  };

  // Copy to clipboard function
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
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
        setCircuitKey("");
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

  // Enhanced Info Card Component
  const InfoCard = ({ 
    icon: Icon, 
    title, 
    value, 
    subtitle, 
    color = "blue", 
    onClick,
    copyable = false,
    actions = []
  }: any) => {
    // Uniform color scheme for all cards
    const uniformColorClasses = "from-card/95 via-card/90 to-card/95 border-border/50 hover:border-border/70 text-foreground";

    return (
      <motion.div
        variants={cardVariants}
        className={`group relative overflow-hidden bg-gradient-to-br ${uniformColorClasses} backdrop-blur-xl border rounded-2xl p-4 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1`}
        onClick={onClick}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-3 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 group-hover:bg-primary/15 transition-all duration-300">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground/90 group-hover:text-foreground transition-colors">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {copyable && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-primary/10 hover:bg-primary/20 border border-primary/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(value, title);
                        }}
                      >
                        {copiedField === title ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-primary" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy {title.toLowerCase()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {actions.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-primary/10 hover:bg-primary/20 border border-primary/20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4 text-primary" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-xl border-border">
                    {actions.map((action: any, index: number) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick();
                        }}
                        className="text-foreground hover:text-foreground hover:bg-muted/50"
                      >
                        {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Value */}
          <div className="space-y-2">
            <p className="text-2xl font-bold text-foreground group-hover:text-foreground/90 transition-colors">
              {value}
            </p>
          </div>

          {/* Hover effect line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-4"
    >
      {/* Enhanced Document Header */}
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
                Last Updated At {new Date(document.updatedAt).toLocaleDateString()} • By {document.updatedBy?.username || 'Unknown'}
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

      {/* Enhanced Approval Details */}
      {pendingApproval && (
        <motion.div variants={itemVariants}>
          <DocumentApprovalDetails
            pendingApproval={pendingApproval}
            approvalHistory={approvalHistory}
            isLoadingApproval={isLoadingApproval}
          />
        </motion.div>
      )}

      {/* Main Document Content - Show/Hide */}
      <AnimatePresence mode="wait">
        {showDocumentDetails && (
          <motion.div
            key="document-details"
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="space-y-8"
          >
            {/* ERP Archival Status */}
            {document.status === 2 && (
              <motion.div variants={itemVariants}>
                <div className="bg-gradient-to-r from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl p-6">
                  <ErpArchivalStatus
                    documentId={document.id}
                    documentKey={document.documentKey}
                    isCompletedDocument={true}
                  />
                </div>
              </motion.div>
            )}

            {/* Enhanced Info Cards Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Document Date */}
              <InfoCard
                icon={Calendar}
                title="Document Date"
                value={new Date(document.docDate).toLocaleDateString()}
                color="blue"
                copyable={true}
                actions={[
                  {
                    icon: Download,
                    label: "Export Date",
                    onClick: () => toast.info("Export functionality coming soon")
                  }
                ]}
              />

              {/* Posting Date */}
              <InfoCard
                icon={Calendar}
                title="Posting Date"
                value={new Date(document.comptableDate).toLocaleDateString()}
                color="green"
                copyable={true}
              />

              {/* Document Type */}
              <InfoCard
                icon={Tag}
                title="Document Type"
                value={document.documentType.typeName}
                color="purple"
                copyable={true}
              />

              {/* Series */}
              <InfoCard
                icon={Hash}
                title="Series"
                value={document.subType?.name || 'No Series'}
                subtitle={document.subType?.subTypeKey ? `Code: ${document.subType.subTypeKey}` : undefined}
                color="orange"
                copyable={true}
              />

              {/* Circuit */}
              <InfoCard
                icon={GitBranch}
                title="Circuit"
                value={document.circuit?.title || 'No Circuit'}
                subtitle={`Status: ${workflowStatus?.currentStatusTitle || 'Unknown'}`}
                color="indigo"
                copyable={true}
              />

              {/* Customer/Vendor */}
              {(document.customerVendorName || document.customerVendorCode) && (
                <InfoCard
                  icon={document.documentType?.tierType === 1 ? UserCheck : Package}
                  title={document.documentType?.tierType === 1 ? 'Customer' : 'Vendor'}
                  value={document.customerVendorName}
                  subtitle={document.customerVendorCode ? `Code: ${document.customerVendorCode}` : undefined}
                  color="rose"
                  copyable={true}
                  actions={[
                    {
                      icon: MapPin,
                      label: "View Address",
                      onClick: () => toast.info("Address details coming soon")
                    },
                    {
                      icon: Phone,
                      label: "Contact Info",
                      onClick: () => toast.info("Contact information coming soon")
                    }
                  ]}
                />
              )}

              {/* External Document */}
              {document.documentExterne && (
                <InfoCard
                  icon={ExternalLink}
                  title="External Document"
                  value={document.documentExterne}
                  color="orange"
                  copyable={true}
                  actions={[
                    {
                      icon: Share2,
                      label: "Share Document",
                      onClick: () => toast.info("Share functionality coming soon")
                    }
                  ]}
                />
              )}

              {/* Created By */}
              <InfoCard
                icon={User}
                title="Created By"
                value={document.createdBy.username}
                subtitle={`${new Date(document.createdAt).toLocaleDateString()} at ${new Date(document.createdAt).toLocaleTimeString()}`}
                color="blue"
                copyable={true}
              />
            </motion.div>

            {/* Enhanced Content Section */}
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-r from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border-slate-700/50 shadow-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                        <FileText className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white">Document Content</CardTitle>
                        <p className="text-slate-300 text-sm">Full document description and details</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFullContent(!showFullContent)}
                        className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                      >
                        {showFullContent ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Show More
                          </>
                        )}
                      </Button>
                      
                      {document.content && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(document.content, "Content")}
                          className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {document.content && document.content.trim() ? (
                    <div className="relative">
                      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
                        <div className="whitespace-pre-wrap text-slate-200 leading-relaxed">
                          {showFullContent ? document.content : document.content.length > 500 ? `${document.content.substring(0, 500)}...` : document.content}
                        </div>
                        
                        {document.content.length > 500 && (
                          <div className="mt-4 pt-4 border-t border-slate-700/50">
                            <Button
                              variant="ghost"
                              onClick={() => setShowFullContent(!showFullContent)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            >
                              {showFullContent ? "Show less" : `Show ${document.content.length - 500} more characters`}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="bg-slate-900/30 border border-slate-700/30 rounded-xl p-8 backdrop-blur-sm">
                        <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400 text-lg font-medium">No content available</p>
                        <p className="text-slate-500 text-sm mt-2">This document doesn't have any content description</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Document History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[85vh] bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-slate-700/50">
          <DialogHeader className="border-b border-slate-700/50 pb-6">
            <DialogTitle className="flex items-center gap-4 text-2xl">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
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
                          badge: "bg-gradient-to-r from-emerald-600 to-teal-600",
                          icon: "🎉",
                          background: "bg-emerald-500/10",
                          border: "border-emerald-500/30",
                          glow: "shadow-emerald-500/20"
                        };
                      case "Update":
                        return {
                          badge: "bg-gradient-to-r from-amber-600 to-orange-600",
                          icon: "✏️",
                          background: "bg-amber-500/10",
                          border: "border-amber-500/30",
                          glow: "shadow-amber-500/20"
                        };
                      case "Workflow":
                      default:
                        return {
                          badge: entry.isApproved
                            ? "bg-gradient-to-r from-green-600 to-emerald-600"
                            : "bg-gradient-to-r from-red-600 to-rose-600",
                          icon: entry.isApproved ? "✅" : "❌",
                          background: entry.isApproved ? "bg-green-500/10" : "bg-red-500/10",
                          border: entry.isApproved ? "border-green-500/30" : "border-red-500/30",
                          glow: entry.isApproved ? "shadow-green-500/20" : "shadow-red-500/20"
                        };
                    }
                  };

                  const styling = getEventStyling(entry.eventType);

                  return (
                    <motion.div
                      key={entry.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-6 ${styling.background} rounded-2xl border ${styling.border} backdrop-blur-sm hover:shadow-lg ${styling.glow} transition-all duration-300 hover:scale-[1.02]`}
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
                        <span className="text-sm bg-slate-800/50 text-slate-300 px-3 py-2 rounded-lg border border-slate-700/50">
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
                        <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border-l-4 border-blue-500/50 backdrop-blur-sm">
                          <div className="text-slate-300 mb-2 font-semibold flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-blue-400" />
                            Comments:
                          </div>
                          <p className="text-white">{entry.comments}</p>
                        </div>
                      )}

                      {entry.updateDetails && (
                        <div className="mt-4 p-4 bg-amber-500/10 rounded-xl border-l-4 border-amber-500/50 backdrop-blur-sm">
                          <div className="text-amber-300 mb-2 font-semibold flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-400" />
                            Update Details:
                          </div>
                          <p className="text-white">{entry.updateDetails}</p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50 inline-flex flex-col items-center backdrop-blur-sm">
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
          
          <div className="mt-8 flex justify-end border-t border-slate-700/50 pt-6">
            <Button
              variant="outline"
              onClick={() => setHistoryDialogOpen(false)}
              className="bg-slate-800/50 border-slate-600/50 text-white hover:bg-slate-700/50 backdrop-blur-sm px-6 py-2"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default DocumentDetailsTab;
