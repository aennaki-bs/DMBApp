import { useState, useEffect } from "react";
import { useDocumentApproval } from "@/hooks/document-workflow/useDocumentApproval";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  XCircle,
  User,
  UserCheck,
  Users,
  Shield,
} from "lucide-react";
import { ApproverInfo, ApproversGroup } from "@/models/approval";
import approvalService from "@/services/approvalService";

interface DocumentApprovalStatusProps {
  documentId: number;
  onApprovalUpdate?: () => void;
  refreshTrigger?: number;
}

export function DocumentApprovalStatus({
  documentId,
  onApprovalUpdate,
  refreshTrigger,
}: DocumentApprovalStatusProps) {
  const [groupDetails, setGroupDetails] = useState<ApproversGroup | null>(null);
  const [isLoadingGroup, setIsLoadingGroup] = useState(false);
  const [groupMembers, setGroupMembers] = useState<ApproverInfo[]>([]);

  const {
    approvalHistory,
    isHistoryLoading,
    isHistoryError,
    hasPendingApprovals,
    latestApprovalStatus,
    wasRejected,
    refetchHistory,
  } = useDocumentApproval(documentId);

  // Also fetch pending approvals for this document to get assignment info
  const { data: pendingApprovals } = useQuery({
    queryKey: ['documentApprovals', documentId],
    queryFn: () => approvalService.getDocumentApprovals(documentId),
    enabled: !!documentId && hasPendingApprovals,
    refetchInterval: hasPendingApprovals ? 30000 : false, // Refetch every 30s if pending
  });

  // Get the latest pending approval
  const latestPendingApproval = approvalHistory?.find((approval) => {
    const status = approval.status?.toLowerCase();
    return status === 'open' || status === 'inprogress';
  });

  // Get assignment information from pending approvals
  const latestPendingAssignment = pendingApprovals?.[0];

  // Get approval group details if this is a group approval
  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!latestPendingAssignment || !latestPendingAssignment.assignedToGroup) return;

      try {
        setIsLoadingGroup(true);
        // Extract group ID from the group name if available
        const groupMatch = latestPendingAssignment.assignedToGroup.match(/\(ID: (\d+)\)/);
        const groupId = groupMatch ? parseInt(groupMatch[1], 10) : null;

        if (groupId) {
          const groupData = await approvalService.getApprovalGroup(groupId);
          setGroupDetails(groupData);

          // Fetch group members
          const membersData = await approvalService.getGroupMembers(groupId);
          setGroupMembers(membersData);
        }
      } catch (error) {
        console.error('Error fetching approval group details:', error);
      } finally {
        setIsLoadingGroup(false);
      }
    };

    fetchGroupDetails();
  }, [latestPendingAssignment]);

  // Refetch approval data when refresh trigger changes
  useEffect(() => {
    if (refreshTrigger) {
      refetchHistory();
    }
  }, [refreshTrigger, refetchHistory]);

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

  // Get rule type badge
  const getRuleTypeBadge = (ruleType: string) => {
    if (!ruleType) {
      return (
        <Badge variant="outline" className="border-amber-500/30 text-amber-200">
          Group
        </Badge>
      );
    }

    switch (ruleType.toLowerCase()) {
      case 'sequential':
        return (
          <Badge variant="outline" className="border-purple-500/30 text-purple-200 bg-purple-500/10">
            Sequential
          </Badge>
        );
      case 'all':
        return (
          <Badge variant="outline" className="border-blue-500/30 text-blue-200 bg-blue-500/10">
            All Approvers Required
          </Badge>
        );
      case 'any':
        return (
          <Badge variant="outline" className="border-green-500/30 text-green-200 bg-green-500/10">
            Any Approver
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-amber-500/30 text-amber-200">
            {ruleType}
          </Badge>
        );
    }
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
                <div className="space-y-2">
                  <p className="text-sm text-blue-300">
                    <span className="font-medium">Approval Step:</span>{" "}
                    {latestPendingApproval.stepTitle}
                  </p>
                  
                  <p className="text-sm text-blue-300">
                    <span className="font-medium">Requested By:</span>{" "}
                    {latestPendingApproval.requestedBy}
                  </p>
                  
                  {/* Display individual approver */}
                  {latestPendingAssignment?.assignedTo && !latestPendingAssignment.assignedToGroup && (
                    <div className="flex items-center gap-1 text-sm text-blue-300">
                      <UserCheck className="h-4 w-4 text-blue-400/70" />
                      <span className="font-medium">Waiting for:</span> 
                      <span>{latestPendingAssignment.assignedTo}</span>
                    </div>
                  )}
                  
                  {/* Display approver group */}
                  {latestPendingAssignment?.assignedToGroup && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-sm text-blue-300">
                        <Users className="h-4 w-4 text-blue-400/70" />
                        <span className="font-medium">Approvers Group:</span> 
                        <span>{latestPendingAssignment.assignedToGroup}</span>
                      </div>
                      
                      {isLoadingGroup ? (
                        <div className="flex items-center gap-1 text-blue-300/50 pl-5 text-sm">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Loading group details...</span>
                        </div>
                      ) : groupDetails && (
                        <div className="pl-5 mt-1 mb-1">
                          {groupDetails.ruleType && (
                            <div className="flex items-center gap-1 mb-1 text-sm text-blue-300">
                              <Shield className="h-4 w-4 text-blue-400/70" />
                              <span className="font-medium">Approval Rule:</span> 
                              {getRuleTypeBadge(groupDetails.ruleType)}
                            </div>
                          )}
                          
                          {groupMembers.length > 0 && (
                            <div className="mt-1">
                              <p className="text-sm text-blue-300 font-medium mb-1">Group Members:</p>
                              <ul className="space-y-1 pl-5 text-sm text-blue-300">
                                {groupMembers.map((member, index) => (
                                  <li key={member.userId || index} className="flex items-center gap-1">
                                    {groupDetails.ruleType && groupDetails.ruleType.toLowerCase() === 'sequential' ? (
                                      <>
                                        <span className="text-blue-400/70">{index + 1}.</span>
                                        <User className="h-3 w-3 text-blue-400/70" />
                                      </>
                                    ) : (
                                      <User className="h-3 w-3 text-blue-400/70" />
                                    )}
                                    <span>{member.username || 'Unknown'}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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
    </>
  );
}
