import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Eye,
  Edit,
  Trash,
  CircuitBoard,
  GitBranch,
} from "lucide-react";

interface CircuitActionsDropdownProps {
  circuit: Circuit;
  onEdit: () => void;
  onView: () => void;
  onViewStatuses: () => void;
  onDelete: () => void;
  isSimpleUser: boolean;
}

export function CircuitActionsDropdown({
  circuit,
  onEdit,
  onView,
  onViewStatuses,
  onDelete,
  isSimpleUser,
}: CircuitActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-accent/50 transition-all duration-200 opacity-70 hover:opacity-100 dropdown-trigger"
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[160px] bg-background/95 backdrop-blur-sm border-border/50 shadow-xl rounded-lg"
      >
        <DropdownMenuItem
          onClick={onView}
          className="hover:bg-accent/50 transition-colors duration-200 cursor-pointer"
        >
          <Eye className="h-4 w-4 mr-2 text-blue-500" />
          View Steps
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onViewStatuses}
          className="hover:bg-accent/50 transition-colors duration-200 cursor-pointer"
        >
          <CircuitBoard className="h-4 w-4 mr-2 text-purple-500" />
          View Statuses
        </DropdownMenuItem>
        {!isSimpleUser && (
          <>
            <DropdownMenuSeparator className="bg-border/30" />
            <DropdownMenuItem
              onClick={onEdit}
              className="hover:bg-accent/50 transition-colors duration-200 cursor-pointer"
            >
              <Edit className="h-4 w-4 mr-2 text-green-500" />
              Edit Circuit
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/30" />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive hover:bg-destructive/10 transition-colors duration-200 cursor-pointer"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
