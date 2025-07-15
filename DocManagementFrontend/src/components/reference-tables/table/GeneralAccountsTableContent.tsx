import { GeneralAccounts } from "@/models/lineElements";
import { Table } from "@/components/ui/table";
import { GeneralAccountsTableHeader } from "./content/GeneralAccountsTableHeader";
import { GeneralAccountsTableBody } from "./content/GeneralAccountsTableBody";
import { GeneralAccountsTableEmpty } from "./GeneralAccountsTableEmpty";
import { ScrollArea } from "@/components/ui/scroll-area";
import PaginationWithBulkActions, { BulkAction } from "@/components/shared/PaginationWithBulkActions";
import { Loader2, Trash2 } from "lucide-react";

interface GeneralAccountsTableContentProps {
  accounts: GeneralAccounts[] | undefined;
  allAccounts?: GeneralAccounts[] | undefined;
  selectedItems: string[]; // Array of account codes from bulk selection
  bulkSelection: any; // Using any to match ElementTypes pattern
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    handlePageChange: (page: number) => void;
    handlePageSizeChange: (size: number) => void;
  };
  onEdit: (account: GeneralAccounts) => void;
  onView: (account: GeneralAccounts) => void;
  onDelete: (code: string) => void;
  sortBy: string;
  sortDirection: string;
  onSort: (field: string) => void;
  onClearFilters: () => void;
  onBulkDelete?: () => void;
  isLoading?: boolean;
  isError?: boolean;
}

export function GeneralAccountsTableContent({
  accounts,
  allAccounts,
  selectedItems,
  bulkSelection,
  pagination,
  onEdit,
  onView,
  onDelete,
  sortBy,
  sortDirection,
  onSort,
  onClearFilters,
  onBulkDelete,
  isLoading = false,
  isError = false,
}: GeneralAccountsTableContentProps) {
  // Use pagination from props
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    handlePageChange,
    handlePageSizeChange,
  } = pagination;

  // Check if we have accounts to display
  const hasAccounts = accounts && accounts.length > 0;

  // Define bulk actions (disabled)
  const bulkActions: BulkAction[] = [
    {
      id: 'delete',
      label: 'Delete Accounts (Disabled)',
      icon: <Trash2 className="h-4 w-4 opacity-50" />,
      variant: 'outline', // Use outline instead of destructive to appear disabled
      onClick: () => {
        // Disabled - no action
      },
      requiresConfirmation: false,
      shortcut: 'Del',
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading accounts...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-destructive/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <span className="text-destructive font-bold">!</span>
              </div>
              <p className="text-destructive">
                Failed to load accounts. Please try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4" style={{ minHeight: "100%" }}>
      <div className="flex-1 relative overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-lg min-h-0">
        {/* Subtle animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/2 via-transparent to-primary/2 animate-pulse"></div>

        {hasAccounts ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Fixed Header - Never Scrolls */}
            <div className="flex-shrink-0 overflow-x-auto border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
              <div className="min-w-[750px]">
                <Table className="table-fixed w-full">
                  <GeneralAccountsTableHeader
                    selectedCount={bulkSelection.currentPageSelectedCount}
                    totalCount={accounts?.length || 0} // Current page items count
                    onSelectAll={bulkSelection.toggleSelectCurrentPage}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={onSort}
                  />
                </Table>
              </div>
            </div>

            {/* Scrollable Body - Only Content Scrolls - FILL REMAINING HEIGHT */}
            <div
              className="flex-1 overflow-hidden"
              style={{ maxHeight: "calc(100vh - 300px)" }}
            >
              <ScrollArea className="table-scroll-area h-full w-full">
                <div className="min-w-[750px] pb-4">
                  <Table className="table-fixed w-full">
                    <GeneralAccountsTableBody
                      accounts={accounts || []}
                      selectedItems={bulkSelection.selectedItems} // Pass keys array directly
                      onSelectItem={(code) => {
                        const account = accounts?.find(a => a.code === code);
                        if (account) bulkSelection.toggleItem(account);
                      }}
                      onEdit={onEdit}
                      onView={onView}
                      onDelete={onDelete}
                    />
                  </Table>
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="relative h-full flex items-center justify-center z-10">
            <GeneralAccountsTableEmpty hasSearchQuery={false} onClearSearch={onClearFilters} />
          </div>
        )}
      </div>

      {/* Smart Pagination with Bulk Actions */}
      {hasAccounts && (
        <PaginationWithBulkActions
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          bulkSelection={bulkSelection}
          bulkActions={bulkActions}
        />
      )}
    </div>
  );
}

export default GeneralAccountsTableContent; 