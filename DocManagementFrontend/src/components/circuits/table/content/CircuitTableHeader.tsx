import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
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
  const renderSortIcon = (field: SortField) => {
    return <ArrowUpDown className="ml-1 h-3 w-3" />;
  };

  const getSortButton = (field: SortField, label: string) => (
    <button
      className="h-8 px-2 -ml-2 text-xs font-medium hover:bg-accent/50 flex items-center gap-1 rounded transition-colors"
      onClick={() => onSort(field)}
    >
      {label}
      {renderSortIcon(field)}
    </button>
  );

  const isAllSelected =
    circuits.length > 0 &&
    circuits.every((circuit) => selectedCircuits.includes(circuit.id));

  return (
    <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
      <TableRow className="border-border hover:bg-muted/50">
        <TableHead className="w-[40px]">
          <div className="flex items-center justify-center">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
              className="border-border"
            />
          </div>
        </TableHead>

        <TableHead className="min-w-[280px]">
          {getSortButton("circuitKey", "Circuit")}
        </TableHead>

        <TableHead className="min-w-[300px]">
          {getSortButton("title", "Title")}
        </TableHead>

        <TableHead className="min-w-[140px]">
          {getSortButton("descriptif", "Type")}
        </TableHead>

        <TableHead className="w-24 text-center">
          {getSortButton("isActive", "Block")}
        </TableHead>

        <TableHead className="w-20 text-center">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
