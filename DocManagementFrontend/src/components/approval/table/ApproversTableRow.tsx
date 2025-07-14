import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TableCell, TableRow } from "@/components/ui/table";
import { User, MessageSquare } from "lucide-react";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";
import { ApprovalActionsDropdown } from "@/components/approval/ApprovalActionsDropdown";

interface Approver {
  id: number;
  userId: number;
  username: string;
  comment?: string;
  stepId?: number;
  stepTitle?: string;
  allAssociations?: { stepId: number; stepTitle: string }[];
}

interface ApproversTableRowProps {
  approver: Approver;
  isSelected: boolean;
  onSelect: (approverId: number) => void;
  onEdit: (approver: Approver) => void;
  onDelete: (approverId: number) => void;
  index?: number;
}

export function ApproversTableRow({
  approver,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  index = 0,
}: ApproversTableRowProps) {

  const handleEdit = () => {
    console.log("Handling edit for approver:", approver);
    onEdit(approver);
  };

  const handleDelete = () => {
    console.log("Handling delete for approver:", approver);
    onDelete(approver.id);
  };

  return (
    <TableRow
      className={`border-slate-200/50 dark:border-slate-700/50 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer group ${isSelected
        ? "bg-blue-50/80 dark:bg-blue-900/20 border-l-2 border-l-blue-500 shadow-sm ring-1 ring-blue-200/50 dark:ring-blue-800/50"
        : "hover:shadow-sm"
        }`}
      onClick={(e) => {
        // Don't trigger row selection if clicking on interactive elements
        const target = e.target as HTMLElement;
        if (
          target.closest('button') ||
          target.closest('input') ||
          target.closest('select') ||
          target.closest('[role="button"]')
        ) {
          return;
        }
        onSelect(approver.id);
      }}
    >
      <TableCell className="w-[48px]">
        <div className="flex items-center justify-center">
          <ProfessionalCheckbox
            checked={isSelected}
            onCheckedChange={() => onSelect(approver.id)}
            size="md"
            variant="row"
          />
        </div>
      </TableCell>
      <TableCell className="w-[48px]">
        <Avatar className="border-2 border-blue-300 dark:border-blue-900/50 h-9 w-9">
          <AvatarImage src={undefined} alt={approver.username} />
          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </TableCell>
      <TableCell className="w-[300px]">
        <div className="font-medium text-blue-900 dark:text-blue-100 flex items-center">
          <User className="h-4 w-4 mr-2 text-blue-400" />
          {approver.username}
        </div>
        {approver.stepTitle && (
          <div className="text-xs text-blue-600 dark:text-blue-400">
            Associated with: {approver.stepTitle}
          </div>
        )}
      </TableCell>
      <TableCell className="w-[400px]">
        <div className="flex items-center text-blue-800 dark:text-blue-200">
          <MessageSquare className="h-4 w-4 mr-2 text-blue-400/70" />
          {approver.comment ? (
            <span className="text-blue-200">{approver.comment}</span>
          ) : (
            <span className="text-blue-300/50 text-sm italic">No comment</span>
          )}
        </div>
      </TableCell>
      <TableCell className="w-[80px] text-right">
        <ApprovalActionsDropdown
          item={approver}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isEditDisabled={!!approver.stepId}
          isDeleteDisabled={!!approver.stepId}
          disabledTooltip={approver.stepId ? `This approver is currently associated with step: ${approver.stepTitle}` : ""}
        />
      </TableCell>
    </TableRow>
  );
} 