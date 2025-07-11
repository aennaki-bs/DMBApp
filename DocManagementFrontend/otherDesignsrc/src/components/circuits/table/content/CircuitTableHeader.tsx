import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  GitBranch,
  FileText,
  Activity,
} from "lucide-react";
import { SortField, SortDirection } from "../../hooks/useCircuitManagement";

interface CircuitTableHeaderProps {
  circuits: Circuit[];
  selectedCircuits: number[];
  onSelectAll: () => void;
  sortBy: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  isSimpleUser: boolean;
}

export function CircuitTableHeader({
  circuits,
  selectedCircuits,
  onSelectAll,
  sortBy,
  sortDirection,
  onSort,
  isSimpleUser,
}: CircuitTableHeaderProps) {
  const isAllSelected =
    circuits.length > 0 && selectedCircuits.length === circuits.length;
  const isIndeterminate =
    selectedCircuits.length > 0 && selectedCircuits.length < circuits.length;

  const renderSortIcon = (field: SortField) => {
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
    field: SortField,
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
      <TableRow className="border-border/20 hover:bg-muted/30 transition-colors duration-200 circuit-table-layout">
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

        {/* Circuit Column */}
        <TableHead className="py-3 table-cell-start">
          {getSortButton(
            "circuitKey",
            "Circuit",
            <GitBranch className="h-3.5 w-3.5" />
          )}
        </TableHead>

        {/* Title Column */}
        <TableHead className="py-3 table-cell-start max-md:hidden">
          {getSortButton("title", "Title")}
        </TableHead>

        {/* Type Column */}
        <TableHead className="py-3 table-cell-center">
          {getSortButton(
            "descriptif",
            "Type",
            <FileText className="h-3.5 w-3.5" />
          )}
        </TableHead>

        {/* Block Column */}
        <TableHead className="py-3 table-cell-center max-md:hidden">
          {getSortButton(
            "isActive",
            "Block",
            <Activity className="h-3.5 w-3.5" />
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
