import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, Target, UserCheck, Users } from 'lucide-react';
import { ApprovalStatusSummary } from '@/models/approval';
import approvalService from '@/services/approvalService';

interface ApprovalStatusDisplayProps {
  approvalId: number;
  approvalType: string;
}

export function ApprovalStatusDisplay({ approvalId, approvalType }: ApprovalStatusDisplayProps) {
  const [statusSummary, setStatusSummary] = useState<ApprovalStatusSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (approvalType === 'MinimumWithRequired') {
      fetchStatusSummary();
    }
  }, [approvalId, approvalType]);

  const fetchStatusSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await approvalService.getApprovalStatusSummary(approvalId);
      setStatusSummary(summary);
    } catch (err) {
      console.error('Failed to fetch approval status:', err);
      setError('Failed to load approval status');
    } finally {
      setLoading(false);
    }
  };

  // For non-MinimumWithRequired approvals, show simple status
  if (approvalType !== 'MinimumWithRequired') {
    return (
      <div className="text-sm text-muted-foreground">
        {approvalType} approval in progress...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground animate-pulse">
        Loading approval status...
      </div>
    );
  }

  if (error || !statusSummary) {
    return (
      <div className="text-sm text-red-500">
        {error || 'Unable to load approval status'}
      </div>
    );
  }

  const minimumProgress = (statusSummary.currentApprovals / statusSummary.minimumRequired) * 100;
  const requiredProgress = statusSummary.requiredMembersTotal > 0 
    ? (statusSummary.requiredMembersApproved / statusSummary.requiredMembersTotal) * 100 
    : 100;

  return (
    <Card className="border-orange-200 dark:border-orange-800/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Target className="h-4 w-4 text-orange-500" />
          Approval Progress
          {statusSummary.isComplete && (
            <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Minimum Approvals Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Minimum Approvals</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {statusSummary.currentApprovals} / {statusSummary.minimumRequired}
            </span>
          </div>
          <Progress 
            value={Math.min(minimumProgress, 100)} 
            className="h-2"
          />
          <div className="flex items-center gap-1">
            {statusSummary.isMinimumMet ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Clock className="h-4 w-4 text-orange-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {statusSummary.isMinimumMet ? 'Minimum met' : 'Waiting for more approvals'}
            </span>
          </div>
        </div>

        {/* Required Members Progress */}
        {statusSummary.requiredMembersTotal > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Required Members</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {statusSummary.requiredMembersApproved} / {statusSummary.requiredMembersTotal}
              </span>
            </div>
            <Progress 
              value={Math.min(requiredProgress, 100)} 
              className="h-2"
            />
            <div className="flex items-center gap-1">
              {statusSummary.areAllRequiredApproved ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Clock className="h-4 w-4 text-orange-500" />
              )}
              <span className="text-xs text-muted-foreground">
                {statusSummary.areAllRequiredApproved 
                  ? 'All required members approved' 
                  : `${statusSummary.requiredMembersPending.length} required member(s) pending`
                }
              </span>
            </div>
          </div>
        )}

        {/* Overall Status */}
        <div className={`p-3 rounded-lg border ${
          statusSummary.isComplete 
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50'
            : 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/50'
        }`}>
          <div className="flex items-center gap-2">
            {statusSummary.isComplete ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            )}
            <span className={`text-sm font-medium ${
              statusSummary.isComplete 
                ? 'text-green-800 dark:text-green-300'
                : 'text-orange-800 dark:text-orange-300'
            }`}>
              {statusSummary.isComplete 
                ? 'Approval Requirements Met'
                : 'Approval In Progress'
              }
            </span>
          </div>
          <p className={`text-xs mt-1 ${
            statusSummary.isComplete 
              ? 'text-green-700 dark:text-green-400'
              : 'text-orange-700 dark:text-orange-400'
          }`}>
            {statusSummary.isComplete 
              ? 'Both minimum approvals and required members have approved.'
              : 'Waiting for approval requirements to be fulfilled.'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 