import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { SortField, SortDirection } from "../../hooks/useApproversManagement";
import { Approver } from "@/hooks/useApprovers";
import {
  MessageSquare,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  User,
} from "lucide-react";

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
  const isAllSelected =
    approvers.length > 0 && selectedApprovers.length === approvers.length;
  const isIndeterminate =
    selectedApprovers.length > 0 && selectedApprovers.length < approvers.length;

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
      <TableRow className="border-border/20 hover:bg-muted/30 transition-colors duration-200 approvers-table-layout">
        {/* Checkbox Column */}
        <TableHead className="py-3 table-cell-center w-12">
          <Checkbox
            enhanced={true}
            size="sm"
            checked={isAllSelected}
            onCheckedChange={onSelectAll}
            aria-label="Select all approvers"
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

        {/* Approver Name Column */}
        <TableHead className="py-3 table-cell-start min-w-[320px]">
          {getSortButton(
            "username",
            "Approver",
            <User className="h-3.5 w-3.5" />
          )}
        </TableHead>

        {/* Comment Column */}
        <TableHead className="py-3 table-cell-start min-w-[300px] max-md:hidden">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              Comment
            </span>
          </div>
        </TableHead>

        {/* Actions Column */}
        <TableHead className="py-3 table-cell-center w-20">
          <span className="text-xs font-medium text-muted-foreground">
            Actions
          </span>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
