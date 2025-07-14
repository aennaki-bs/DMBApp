import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";

interface DocumentTypeTableHeaderProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  sortBy: string;
  sortDirection: string;
  onSort: (field: string) => void;
}

export function DocumentTypeTableHeader({
  selectedCount,
  totalCount,
  onSelectAll,
  sortBy,
  sortDirection,
  onSort,
}: DocumentTypeTableHeaderProps) {
  const headerClass = (field: string) =>
    cn(
      "text-foreground font-medium cursor-pointer transition-colors hover:text-primary",
      "select-none group"
    );

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) {
      return (
        <div className="opacity-0 group-hover:opacity-50 transition-opacity ml-1">
          <ChevronUp className="h-3.5 w-3.5" />
        </div>
      );
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-3.5 w-3.5 ml-1 text-primary" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 ml-1 text-primary" />
    );
  };

  return (
    <TableHeader>
      <TableRow className="border-slate-200/50 dark:border-slate-700/50 hover:bg-transparent">
        <TableHead className="w-[48px] text-center">
          <div className="flex items-center justify-center">
            <ProfessionalCheckbox
              checked={selectedCount === totalCount && totalCount > 0}
              indeterminate={selectedCount > 0 && selectedCount < totalCount}
              onCheckedChange={onSelectAll}
              size="md"
              variant="header"
              className="shadow-lg"
            />
          </div>
        </TableHead>
        <TableHead className="w-[48px] text-center"></TableHead>
        <TableHead
          className={`${headerClass("typeName")} w-[200px]`}
          onClick={() => onSort("typeName")}
        >
          <div className="flex items-center">
            Type Name {renderSortIcon("typeName")}
          </div>
        </TableHead>
        <TableHead
          className={`${headerClass("typeAttr")} w-[280px]`}
          onClick={() => onSort("typeAttr")}
        >
          <div className="flex items-center">
            Description {renderSortIcon("typeAttr")}
          </div>
        </TableHead>
        <TableHead
          className={`${headerClass("tierType")} w-[150px] text-center`}
          onClick={() => onSort("tierType")}
        >
          <div className="flex items-center justify-center">
            Tier Type {renderSortIcon("tierType")}
          </div>
        </TableHead>
        <TableHead
          className={`${headerClass("typeNumber")} w-[120px] text-center`}
          onClick={() => onSort("typeNumber")}
        >
          <div className="flex items-center justify-center">
            ERP Type {renderSortIcon("typeNumber")}
          </div>
        </TableHead>
        <TableHead className="text-foreground font-medium w-[100px] text-center">
          Actions
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
