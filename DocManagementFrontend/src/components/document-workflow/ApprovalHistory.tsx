import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ApprovalHistory } from "@/models/approval";
import approvalService from "@/services/approvalService";

interface ApprovalHistoryComponentProps {
  documentId: number;
}

export function ApprovalHistoryComponent({
  documentId,
}: ApprovalHistoryComponentProps) {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const {
    data: approvalHistory,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["approvalHistory", documentId],
    queryFn: () => approvalService.getApprovalHistory(documentId),
    enabled: !!documentId,
  });

  const toggleExpand = (approvalId: number) => {
    setExpandedItems((prev) =>
      prev.includes(approvalId)
        ? prev.filter((id) => id !== approvalId)
        : [...prev, approvalId]
    );
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return null;

    if (status.toLowerCase().includes("approved")) {
      return <Badge className="bg-green-600">Approved</Badge>;
    }
    if (status.toLowerCase().includes("rejected")) {
      return <Badge className="bg-red-600">Rejected</Badge>;
    }
    if (status.toLowerCase().includes("pending")) {
      return <Badge className="bg-amber-500">Pending</Badge>;
    }

    return <Badge>{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="rounded-xl border border-blue-900/30 bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-white">Approval History</CardTitle>
          <CardDescription>Failed to load approval history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-400">
              There was an error loading the approval history.
            </p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!approvalHistory || approvalHistory.length === 0) {
    return (
      <Card className="rounded-xl border border-blue-900/30 bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-white">Approval History</CardTitle>
          <CardDescription>
            No approval history found for this document
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-400">
              This document has no approval history yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-blue-900/30 bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-white">Approval History</CardTitle>
        <CardDescription>
          {approvalHistory.length} approval request
          {approvalHistory.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-4 p-4">
            {approvalHistory.map((approval) => (
              <Collapsible
                key={approval.approvalId}
                open={expandedItems.includes(approval.approvalId)}
                onOpenChange={() => toggleExpand(approval.approvalId)}
                className="border border-blue-900/50 rounded-lg bg-blue-950/30"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">
                        {approval.stepTitle}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          {approval.requestedBy}
                        </span>
                        <Clock className="h-3.5 w-3.5 text-gray-400 ml-2" />
                        <span className="text-sm text-gray-400">
                          {formatDate(approval.requestDate)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(approval.status)}
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          {expandedItems.includes(approval.approvalId) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>

                  {approval.comments && (
                    <div className="mt-2 flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                      <p className="text-sm text-gray-300">
                        {approval.comments}
                      </p>
                    </div>
                  )}
                </div>

                <CollapsibleContent>
                  <Separator className="bg-blue-900/50" />
                  <div className="p-4 space-y-3">
                    <h4 className="text-sm font-medium text-gray-300">
                      Responses
                    </h4>

                    {!approval.responses || approval.responses.length === 0 ? (
                      <p className="text-sm text-gray-400">No responses yet</p>
                    ) : (
                      <div className="space-y-3">
                        {approval.responses.map((response, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-md ${
                              response.isApproved
                                ? "bg-green-900/20 border border-green-800/50"
                                : "bg-red-900/20 border border-red-800/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {response.isApproved ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span className="text-sm font-medium text-gray-200">
                                  {response.responderName}
                                </span>
                              </div>
                              <span className="text-xs text-gray-400">
                                {formatDate(response.responseDate)}
                              </span>
                            </div>

                            {response.comments && (
                              <div className="mt-2 pl-6">
                                <p className="text-sm text-gray-300">
                                  {response.comments}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
