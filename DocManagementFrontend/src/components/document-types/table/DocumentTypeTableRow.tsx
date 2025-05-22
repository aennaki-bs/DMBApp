import { TableRow, TableCell } from "@/components/ui/table";
import { DocumentType } from "@/models/document";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DocumentTypeTableRowProps {
  type: DocumentType;
  isSelected: boolean;
  onSelectType: (id: number, checked: boolean) => void;
  onDeleteType: (id: number) => void;
  onEditType: (type: DocumentType) => void;
}

export const DocumentTypeTableRow = ({
  type,
  isSelected,
  onSelectType,
  onDeleteType,
  onEditType,
}: DocumentTypeTableRowProps) => {
  const isEligibleForSelection = type.documentCounter === 0;
  const navigate = useNavigate();

  // Handle row click to navigate to subtypes page
  const handleRowClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on checkbox, actions, or if text is selected
    if (
      (e.target as HTMLElement).closest(".checkbox-cell") ||
      (e.target as HTMLElement).closest(".actions-cell") ||
      window.getSelection()?.toString()
    ) {
      return;
    }

    navigate(`/document-types/${type.id}/subtypes`);
  };

  return (
    <TableRow
      className={cn(
        "border-blue-900/20 hover:bg-blue-900/20 cursor-pointer group relative",
        isSelected && "bg-blue-900/30"
      )}
      onClick={handleRowClick}
    >
      <TableCell className="checkbox-cell">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelectType(type.id!, !!checked)}
          disabled={!isEligibleForSelection}
          className="translate-y-[2px]"
        />
      </TableCell>
      <TableCell className="font-mono text-xs text-blue-300">
        {type.typeKey || "No code"}
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium text-blue-100">
            {type.typeName || "Unnamed Type"}
          </span>
        </div>
      </TableCell>
      <TableCell className="max-w-xs">
        <span className="text-xs text-blue-400 line-clamp-1">
          {type.typeAttr || "No description"}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <span className="text-blue-200">{type.documentCounter || 0}</span>
        </div>
      </TableCell>
      <TableCell className="text-right actions-cell">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/document-types/${type.id}/subtypes`);
            }}
          >
            View Subtypes
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-[#1e2a4a] border border-blue-900/40"
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEditType(type);
                }}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>

              {isEligibleForSelection ? (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteType(type.id!);
                  }}
                  className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative flex cursor-not-allowed items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                        <AlertCircle className="ml-2 h-3 w-3" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cannot delete type with associated documents</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};
