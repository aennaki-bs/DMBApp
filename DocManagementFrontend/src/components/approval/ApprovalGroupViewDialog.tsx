import React from "react";
import { ApprovalGroup } from "@/models/approval";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UsersRound,
  UserRound,
  AlertTriangle,
  Info,
  Users,
} from "lucide-react";

interface ApprovalGroupViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: ApprovalGroup;
  isAssociated?: boolean;
}

export default function ApprovalGroupViewDialog({
  open,
  onOpenChange,
  group,
  isAssociated = false,
}: ApprovalGroupViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1e2a4a] border border-blue-900/70 text-blue-100 max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-blue-100 flex items-center gap-2">
            <UsersRound className="h-5 w-5 text-blue-400" />
            Group Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Group header with name and rule type */}
          <div className="flex items-center justify-between bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
            <div className="flex items-center gap-3">
              <div className="bg-blue-800/60 p-3 rounded-full">
                <UsersRound className="h-6 w-6 text-blue-300" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-100">
                  {group.name}
                </h3>
                {group.comment && (
                  <p className="text-blue-300 text-sm mt-1">{group.comment}</p>
                )}
              </div>
            </div>
            <Badge
              className={`${
                group.ruleType === "All"
                  ? "bg-emerald-600/60 text-emerald-100"
                  : group.ruleType === "Any"
                  ? "bg-amber-600/60 text-amber-100"
                  : "bg-blue-600/60 text-blue-100"
              } px-3 py-1`}
            >
              {group.ruleType === "All"
                ? "All Must Approve"
                : group.ruleType === "Any"
                ? "Any Can Approve"
                : "Sequential"}
            </Badge>
          </div>

          {/* Association warning */}
          {isAssociated && (
            <div className="bg-amber-950/20 border border-amber-900/30 rounded-md p-3 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-200 text-sm font-medium">
                  This group is currently associated with workflow steps
                </p>
                <p className="text-amber-200/70 text-xs mt-1">
                  You cannot edit or delete this group while it's in use. Remove
                  its associations from workflow steps first.
                </p>
              </div>
            </div>
          )}

          {/* Members list */}
          <div className="border border-blue-900/30 rounded-lg">
            <div className="p-3 border-b border-blue-900/30 bg-blue-950/50">
              <h4 className="flex items-center gap-2 text-blue-200 font-medium">
                <UserRound className="h-4 w-4 text-blue-400" />
                Group Members ({group.approvers?.length || 0})
              </h4>
            </div>
            <div className="p-4 max-h-[300px] overflow-y-auto">
              {group.approvers && group.approvers.length > 0 ? (
                <div className="space-y-2">
                  {group.approvers.map((approver, index) => (
                    <div
                      key={approver.userId}
                      className={`flex items-center p-3 rounded-md ${
                        group.ruleType === "Sequential"
                          ? "bg-blue-900/20 border border-blue-800/30"
                          : "bg-blue-950/50"
                      }`}
                    >
                      {group.ruleType === "Sequential" && (
                        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-800/50 text-blue-200 text-xs mr-3">
                          {index + 1}
                        </div>
                      )}
                      <UserRound className="h-4 w-4 text-blue-400 mr-2" />
                      <span className="text-blue-100">{approver.username}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 text-blue-500/60">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No members in this group</p>
                </div>
              )}
            </div>
          </div>

          {/* Info box */}
          <div className="bg-blue-950/30 p-4 rounded-md border border-blue-900/20 flex gap-3">
            <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-300">
              <p className="mb-1">
                This approval group defines how document approvals are
                processed.
              </p>
              {group.ruleType === "All" && (
                <p>All members must approve for the document to proceed.</p>
              )}
              {group.ruleType === "Any" && (
                <p>Any single member can approve the document to proceed.</p>
              )}
              {group.ruleType === "Sequential" && (
                <p>Members must approve in the specified order shown above.</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-blue-800 text-blue-300 hover:bg-blue-900/20"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
