import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResponsibilityCentre } from "@/models/responsibilityCentre";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ResponsibilityCentreActionsDropdownProps {
  centre: ResponsibilityCentre;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onViewDetails: () => void;
  onAssociateUsers: () => void;
  onRemoveUsers?: () => void;
  userCount?: number;
}

export function ResponsibilityCentreActionsDropdown({
  centre,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewDetails,
  onAssociateUsers,
  onRemoveUsers,
  userCount = 0,
}: ResponsibilityCentreActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
          className="cursor-pointer"
        >
          <Eye className="mr-2 h-4 w-4 text-blue-500" />
          <span>View Details</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Disabled Update Centre action */}
        <DropdownMenuItem
          disabled
          className="cursor-not-allowed opacity-50"
        >
          <Edit className="mr-2 h-4 w-4 text-green-600" />
          <span>Update Centre</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onAssociateUsers();
          }}
          className="cursor-pointer"
        >
          <UserPlus className="mr-2 h-4 w-4 text-blue-600" />
          <span>Associate Users</span>
        </DropdownMenuItem>

        {onRemoveUsers && userCount > 0 && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onRemoveUsers();
            }}
            className="cursor-pointer"
          >
            <UserMinus className="mr-2 h-4 w-4 text-orange-600" />
            <span>Remove Users ({userCount})</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Disabled Delete action */}
        <DropdownMenuItem
          disabled
          className="cursor-not-allowed opacity-50 text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 