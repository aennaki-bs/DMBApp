import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DocumentType } from "@/models/document";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";

interface DocumentTypeActionsDropdownProps {
  type: DocumentType;
  onEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

export function DocumentTypeActionsDropdown({
  type,
  onEdit,
  onDelete,
  canDelete,
}: DocumentTypeActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 table-glass-action-button hover:table-glass-action-button-hover"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="table-glass-dropdown rounded-lg shadow-xl"
      >
        <DropdownMenuItem
          onClick={onEdit}
          className="table-glass-dropdown-item hover:table-glass-dropdown-item-hover rounded-md"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Type
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {}}
          className="table-glass-dropdown-item hover:table-glass-dropdown-item-hover rounded-md"
        >
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        {canDelete && (
          <DropdownMenuItem
            onClick={onDelete}
            className="table-glass-dropdown-item table-glass-dropdown-item-destructive hover:table-glass-dropdown-item-destructive rounded-md"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Type
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
