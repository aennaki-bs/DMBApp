import React from "react";
import { Table } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GeneralAccountsTableHeader } from "./content/GeneralAccountsTableHeader";
import { GeneralAccountsTableBody } from "./content/GeneralAccountsTableBody";
import { GeneralAccounts } from "@/models/lineElements";

interface GeneralAccountsTableContentProps {
  accounts: GeneralAccounts[];
  sortField: keyof GeneralAccounts;
  sortDirection: "asc" | "desc";
  onSort: (field: keyof GeneralAccounts) => void;
  selectedAccounts: string[];
  onSelectAccount: (accountCode: string) => void;
  onSelectAll: () => void;
  onEditAccount: (account: GeneralAccounts) => void;
  onDeleteAccount: (account: GeneralAccounts) => void;
  onViewAccount: (account: GeneralAccounts) => void;
}

export const GeneralAccountsTableContent: React.FC<GeneralAccountsTableContentProps> = ({
  accounts,
  sortField,
  sortDirection,
  onSort,
  selectedAccounts,
  onSelectAccount,
  onSelectAll,
  onEditAccount,
  onDeleteAccount,
  onViewAccount,
}) => {
  return (
    <div className="bg-background/60 backdrop-blur-md border border-primary/20 rounded-xl overflow-hidden shadow-xl">
      {/* Fixed Header */}
      <div className="border-b border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <Table>
          <GeneralAccountsTableHeader
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
            selectedAccounts={selectedAccounts}
            accounts={accounts}
            onSelectAll={onSelectAll}
          />
        </Table>
      </div>

      {/* Scrollable Body */}
      <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
        <Table>
          <GeneralAccountsTableBody
            accounts={accounts}
            selectedAccounts={selectedAccounts}
            onSelectAccount={onSelectAccount}
            onEditAccount={onEditAccount}
            onDeleteAccount={onDeleteAccount}
            onViewAccount={onViewAccount}
          />
        </Table>
      </ScrollArea>
    </div>
  );
};

export default GeneralAccountsTableContent; 