import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface UserTableHeaderProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  sortBy: string;
  sortDirection: string;
  onSort: (field: string) => void;
}

export function UserTableHeader({
  selectedCount,
  totalCount,
  onSelectAll,
  sortBy,
  sortDirection,
  onSort,
}: UserTableHeaderProps) {
  const { t } = useTranslation();

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    );
  };

  const headerClass = (field: string) => `
    font-medium cursor-pointer select-none text-xs
    hover:opacity-80 transition-colors duration-150
    ${sortBy === field ? "opacity-100" : ""}
  `;

  const isAllSelected = selectedCount > 0 && selectedCount === totalCount;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

  return (
    <TableHeader className="table-glass-header">
      <TableRow className="table-glass-header-row h-10">
        <TableHead className="w-[40px] py-2">
          <div className="flex items-center justify-center">
            <Checkbox
              enhanced={true}
              size="sm"
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
              className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              aria-label="Select all"
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
        <TableHead className="w-[40px] py-2"></TableHead>
        <TableHead
          className={`${headerClass("firstName")} w-[180px] py-2`}
          onClick={() => onSort("firstName")}
        >
          <div className="flex items-center">
            {t("userManagement.user")} {renderSortIcon("firstName")}
          </div>
        </TableHead>
        <TableHead
          className={`${headerClass("email")} w-[250px] py-2`}
          onClick={() => onSort("email")}
        >
          <div className="flex items-center">
            {t("userManagement.email")} {renderSortIcon("email")}
          </div>
        </TableHead>
        <TableHead
          className={`${headerClass("role")} w-[130px] py-2`}
          onClick={() => onSort("role")}
        >
          <div className="flex items-center">
            {t("userManagement.role")} {renderSortIcon("role")}
          </div>
        </TableHead>
        <TableHead
          className={`${headerClass("isActive")} w-[100px] py-2`}
          onClick={() => onSort("isActive")}
        >
          <div className="flex items-center">
            {t("userManagement.status")} {renderSortIcon("isActive")}
          </div>
        </TableHead>
        <TableHead className="font-medium w-[80px] py-2 text-xs">
          {t("userManagement.block")}
        </TableHead>
        <TableHead className="w-[70px] font-medium text-right pr-3 py-2 text-xs">
          {t("userManagement.actions")}
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
