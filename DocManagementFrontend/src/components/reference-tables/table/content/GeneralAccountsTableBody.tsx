import { TableBody } from "@/components/ui/table";
import { GeneralAccounts } from "@/models/lineElements";
import { GeneralAccountsTableRow } from "./GeneralAccountsTableRow";

interface GeneralAccountsTableBodyProps {
  accounts: GeneralAccounts[];
  selectedItems: string[]; // Array of account codes
  onSelectItem: (code: string) => void;
  onEdit: (account: GeneralAccounts) => void;
  onView: (account: GeneralAccounts) => void;
  onDelete: (code: string) => void;
}

export function GeneralAccountsTableBody({
  accounts,
  selectedItems,
  onSelectItem,
  onEdit,
  onView,
  onDelete,
}: GeneralAccountsTableBodyProps) {
  return (
    <TableBody>
      {accounts.map((account) => {
        const isSelected = selectedItems.includes(account.code); // Check if code is in selectedItems array

        return (
          <GeneralAccountsTableRow
            key={account.code}
            account={account}
            isSelected={isSelected}
            onSelect={() => onSelectItem(account.code)}
            onEdit={() => onEdit(account)}
            onView={() => onView(account)}
            onDelete={() => onDelete(account.code)}
          />
        );
      })}
    </TableBody>
  );
}

export default GeneralAccountsTableBody; 