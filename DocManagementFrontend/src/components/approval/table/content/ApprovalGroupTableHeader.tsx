import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";

interface ApprovalGroupTableHeaderProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  isCurrentPageFullySelected?: boolean;
  isPartialSelection?: boolean;
  sortBy: string;
  sortDirection: string;
  onSort: (field: string) => void;
}

export function ApprovalGroupTableHeader({
  selectedCount,
  totalCount,
  onSelectAll,
  isCurrentPageFullySelected = false,
  isPartialSelection = false,
  sortBy,
  sortDirection,
  onSort,
}: ApprovalGroupTableHeaderProps) {
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
    <TableHeader className="bg-gradient-to-r from-slate-50/90 via-slate-50/70 to-slate-50/90 dark:from-slate-800/60 dark:via-slate-800/40 dark:to-slate-800/60 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-700/50 shadow-sm">
      <TableRow className="border-slate-200/50 dark:border-slate-700/50 hover:bg-transparent">
        <TableHead className="w-[48px] py-4">
          <div className="flex items-center justify-center">
            <ProfessionalCheckbox
              checked={isCurrentPageFullySelected}
              indeterminate={isPartialSelection}
              onCheckedChange={onSelectAll}
              size="md"
              variant="header"
              className="shadow-lg"
            />
          </div>
        </TableHead>
        <TableHead className="w-[48px] py-4">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <div className="w-2 h-2 bg-primary/50 rounded-full animate-pulse"></div>
            </div>
          </div>
        </TableHead>
        <TableHead
          className={`${headerClass("name")} w-[250px] py-4`}
          onClick={() => onSort("name")}
        >
          <div className="flex items-center font-semibold text-foreground/90 hover:text-primary transition-colors duration-200">
            Group Name {renderSortIcon("name")}
          </div>
        </TableHead>
        <TableHead
          className={`${headerClass("ruleType")} w-[180px] py-4`}
          onClick={() => onSort("ruleType")}
        >
          <div className="flex items-center font-semibold text-foreground/90 hover:text-primary transition-colors duration-200">
            Approval Rule {renderSortIcon("ruleType")}
          </div>
        </TableHead>
        <TableHead
          className={`${headerClass("comment")} w-[200px] py-4`}
          onClick={() => onSort("comment")}
        >
          <div className="flex items-center font-semibold text-foreground/90 hover:text-primary transition-colors duration-200">
            Comment {renderSortIcon("comment")}
          </div>
        </TableHead>
        <TableHead className="text-foreground/90 font-semibold w-[120px] py-4">
          <div className="flex items-center">
            Approvers
          </div>
        </TableHead>
        <TableHead className="w-[80px] text-foreground/90 font-semibold text-right pr-4 py-4">
          <div className="flex items-center justify-end">
            Actions
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
} 