import React from "react";
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown } from "lucide-react";
import { GeneralAccounts } from "@/models/lineElements";

interface GeneralAccountsTableHeaderProps {
  sortField: keyof GeneralAccounts;
  sortDirection: "asc" | "desc";
  onSort: (field: keyof GeneralAccounts) => void;
  selectedAccounts: string[];
  accounts: GeneralAccounts[];
  onSelectAll: () => void;
}

export const GeneralAccountsTableHeader: React.FC<GeneralAccountsTableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort,
  selectedAccounts,
  accounts,
  onSelectAll,
}) => {
  const renderSortIcon = (field: keyof GeneralAccounts) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
    );
  };

  const headerClass = (field: keyof GeneralAccounts) => `
    text-blue-800 dark:text-blue-200 font-medium cursor-pointer select-none
    hover:text-blue-900 dark:hover:text-blue-100 transition-colors duration-150
    ${sortField === field ? "text-blue-900 dark:text-blue-100" : ""}
  `;

  return (
    <TableHeader>
      <TableRow className="border-primary/20 hover:bg-transparent">
        <TableHead className="w-[50px] text-center">
          <Checkbox
            checked={accounts.length > 0 && accounts.every((account) => selectedAccounts.includes(account.code))}
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
          className={`${headerClass("accountType")} cursor-pointer hover:bg-primary/5 transition-colors`}
          onClick={() => onSort("accountType")}
        >
          <div className="flex items-center gap-2">
            Account Type {renderSortIcon("accountType")}
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

export default GeneralAccountsTableHeader; 