import { TableRow, TableCell } from "@/components/ui/table";
import { DocumentType, TierType } from "@/models/document";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  AlertCircle,
  ChevronRight,
  Users,
  UserCheck,
  Package,
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

  // Helper function to render tier type with icon
  const renderTierType = (tierType?: TierType) => {
    switch (tierType) {
      case TierType.Customer:
        return (
          <div className="flex items-center gap-1.5 text-green-400">
            <UserCheck className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Customer</span>
          </div>
        );
      case TierType.Vendor:
        return (
          <div className="flex items-center gap-1.5 text-orange-400">
            <Package className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Vendor</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 text-gray-400">
            <Users className="h-3.5 w-3.5" />
            <span className="text-xs">None</span>
          </div>
        );
    }
  };

  return (
    <TableRow
      className={cn(
        "border-primary/10 hover:bg-primary/5 cursor-pointer group relative transition-colors",
        isSelected && "bg-primary/10"
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
      <TableCell className="font-mono text-xs text-muted-foreground">
        {type.typeKey || "No code"}
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {type.typeName || "Unnamed Type"}
          </span>
        </div>
      </TableCell>
      <TableCell className="max-w-xs">
        <span className="text-xs text-muted-foreground line-clamp-1">
          {type.typeAttr || "No description"}
        </span>
      </TableCell>
      <TableCell>{renderTierType(type.tierType)}</TableCell>
      <TableCell className="pl-6">
        <div className="flex items-center">
          <span className="text-foreground">{type.documentCounter || 0}</span>
        </div>
      </TableCell>
      <TableCell className="text-right actions-cell">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-primary hover:text-primary/80 hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/document-types/${type.id}/subtypes`);
            }}
          >
            View Series
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-primary/10"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-background/95 backdrop-blur-sm border-primary/20"
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEditType(type);
                }}
                className="cursor-pointer hover:bg-primary/10"
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
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative flex cursor-not-allowed items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors opacity-50">
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
