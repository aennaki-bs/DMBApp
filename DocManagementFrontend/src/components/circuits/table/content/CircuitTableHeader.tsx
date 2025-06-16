import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown } from "lucide-react";
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
    if (sortBy !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const headerClass = (field: SortField) => `
    cursor-pointer hover:bg-primary/10 transition-colors duration-200 
    text-left font-semibold text-primary/90 hover:text-primary
    ${sortBy === field ? "bg-primary/5" : ""}
  `;

  const isAllSelected =
    circuits.length > 0 &&
    circuits.every((circuit) => selectedCircuits.includes(circuit.id));

  return (
    <TableHeader className="bg-muted/20 backdrop-blur-sm">
      <TableRow className="table-glass-header-row">
        <TableHead className="w-[40px]">
          <div className="flex items-center justify-center">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
              className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </div>
        </TableHead>

        <TableHead
          className={`w-[280px] ${headerClass("circuitKey")}`}
          onClick={() => onSort("circuitKey")}
        >
          <div className="flex items-center gap-2">
            Circuit
            {renderSortIcon("circuitKey")}
          </div>
        </TableHead>

        <TableHead
          className={`w-[300px] ${headerClass("title")}`}
          onClick={() => onSort("title")}
        >
          <div className="flex items-center gap-2">
            Title
            {renderSortIcon("title")}
          </div>
        </TableHead>

        <TableHead
          className={`w-[140px] ${headerClass("descriptif")}`}
          onClick={() => onSort("descriptif")}
        >
          <div className="flex items-center gap-2">
            Type
            {renderSortIcon("descriptif")}
          </div>
        </TableHead>

        <TableHead
          className={`w-[100px] text-center ${headerClass("isActive")}`}
          onClick={() => onSort("isActive")}
        >
          <div className="flex items-center justify-center gap-2">
            Block
            {renderSortIcon("isActive")}
          </div>
        </TableHead>

        <TableHead className="w-[120px] text-right pr-3">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
