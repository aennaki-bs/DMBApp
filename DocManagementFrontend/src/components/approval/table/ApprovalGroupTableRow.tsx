import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { ApprovalGroup } from "@/models/approval";
import { ApprovalGroupActionsDropdown } from "./row/ApprovalGroupActionsDropdown";
import { UsersRound, Shield, CheckCircle2, Clock, AlertCircle, Link2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";

interface ApprovalGroupTableRowProps {
  group: ApprovalGroup;
  isSelected: boolean;
  onSelect: (groupId: number) => void;
  onView: (group: ApprovalGroup) => void;
  onEdit: (group: ApprovalGroup) => void;
  onDelete: (groupId: number) => void;
  isAssociated: boolean;
  checkingAssociation: boolean;
  index?: number;
}

export function ApprovalGroupTableRow({
  group,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  isAssociated,
  checkingAssociation,
  index = 0,
}: ApprovalGroupTableRowProps) {
  const handleView = () => {
    onView(group);
  };

  const handleEdit = () => {
    if (isAssociated) return;
    onEdit(group);
  };

  const handleDelete = () => {
    if (isAssociated) return;
    onDelete(group.id);
  };

  const getRuleTypeBadge = (ruleType: string) => {
    switch (ruleType) {
      case "All":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30 font-medium px-3 py-1 rounded-full transition-colors duration-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            All Must Approve
          </Badge>
        );
      case "Any":
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30 font-medium px-3 py-1 rounded-full transition-colors duration-200">
            <Clock className="w-3 h-3 mr-1" />
            Any Can Approve
          </Badge>
        );
      case "Sequential":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 font-medium px-3 py-1 rounded-full transition-colors duration-200">
            <Shield className="w-3 h-3 mr-1" />
            Sequential
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 hover:bg-gray-500/30 font-medium px-3 py-1 rounded-full transition-colors duration-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            {ruleType}
          </Badge>
        );
    }
  };

  const getStatusIndicator = () => {
    if (checkingAssociation) {
      return (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Checking...</span>
        </div>
      );
    }

    if (isAssociated) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <Link2 className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-blue-500 font-medium">Associated</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>This group is associated with workflow steps</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <div className="flex items-center justify-center">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      </div>
    );
  };

  const approverCount = group.approvers?.length || 0;

  return (
    <>
      <TableRow
        className={`border-slate-200/50 dark:border-slate-700/50 transition-all duration-200 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 cursor-pointer group ${isSelected
          ? "bg-blue-50/80 dark:bg-blue-900/20 border-l-4 border-l-blue-500 shadow-sm ring-1 ring-blue-200/50 dark:ring-blue-800/50"
          : "hover:shadow-sm"
          } ${isAssociated ? "bg-slate-50/50 dark:bg-slate-800/20" : ""}`}
        onClick={(e) => {
          // Don't trigger row selection if clicking on interactive elements or if group is associated
          const target = e.target as HTMLElement;
          if (
            target.closest('button') ||
            target.closest('input') ||
            target.closest('select') ||
            target.closest('[role="button"]') ||
            isAssociated
          ) {
            return;
          }
          onSelect(group.id);
        }}
      >
        <TableCell className="w-[48px] py-4">
          <div className="flex items-center justify-center">
            <ProfessionalCheckbox
              checked={isSelected}
              onCheckedChange={() => {
                if (!isAssociated) {
                  onSelect(group.id);
                }
              }}
              size="md"
              variant="row"
              disabled={isAssociated}
            />
          </div>
        </TableCell>

        <TableCell className="w-[48px] py-4">
          <div className="flex items-center justify-center">
            {getStatusIndicator()}
          </div>
        </TableCell>

        <TableCell className="w-[250px] py-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <UsersRound className="w-4 h-4 text-primary/60" />
              <span className="font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                {group.name}
              </span>
            </div>
            {group.stepTitle && (
              <span className="text-sm text-muted-foreground ml-6">
                Step: {group.stepTitle}
              </span>
            )}
          </div>
        </TableCell>

        <TableCell className="w-[180px] py-4">
          <div className="flex items-center">
            {getRuleTypeBadge(group.ruleType)}
          </div>
        </TableCell>

        <TableCell className="w-[200px] py-4">
          <div className="max-w-[180px]">
            {group.comment ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm text-muted-foreground truncate cursor-help">
                      {group.comment}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{group.comment}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <span className="text-sm text-muted-foreground italic">No comment</span>
            )}
          </div>
        </TableCell>

        <TableCell className="w-[120px] py-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <UsersRound className="w-4 h-4 text-primary/60" />
              <span className="font-medium text-foreground">
                {/* {approverCount} */}
              </span>
            </div>
            {approverCount > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="text-xs cursor-help bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                    >
                      {approverCount === 1 ? "1 user" : `${approverCount} users`}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-medium">Approvers:</p>
                      {group.approvers?.map((approver, idx) => (
                        <p key={idx} className="text-sm">
                          {approver.username}
                        </p>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </TableCell>

        <TableCell className="w-[80px] text-right pr-4 py-4">
          <div className="flex items-center justify-end">
            <ApprovalGroupActionsDropdown
              group={group}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isAssociated={isAssociated}
              checkingAssociation={checkingAssociation}
            />
          </div>
        </TableCell>
      </TableRow>
    </>
  );
} 