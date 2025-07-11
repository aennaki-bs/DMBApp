import {
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  Eye,
  MoreVertical,
} from "lucide-react";
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
          size="sm"
          className="h-8 w-8 p-0 hover:bg-accent/50 transition-all duration-200 opacity-70 group-hover:opacity-100"
        >
          <span className="sr-only">Open menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-background/95 backdrop-blur-sm border-border/50 shadow-xl rounded-lg"
      >
        <DropdownMenuItem
          onClick={() => onViewDetails(centre)}
          className="cursor-pointer hover:bg-accent/50 transition-colors duration-200"
        >
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onAssociateUsers(centre)}
          className="cursor-pointer hover:bg-accent/50 transition-colors duration-200"
        >
          <Users className="mr-2 h-4 w-4" />
          Associate Users
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border/30" />
        <DropdownMenuItem
          onClick={() => onEdit(centre)}
          className="cursor-pointer hover:bg-accent/50 transition-colors duration-200"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border/30" />
        <DropdownMenuItem
          onClick={() => onDelete(centre)}
          className="text-destructive cursor-pointer hover:bg-destructive/10 transition-colors duration-200"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
