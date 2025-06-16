import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown, User } from "lucide-react";
import { Approver } from "@/hooks/useApprovers";
import { SortDirection, SortField } from "../../hooks/useApproversManagement";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ApproversTableHeaderProps {
  approvers: Approver[];
  selectedApprovers: number[];
  onSelectAll: () => void;
  sortBy: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export function ApproversTableHeader({
  approvers,
  selectedApprovers,
  onSelectAll,
  sortBy,
  sortDirection,
  onSort,
}: ApproversTableHeaderProps) {
  // Add null checks to prevent undefined errors
  const approversList = approvers || [];
  const selectedList = selectedApprovers || [];

  const isAllSelected =
    approversList.length > 0 && selectedList.length === approversList.length;
  const isIndeterminate =
    selectedList.length > 0 && selectedList.length < approversList.length;

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

        {/* Approver Name Column */}
        <TableHead
          className={`${headerClass("username")} w-[280px] py-2`}
          onClick={() => onSort("username")}
        >
          <div className="flex items-center">
            <User className="h-3.5 w-3.5 mr-1.5" />
            Approver
            {renderSortIcon("username")}
          </div>
        </TableHead>

        {/* Comment Column */}
        <TableHead
          className={`${headerClass("comment")} w-[400px] py-2`}
          onClick={() => onSort("comment")}
        >
          <div className="flex items-center">
            Comment
            {renderSortIcon("comment")}
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
