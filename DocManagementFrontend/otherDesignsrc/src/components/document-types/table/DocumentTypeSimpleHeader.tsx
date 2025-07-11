import { DocumentType } from "@/models/document";
import { Checkbox } from "@/components/ui/checkbox";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface DocumentTypeSimpleHeaderProps {
  types: DocumentType[];
  selectedTypes: number[];
  onSelectAll: () => void;
  sortBy: string;
  sortDirection: string;
  onSort: (field: string) => void;
}

export function DocumentTypeSimpleHeader({
  types,
  selectedTypes,
  onSelectAll,
  sortBy,
  sortDirection,
  onSort,
}: DocumentTypeSimpleHeaderProps) {
  // Only count types that can be selected (no documents)
  const eligibleTypes = types.filter(
    (type) => (type.documentCounter || 0) === 0
  );
  const isAllEligibleSelected =
    eligibleTypes.length > 0 &&
    eligibleTypes.every((type) => selectedTypes.includes(type.id!));
  const isIndeterminate = selectedTypes.length > 0 && !isAllEligibleSelected;

  const getSortIcon = (field: string) => {
    if (sortBy === field) {
      return sortDirection === "asc" ? (
        <ArrowUp className="ml-1 h-3 w-3" />
      ) : (
        <ArrowDown className="ml-1 h-3 w-3" />
      );
    }
    return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
  };

  return (
    <TableHeader className="sticky top-0 z-20">
      <TableRow className="table-glass-header-row hover:table-glass-header-row border-b border-border/10">
        {/* Checkbox Column - 60px */}
        <TableHead className="w-[60px] text-center relative">
          <div className="flex items-center justify-center">
            <Checkbox
              checked={isAllEligibleSelected}
              ref={(el) => {
                if (el) {
                  (el as any).indeterminate = isIndeterminate;
                }
              }}
              onCheckedChange={onSelectAll}
              disabled={eligibleTypes.length === 0}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              aria-label="Select all eligible document types"
            />
          </div>
        </TableHead>

        {/* Type Code Column - 120px */}
        <TableHead className="w-[120px]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSort("typeKey")}
            className="h-auto p-0 font-medium table-glass-header-text hover:table-glass-header-text-hover transition-colors"
          >
            Type Code
            {getSortIcon("typeKey")}
          </Button>
        </TableHead>

        {/* Type Name Column - 200px */}
        <TableHead className="w-[200px]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSort("typeName")}
            className="h-auto p-0 font-medium table-glass-header-text hover:table-glass-header-text-hover transition-colors"
          >
            Type Name
            {getSortIcon("typeName")}
          </Button>
        </TableHead>

        {/* Description Column - 300px */}
        <TableHead className="w-[300px]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSort("typeAttr")}
            className="h-auto p-0 font-medium table-glass-header-text hover:table-glass-header-text-hover transition-colors"
          >
            Description
            {getSortIcon("typeAttr")}
          </Button>
        </TableHead>

        {/* Tier Type Column - 120px */}
        <TableHead className="w-[120px] text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSort("tierType")}
            className="h-auto p-0 font-medium table-glass-header-text hover:table-glass-header-text-hover transition-colors"
          >
            Tier Type
            {getSortIcon("tierType")}
          </Button>
        </TableHead>

        {/* Documents Column - 100px */}
        <TableHead className="w-[100px] text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSort("documentCounter")}
            className="h-auto p-0 font-medium table-glass-header-text hover:table-glass-header-text-hover transition-colors"
          >
            Documents
            {getSortIcon("documentCounter")}
          </Button>
        </TableHead>

        {/* Actions Column - 80px */}
        <TableHead className="w-[80px] text-center">
          <span className="font-medium table-glass-header-text">Actions</span>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
