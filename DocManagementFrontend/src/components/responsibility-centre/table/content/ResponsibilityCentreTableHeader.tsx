import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

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

  return (
    <TableHeader className="table-glass-header">
      <TableRow className="table-glass-header-row h-10">
        <TableHead className="w-[40px] py-2">
          <div className="flex items-center justify-center">
            <Checkbox
              checked={selectedCount > 0 && selectedCount === totalCount}
              onCheckedChange={onSelectAll}
              aria-label="Select all"
              className="h-3.5 w-3.5"
            />
          </div>
        </TableHead>
        <TableHead
          className={`${headerClass("code")} w-[150px] py-2`}
          onClick={() => onSort("code")}
        >
          <div className="flex items-center">
            {t("common.code")}
            {renderSortIcon("code")}
          </div>
        </TableHead>
        <TableHead
          className={`${headerClass("descr")} w-[300px] py-2`}
          onClick={() => onSort("descr")}
        >
          <div className="flex items-center">
            {t("common.description")}
            {renderSortIcon("descr")}
          </div>
        </TableHead>
        <TableHead
          className={`${headerClass("usersCount")} w-[120px] py-2`}
          onClick={() => onSort("usersCount")}
        >
          <div className="flex items-center justify-center">
            {t("responsibilityCentres.usersCount")}
            {renderSortIcon("usersCount")}
          </div>
        </TableHead>
        <TableHead
          className={`${headerClass("documentsCount")} w-[120px] py-2`}
          onClick={() => onSort("documentsCount")}
        >
          <div className="flex items-center justify-center">
            {t("responsibilityCentres.documentsCount")}
            {renderSortIcon("documentsCount")}
          </div>
        </TableHead>
        <TableHead className="w-[200px] font-medium text-right py-2 text-xs pr-3">
          {t("common.actions")}
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
