import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { ArrowDown, ArrowUp, ArrowUpDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";

interface StepTableHeaderProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  sortBy: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
  isCircuitActive?: boolean;
  isSimpleUser?: boolean;
}

export function StepTableHeader({
  selectedCount,
  totalCount,
  onSelectAll,
  sortBy,
  sortDirection,
  onSort,
  isCircuitActive = false,
  isSimpleUser = false,
}: StepTableHeaderProps) {
  const headerClass = (field: string) =>
    `cursor-pointer select-none transition-colors hover:text-blue-300 ${sortBy === field ? "text-blue-200" : "text-blue-300/80"
    }`;

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 ml-1.5 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 ml-1.5 text-blue-300" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 ml-1.5 text-blue-300" />
    );
  };

  return (
    <TableHeader>
      <TableRow className="border-slate-200/50 dark:border-slate-700/50 hover:bg-transparent">
        <TableHead className="w-[48px] text-center">
          <div className="flex items-center justify-center">
            <ProfessionalCheckbox
              checked={!isCircuitActive && !isSimpleUser && selectedCount === totalCount && totalCount > 0}
              indeterminate={!isCircuitActive && !isSimpleUser && selectedCount > 0 && selectedCount < totalCount}
              onCheckedChange={() => {
                if (!isCircuitActive && !isSimpleUser) {
                  onSelectAll();
                }
              }}
              size="md"
              variant="header"
              className="shadow-lg"
              disabled={isCircuitActive || isSimpleUser}
            />
          </div>
        </TableHead>
        <TableHead className="w-[60px] text-center"></TableHead>
        <TableHead
          className={`${headerClass("title")} w-[280px]`}
          onClick={() => onSort("title")}
        >
          <div className="flex items-center">
            Title {renderSortIcon("title")}
          </div>
        </TableHead>
        <TableHead
          className={`${headerClass("description")} flex-1 min-w-[200px]`}
          onClick={() => onSort("description")}
        >
          <div className="flex items-center">
            Description {renderSortIcon("description")}
          </div>
        </TableHead>
        <TableHead
          className={`${headerClass("orderIndex")} w-[120px] text-center`}
          onClick={() => onSort("orderIndex")}
        >
          <div className="flex items-center justify-center">
            Order {renderSortIcon("orderIndex")}
          </div>
        </TableHead>
        <TableHead className="w-[90px] text-center">
          Actions
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
