import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { DocumentType } from "@/models/document";
import { DocumentTypeActionsDropdown } from "./DocumentTypeActionsDropdown";
import { FileText, Hash, AlignLeft, Layers, Files } from "lucide-react";

interface DocumentTypeTableRowProps {
  type: DocumentType | undefined;
  isSelected: boolean;
  onSelect: (id: number, checked: boolean) => void;
  onEdit: (type: DocumentType) => void;
  onDelete: (id: number) => void;
}

export function DocumentTypeTableRow({
  type,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: DocumentTypeTableRowProps) {
  // Safety check: if type is undefined, return null
  if (!type) {
    return null;
  }

  const canSelect = (type.documentCounter || 0) === 0;

  const handleRowClick = (event: React.MouseEvent) => {
    // Don't trigger row selection if clicking on action buttons or links
    const target = event.target as HTMLElement;
    const isActionElement = target.closest(
      'button, a, [role="button"], .dropdown-trigger'
    );

    if (!isActionElement && canSelect) {
      onSelect(type.id!, !isSelected);
    }
  };

  const handleSelectChange = (checked: boolean) => {
    if (canSelect) {
      onSelect(type.id!, checked);
    }
  };

  const getTierTypeColor = (tierType: string | undefined) => {
    switch (String(tierType || "").toLowerCase()) {
      case "primary":
        return "bg-blue-500/30 text-blue-400 border-blue-500/40";
      case "secondary":
        return "bg-green-500/30 text-green-400 border-green-500/40";
      case "tertiary":
        return "bg-purple-500/30 text-purple-400 border-purple-500/40";
      default:
        return "bg-gray-500/30 text-gray-400 border-gray-500/40";
    }
  };

  return (
    <TableRow
      className={`document-types-table-layout transition-all duration-200 cursor-pointer select-none ${
        isSelected
          ? "bg-primary/10 border-primary/30 shadow-sm"
          : "hover:bg-muted/30"
      }`}
      onClick={handleRowClick}
    >
      {/* Selection Column */}
      <TableCell className="py-4 table-cell-center">
        <Checkbox
          enhanced={true}
          size="sm"
          checked={isSelected}
          onCheckedChange={handleSelectChange}
          disabled={!canSelect}
          className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
        />
      </TableCell>

      {/* Type Code Column */}
      <TableCell className="py-4 table-cell-start">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="flex-shrink-0">
            <div
              className={`h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center transition-all duration-200 ${
                isSelected
                  ? "from-primary/30 to-primary/20 border-primary/40 shadow-sm"
                  : ""
              }`}
            >
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div
              className={`text-sm font-medium truncate transition-colors duration-200 ${
                isSelected ? "text-primary" : "text-foreground"
              }`}
            >
              {type.typeKey || "N/A"}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              ID: {type.id}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Type Name Column */}
      <TableCell className="py-4 table-cell-start">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm truncate max-w-[180px]">
            {type.typeName || "Unnamed Type"}
          </span>
        </div>
      </TableCell>

      {/* Description Column */}
      <TableCell className="py-4 table-cell-start max-md:hidden">
        <div className="flex items-center gap-2">
          <AlignLeft className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          {type.typeAttr ? (
            <span className="text-sm truncate max-w-[250px]">
              {type.typeAttr}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground italic">
              No description
            </span>
          )}
        </div>
      </TableCell>

      {/* Tier Type Column */}
      <TableCell className="py-4 table-cell-center">
        <Badge
          variant="secondary"
          className={`text-xs px-2 py-1 transition-colors duration-200 capitalize ${
            isSelected
              ? getTierTypeColor(String(type.tierType || ""))
              : getTierTypeColor(String(type.tierType || ""))
                  .replace("/30", "/20")
                  .replace("/40", "/30")
          }`}
        >
          <Layers className="h-3 w-3 mr-1" />
          {type.tierType || "Unknown"}
        </Badge>
      </TableCell>

      {/* Documents Column */}
      <TableCell className="py-4 table-cell-center max-md:hidden">
        <Badge
          variant="secondary"
          className={`text-xs px-2 py-1 transition-colors duration-200 ${
            isSelected
              ? "bg-green-500/30 text-green-400 border-green-500/40"
              : "bg-green-500/20 text-green-400 border-green-500/30"
          }`}
        >
          <Files className="h-3 w-3 mr-1" />
          {type.documentCounter || 0}
        </Badge>
      </TableCell>

      {/* Actions Column */}
      <TableCell className="py-4 table-cell-center">
        <DocumentTypeActionsDropdown
          type={type}
          onEdit={() => onEdit(type)}
          onDelete={() => onDelete(type.id!)}
          canDelete={canSelect}
        />
      </TableCell>
    </TableRow>
  );
}
