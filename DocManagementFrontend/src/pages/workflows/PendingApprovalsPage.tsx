import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CircleCheck,
  CircleX,
  Clock,
  FileText,
  FileWarning,
  ArrowUpDown,
  Search,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/useTranslation";
import approvalService from "@/services/approvalService";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PendingApprovalsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [responseType, setResponseType] = useState<"approve" | "reject" | null>(
    null
  );
  const [comments, setComments] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  // Helper function to safely format dates
  const formatDate = (dateValue: string | null | undefined): string => {
    if (!dateValue || dateValue.trim() === "") return "";

    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";

    try {
      return date.toLocaleString();
    } catch (error) {
      return "";
    }
  };

  // Convert userId to number to ensure compatibility with API
  const userIdStr = user?.userId || "0";
  const userIdNum = parseInt(userIdStr, 10);

  // Fetch pending approvals using the user-specific endpoint
  const {
    data: pendingApprovals = [],
    isLoading: isPendingLoading,
    isError: isPendingError,
    refetch: refetchPending,
  } = useQuery({
    queryKey: ["pendingApprovals", userIdNum],
    queryFn: () => {
      if (!userIdNum) return [];
      return approvalService.getPendingApprovalsForUser(userIdNum);
    },
    enabled: !!userIdNum,
  });

  // Fetch user-specific approval history (will be filtered by status)
  const {
    data: userApprovalHistoryData = [],
    isLoading: isUserHistoryLoading,
    isError: isUserHistoryError,
    refetch: refetchUserHistory,
  } = useQuery({
    queryKey: ["userApprovalHistory", userIdNum],
    queryFn: () => {
      if (!userIdNum) return [];
      return approvalService.getUserApprovalHistory(userIdNum);
    },
    enabled: !!userIdNum,
  });

  // Fetch approvals requested by this user
  const {
    data: requestedApprovalsData = [],
    isLoading: isRequestedLoading,
    isError: isRequestedError,
    refetch: refetchRequested,
  } = useQuery({
    queryKey: ["requestedApprovals", userIdNum],
    queryFn: () => {
      if (!userIdNum) return [];
      return approvalService.getRequestedApprovalsByUser(userIdNum);
    },
    enabled: !!userIdNum,
  });

  // Fetch accepted approval responses by this user
  const {
    data: acceptedApprovalsData = [],
    isLoading: isAcceptedLoading,
    isError: isAcceptedError,
    refetch: refetchAccepted,
  } = useQuery({
    queryKey: ["acceptedApprovalResponses", userIdNum],
    queryFn: () => {
      if (!userIdNum) return [];
      return approvalService.getAcceptedApprovalResponses(userIdNum);
    },
    enabled: !!userIdNum,
  });

  // Fetch rejected approval responses by this user
  const {
    data: rejectedApprovalsData = [],
    isLoading: isRejectedLoading,
    isError: isRejectedError,
    refetch: refetchRejected,
  } = useQuery({
    queryKey: ["rejectedApprovalResponses", userIdNum],
    queryFn: () => {
      if (!userIdNum) return [];
      return approvalService.getRejectedApprovalResponses(userIdNum);
    },
    enabled: !!userIdNum,
  });

  // Filter pending approvals (keep existing logic for pending tab)
  const filteredPendingApprovals = pendingApprovals.filter(
    (approval: any) =>
      approval.documentTitle
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      approval.stepTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.requestedBy?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter accepted approvals from the new data source
  const acceptedApprovals = acceptedApprovalsData.filter(
    (approval: any) =>
      approval.documentTitle
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      approval.stepTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.requestedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.comments?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.writingComments?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter rejected approvals from the new data source
  const rejectedApprovals = rejectedApprovalsData.filter(
    (approval: any) =>
      approval.documentTitle
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      approval.stepTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.requestedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.comments?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.writingComments?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter waiting approvals from user history (only those waiting for this user's response)
  const waitingApprovals = userApprovalHistoryData.filter(
    (approval: any) =>
      (approval.status === "Open" || approval.status === "InProgress") &&
      approval.approved === null && // No response yet from this user
      approval.processedBy === null && // This user hasn't responded yet
      (approval.documentTitle
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      approval.stepTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.requestedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.comments?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter requested approvals by search query and categorize by status
  const filteredRequestedApprovals = requestedApprovalsData.filter(
    (approval: any) =>
      approval.documentTitle
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      approval.stepTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.processedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.comments?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const requestedPendingApprovals = filteredRequestedApprovals.filter(
    (approval: any) => approval.status === "Open" || approval.status === "InProgress"
  );

  const requestedCompletedApprovals = filteredRequestedApprovals.filter(
    (approval: any) => approval.status === "Accepted"
  );

  const requestedRejectedApprovals = filteredRequestedApprovals.filter(
    (approval: any) => approval.status === "Rejected"
  );

  const [historySubTab, setHistorySubTab] = useState("waiting");

  // Handle approval response
  const handleApprovalResponse = async () => {
    if (!selectedApproval || !responseType) return;

    // Validate that comments are provided when rejecting
    if (responseType === "reject" && !comments.trim()) {
      toast({
        title: "Comments Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Use approvalId if available, otherwise fall back to id
      const approvalId = selectedApproval.approvalId || selectedApproval.id;

      // Send the response with isApproved=true for approve, isApproved=false for reject
      await approvalService.respondToApproval(approvalId, {
        isApproved: responseType === "approve", // true for approve, false for reject
        comments: comments,
      });

      toast({
        title:
          responseType === "approve"
            ? "Document Approved"
            : "Document Rejected",
        description: `You have successfully ${
          responseType === "approve" ? "approved" : "rejected"
        } the document.`,
        variant: responseType === "approve" ? "default" : "destructive",
      });

      // Reset state and close dialog
      setSelectedApproval(null);
      setResponseType(null);
      setComments("");
      setApprovalDialogOpen(false);

      // Refetch data
      refetchPending();
    } catch (error) {
      console.error("Error responding to approval:", error);
      toast({
        title: "Error",
        description: "Failed to process your response. Please try again.",
        variant: "destructive",
      });
    }

    // Refetch data
    refetchPending();
    refetchUserHistory();
    refetchRequested();
    refetchAccepted();
    refetchRejected();
  };

  // Open dialog for approval or rejection
  const openResponseDialog = (approval: any, type: "approve" | "reject") => {
    setSelectedApproval(approval);
    setResponseType(type);
    setComments("");
    setApprovalDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl bg-blue-50 dark:bg-blue-950/10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-blue-900 dark:text-white">
          {t('approvals.title')}
        </h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-blue-600 dark:text-gray-400" />
          <Input
            placeholder={t('approvals.searchPlaceholder')}
            className="pl-8 bg-blue-50 border-blue-200 text-blue-900 placeholder:text-blue-900 dark:bg-blue-950/60 dark:border-blue-900/30 dark:text-white dark:placeholder:text-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs
        defaultValue="pending"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="bg-blue-100 border border-blue-200 dark:bg-blue-950/50 dark:border-blue-900/30">
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-800/50"
          >
            {t('approvals.waitingApprovals')}
            {pendingApprovals.length > 0 && (
              <Badge variant="destructive" className="ml-2 bg-red-600">
                {pendingApprovals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="requested"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-800/50"
          >
            <Send className="h-4 w-4 mr-1" />
            {t('approvals.requestedApprovals')}
            {filteredRequestedApprovals.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-blue-500/20 text-blue-400">
                {filteredRequestedApprovals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-800/50"
          >
            {t('approvals.approvalHistory')}
          </TabsTrigger>
        </TabsList>

        {/* Pending Approvals Tab */}
        <TabsContent value="pending" className="mt-4">
          <div className="rounded-xl border border-blue-200 overflow-hidden dark:border-blue-900/30 dark:bg-gradient-to-b dark:from-[#1a2c6b]/50 dark:to-[#0a1033]/50 shadow-lg">
            {isPendingLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isPendingError ? (
              <div className="p-6 text-center">
                <FileWarning className="h-16 w-16 mx-auto text-red-500 mb-2" />
                <h3 className="text-xl font-medium text-red-600 dark:text-red-400">
                  Failed to load approvals
                </h3>
                <p className="text-blue-600 dark:text-gray-400">
                  There was an error retrieving your waiting approvals.
                </p>
                <Button
                  variant="destructive"
                  className="mt-4"
                  onClick={() => refetchPending()}
                >
                  Try Again
                </Button>
              </div>
            ) : filteredPendingApprovals.length === 0 ? (
              <div className="p-8 text-center bg-blue-50 dark:bg-blue-950/50">
                <Clock className="h-16 w-16 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
                {searchQuery ? (
                  <>
                    <h3 className="text-xl font-medium text-blue-800 dark:text-blue-300">
                      {t('approvals.noMatchingApprovals')}
                    </h3>
                    <p className="text-blue-600 dark:text-gray-400">
                      {t('approvals.noMatchingApprovalsDesc')}
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-medium text-blue-800 dark:text-blue-300">
                      {t('approvals.noWaitingApprovals')}
                    </h3>
                    <p className="text-blue-600 dark:text-gray-400">
                      {t('approvals.noWaitingApprovalsDesc')}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-300px)]">
                <Table>
                  <TableHeader className="bg-blue-100 dark:bg-blue-900/20 sticky top-0 z-10">
                    <TableRow className="border-blue-200 hover:bg-blue-200 dark:border-blue-900/50 dark:hover:bg-blue-900/30">
                      <TableHead className="text-blue-900 dark:text-blue-300">
                        {t('approvals.document')}
                      </TableHead>
                      <TableHead className="text-blue-900 dark:text-blue-300">
                        {t('approvals.step')}
                      </TableHead>
                      <TableHead className="text-blue-900 dark:text-blue-300">
                        {t('approvals.currentStatus')}
                      </TableHead>
                      <TableHead className="text-blue-900 dark:text-blue-300">
                        {t('approvals.nextStatus')}
                      </TableHead>
                      <TableHead className="text-blue-900 dark:text-blue-300">
                        {t('approvals.requestedBy')}
                      </TableHead>
                      <TableHead className="text-blue-900 dark:text-blue-300">
                        {t('approvals.requestedOn')}
                      </TableHead>
                      <TableHead className="text-blue-900 dark:text-blue-300">
                        {t('approvals.actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPendingApprovals.map(
                      (approval: any, index: number) => (
                        <TableRow
                          key={`pending-${
                            approval.id ||
                            approval.approvalId ||
                            approval.documentId
                          }-${index}`}
                          className="border-blue-200 hover:bg-blue-50 dark:border-blue-900/30 dark:hover:bg-blue-900/20"
                        >
                          <TableCell className="font-medium text-blue-900 dark:text-blue-100">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() =>
                                  navigate(`/documents/${approval.documentId}`)
                                }
                                className="flex items-center gap-2 text-left hover:text-blue-600 dark:hover:text-blue-300 transition-colors cursor-pointer group"
                              >
                                <FileText className="h-4 w-4 text-blue-600 group-hover:text-blue-800 dark:text-blue-400 dark:group-hover:text-blue-300" />
                                <div className="flex flex-col">
                                  <span className="font-mono text-blue-800 dark:text-blue-300 text-sm group-hover:text-blue-900 dark:group-hover:text-blue-200">
                                    {approval.documentKey || "No Key"}
                                  </span>
                                  <span className="text-blue-900 group-hover:text-blue-700 dark:text-blue-100 dark:group-hover:text-blue-300">
                                    {approval.documentTitle ||
                                      "Untitled Document"}
                                  </span>
                                </div>
                              </button>
                            </div>
                          </TableCell>
                          <TableCell className="text-blue-800 dark:text-blue-200">
                            {approval.stepTitle || t('approvals.unknownStep')}
                          </TableCell>
                          <TableCell className="text-blue-800 dark:text-blue-200">
                            <Badge 
                              variant="outline" 
                              className="bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300"
                            >
                              {approval.currentStatusTitle || t('approvals.unknown')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-blue-800 dark:text-blue-200">
                            <Badge 
                              variant="outline" 
                              className="bg-green-100 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300"
                            >
                              {approval.nextStatusTitle || t('approvals.unknown')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-blue-800 dark:text-blue-200">
                            {approval.requestedBy || t('approvals.unknownUser')}
                          </TableCell>
                          <TableCell className="text-blue-800 dark:text-blue-200">
                            {formatDate(
                              approval.requestDate || approval.requestedAt || ""
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                className="bg-green-900/30 border border-green-500/30 text-green-400 hover:bg-green-800/50 hover:text-green-300"
                                onClick={() =>
                                  openResponseDialog(approval, "approve")
                                }
                              >
                                <CircleCheck className="h-4 w-4 mr-1" />
                                {t('approvals.approve')}
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-900/30 border border-red-500/30 text-red-400 hover:bg-red-800/50 hover:text-red-300"
                                onClick={() =>
                                  openResponseDialog(approval, "reject")
                                }
                              >
                                <CircleX className="h-4 w-4 mr-1" />
                                {t('approvals.reject')}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </div>
        </TabsContent>

        {/* Requested Approvals Tab */}
        <TabsContent value="requested" className="mt-4">
          <div className="rounded-xl border border-blue-200 overflow-hidden dark:border-blue-900/30 dark:bg-gradient-to-b dark:from-[#1a2c6b]/50 dark:to-[#0a1033]/50 shadow-lg">
            {isRequestedLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isRequestedError ? (
              <div className="p-6 text-center">
                <FileWarning className="h-16 w-16 mx-auto text-red-500 mb-2" />
                <h3 className="text-xl font-medium text-red-600 dark:text-red-400">
                  {t('approvals.failedToLoad')}
                </h3>
                <p className="text-blue-600 dark:text-gray-400">
                  {t('approvals.noWaitingApprovalsDesc')}
                </p>
                <Button
                  variant="destructive"
                  className="mt-4"
                  onClick={() => refetchRequested()}
                >
                  {t('approvals.tryAgain')}
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="bg-blue-100 border-b border-blue-200 dark:bg-blue-950/40 dark:border-blue-900/30 rounded-none h-auto w-full justify-start p-0">
                  <TabsTrigger
                    value="pending"
                    className="px-4 py-3 text-sm font-medium transition-all border-b-2 data-[state=active]:border-amber-500 data-[state=active]:text-amber-600 data-[state=active]:bg-amber-100 dark:data-[state=active]:text-amber-400 dark:data-[state=active]:bg-amber-500/10"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {t('approvals.waiting')}
                      {requestedPendingApprovals.length > 0 && (
                        <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 text-xs">
                          {requestedPendingApprovals.length}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="px-4 py-3 text-sm font-medium transition-all border-b-2 data-[state=active]:border-green-500 data-[state=active]:text-green-600 data-[state=active]:bg-green-100 dark:data-[state=active]:text-green-400 dark:data-[state=active]:bg-green-500/10"
                  >
                    <div className="flex items-center gap-2">
                      <CircleCheck className="h-4 w-4" />
                      {t('approvals.accepted')}
                      {requestedCompletedApprovals.length > 0 && (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
                          {requestedCompletedApprovals.length}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="rejected"
                    className="px-4 py-3 text-sm font-medium transition-all border-b-2 data-[state=active]:border-red-500 data-[state=active]:text-red-600 data-[state=active]:bg-red-100 dark:data-[state=active]:text-red-400 dark:data-[state=active]:bg-red-500/10"
                  >
                    <div className="flex items-center gap-2">
                      <CircleX className="h-4 w-4" />
                      {t('approvals.rejected')}
                      {requestedRejectedApprovals.length > 0 && (
                        <Badge variant="secondary" className="bg-red-500/20 text-red-400 text-xs">
                          {requestedRejectedApprovals.length}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="p-4">
                  {requestedPendingApprovals.length === 0 ? (
                    <div className="text-center py-8">
                      <Send className="h-12 w-12 mx-auto text-amber-500 dark:text-amber-400/50 mb-3" />
                      <h3 className="text-lg font-medium text-amber-700 dark:text-amber-300">
                        No waiting requests
                      </h3>
                      <p className="text-blue-600 dark:text-gray-400 text-sm">
                        You haven't requested any approvals that are currently waiting.
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[calc(100vh-400px)]">
                      <div className="space-y-3">
                        {requestedPendingApprovals.map((approval: any, index: number) => (
                          <div
                            key={`requested-pending-${approval.approvalId || approval.documentId}-${index}`}
                            className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg hover:bg-amber-500/10 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <button
                                  onClick={() => navigate(`/documents/${approval.documentId}`)}
                                  className="flex items-center gap-2 text-left hover:text-amber-600 dark:hover:text-amber-300 transition-colors group mb-2"
                                >
                                  <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                  <div>
                                    <span className="font-mono text-amber-700 dark:text-amber-300 text-sm">
                                      {approval.documentKey || "No Key"}
                                    </span>
                                    <span className="text-amber-800 dark:text-amber-100 ml-2">
                                      {approval.documentTitle || "Untitled Document"}
                                    </span>
                                  </div>
                                </button>
                                <div className="text-sm text-amber-700 dark:text-amber-200/80">
                                  {t('approvals.step')}: {approval.stepTitle || t('approvals.unknownStep')}
                                </div>
                                <div className="text-sm text-amber-600 dark:text-amber-200/60">
                                  {t('approvals.assignedTo')} {approval.processedBy || t('approvals.unknown')}
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                                  {approval.status === "InProgress" ? t('approvals.inProgress') : t('approvals.waiting')}
                                </Badge>
                                <div className="text-xs text-amber-600 dark:text-amber-200/60 mt-1">
                                  {formatDate(approval.requestDate || "")}
                                </div>
                              </div>
                            </div>
                            {approval.comments && (
                              <div className="mt-3 pt-2 border-t border-amber-500/20">
                                <p className="text-sm text-amber-700 dark:text-amber-200/80">
                                  {approval.comments}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>

                <TabsContent value="completed" className="p-4">
                  {requestedCompletedApprovals.length === 0 ? (
                    <div className="text-center py-8">
                      <CircleCheck className="h-12 w-12 mx-auto text-green-500 dark:text-green-400/50 mb-3" />
                      <h3 className="text-lg font-medium text-green-700 dark:text-green-300">
                        No accepted requests
                      </h3>
                      <p className="text-blue-600 dark:text-gray-400 text-sm">
                        None of your approval requests have been accepted yet.
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[calc(100vh-400px)]">
                      <div className="space-y-3">
                        {requestedCompletedApprovals.map((approval: any, index: number) => (
                          <div
                            key={`requested-completed-${approval.approvalId || approval.documentId}-${index}`}
                            className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg hover:bg-green-500/10 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <button
                                  onClick={() => navigate(`/documents/${approval.documentId}`)}
                                  className="flex items-center gap-2 text-left hover:text-green-600 dark:hover:text-green-300 transition-colors group mb-2"
                                >
                                  <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  <div>
                                    <span className="font-mono text-green-700 dark:text-green-300 text-sm">
                                      {approval.documentKey || "No Key"}
                                    </span>
                                    <span className="text-green-800 dark:text-green-100 ml-2">
                                      {approval.documentTitle || "Untitled Document"}
                                    </span>
                                  </div>
                                </button>
                                <div className="text-sm text-green-700 dark:text-green-200/80">
                                  {t('approvals.step')}: {approval.stepTitle || t('approvals.unknownStep')}
                                </div>
                                <div className="text-sm text-green-600 dark:text-green-200/60">
                                  {t('approvals.approvedBy')} {approval.processedBy || t('approvals.unknown')}
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                  {t('approvals.accepted')}
                                </Badge>
                                <div className="text-xs text-green-600 dark:text-green-200/60 mt-1">
                                  {formatDate(approval.requestDate || "")}
                                </div>
                              </div>
                            </div>
                            {approval.comments && (
                              <div className="mt-3 pt-2 border-t border-green-500/20">
                                <p className="text-sm text-green-700 dark:text-green-200/80">
                                  {approval.comments}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>

                <TabsContent value="rejected" className="p-4">
                  {requestedRejectedApprovals.length === 0 ? (
                    <div className="text-center py-8">
                      <CircleX className="h-12 w-12 mx-auto text-red-500 dark:text-red-400/50 mb-3" />
                      <h3 className="text-lg font-medium text-red-700 dark:text-red-300">
                        No rejected requests
                      </h3>
                      <p className="text-blue-600 dark:text-gray-400 text-sm">
                        None of your approval requests have been rejected.
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[calc(100vh-400px)]">
                      <div className="space-y-3">
                        {requestedRejectedApprovals.map((approval: any, index: number) => (
                          <div
                            key={`requested-rejected-${approval.approvalId || approval.documentId}-${index}`}
                            className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <button
                                  onClick={() => navigate(`/documents/${approval.documentId}`)}
                                  className="flex items-center gap-2 text-left hover:text-red-600 dark:hover:text-red-300 transition-colors group mb-2"
                                >
                                  <FileText className="h-4 w-4 text-red-600 dark:text-red-400" />
                                  <div>
                                    <span className="font-mono text-red-700 dark:text-red-300 text-sm">
                                      {approval.documentKey || "No Key"}
                                    </span>
                                    <span className="text-red-800 dark:text-red-100 ml-2">
                                      {approval.documentTitle || "Untitled Document"}
                                    </span>
                                  </div>
                                </button>
                                <div className="text-sm text-red-700 dark:text-red-200/80">
                                  {t('approvals.step')}: {approval.stepTitle || t('approvals.unknownStep')}
                                </div>
                                <div className="text-sm text-red-600 dark:text-red-200/60">
                                  {t('approvals.rejectedBy')} {approval.processedBy || t('approvals.unknown')}
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                  {t('approvals.rejected')}
                                </Badge>
                                <div className="text-xs text-red-600 dark:text-red-200/60 mt-1">
                                  {formatDate(approval.requestDate || "")}
                                </div>
                              </div>
                            </div>
                            {approval.comments && (
                              <div className="mt-3 pt-2 border-t border-red-500/20">
                                <p className="text-sm text-red-700 dark:text-red-200/80">
                                  {approval.comments}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </TabsContent>

        {/* Approval History Tab */}
        <TabsContent value="history" className="mt-4">
          <div className="rounded-xl border border-blue-200 overflow-hidden dark:border-blue-900/30 dark:bg-gradient-to-b dark:from-[#1a2c6b]/50 dark:to-[#0a1033]/50 shadow-lg">
            {(isUserHistoryLoading || isAcceptedLoading || isRejectedLoading) ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (isUserHistoryError || isAcceptedError || isRejectedError) ? (
              <div className="p-6 text-center">
                <FileWarning className="h-16 w-16 mx-auto text-red-500 mb-2" />
                <h3 className="text-xl font-medium text-red-600 dark:text-red-400">
                  {t('approvals.failedToLoadHistory')}
                </h3>
                <p className="text-blue-600 dark:text-gray-400">
                  {t('approvals.failedToLoadHistoryDesc')}
                </p>
                <Button
                  variant="destructive"
                  className="mt-4"
                  onClick={() => {
                    refetchUserHistory();
                    refetchAccepted();
                    refetchRejected();
                  }}
                >
                  {t('approvals.tryAgain')}
                </Button>
              </div>
            ) : (
              <Tabs
                value={historySubTab}
                onValueChange={setHistorySubTab}
                className="w-full"
              >
                <TabsList className="bg-blue-100 border-b border-blue-200 dark:bg-blue-950/40 dark:border-blue-900/30 rounded-none h-auto w-full justify-start p-0">
                  <button
                    onClick={() => setHistorySubTab("waiting")}
                    className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                      historySubTab === "waiting"
                        ? "border-amber-500 text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-500/10"
                        : "border-transparent text-blue-700 hover:text-blue-900 hover:bg-blue-100 dark:text-blue-300 dark:hover:text-blue-200 dark:hover:bg-blue-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {t('approvals.waiting')}
                      {waitingApprovals.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-amber-500/20 text-amber-400 text-xs"
                        >
                          {waitingApprovals.length}
                        </Badge>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => setHistorySubTab("accepted")}
                    className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                      historySubTab === "accepted"
                        ? "border-green-500 text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-500/10"
                        : "border-transparent text-blue-700 hover:text-blue-900 hover:bg-blue-100 dark:text-blue-300 dark:hover:text-blue-200 dark:hover:bg-blue-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CircleCheck className="h-4 w-4" />
                      {t('approvals.accepted')}
                      {acceptedApprovals.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-green-500/20 text-green-400 text-xs"
                        >
                          {acceptedApprovals.length}
                        </Badge>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => setHistorySubTab("rejected")}
                    className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                      historySubTab === "rejected"
                        ? "border-red-500 text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-500/10"
                        : "border-transparent text-blue-700 hover:text-blue-900 hover:bg-blue-100 dark:text-blue-300 dark:hover:text-blue-200 dark:hover:bg-blue-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CircleX className="h-4 w-4" />
                      {t('approvals.rejected')}
                      {rejectedApprovals.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-red-500/20 text-red-400 text-xs"
                        >
                          {rejectedApprovals.length}
                        </Badge>
                      )}
                    </div>
                  </button>
                </TabsList>

                {/* History Content based on selected sub-tab */}
                {historySubTab === "waiting" && (
                  <div className="p-4">
                    {waitingApprovals.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 mx-auto text-amber-500 dark:text-amber-400/50 mb-3" />
                        <h3 className="text-lg font-medium text-amber-700 dark:text-amber-300">
                          {t('approvals.noWaitingApprovals')}
                        </h3>
                        <p className="text-blue-600 dark:text-gray-400 text-sm">
                          {t('approvals.noWaitingApprovalsDesc')}
                        </p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[calc(100vh-400px)]">
                        <div className="space-y-3">
                          {waitingApprovals.map(
                            (approval: any, index: number) => (
                              <div
                                key={`waiting-${
                                  approval.approvalId ||
                                  approval.documentId
                                }-${index}`}
                                className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg hover:bg-amber-500/10 transition-colors"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <button
                                      onClick={() =>
                                        navigate(
                                          `/documents/${approval.documentId}`
                                        )
                                      }
                                      className="flex items-center gap-2 text-left hover:text-amber-600 dark:hover:text-amber-300 transition-colors group mb-2"
                                    >
                                      <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                      <div>
                                        <span className="font-mono text-amber-700 dark:text-amber-300 text-sm">
                                          {approval.documentKey || "No Key"}
                                        </span>
                                        <span className="text-amber-800 dark:text-amber-100 ml-2">
                                          {approval.documentTitle ||
                                            "Untitled Document"}
                                        </span>
                                      </div>
                                    </button>
                                    <div className="text-sm text-amber-700 dark:text-amber-200/80">
                                      Step:{" "}
                                      {approval.stepTitle || "Unknown Step"}
                                    </div>
                                    {approval.requestedBy && (
                                      <div className="text-sm text-amber-600 dark:text-amber-200/60">
                                        Requested by: {approval.requestedBy}
                                      </div>
                                    )}
                                    {/* Display approvers */}
                                    {approval.approvers &&
                                      approval.approvers.length > 0 && (
                                        <div className="text-sm text-amber-600 dark:text-amber-200/60 mt-1">
                                          Approvers:{" "}
                                          {approval.approvers
                                            .map(
                                              (approver: any) =>
                                                approver.username
                                            )
                                            .join(", ")}
                                        </div>
                                      )}
                                    {/* Display current responses (for InProgress status) */}
                                    {approval.responses &&
                                      approval.responses.length > 0 && (
                                        <div className="text-sm text-amber-600 dark:text-amber-200/60 mt-1">
                                          Responses: {approval.responses.length}{" "}
                                          of {approval.approvers?.length || 0}{" "}
                                          completed
                                        </div>
                                      )}
                                  </div>
                                  <div className="text-right">
                                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                                      {approval.status === "inprogress"
                                        ? t('approvals.inProgress')
                                        : t('approvals.waiting')}
                                    </Badge>
                                    <div className="text-xs text-amber-600 dark:text-amber-200/60 mt-1">
                                      {formatDate(
                                        approval.requestDate ||
                                          approval.createdAt ||
                                          ""
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {approval.comments && (
                                  <div className="mt-3 pt-2 border-t border-amber-500/20">
                                    <p className="text-sm text-amber-700 dark:text-amber-200/80">
                                      {approval.comments}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                )}

                {historySubTab === "accepted" && (
                  <div className="p-4">
                    {acceptedApprovals.length === 0 ? (
                      <div className="text-center py-8">
                        <CircleCheck className="h-12 w-12 mx-auto text-green-500 dark:text-green-400/50 mb-3" />
                        <h3 className="text-lg font-medium text-green-700 dark:text-green-300">
                          {t('approvals.noAcceptedApprovals')}
                        </h3>
                        <p className="text-blue-600 dark:text-gray-400 text-sm">
                          {t('approvals.noAcceptedApprovalsDesc')}
                        </p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[calc(100vh-400px)]">
                        <div className="space-y-3">
                          {acceptedApprovals.map(
                            (approval: any, index: number) => (
                              <div
                                key={`accepted-${
                                  approval.approvalId ||
                                  approval.documentId
                                }-${index}`}
                                className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg hover:bg-green-500/10 transition-colors"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <button
                                      onClick={() =>
                                        navigate(
                                          `/documents/${approval.documentId}`
                                        )
                                      }
                                      className="flex items-center gap-2 text-left hover:text-green-600 dark:hover:text-green-300 transition-colors group mb-2"
                                    >
                                      <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                                      <div>
                                        <span className="font-mono text-green-700 dark:text-green-300 text-sm">
                                          {approval.documentKey || "No Key"}
                                        </span>
                                        <span className="text-green-800 dark:text-green-100 ml-2">
                                          {approval.documentTitle ||
                                            "Untitled Document"}
                                        </span>
                                      </div>
                                    </button>
                                    {/* {approval.processedBy && (
                                      <div className="text-sm text-green-600 dark:text-green-200/60">
                                        Approved by: {approval.processedBy}
                                      </div>
                                    )} */}
                                    <div className="text-sm text-green-700 dark:text-green-200/80">
                                      Step:{" "}
                                      {approval.stepTitle || "Unknown Step"}
                                    </div>
                                    {approval.writingComments && (
                                      <div className="text-sm text-green-700 dark:text-green-200/80">
                                        {approval.writingComments}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                      Accepted
                                    </Badge>
                                    <div className="text-xs text-green-600 dark:text-green-200/60 mt-1">
                                      {formatDate(
                                        approval.respondedAt ||
                                          approval.processedAt ||
                                          ""
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {approval.comments && (
                                  <div className="mt-3 pt-2 border-t border-green-500/20">
                                    <p className="text-sm text-green-700 dark:text-green-200/80">
                                      {approval.comments}
                                    </p>
                                  </div>
                                )}
                                {/* Display response details */}
                                {approval.responses &&
                                  approval.responses.length > 0 && (
                                    <div className="mt-3 pt-2 border-t border-green-500/20">
                                      <div className="text-xs text-green-200/60 mb-2">
                                        Response Details:
                                      </div>
                                      {approval.responses.map(
                                        (response: any, idx: number) => (
                                          <div
                                            key={`response-${
                                              approval.approvalId
                                            }-${
                                              response.userId ||
                                              response.username
                                            }-${idx}`}
                                            className="text-xs text-green-200/80 mb-1"
                                          >
                                            • {response.username}:{" "}
                                            {response.isApproved
                                              ? t('approvals.approved')
                                              : t('approvals.rejected')}
                                            {response.comments &&
                                              ` - "${response.comments}"`}
                                            <span className="text-green-200/60">
                                              {" "}
                                              (
                                              {formatDate(
                                                response.responseDate
                                              )}
                                              )
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                              </div>
                            )
                          )}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                )}

                {historySubTab === "rejected" && (
                  <div className="p-4">
                    {rejectedApprovals.length === 0 ? (
                      <div className="text-center py-8">
                        <CircleX className="h-12 w-12 mx-auto text-red-500 dark:text-red-400/50 mb-3" />
                        <h3 className="text-lg font-medium text-red-700 dark:text-red-300">
                          {t('approvals.noRejectedApprovals')}
                        </h3>
                        <p className="text-blue-600 dark:text-gray-400 text-sm">
                          {t('approvals.noRejectedApprovalsDesc')}
                        </p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[calc(100vh-400px)]">
                        <div className="space-y-3">
                          {rejectedApprovals.map(
                            (approval: any, index: number) => (
                              <div
                                key={`rejected-${
                                  approval.approvalId ||
                                  approval.documentId
                                }-${index}`}
                                className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <button
                                      onClick={() =>
                                        navigate(
                                          `/documents/${approval.documentId}`
                                        )
                                      }
                                      className="flex items-center gap-2 text-left hover:text-red-600 dark:hover:text-red-300 transition-colors group mb-2"
                                    >
                                      <FileText className="h-4 w-4 text-red-600 dark:text-red-400" />
                                      <div>
                                        <span className="font-mono text-red-700 dark:text-red-300 text-sm">
                                          {approval.documentKey || "No Key"}
                                        </span>
                                        <span className="text-red-800 dark:text-red-100 ml-2">
                                          {approval.documentTitle ||
                                            "Untitled Document"}
                                        </span>
                                      </div>
                                    </button>
                                    <div className="text-sm text-red-700 dark:text-red-200/80">
                                      Step:{" "}
                                      {approval.stepTitle || "Unknown Step"}
                                    </div>
                                    {approval.writingComments && (
                                      <div className="text-sm text-red-700 dark:text-red-200/80">
                                        {approval.writingComments}
                                      </div>
                                    )}
                                    {/* {approval.processedBy && (
                                      <div className="text-sm text-red-600 dark:text-red-200/60">
                                        Rejected by: {approval.processedBy}
                                      </div>
                                    )} */}
                                  </div>
                                  <div className="text-right">
                                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                      Rejected
                                    </Badge>
                                    <div className="text-xs text-red-600 dark:text-red-200/60 mt-1">
                                      {formatDate(
                                        approval.respondedAt ||
                                          approval.processedAt ||
                                          ""
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {approval.comments && (
                                  <div className="mt-3 pt-2 border-t border-red-500/20">
                                    <p className="text-sm text-red-700 dark:text-red-200/80">
                                      {approval.comments}
                                    </p>
                                  </div>
                                )}
                                {/* Display response details */}
                                {approval.responses &&
                                  approval.responses.length > 0 && (
                                    <div className="mt-3 pt-2 border-t border-red-500/20">
                                      <div className="text-xs text-red-600 dark:text-red-200/60 mb-2">
                                        Response Details:
                                      </div>
                                      {approval.responses.map(
                                        (response: any, idx: number) => (
                                          <div
                                            key={`response-${
                                              approval.approvalId
                                            }-${
                                              response.userId ||
                                              response.username
                                            }-${idx}`}
                                            className="text-xs text-red-700 dark:text-red-200/80 mb-1"
                                          >
                                            • {response.username}:{" "}
                                            {response.isApproved
                                              ? t('approvals.approved')
                                              : t('approvals.rejected')}
                                            {response.comments &&
                                              ` - "${response.comments}"`}
                                            <span className="text-red-600 dark:text-red-200/60">
                                              {" "}
                                              (
                                              {formatDate(
                                                response.responseDate
                                              )}
                                              )
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                              </div>
                            )
                          )}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                )}
              </Tabs>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Approval/Rejection Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="bg-white border-blue-200 text-blue-900 dark:bg-[#0a1033] dark:border-blue-900/50 dark:text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {responseType === "approve"
                ? t('approvals.approveDocument')
                : t('approvals.rejectDocument')}
            </DialogTitle>
            <DialogDescription className="text-blue-600 dark:text-gray-400">
              {responseType === "approve"
                ? t('approvals.approveDialogDesc')
                : t('approvals.rejectDialogDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {selectedApproval && (
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200 dark:bg-blue-950/50 dark:border-blue-900/30">
                <p className="text-sm text-blue-600 dark:text-gray-400">
                  {t('approvals.document')}
                </p>
                <p className="font-medium text-blue-900 dark:text-blue-300">
                  {selectedApproval.documentTitle || t('approvals.untitledDocument')}
                </p>
                <p className="text-sm text-blue-600 dark:text-gray-400 mt-2">
                  {t('approvals.step')}
                </p>
                <p className="font-medium text-blue-900 dark:text-blue-300">
                  {selectedApproval.stepTitle || t('approvals.unknownStep')}
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="comments"
                className="text-sm font-medium text-blue-700 dark:text-gray-400"
              >
                {responseType === "reject" ? t('approvals.commentsRequired') : t('approvals.commentsOptional')}
                {responseType === "reject" && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <Textarea
                id="comments"
                placeholder={
                  responseType === "approve"
                    ? t('approvals.commentsPlaceholder')
                    : t('approvals.rejectCommentsPlaceholder')
                }
                className="mt-1 bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/40 dark:border-blue-900/30 dark:text-white"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                required={responseType === "reject"}
              />
              {responseType === "reject" && !comments.trim() && (
                <p className="text-xs text-red-500 mt-1">
                  {t('approvals.commentsRequired')}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setApprovalDialogOpen(false)}
              className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300"
            >
              {t('approvals.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleApprovalResponse}
              disabled={responseType === "reject" && !comments.trim()}
              className={
                responseType === "approve"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              {responseType === "approve" ? t('approvals.approve') : t('approvals.reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
