import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";

interface ResponsibilityCentreTableHeaderProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  sortBy: string;
  sortDirection: string;
  onSort: (field: string) => void;
}

export function ResponsibilityCentreTableHeader({
  selectedCount,
  totalCount,
  onSelectAll,
  sortBy,
  sortDirection,
  onSort,
}: ResponsibilityCentreTableHeaderProps) {
  const { t } = useTranslation();

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-primary" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-primary" />
    );
  };

  const headerClass = (field: string) => `
    text-foreground font-medium cursor-pointer select-none
    hover:text-primary transition-colors duration-150
    ${sortBy === field ? "text-primary" : ""}
  `;

  return (
    <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
      <TableRow className="border-slate-200/50 dark:border-slate-700/50 hover:bg-transparent">
        <TableHead className="w-[48px]">
          <div className="flex items-center justify-center">
            <ProfessionalCheckbox
              checked={selectedCount === totalCount && totalCount > 0}
              indeterminate={selectedCount > 0 && selectedCount < totalCount}
              onCheckedChange={onSelectAll}
              size="md"
              variant="header"
            />
          </div>
        </TableHead>
        
        <TableHead className="w-[200px]">
          <div
            className={headerClass("code")}
            onClick={() => onSort("code")}
          >
            <div className="flex items-center">
              Code
              {renderSortIcon("code")}
            </div>
          </div>
        </TableHead>
        
        <TableHead className="flex-1">
          <div
            className={headerClass("descr")}
            onClick={() => onSort("descr")}
          >
            <div className="flex items-center">
              Description
              {renderSortIcon("descr")}
            </div>
          </div>
        </TableHead>
        
        <TableHead className="w-[100px]">
          <div className="flex items-center justify-center">
            <span className="text-sm text-muted-foreground">Users</span>
          </div>
        </TableHead>
        
        <TableHead className="w-[120px]">
          <div className="flex items-center justify-center">
            <span className="text-sm text-muted-foreground">Actions</span>
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
} 