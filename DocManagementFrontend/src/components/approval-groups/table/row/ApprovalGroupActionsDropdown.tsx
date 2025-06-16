import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApprovalGroup } from "@/models/approval";

interface ApprovalGroupActionsDropdownProps {
  group: ApprovalGroup;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ApprovalGroupActionsDropdown({
  group,
  onView,
  onEdit,
  onDelete,
}: ApprovalGroupActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 table-action-button opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="table-dropdown w-48">
        <DropdownMenuItem
          onClick={onView}
          className="table-dropdown-item flex items-center gap-2 cursor-pointer"
        >
          <Eye className="h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onEdit}
          className="table-dropdown-item flex items-center gap-2 cursor-pointer"
        >
          <Edit className="h-4 w-4" />
          Edit Group
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDelete}
          className="table-dropdown-item text-red-400 hover:text-red-300 hover:bg-red-900/20 flex items-center gap-2 cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          Delete Group
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
