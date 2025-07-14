import React from "react";
import { TableBody } from "@/components/ui/table";
import { GeneralAccountsTableRow } from "../GeneralAccountsTableRow";
import { GeneralAccounts } from "@/models/lineElements";

interface GeneralAccountsTableBodyProps {
  accounts: GeneralAccounts[];
  selectedAccounts: string[];
  onSelectAccount: (accountCode: string) => void;
  onEditAccount: (account: GeneralAccounts) => void;
  onDeleteAccount: (account: GeneralAccounts) => void;
  onViewAccount: (account: GeneralAccounts) => void;
}

export const GeneralAccountsTableBody: React.FC<GeneralAccountsTableBodyProps> = ({
  accounts,
  selectedAccounts,
  onSelectAccount,
  onEditAccount,
  onDeleteAccount,
  onViewAccount,
}) => {
  return (
    <TableBody>
      {accounts.map((account) => (
        <GeneralAccountsTableRow
          key={account.code}
          account={account}
          isSelected={selectedAccounts.includes(account.code)}
          onSelect={() => onSelectAccount(account.code)}
          onEdit={() => onEditAccount(account)}
          onDelete={() => onDeleteAccount(account)}
          onView={() => onViewAccount(account)}
        />
      ))}
    </TableBody>
  );
};

export default GeneralAccountsTableBody; 