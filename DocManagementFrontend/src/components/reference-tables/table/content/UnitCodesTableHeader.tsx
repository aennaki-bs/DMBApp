import React from "react";
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown } from "lucide-react";
import { UniteCode } from "@/models/lineElements";

interface UnitCodesTableHeaderProps {
  sortField: keyof UniteCode;
  sortDirection: "asc" | "desc";
  onSort: (field: keyof UniteCode) => void;
  selectedUnitCodes: string[];
  unitCodes: UniteCode[];
  onSelectAll: () => void;
}

export const UnitCodesTableHeader: React.FC<UnitCodesTableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort,
  selectedUnitCodes,
  unitCodes,
  onSelectAll,
}) => {
  const renderSortIcon = (field: keyof UniteCode) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
    );
  };

  const headerClass = (field: keyof UniteCode) => `
    text-blue-800 dark:text-blue-200 font-medium cursor-pointer select-none
    hover:text-blue-900 dark:hover:text-blue-100 transition-colors duration-150
    ${sortField === field ? "text-blue-900 dark:text-blue-100" : ""}
  `;

  return (
    <TableHeader>
      <TableRow className="border-primary/20 hover:bg-transparent">
        <TableHead className="w-[50px] text-center">
          <Checkbox
            checked={unitCodes.length > 0 && unitCodes.every((unitCode) => selectedUnitCodes.includes(unitCode.code))}
            onCheckedChange={onSelectAll}
            aria-label="Select all"
            className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </TableHead>
        <TableHead
          className={`${headerClass("code")} cursor-pointer hover:bg-primary/5 transition-colors`}
          onClick={() => onSort("code")}
        >
          <div className="flex items-center gap-2">
            Code {renderSortIcon("code")}
          </div>
        </TableHead>
        <TableHead
          className={`${headerClass("description")} cursor-pointer hover:bg-primary/5 transition-colors`}
          onClick={() => onSort("description")}
        >
          <div className="flex items-center gap-2">
            Description {renderSortIcon("description")}
          </div>
        </TableHead>
        <TableHead
          className={`${headerClass("createdAt")} cursor-pointer hover:bg-primary/5 transition-colors`}
          onClick={() => onSort("createdAt")}
        >
          <div className="flex items-center gap-2">
            Created At {renderSortIcon("createdAt")}
          </div>
        </TableHead>
        <TableHead className="text-right pr-6">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default UnitCodesTableHeader; 