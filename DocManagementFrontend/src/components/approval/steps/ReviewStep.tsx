import {
  CheckCircle,
  FileText,
  MessageSquare,
  Settings,
  UsersRound,
  UserRound,
  ListOrdered,
  AlertTriangle,
  ArrowDownUp,
  ArrowDown,
  Target,
  UserCheck,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ApprovalGroupFormData, ApprovalRuleType } from "@/models/approval";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ReviewStepProps {
  formData: ApprovalGroupFormData;
}

export function ReviewStep({ formData }: ReviewStepProps) {
  const isSequential = formData.ruleType === ApprovalRuleType.Sequential;
  const isMinimumWithRequired = formData.ruleType === ApprovalRuleType.MinimumWithRequired;

  // Format rule type for display
  const formatRuleType = (ruleType: string) => {
    switch (ruleType) {
      case "All":
        return "All Must Approve";
      case "Any":
        return "Any Can Approve";
      case "Sequential":
        return "Sequential Approval";
      case "MinimumWithRequired":
        return "Minimum + Required";
      default:
        return ruleType;
    }
  };

  // Get required members for MinimumWithRequired rule
  const requiredMembers = isMinimumWithRequired 
    ? formData.selectedUsers.filter(user => 
        formData.requiredMemberIds?.includes(user.userId)
      )
    : [];

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">Review Details</h3>
        <p className="text-xs text-muted-foreground">
          Review the approval group information before creating
        </p>
      </div>

      <div className="space-y-3">
        <Card className="overflow-hidden">
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-1.5 flex-shrink-0">
                <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-medium">Group Name</h4>
                <p className="text-xs">{formData.name}</p>
              </div>
            </div>

            {formData.comment && (
              <div className="flex items-start gap-2">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-1.5 flex-shrink-0 mt-0.5">
                  <MessageSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-medium">Description</h4>
                  <p className="text-xs text-muted-foreground">
                    {formData.comment}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-1.5 flex-shrink-0 mt-0.5">
                <Settings className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-medium">Approval Method</h4>
                <Badge
                  variant="secondary"
                  className={`font-normal text-[10px] py-0.5 px-1.5 ${
                    isSequential
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                      : isMinimumWithRequired
                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                      : ""
                  }`}
                >
                  {formatRuleType(formData.ruleType)}
                </Badge>
              </div>
            </div>

            {/* MinimumWithRequired Configuration */}
            {isMinimumWithRequired && (
              <div className="space-y-2 pt-2 border-t border-orange-200 dark:border-orange-800/50">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-1.5 flex-shrink-0">
                    <Users className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-medium">Minimum Approvals</h4>
                    <p className="text-xs">{formData.minimumApprovals || 1} approval(s) required</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-1.5 flex-shrink-0 mt-0.5">
                    <UserCheck className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-1 w-full">
                    <h4 className="text-xs font-medium">Required Members</h4>
                    {requiredMembers.length > 0 ? (
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
                    ) : (
                      <p className="text-xs text-muted-foreground">No required members selected</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {isSequential && (
          <Alert className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/30 py-1.5 px-2.5 text-xs">
            <ArrowDownUp className="h-3 w-3 text-purple-600 dark:text-purple-400" />
            <AlertDescription className="text-purple-700 dark:text-purple-300 text-xs">
              <span className="font-medium">Sequential order:</span> Users will
              approve documents in the exact order shown below.
            </AlertDescription>
          </Alert>
        )}

        {isMinimumWithRequired && (
          <Alert className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/30 py-1.5 px-2.5 text-xs">
            <Target className="h-3 w-3 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="text-orange-700 dark:text-orange-300 text-xs">
              <span className="font-medium">Approval complete when:</span> At least {formData.minimumApprovals || 1} member(s) approve AND all required members approve.
            </AlertDescription>
          </Alert>
        )}

        <Card className="overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-1.5 flex-shrink-0 mt-0.5">
                {isSequential ? (
                  <ListOrdered className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                ) : (
                  <UsersRound className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-medium">
                    {isSequential ? "Approval Sequence" : "Group Members"}
                  </h4>
                  <Badge
                    variant="outline"
                    className="ml-2 text-[10px] py-0 h-4"
                  >
                    {formData.selectedUsers.length}{" "}
                    {formData.selectedUsers.length === 1 ? "user" : "users"}
                  </Badge>
                </div>

                {formData.selectedUsers.length > 0 ? (
                  <ScrollArea className="h-[120px] w-full">
                    <div className="space-y-1.5 pr-3">
                      {isSequential && formData.selectedUsers.length > 1 && (
                        <div className="relative ml-2 pl-7 mb-2">
                          <div className="absolute left-0 top-0 bottom-0 border-l-2 border-dashed border-purple-300 dark:border-purple-700"></div>
                        </div>
                      )}

                      {formData.selectedUsers.map((user, index) => (
                        <div
                          key={user.userId}
                          className={`flex items-center gap-1.5 p-1.5 rounded-md ${
                            isSequential
                              ? "bg-gradient-to-r from-purple-50 to-purple-50/70 dark:from-purple-900/20 dark:to-purple-900/10 border border-purple-100 dark:border-purple-900/30"
                              : isMinimumWithRequired && formData.requiredMemberIds?.includes(user.userId)
                              ? "bg-gradient-to-r from-green-50 to-green-50/70 dark:from-green-900/20 dark:to-green-900/10 border border-green-100 dark:border-green-900/30"
                              : "bg-muted/50"
                          }`}
                        >
                          {isSequential && (
                            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-800/50 flex items-center justify-center text-xs font-medium text-purple-700 dark:text-purple-300">
                              {index + 1}
                            </div>
                          )}
                          {isMinimumWithRequired && formData.requiredMemberIds?.includes(user.userId) && (
                            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 dark:bg-green-800/50 flex items-center justify-center">
                              <UserCheck className="h-3 w-3 text-green-700 dark:text-green-300" />
                            </div>
                          )}
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                            <UserRound className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium truncate">
                              {user.username}
                            </p>
                            {user.role && (
                              <p className="text-[10px] text-muted-foreground truncate">
                                {user.role}
                              </p>
                            )}
                          </div>
                          {isSequential && (
                            <Badge
                              variant="outline"
                              className={`ml-auto text-[10px] h-4 py-0 px-1.5 ${
                                index === 0
                                  ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700"
                                  : index === formData.selectedUsers.length - 1
                                  ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"
                                  : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                              }`}
                            >
                              {index === 0
                                ? "First"
                                : index === formData.selectedUsers.length - 1
                                ? "Final"
                                : `#${index + 1}`}
                            </Badge>
                          )}
                          {isMinimumWithRequired && formData.requiredMemberIds?.includes(user.userId) && (
                            <Badge
                              variant="outline"
                              className="ml-auto text-[10px] h-4 py-0 px-1.5 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"
                            >
                              Required
                            </Badge>
                          )}

                          {isSequential &&
                            index < formData.selectedUsers.length - 1 && (
                              <div className="absolute left-2 ml-2 transform translate-y-6">
                                <ArrowDown className="h-3 w-3 text-purple-400 dark:text-purple-600" />
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    No users selected. Please go back and select users.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-2 flex items-start gap-2 p-2 rounded-md bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400">
          <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium">
              Ready to create approval group
            </p>
            <p className="text-[10px] mt-0.5">
              Click "Create Group" to finish and create this approval group.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
