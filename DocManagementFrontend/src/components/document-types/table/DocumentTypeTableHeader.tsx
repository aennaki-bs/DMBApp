import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  Hash,
  AlignLeft,
  Layers,
  Files,
} from "lucide-react";
import { DocumentType } from "@/models/document";

interface DocumentTypeTableHeaderProps {
  types: DocumentType[];
  selectedTypes: number[];
  onSelectAll: () => void;
  sortBy: string;
  sortDirection: string;
  onSort: (field: string) => void;
}

export function DocumentTypeTableHeader({
  types,
  selectedTypes,
  onSelectAll,
  sortBy,
  sortDirection,
  onSort,
}: DocumentTypeTableHeaderProps) {
  // Only count types that can be selected (no documents)
  const eligibleTypes = types.filter(
    (type) => (type.documentCounter || 0) === 0
  );
  const isAllEligibleSelected =
    eligibleTypes.length > 0 &&
    eligibleTypes.every((type) => selectedTypes.includes(type.id!));
  const isIndeterminate = selectedTypes.length > 0 && !isAllEligibleSelected;

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 text-primary" />
    );
  };

  const getSortButton = (
    field: string,
    label: string,
    icon?: React.ReactNode
  ) => (
    <button
      className="h-8 px-2 -ml-2 text-xs font-medium hover:bg-accent/50 flex items-center gap-1 rounded-md transition-all duration-200 hover:shadow-sm"
      onClick={() => onSort(field)}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {label}
      {renderSortIcon(field)}
    </button>
  );

  return (
    <TableHeader className="sticky top-0 z-10">
      <TableRow className="border-border/20 hover:bg-muted/30 transition-colors duration-200 document-types-table-layout">
        {/* Checkbox Column */}
        <TableHead className="py-3 table-cell-center">
          <Checkbox
            enhanced={true}
            size="sm"
            checked={isAllEligibleSelected}
            onCheckedChange={onSelectAll}
            disabled={eligibleTypes.length === 0}
            aria-label="Select all eligible document types"
            className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            ref={(el) => {
              if (el && el.querySelector) {
                const input = el.querySelector(
                  'input[type="checkbox"]'
                ) as HTMLInputElement;
                if (input) input.indeterminate = isIndeterminate;
              }
            }}
          />
        </TableHead>

        {/* Type Code Column */}
        <TableHead className="py-3 table-cell-start">
          {getSortButton(
            "typeKey",
            "Type Code",
            <Hash className="h-3.5 w-3.5" />
          )}
        </TableHead>

        {/* Type Name Column */}
        <TableHead className="py-3 table-cell-start">
          {getSortButton(
            "typeName",
            "Type Name",
            <FileText className="h-3.5 w-3.5" />
          )}
        </TableHead>

        {/* Description Column */}
        <TableHead className="py-3 table-cell-start max-md:hidden">
          {getSortButton(
            "typeAttr",
            "Description",
            <AlignLeft className="h-3.5 w-3.5" />
          )}
        </TableHead>

        {/* Tier Type Column */}
        <TableHead className="py-3 table-cell-center">
          {getSortButton(
            "tierType",
            "Tier Type",
            <Layers className="h-3.5 w-3.5" />
          )}
        </TableHead>

        {/* Documents Column */}
        <TableHead className="py-3 table-cell-center max-md:hidden">
          {getSortButton(
            "documentCounter",
            "Documents",
            <Files className="h-3.5 w-3.5" />
          )}
        </TableHead>

        {/* Actions Column */}
        <TableHead className="py-3 table-cell-center">
          <span className="text-xs font-medium text-muted-foreground">
            Actions
          </span>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
