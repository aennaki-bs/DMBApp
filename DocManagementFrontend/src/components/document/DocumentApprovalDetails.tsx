import { useState, useEffect } from 'react';
import { 
  AlertCircle, Clock8, User, UserCheck, Users, Loader2, 
  Clock, Shield, CheckCircle2, XCircle, Calendar, Check, X, ArrowRight,
  ChevronRight, Activity, Timer, UserRound, BadgeCheck, AlertTriangle,
  Eye, EyeOff
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ApprovalHistoryItem, ApproversGroup } from '@/services/approvalService';
import { ApproverInfo, StepApprovalConfigDetailDto } from '@/models/approval';
import approvalService from '@/services/approvalService';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface DocumentApprovalDetailsProps {
  pendingApproval?: ApprovalHistoryItem;
  approvalHistory?: ApprovalHistoryItem[];
  isLoadingApproval?: boolean;
}

const DocumentApprovalDetails = ({ 
  pendingApproval, 
  approvalHistory, 
  isLoadingApproval 
}: DocumentApprovalDetailsProps) => {
  const [groupDetails, setGroupDetails] = useState<ApproversGroup | null>(null);
  const [isLoadingGroup, setIsLoadingGroup] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [groupMembers, setGroupMembers] = useState<ApproverInfo[]>([]);

  // Fetch step configuration when we have a pending approval
  const { data: stepConfig } = useQuery<StepApprovalConfigDetailDto>({
    queryKey: ['stepConfig', pendingApproval?.stepId],
    queryFn: () => approvalService.getStepApprovalConfig(pendingApproval!.stepId),
    enabled: !!pendingApproval?.stepId,
  });

  // Get approval group details if this is a group approval
  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!pendingApproval || !pendingApproval.assignedToGroup) return;

      try {
        setIsLoadingGroup(true);
        // Extract group ID from the group name if available, or try to parse from response data
        const groupMatch = pendingApproval.assignedToGroup.match(/\(ID: (\d+)\)/);
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
  }, [pendingApproval]);

  // Helper function to get approval status for a specific user
  const getUserApprovalStatus = (username: string) => {
    if (!approvalHistory || !pendingApproval) return null;

    // Find the current approval in the history
    const currentApproval = approvalHistory.find(
      item => item.approvalId === pendingApproval.approvalId
    );

    if (!currentApproval || !currentApproval.responses) return null;

    // Find this user's response
    const userResponse = currentApproval.responses.find(
      response => response.responderName === username
    );

    return userResponse;
  };

  // Calculate approval progress
  const calculateProgress = () => {
    if (!groupMembers.length) return 0;
    const approvedCount = groupMembers.filter(member => {
      const status = getUserApprovalStatus(member.username);
      return status?.isApproved === true;
    }).length;
    return (approvedCount / groupMembers.length) * 100;
  };

  if (isLoadingApproval) {
    return (
      <Card className="mb-6 bg-card/95 border-border/50 shadow-2xl backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-ping opacity-20"></div>
            </div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted/50 rounded animate-pulse"></div>
              <div className="h-3 bg-muted/30 rounded w-2/3 animate-pulse"></div>
            </div>
      </div>
        </CardContent>
      </Card>
    );
  }

  if (!pendingApproval) return null;

  // Check if this is a synthetic approval that doesn't actually require action
  if (pendingApproval.assignedTo === "Approval Required" && !pendingApproval.assignedToGroup) {
    return (
      <Card className="mb-6 bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200/30 dark:border-emerald-800/30 shadow-xl backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 text-lg">No Required Approval</h3>
              <p className="text-emerald-700 dark:text-emerald-200/70 text-sm">This step is ready to proceed</p>
            </div>
        </div>
        
          {stepConfig && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock8 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-200/80">Step:</span> 
                <span className="text-emerald-900 dark:text-emerald-100 font-medium">{stepConfig.stepKey}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200/30 dark:border-emerald-800/30">
                <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800/30">
                  {stepConfig.currentStatusTitle}
                </Badge>
                <ArrowRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/30">
                  {stepConfig.nextStatusTitle}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Get rule type badge
  const getRuleTypeBadge = (ruleType: string) => {
    if (!ruleType) {
      return (
        <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800/30">
          Group
        </Badge>
      );
    }

    switch (ruleType.toLowerCase()) {
      case 'sequential':
        return (
          <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800/30">
            Sequential
          </Badge>
        );
      case 'all':
        return (
          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800/30">
            All Required
          </Badge>
        );
      case 'any':
        return (
          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800/30">
            Any Approver
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800/30">
            {ruleType}
          </Badge>
        );
    }
  };

  const progress = calculateProgress();

  return (
    <Card className="mb-6 bg-card/95 border-border/50 shadow-2xl backdrop-blur-xl overflow-hidden">
      {/* Header with animated background */}
      <div className="relative p-6 border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 dark:from-amber-400/10 dark:via-orange-400/5 dark:to-amber-400/10"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 dark:from-amber-400 dark:via-orange-400 dark:to-amber-400"></div>
        
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 rounded-full flex items-center justify-center shadow-lg">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 dark:bg-amber-300 rounded-full animate-pulse"></div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-amber-900 dark:text-amber-100 text-xl mb-1">Waiting for Approval</h3>
            <p className="text-amber-700 dark:text-amber-200/70 text-sm">Document requires approval to proceed</p>
          </div>
          
          {/* Hide/View Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="bg-muted/50 hover:bg-muted/70 text-amber-700 dark:text-amber-200 hover:text-amber-800 dark:hover:text-amber-100 border border-border/30"
          >
            {showDetails ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Details
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Details Content - Conditionally Rendered */}
      {showDetails && (
        <CardContent className="p-6 space-y-6">
          {/* Step Information */}
          {stepConfig && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-lg flex items-center justify-center">
                  <Clock8 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-blue-700 dark:text-blue-200/80 text-sm">Current Step</div>
                  <div className="text-blue-900 dark:text-blue-100 font-semibold">{stepConfig.title}</div>
                </div>
              </div>
              
              {/* Status Transition */}
              <div className="bg-muted/30 dark:bg-muted/20 rounded-lg p-4 border border-border/30">
                <div className="text-muted-foreground text-sm mb-3">Status Transition</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800/30 px-3 py-1">
                {stepConfig.currentStatusTitle}
              </Badge>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800/30 px-3 py-1">
                {stepConfig.nextStatusTitle}
              </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Approvers Information */}
        {pendingApproval.assignedToGroup && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-purple-700 dark:text-purple-200/80 text-sm">Approvers Group</div>
                  <div className="text-purple-900 dark:text-purple-100 font-semibold">
                    {pendingApproval.assignedToGroup?.replace(/\s*\(ID:\s*\d+\)/, '')}
                  </div>
                </div>
              </div>
            
            {isLoadingGroup ? (
                <div className="flex items-center gap-3 p-4 bg-muted/20 dark:bg-muted/10 rounded-lg">
                  <div className="w-6 h-6 border-2 border-purple-500 dark:border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-muted-foreground">Loading group details...</span>
                </div>
            ) : groupDetails && (
                <div className="space-y-4">
                  {/* Approval Rule */}
                {groupDetails.ruleType && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500 rounded-lg flex items-center justify-center">
                        <Shield className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-indigo-700 dark:text-indigo-200/80 text-sm">Approval Rule</div>
                    {getRuleTypeBadge(groupDetails.ruleType)}
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {groupMembers.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">Approval Progress</span>
                        <span className="text-foreground text-sm font-medium">
                          {groupMembers.filter(member => {
                            const status = getUserApprovalStatus(member.username);
                            return status?.isApproved === true;
                          }).length} / {groupMembers.length}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                  </div>
                )}
                
                  {/* Group Members */}
                {groupMembers.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-muted-foreground text-sm font-medium">Group Members</div>
                      <div className="space-y-2">
                      {groupMembers.map((member, index) => {
                        const userStatus = getUserApprovalStatus(member.username);
                        const hasApproved = userStatus?.isApproved === true;
                        const hasRejected = userStatus?.isApproved === false;
                        const hasPending = !userStatus;
                        
                        return (
                            <div 
                              key={member.userId} 
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
                                hasApproved 
                                  ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/30" 
                                  : hasRejected 
                                  ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30"
                                  : "bg-muted/30 dark:bg-muted/20 border-border/30 hover:bg-muted/50 dark:hover:bg-muted/30"
                              )}
                            >
                              {/* Sequential Number */}
                            {groupDetails.ruleType && groupDetails.ruleType.toLowerCase() === 'sequential' && (
                                <div className={cn(
                                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                  hasApproved 
                                    ? "bg-green-600 dark:bg-green-500 text-white" 
                                    : hasRejected 
                                    ? "bg-red-600 dark:bg-red-500 text-white"
                                    : "bg-muted text-muted-foreground"
                                )}>
                                  {index + 1}
                                </div>
                              )}
                              
                              {/* Status Icon */}
                              <div className="flex-shrink-0">
                            {hasApproved ? (
                                  <div className="w-8 h-8 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center">
                                    <Check className="h-4 w-4 text-white" />
                                  </div>
                            ) : hasRejected ? (
                                  <div className="w-8 h-8 bg-red-600 dark:bg-red-500 rounded-full flex items-center justify-center">
                                    <X className="h-4 w-4 text-white" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 bg-amber-600 dark:bg-amber-500 rounded-full flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-white" />
                                  </div>
                                )}
                              </div>
                              
                              {/* User Info */}
                              <div className="flex-1">
                                <div className={cn(
                                  "font-medium",
                                  hasApproved ? "text-green-800 dark:text-green-200" : 
                                  hasRejected ? "text-red-800 dark:text-red-200" : 
                                  "text-foreground"
                                )}>
                              {member.username || 'Unknown'}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                            <Badge 
                                    className={cn(
                                      "text-xs",
                                      hasApproved 
                                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800/30" :
                                        hasRejected 
                                        ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800/30" :
                                        "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800/30"
                                    )}
                            >
                              {hasApproved ? 'Approved' : hasRejected ? 'Rejected' : 'Pending'}
                            </Badge>
                            {userStatus && (
                                    <span className="text-xs text-muted-foreground">
                                {new Date(userStatus.responseDate).toLocaleDateString()}
                              </span>
                            )}
                                </div>
                              </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          )}

          {/* Individual Approver */}
          {pendingApproval.assignedTo && !pendingApproval.assignedToGroup && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-lg flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-blue-700 dark:text-blue-200/80 text-sm">Waiting for</div>
                <div className="text-blue-900 dark:text-blue-100 font-semibold">{pendingApproval.assignedTo}</div>
              </div>
            </div>
          )}

          {/* Timestamp */}
          {pendingApproval.createdAt && (
            <div className="flex items-center gap-3 pt-4 border-t border-border/30">
              <div className="w-8 h-8 bg-gradient-to-r from-muted to-muted/80 rounded-lg flex items-center justify-center">
                <Timer className="h-4 w-4 text-muted-foreground" />
      </div>
              <div>
                <div className="text-muted-foreground text-sm">Waiting since</div>
                <div className="text-foreground font-medium">
                  {new Date(pendingApproval.createdAt).toLocaleString()}
                </div>
          </div>
        </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default DocumentApprovalDetails; 