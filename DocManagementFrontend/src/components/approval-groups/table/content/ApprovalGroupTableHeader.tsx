import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { ApprovalGroup } from "@/models/approval";
import {
  SortDirection,
  SortField,
} from "../../hooks/useApprovalGroupManagement";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ApprovalGroupTableHeaderProps {
  groups: ApprovalGroup[];
  selectedGroups: number[];
  onSelectAll: () => void;
  sortBy: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export function ApprovalGroupTableHeader({
  groups,
  selectedGroups,
  onSelectAll,
  sortBy,
  sortDirection,
  onSort,
}: ApprovalGroupTableHeaderProps) {
  const isAllSelected =
    groups.length > 0 && selectedGroups.length === groups.length;
  const isIndeterminate =
    selectedGroups.length > 0 && selectedGroups.length < groups.length;

  const renderSortIcon = (field: SortField) => {
    if (sortBy !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    );
  };

  const headerClass = (field: SortField) => `
    font-medium cursor-pointer select-none text-xs
    hover:opacity-80 transition-colors duration-150
    ${sortBy === field ? "opacity-100" : ""}
  `;

  return (
    <TableHeader className="table-glass-header">
      <TableRow className="table-glass-header-row h-10">
        {/* Checkbox Column */}
        <TableHead className="w-[40px] py-2">
          <div className="flex items-center justify-center">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
              aria-label="Select all"
              className="h-3.5 w-3.5"
              ref={(el) => {
                if (el && el.querySelector) {
                  const input = el.querySelector(
                    'input[type="checkbox"]'
                  ) as HTMLInputElement;
                  if (input) input.indeterminate = isIndeterminate;
                }
              }}
            />
          </div>
        </TableHead>

        {/* Group Name Column */}
        <TableHead
          className={`${headerClass("name")} w-[280px] py-2`}
          onClick={() => onSort("name")}
        >
          <div className="flex items-center">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Group Name
            {renderSortIcon("name")}
          </div>
        </TableHead>

        {/* Rule Type Column */}
        <TableHead
          className={`${headerClass("ruleType")} w-[140px] py-2`}
          onClick={() => onSort("ruleType")}
        >
          <div className="flex items-center">
            Rule Type
            {renderSortIcon("ruleType")}
          </div>
        </TableHead>

        {/* Comment Column */}
        <TableHead
          className={`${headerClass("comment")} w-[300px] py-2`}
          onClick={() => onSort("comment")}
        >
          <div className="flex items-center">
            Comment
            {renderSortIcon("comment")}
          </div>
        </TableHead>

        {/* Approvers Column */}
        <TableHead
          className={`${headerClass("approversCount")} w-[100px] py-2`}
          onClick={() => onSort("approversCount")}
        >
          <div className="flex items-center justify-center">
            Approvers
            {renderSortIcon("approversCount")}
          </div>
        </TableHead>

        {/* Actions Column */}
        <TableHead className="w-[120px] font-medium text-right py-2 text-xs pr-3">
          Actions
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
