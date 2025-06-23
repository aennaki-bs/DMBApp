import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  Tag,
  Activity,
  CalendarDays,
  User,
} from "lucide-react";

interface DocumentTableHeaderProps {
  documents: any[];
  selectedDocuments: number[];
  onSelectAll: () => void;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (field: string) => void;
  isSimpleUser: boolean;
}

export function DocumentTableHeader({
  documents,
  selectedDocuments,
  onSelectAll,
  sortBy = "",
  sortDirection = "asc",
  onSort,
  isSimpleUser,
}: DocumentTableHeaderProps) {
  const isAllSelected =
    documents.length > 0 && selectedDocuments.length === documents.length;
  const isIndeterminate =
    selectedDocuments.length > 0 && selectedDocuments.length < documents.length;

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
      onClick={() => onSort?.(field)}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {label}
      {renderSortIcon(field)}
    </button>
  );

  return (
    <TableHeader className="sticky top-0 z-10">
      <TableRow className="border-border/20 hover:bg-muted/30 transition-colors duration-200 documents-table-layout">
        {/* Checkbox Column */}
        <TableHead className="py-3 table-cell-center">
          <Checkbox
            enhanced={true}
            size="sm"
            checked={isAllSelected}
            onCheckedChange={onSelectAll}
            aria-label="Select all"
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

        {/* Document Code Column */}
        <TableHead className="py-3 table-cell-start">
          {getSortButton(
            "documentKey",
            "Document",
            <Tag className="h-3.5 w-3.5" />
          )}
        </TableHead>

        {/* Title Column */}
        <TableHead className="py-3 table-cell-start max-md:hidden">
          {getSortButton(
            "title",
            "Title",
            <FileText className="h-3.5 w-3.5" />
          )}
        </TableHead>

        {/* Status Column */}
        <TableHead className="py-3 table-cell-center">
          {getSortButton(
            "status",
            "Status",
            <Activity className="h-3.5 w-3.5" />
          )}
        </TableHead>

        {/* Type Column */}
        <TableHead className="py-3 table-cell-center max-md:hidden">
          {getSortButton("type", "Type", <FileText className="h-3.5 w-3.5" />)}
        </TableHead>

        {/* Date Column */}
        <TableHead className="py-3 table-cell-center max-md:hidden">
          {getSortButton(
            "docDate",
            "Date",
            <CalendarDays className="h-3.5 w-3.5" />
          )}
        </TableHead>

        {/* Creator Column */}
        <TableHead className="py-3 table-cell-center">
          {getSortButton(
            "createdBy",
            "Creator",
            <User className="h-3.5 w-3.5" />
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
