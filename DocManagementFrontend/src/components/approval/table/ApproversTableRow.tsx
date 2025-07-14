import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TableCell, TableRow } from "@/components/ui/table";
import { User, Link2 } from "lucide-react";
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

  const isAssociated = approver.allAssociations && approver.allAssociations.length > 0;

  const handleEdit = () => {
    if (isAssociated) return;
    console.log("Handling edit for approver:", approver);
    onEdit(approver);
  };

  const handleDelete = () => {
    if (isAssociated) return;
    console.log("Handling delete for approver:", approver);
    onDelete(approver.id);
  };

  return (
    <TableRow
      className={`border-slate-200/50 dark:border-slate-700/50 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer group ${isSelected
        ? "bg-blue-50/80 dark:bg-blue-900/20 border-l-2 border-l-blue-500 shadow-sm ring-1 ring-blue-200/50 dark:ring-blue-800/50"
        : "hover:shadow-sm"
        } ${isAssociated ? "bg-slate-50/50 dark:bg-slate-800/20 opacity-75 cursor-not-allowed" : ""}`}
      onClick={(e) => {
        // Don't trigger row selection if clicking on interactive elements or if approver is associated
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
        onSelect(approver.id);
      }}
    >
      <TableCell className="w-[48px]">
        <div className="flex items-center justify-center">
          <ProfessionalCheckbox
            checked={isSelected}
            onCheckedChange={() => {
              if (!isAssociated) {
                onSelect(approver.id);
              }
            }}
            size="md"
            variant="row"
            disabled={isAssociated}
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
          {isAssociated && (
            <div className="ml-2 flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-md">
              <Link2 className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Associated</span>
            </div>
          )}
        </div>
        {approver.stepTitle && (
          <div className="text-xs text-blue-600 dark:text-blue-400">
            Associated with: {approver.stepTitle}
          </div>
        )}
      </TableCell>
      <TableCell className="w-[400px]">
        <div className="flex items-center text-blue-800 dark:text-blue-200">
          {isAssociated && approver.stepTitle && (
            <>
              <Link2 className="h-4 w-4 mr-2 text-blue-400" />
              <span className="text-blue-200 text-sm">Associated with: {approver.stepTitle}</span>
            </>
          )}
        </div>
      </TableCell>
      <TableCell className="w-[80px] text-right">
        <ApprovalActionsDropdown
          item={approver}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isEditDisabled={isAssociated}
          isDeleteDisabled={isAssociated}
          disabledTooltip={isAssociated ? `This approver is currently associated with a document workflow` : ""}
        />
      </TableCell>
    </TableRow>
  );
} 