import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";

interface LocationsTableHeaderProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  sortBy: string;
  sortDirection: string;
  onSort: (field: string) => void;
}

export function LocationsTableHeader({
  selectedCount,
  totalCount,
  onSelectAll,
  sortBy,
  sortDirection,
  onSort,
}: LocationsTableHeaderProps) {
  const headerClass = (field: string) => {
    return cn(
      "text-foreground font-medium hover:text-primary transition-colors cursor-pointer select-none",
      sortBy === field ? "text-primary" : ""
    );
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 opacity-50 ml-1" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 text-primary ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 text-primary ml-1" />
    );
  };

  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

  return (
    <TableHeader>
      <TableRow className="border-slate-200/50 dark:border-slate-700/50 hover:bg-transparent">
        {/* Selection Column */}
        <TableHead className="w-[48px]">
          <div className="flex items-center justify-center">
            <ProfessionalCheckbox
              checked={isAllSelected}
              indeterminate={isPartiallySelected}
              onCheckedChange={onSelectAll}
              size="md"
              variant="header"
              className="shadow-lg"
            />
          </div>
        </TableHead>

        {/* Location Code Column */}
        <TableHead
          className={`${headerClass("locationCode")} w-[200px]`}
          onClick={() => onSort("locationCode")}
        >
          <div className="flex items-center">
            Location Code {renderSortIcon("locationCode")}
          </div>
        </TableHead>

        {/* Description Column */}
        <TableHead
          className={`${headerClass("description")} w-[400px]`}
          onClick={() => onSort("description")}
        >
          <div className="flex items-center">
            Description {renderSortIcon("description")}
          </div>
        </TableHead>

        {/* Actions Column */}
        <TableHead className="text-foreground font-medium w-[100px] text-right">
          Actions
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}

export default LocationsTableHeader; 