import { ArrowUpDown, Tag, FileText, Info, Hash } from "lucide-react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface DocumentTypeTableHeaderProps {
  onSelectAll: (checked: boolean) => void;
  areAllEligibleSelected: boolean;
  hasEligibleTypes: boolean;
  onSort: (field: string) => void;
  sortField: string | null;
  sortDirection: "asc" | "desc";
}

export const DocumentTypeTableHeader = ({
  onSelectAll,
  areAllEligibleSelected,
  hasEligibleTypes,
  onSort,
  sortField,
  sortDirection,
}: DocumentTypeTableHeaderProps) => {
  const renderSortableHeader = (
    label: string,
    field: string,
    icon: React.ReactNode
  ) => (
    <div
      className="flex items-center gap-1 cursor-pointer select-none"
      onClick={() => onSort(field)}
    >
      {icon}
      {label}
      <div className="ml-1 w-4 text-center">
        {sortField === field ? (
          <ArrowUpDown
            className="h-3 w-3"
            style={{
              transform:
                sortDirection === "asc" ? "rotate(0deg)" : "rotate(180deg)",
              opacity: 1,
            }}
          />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </div>
    </div>
  );

  return (
    <TableHeader className="bg-blue-900/20 sticky top-0 z-10">
      <TableRow className="border-blue-900/50 hover:bg-blue-900/30">
        <TableHead className="w-12 text-blue-300">
          <Checkbox
            checked={areAllEligibleSelected && hasEligibleTypes}
            onCheckedChange={onSelectAll}
            disabled={!hasEligibleTypes}
            aria-label="Select all types"
            className="border-blue-500/50"
          />
        </TableHead>
        <TableHead className="text-blue-300">
          {renderSortableHeader(
            "Type Code",
            "typeKey",
            <Tag className="h-4 w-4" />
          )}
        </TableHead>
        <TableHead className="text-blue-300">
          {renderSortableHeader(
            "Type Name",
            "typeName",
            <FileText className="h-4 w-4" />
          )}
        </TableHead>
        <TableHead className="text-blue-300">
          {renderSortableHeader(
            "Description",
            "typeAttr",
            <Info className="h-4 w-4" />
          )}
        </TableHead>
        <TableHead className="text-blue-300">
          {renderSortableHeader(
            "Document Count",
            "documentCounter",
            <Hash className="h-4 w-4" />
          )}
        </TableHead>
        <TableHead className="text-blue-300 text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
