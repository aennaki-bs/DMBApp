import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Target, Users, UserCheck, AlertCircle } from "lucide-react";
import { ApproverInfo } from "@/models/approval";

interface MinimumWithRequiredConfigStepProps {
  minimumApprovals: number;
  onMinimumApprovalsChange: (value: number) => void;
  requiredMemberIds: number[];
  onRequiredMemberIdsChange: (ids: number[]) => void;
  selectedUsers: ApproverInfo[];
}

export function MinimumWithRequiredConfigStep({
  minimumApprovals,
  onMinimumApprovalsChange,
  requiredMemberIds,
  onRequiredMemberIdsChange,
  selectedUsers,
}: MinimumWithRequiredConfigStepProps) {
  
  const handleRequiredMemberToggle = (userId: number, checked: boolean) => {
    if (checked) {
      onRequiredMemberIdsChange([...requiredMemberIds, userId]);
    } else {
      onRequiredMemberIdsChange(requiredMemberIds.filter(id => id !== userId));
    }
  };

  const requiredMembers = selectedUsers.filter(user => 
    requiredMemberIds.includes(user.userId)
  );

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Target className="h-4 w-4 text-orange-500" />
          Minimum with Required Configuration
        </h3>
        <p className="text-xs text-muted-foreground">
          Configure the minimum number of approvals and select required members
        </p>
      </div>

      {/* Minimum Approvals Setting */}
      <Card className="border-orange-200 dark:border-orange-800/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            Minimum Approvals Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="minimum-approvals" className="text-xs font-medium">
              Number of Approvals*
            </Label>
            <Input
              id="minimum-approvals"
              type="number"
              min="1"
              max={selectedUsers.length}
              value={minimumApprovals}
              onChange={(e) => onMinimumApprovalsChange(parseInt(e.target.value) || 1)}
              className="w-full h-8 text-xs"
            />
            <p className="text-[10px] text-muted-foreground">
              Minimum number of group members who must approve (max: {selectedUsers.length})
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Required Members Selection */}
      <Card className="border-orange-200 dark:border-orange-800/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-green-500" />
            Required Members
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Select members who must always approve
            </Label>
            <p className="text-[10px] text-muted-foreground">
              These members must approve regardless of the minimum count
            </p>
          </div>

          {selectedUsers.length > 0 ? (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedUsers.map((user) => (
                <div key={user.userId} className="flex items-center space-x-2">
                  <Checkbox
                    id={`required-${user.userId}`}
                    checked={requiredMemberIds.includes(user.userId)}
                    onCheckedChange={(checked) => 
                      handleRequiredMemberToggle(user.userId, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`required-${user.userId}`}
                    className="text-xs cursor-pointer flex-1"
                  >
                    {user.username}
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-muted-foreground">
              No users selected yet. Please add users in the previous step.
            </div>
          )}

          {/* Summary of selected required members */}
          {requiredMembers.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-medium">Required Members:</Label>
              <div className="flex flex-wrap gap-1">
                {requiredMembers.map((user) => (
                  <Badge 
                    key={user.userId} 
                    variant="secondary" 
                    className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  >
                    {user.username}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/50">
        <CardContent className="p-3">
          <div className="flex items-start space-x-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <AlertCircle className="h-3 w-3" />
            </div>
            <div>
              <h4 className="text-xs font-semibold">Configuration Summary</h4>
              <div className="text-[10px] text-muted-foreground mt-1 space-y-1">
                <p>• Minimum of {minimumApprovals} approval(s) required from any group members</p>
                {requiredMembers.length > 0 && (
                  <p>• {requiredMembers.length} specific member(s) must approve: {requiredMembers.map(u => u.username).join(', ')}</p>
                )}
                <p>• Approval is complete when both conditions are met</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 