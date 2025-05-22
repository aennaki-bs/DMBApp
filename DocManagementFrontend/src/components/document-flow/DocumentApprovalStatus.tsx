import { useState } from "react";
import { useDocumentApproval } from "@/hooks/document-workflow/useDocumentApproval";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  XCircle,
} from "lucide-react";

interface DocumentApprovalStatusProps {
  documentId: number;
  onApprovalUpdate?: () => void;
}

export function DocumentApprovalStatus({
  documentId,
  onApprovalUpdate,
}: DocumentApprovalStatusProps) {
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [comments, setComments] = useState("");

  const {
    approvalHistory,
    isHistoryLoading,
    isHistoryError,
    respondToApproval,
    isLoading,
    hasPendingApprovals,
    latestApprovalStatus,
    wasRejected,
  } = useDocumentApproval(documentId);

  // Get the latest pending approval
  const latestPendingApproval = approvalHistory?.find((approval) =>
    approval.status?.toLowerCase().includes("pending")
  );

  const handleApprove = async () => {
    if (!latestPendingApproval) return;

    const success = await respondToApproval(
      latestPendingApproval.approvalId,
      true,
      comments
    );

    if (success) {
      setComments("");
      setIsApproveDialogOpen(false);
      if (onApprovalUpdate) onApprovalUpdate();
    }
  };

  const handleReject = async () => {
    if (!latestPendingApproval || !comments.trim()) return;

    const success = await respondToApproval(
      latestPendingApproval.approvalId,
      false,
      comments
    );

    if (success) {
      setComments("");
      setIsRejectDialogOpen(false);
      if (onApprovalUpdate) onApprovalUpdate();
    }
  };

  const getStatusBadge = () => {
    if (isHistoryLoading) {
      return <Badge className="bg-blue-600">Loading...</Badge>;
    }

    if (wasRejected) {
      return <Badge className="bg-red-600">Rejected</Badge>;
    }

    if (hasPendingApprovals) {
      return <Badge className="bg-amber-500">Pending Approval</Badge>;
    }

    if (latestApprovalStatus?.toLowerCase().includes("approved")) {
      return <Badge className="bg-green-600">Approved</Badge>;
    }

    return <Badge className="bg-blue-600">No Approval Required</Badge>;
  };

  if (isHistoryLoading) {
    return (
      <Card className="rounded-xl border border-blue-900/30 bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white">Approval Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isHistoryError) {
    return (
      <Card className="rounded-xl border border-blue-900/30 bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white">Approval Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-2 text-red-400">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Failed to load approval status</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!approvalHistory || approvalHistory.length === 0) {
    return (
      <Card className="rounded-xl border border-blue-900/30 bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white">Approval Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-2 text-gray-400">
            <p>No approval required for this document</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-xl border border-blue-900/30 bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white">Approval Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {wasRejected ? (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                ) : hasPendingApprovals ? (
                  <Clock className="h-5 w-5 text-amber-500 mr-2" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                )}
                <span className="text-white">
                  {wasRejected
                    ? "Approval Rejected"
                    : hasPendingApprovals
                    ? "Waiting for Approval"
                    : "Approval Complete"}
                </span>
              </div>
              {getStatusBadge()}
            </div>

            {latestPendingApproval && (
              <div className="rounded-md bg-blue-900/20 p-3 border border-blue-800/50">
                <p className="text-sm text-blue-300 mb-2">
                  <span className="font-medium">Approval Step:</span>{" "}
                  {latestPendingApproval.stepTitle}
                </p>
                <p className="text-sm text-blue-300">
                  <span className="font-medium">Requested By:</span>{" "}
                  {latestPendingApproval.requestedBy}
                </p>

                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={() => setIsApproveDialogOpen(true)}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => setIsRejectDialogOpen(true)}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            )}

            {wasRejected && (
              <div className="rounded-md bg-red-900/20 p-3 border border-red-800/50">
                <p className="text-sm text-red-300">
                  This document was rejected. Please review the approval history
                  for details.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Approve Document</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="approve-comments"
                className="text-sm font-medium text-gray-200"
              >
                Comments (optional)
              </label>
              <Textarea
                id="approve-comments"
                placeholder="Add any comments about your approval decision..."
                className="bg-[#111633] border-blue-900/50 text-white resize-none focus:border-blue-500/50"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveDialogOpen(false)}
              disabled={isLoading}
              className="border-blue-800 text-gray-300 hover:bg-blue-900/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Approval
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="reject-comments"
                className="text-sm font-medium text-gray-200"
              >
                Rejection Reason <span className="text-red-400">*</span>
              </label>
              <Textarea
                id="reject-comments"
                placeholder="Please provide a reason for rejection..."
                className="bg-[#111633] border-blue-900/50 text-white resize-none focus:border-blue-500/50"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                required
              />
              {!comments.trim() && (
                <p className="text-xs text-red-400">
                  Comments are required for rejection
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={isLoading}
              className="border-blue-800 text-gray-300 hover:bg-blue-900/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={isLoading || !comments.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Confirm Rejection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
