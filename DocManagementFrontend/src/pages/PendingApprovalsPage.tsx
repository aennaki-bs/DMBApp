import { useState, useEffect } from "react";
import {
  CircleCheck,
  CircleX,
  Clock,
  FileText,
  FileWarning,
  ArrowUpDown,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [responseType, setResponseType] = useState<"approve" | "reject" | null>(
    null
  );
  const [comments, setComments] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

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

  // Fetch approval history
  const {
    data: approvalHistory = [],
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["approvalHistory", userIdNum],
    queryFn: () => {
      if (!userIdNum) return [];
      return approvalService.getApprovalHistory(userIdNum);
    },
    enabled: !!userIdNum,
  });

  // Filter approvals based on search query
  const filteredPendingApprovals = pendingApprovals.filter(
    (approval: any) =>
      approval.documentTitle
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      approval.stepTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.requestedBy?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredApprovalHistory = approvalHistory.filter(
    (approval: any) =>
      approval.documentTitle
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      approval.stepTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.requestedBy?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle approval response
  const handleApprovalResponse = async () => {
    if (!selectedApproval || !responseType) return;

    try {
      // Use approvalId if available, otherwise fall back to id
      const approvalId = selectedApproval.approvalId || selectedApproval.id;

      // Send the response with approved=true for approve, approved=false for reject
      await approvalService.respondToApproval(approvalId, {
        approved: responseType === "approve", // true for approve, false for reject
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
      refetchHistory();
    } catch (error) {
      console.error("Error responding to approval:", error);
      toast({
        title: "Error",
        description: "Failed to process your response. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Open dialog for approval or rejection
  const openResponseDialog = (approval: any, type: "approve" | "reject") => {
    setSelectedApproval(approval);
    setResponseType(type);
    setComments("");
    setApprovalDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">My Approvals</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search approvals..."
            className="pl-8 bg-blue-950/40 border-blue-900/30 text-white placeholder:text-gray-500"
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
        <TabsList className="bg-blue-950/50 border border-blue-900/30">
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-blue-800/50"
          >
            Pending Approvals
            {pendingApprovals.length > 0 && (
              <Badge variant="destructive" className="ml-2 bg-red-600">
                {pendingApprovals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-blue-800/50"
          >
            Approval History
          </TabsTrigger>
        </TabsList>

        {/* Pending Approvals Tab */}
        <TabsContent value="pending" className="mt-4">
          <div className="rounded-xl border border-blue-900/30 overflow-hidden bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
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
                <h3 className="text-xl font-medium text-red-400">
                  Failed to load approvals
                </h3>
                <p className="text-gray-400">
                  There was an error retrieving your pending approvals.
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
              <div className="p-8 text-center">
                <Clock className="h-16 w-16 mx-auto text-blue-400 mb-2" />
                {searchQuery ? (
                  <>
                    <h3 className="text-xl font-medium text-blue-300">
                      No matching approvals
                    </h3>
                    <p className="text-gray-400">
                      No approvals match your search criteria.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-medium text-blue-300">
                      No pending approvals
                    </h3>
                    <p className="text-gray-400">
                      You don't have any documents waiting for your approval.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-300px)]">
                <Table>
                  <TableHeader className="bg-blue-900/20 sticky top-0 z-10">
                    <TableRow className="border-blue-900/50 hover:bg-blue-900/30">
                      <TableHead className="text-blue-300">Document</TableHead>
                      <TableHead className="text-blue-300">Step</TableHead>
                      <TableHead className="text-blue-300">
                        Requested By
                      </TableHead>
                      <TableHead className="text-blue-300">
                        Requested On
                      </TableHead>
                      <TableHead className="text-blue-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPendingApprovals.map((approval: any) => (
                      <TableRow
                        key={approval.id}
                        className="border-blue-900/30 hover:bg-blue-900/20"
                      >
                        <TableCell className="font-medium text-blue-100">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-400" />
                            {approval.documentTitle || "Untitled Document"}
                          </div>
                        </TableCell>
                        <TableCell className="text-blue-200">
                          {approval.stepTitle || "Unknown Step"}
                        </TableCell>
                        <TableCell className="text-blue-200">
                          {approval.requestedBy || "Unknown User"}
                        </TableCell>
                        <TableCell className="text-blue-200">
                          {new Date(
                            approval.requestDate || approval.requestedAt || ""
                          ).toLocaleDateString()}
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
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-900/30 border border-red-500/30 text-red-400 hover:bg-red-800/50 hover:text-red-300"
                              onClick={() =>
                                openResponseDialog(approval, "reject")
                              }
                            >
                              <CircleX className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </div>
        </TabsContent>

        {/* Approval History Tab */}
        <TabsContent value="history" className="mt-4">
          <div className="rounded-xl border border-blue-900/30 overflow-hidden bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
            {isHistoryLoading ? (
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
            ) : isHistoryError ? (
              <div className="p-6 text-center">
                <FileWarning className="h-16 w-16 mx-auto text-red-500 mb-2" />
                <h3 className="text-xl font-medium text-red-400">
                  Failed to load history
                </h3>
                <p className="text-gray-400">
                  There was an error retrieving your approval history.
                </p>
                <Button
                  variant="destructive"
                  className="mt-4"
                  onClick={() => refetchHistory()}
                >
                  Try Again
                </Button>
              </div>
            ) : filteredApprovalHistory.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="h-16 w-16 mx-auto text-blue-400 mb-2" />
                {searchQuery ? (
                  <>
                    <h3 className="text-xl font-medium text-blue-300">
                      No matching history
                    </h3>
                    <p className="text-gray-400">
                      No approval history matches your search criteria.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-medium text-blue-300">
                      No approval history
                    </h3>
                    <p className="text-gray-400">
                      You don't have any approval history yet.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-300px)]">
                <Table>
                  <TableHeader className="bg-blue-900/20 sticky top-0 z-10">
                    <TableRow className="border-blue-900/50 hover:bg-blue-900/30">
                      <TableHead className="text-blue-300">Document</TableHead>
                      <TableHead className="text-blue-300">Step</TableHead>
                      <TableHead className="text-blue-300">Decision</TableHead>
                      <TableHead className="text-blue-300">Date</TableHead>
                      <TableHead className="text-blue-300">Comments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApprovalHistory.map((approval: any) => (
                      <TableRow
                        key={approval.id || approval.approvalId}
                        className="border-blue-900/30 hover:bg-blue-900/20"
                      >
                        <TableCell className="font-medium text-blue-100">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-400" />
                            {approval.documentTitle || "Untitled Document"}
                          </div>
                        </TableCell>
                        <TableCell className="text-blue-200">
                          {approval.stepTitle || "Unknown Step"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              approval.approved ? "default" : "destructive"
                            }
                            className={
                              approval.approved
                                ? "bg-green-600/20 text-green-500 hover:bg-green-600/30 border-green-500/30"
                                : "bg-red-600/20 text-red-500 hover:bg-red-600/30 border-red-500/30"
                            }
                          >
                            {approval.approved ? "Approved" : "Rejected"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-blue-200">
                          {new Date(
                            approval.respondedAt || approval.requestDate || ""
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-blue-200 max-w-xs truncate">
                          {approval.comments || "No comments"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Approval/Rejection Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="bg-[#0a1033] border-blue-900/50 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {responseType === "approve"
                ? "Approve Document"
                : "Reject Document"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {responseType === "approve"
                ? "You're about to approve this document. Please provide any comments if needed."
                : "You're about to reject this document. Please provide a reason for rejection."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {selectedApproval && (
              <div className="bg-blue-950/50 p-3 rounded-md border border-blue-900/30">
                <p className="text-sm text-gray-400">Document</p>
                <p className="font-medium text-blue-300">
                  {selectedApproval.documentTitle || "Untitled Document"}
                </p>
                <p className="text-sm text-gray-400 mt-2">Step</p>
                <p className="font-medium text-blue-300">
                  {selectedApproval.stepTitle || "Unknown Step"}
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="comments"
                className="text-sm font-medium text-gray-400"
              >
                Comments
              </label>
              <Textarea
                id="comments"
                placeholder={
                  responseType === "approve"
                    ? "Optional comments..."
                    : "Reason for rejection..."
                }
                className="mt-1 bg-blue-950/40 border-blue-900/30 text-white"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                required={responseType === "reject"}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setApprovalDialogOpen(false)}
              className="bg-transparent border-blue-900/50 text-gray-300 hover:bg-blue-900/20"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className={
                responseType === "approve"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
              onClick={handleApprovalResponse}
              disabled={responseType === "reject" && !comments.trim()}
            >
              {responseType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
