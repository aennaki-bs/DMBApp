import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApprovalGroup } from "@/models/approval";
import { Edit, Eye, MoreVertical, Trash, UsersRound } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ApprovalGroupActionsDropdownProps {
  group: ApprovalGroup;
  onView: (group: ApprovalGroup) => void;
  onEdit: (group: ApprovalGroup) => void;
  onDelete: (groupId: number) => void;
  isAssociated: boolean;
  checkingAssociation: boolean;
}

export function ApprovalGroupActionsDropdown({
  group,
  onView,
  onEdit,
  onDelete,
  isAssociated,
  checkingAssociation,
}: ApprovalGroupActionsDropdownProps) {
  const handleView = () => onView(group);
  const handleEdit = () => !isAssociated && onEdit(group);
  const handleDelete = () => !isAssociated && onDelete(group.id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-200"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-white dark:bg-gradient-to-b dark:from-[#1a2c6b] dark:to-[#0a1033] border border-blue-300 dark:border-blue-500/30 text-blue-900 dark:text-blue-100 rounded-lg shadow-lg p-1.5 animate-in fade-in-0 zoom-in-95 duration-100"
      >
        <DropdownMenuLabel className="flex items-center gap-2 text-blue-800 dark:text-blue-200 px-3 py-2">
          <UsersRound className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Group Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-blue-300 dark:bg-blue-800/40 my-1" />
        
        <DropdownMenuItem
          onClick={handleView}
          className="flex items-center gap-2 px-3 py-2 text-blue-800 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-900 dark:hover:text-blue-100 transition-colors cursor-pointer rounded-md mx-1"
        >
          <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          View Details
        </DropdownMenuItem>

        {isAssociated ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  disabled
                  className="flex items-center gap-2 px-3 py-2 text-gray-500 dark:text-gray-400 opacity-50 rounded-md mx-1"
                >
                  <Edit className="h-4 w-4" />
                  Edit Group
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cannot edit a group that is associated with workflow steps</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <DropdownMenuItem
            onClick={handleEdit}
            className="flex items-center gap-2 px-3 py-2 text-blue-800 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-900 dark:hover:text-blue-100 transition-colors cursor-pointer rounded-md mx-1"
          >
            <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Edit Group
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="bg-blue-300 dark:bg-blue-800/40 my-1" />

        {isAssociated ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  disabled
                  className="flex items-center gap-2 px-3 py-2 text-gray-500 dark:text-gray-400 opacity-50 rounded-md mx-1"
                >
                  <Trash className="h-4 w-4" />
                  Delete Group
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cannot delete a group that is associated with workflow steps</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <DropdownMenuItem
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-800 dark:hover:text-red-200 transition-colors cursor-pointer rounded-md mx-1"
          >
            <Trash className="h-4 w-4 text-red-600 dark:text-red-400" />
            Delete Group
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 