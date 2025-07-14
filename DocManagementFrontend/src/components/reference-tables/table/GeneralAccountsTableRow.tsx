import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { GeneralAccountsActionsDropdown } from "./row/GeneralAccountsActionsDropdown";
import { GeneralAccounts } from "@/models/lineElements";

interface GeneralAccountsTableRowProps {
  account: GeneralAccounts;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

export const GeneralAccountsTableRow: React.FC<GeneralAccountsTableRowProps> = ({
  account,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onView,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <TableRow className="border-b border-primary/10 hover:bg-primary/5 transition-all duration-200">
      <TableCell className="w-[50px] text-center">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          aria-label={`Select ${account.code}`}
          className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </TableCell>
      <TableCell className="font-mono font-semibold text-foreground">
        <Badge variant="outline" className="bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20 hover:bg-violet-500/20 transition-colors">
          {account.code}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        <div className="truncate max-w-[300px]">{account.description}</div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        <div className="truncate max-w-[200px]">{account.accountType || "N/A"}</div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(account.createdAt)}
      </TableCell>
      <TableCell className="text-right pr-6">
        <GeneralAccountsActionsDropdown
          account={account}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      </TableCell>
    </TableRow>
  );
};

export default GeneralAccountsTableRow; 