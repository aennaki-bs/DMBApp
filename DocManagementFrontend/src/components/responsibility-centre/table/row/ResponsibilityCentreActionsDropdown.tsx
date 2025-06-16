import { MoreHorizontal, Edit, Trash2, Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResponsibilityCentre } from "@/models/responsibilityCentre";
import { useTranslation } from "@/hooks/useTranslation";

interface ResponsibilityCentreActionsDropdownProps {
  centre: ResponsibilityCentre;
  onEdit: (centre: ResponsibilityCentre) => void;
  onDelete: (centre: ResponsibilityCentre) => void;
  onAssociateUsers: (centre: ResponsibilityCentre) => void;
  onViewDetails: (centre: ResponsibilityCentre) => void;
}

export function ResponsibilityCentreActionsDropdown({
  centre,
  onEdit,
  onDelete,
  onAssociateUsers,
  onViewDetails,
}: ResponsibilityCentreActionsDropdownProps) {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-6 w-6 p-0 hover:bg-muted/50 focus:bg-muted/50 transition-colors"
          size="sm"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => onViewDetails(centre)}
          className="cursor-pointer"
        >
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onAssociateUsers(centre)}
          className="cursor-pointer"
        >
          <Users className="mr-2 h-4 w-4" />
          Associate Users
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onEdit(centre)}
          className="cursor-pointer"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(centre)}
          className="text-destructive cursor-pointer"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
