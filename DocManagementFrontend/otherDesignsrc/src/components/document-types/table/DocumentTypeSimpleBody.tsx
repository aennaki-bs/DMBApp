import { DocumentType } from "@/models/document";
import { Checkbox } from "@/components/ui/checkbox";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, FileText, Edit, Trash2, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DocumentTypeSimpleBodyProps {
  types: DocumentType[];
  selectedTypes: number[];
  onSelectType: (id: number, checked: boolean) => void;
  onEdit: (type: DocumentType) => void;
  onDelete: (id: number) => void;
}

export function DocumentTypeSimpleBody({
  types,
  selectedTypes,
  onSelectType,
  onEdit,
  onDelete,
}: DocumentTypeSimpleBodyProps) {
  const getTierTypeColor = (tierType: string) => {
    switch (tierType?.toLowerCase()) {
      case "primary":
        return "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20";
      case "secondary":
        return "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20";
      case "tertiary":
        return "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20 border-gray-500/20";
    }
  };

  return (
    <TableBody>
      {types.map((type, index) => {
        const isSelected = selectedTypes.includes(type.id!);
        const canSelect = (type.documentCounter || 0) === 0;
        const isEvenRow = index % 2 === 0;

        return (
          <TableRow
            key={type.id || index}
            className={`
              cursor-pointer table-glass-row hover:table-glass-row-hover
              ${isSelected ? "table-glass-row-selected" : ""}
              ${isEvenRow ? "table-glass-row-even" : "table-glass-row-odd"}
              transition-all duration-150 border-b border-border/5
            `}
            onClick={() => {
              if (canSelect) {
                onSelectType(type.id!, !isSelected);
              }
            }}
          >
            {/* Checkbox */}
            <TableCell className="w-[60px] text-center">
              <div className="flex items-center justify-center">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked: boolean) => {
                    if (canSelect) {
                      onSelectType(type.id!, checked);
                    }
                  }}
                  disabled={!canSelect}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </TableCell>

            {/* Type Code with Icon */}
            <TableCell className="w-[120px]">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg table-glass-avatar flex items-center justify-center shadow-sm">
                    <FileText className="h-4 w-4 table-glass-avatar-icon" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm table-glass-text truncate">
                    {type.typeKey || "N/A"}
                  </p>
                </div>
              </div>
            </TableCell>

            {/* Type Name */}
            <TableCell className="w-[200px]">
              <div className="font-medium text-sm table-glass-text truncate">
                {type.typeName || "Unnamed Type"}
              </div>
            </TableCell>

            {/* Description */}
            <TableCell className="w-[300px]">
              <div className="text-sm table-glass-text-muted truncate">
                {type.typeAttr || "No description"}
              </div>
            </TableCell>

            {/* Tier Type */}
            <TableCell className="w-[120px] text-center">
              <Badge
                variant="outline"
                className={`text-xs font-medium capitalize ${getTierTypeColor(
                  String(type.tierType || "")
                )}`}
              >
                {type.tierType || "Unknown"}
              </Badge>
            </TableCell>

            {/* Documents Count */}
            <TableCell className="w-[100px] text-center">
              <Badge
                variant="outline"
                className="text-xs font-medium bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20"
              >
                {type.documentCounter || 0}
              </Badge>
            </TableCell>

            {/* Actions */}
            <TableCell
              className="w-[80px] text-center"
              onClick={(e) => e.stopPropagation()}
            >
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
                    onClick={() => onEdit(type)}
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
                  {canSelect && (
                    <DropdownMenuItem
                      onClick={() => onDelete(type.id!)}
                      className="table-glass-dropdown-item table-glass-dropdown-item-destructive hover:table-glass-dropdown-item-destructive rounded-md"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Type
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  );
}
