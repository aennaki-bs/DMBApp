import { Customer } from "@/models/customer";
import { Table } from "@/components/ui/table";
import { CustomerTableHeader } from "./content/CustomerTableHeader";
import { CustomerTableBody } from "./content/CustomerTableBody";
import { CustomerTableEmpty } from "./CustomerTableEmpty";
import { ScrollArea } from "@/components/ui/scroll-area";
import PaginationWithBulkActions, { BulkAction } from "@/components/shared/PaginationWithBulkActions";
import { Loader2, Trash2, Edit } from "lucide-react";

interface CustomerTableContentProps {
  customers: Customer[] | undefined;
  allCustomers?: Customer[] | undefined;
  selectedCustomers: any[];
  bulkSelection: any;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    handlePageChange: (page: number) => void;
    handlePageSizeChange: (size: number) => void;
  };
  onEdit: (customer: Customer) => void;
  onDelete: (code: string) => void;
  sortBy: string;
  sortDirection: string;
  onSort: (field: string) => void;
  onClearFilters: () => void;
  onBulkEdit?: () => void;
  onBulkDelete?: () => void;
  isLoading?: boolean;
  isError?: boolean;
}

export function CustomerTableContent({
  customers,
  allCustomers,
  selectedCustomers,
  bulkSelection,
  pagination,
  onEdit,
  onDelete,
  sortBy,
  sortDirection,
  onSort,
  onClearFilters,
  onBulkEdit,
  onBulkDelete,
  isLoading = false,
  isError = false,
}: CustomerTableContentProps) {
  // Use pagination from props
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    handlePageChange,
    handlePageSizeChange,
  } = pagination;

  // Check if we have customers to display
  const hasCustomers = customers && customers.length > 0;

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      id: 'edit',
      label: 'Edit Customers',
      icon: <Edit className="h-4 w-4" />,
      variant: 'outline',
      onClick: () => onBulkEdit?.(),
      shortcut: 'E',
    },
    {
      id: 'delete',
      label: 'Delete Customers',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive',
      onClick: () => onBulkDelete?.(),
      requiresConfirmation: true,
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
              <p className="text-muted-foreground">Loading customers...</p>
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
              <div className="p-3 rounded-full bg-destructive/10">
                <Loader2 className="h-8 w-8 text-destructive" />
              </div>
              <p className="text-destructive">Failed to load customers</p>
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

        {hasCustomers ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Fixed Header - Never Scrolls */}
            <div className="flex-shrink-0 overflow-x-auto border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
              <div className="min-w-[1026px]">
                <Table className="table-fixed w-full table-compact">
                  <CustomerTableHeader
                    selectedCount={bulkSelection.currentPageSelectedCount}
                    totalCount={customers?.length || 0}
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
              style={{ maxHeight: "calc(100vh - 260px)" }}
            >
              <ScrollArea className="table-scroll-area h-full w-full">
                <div className="min-w-[1026px] pb-4">
                  <Table className="table-fixed w-full table-compact">
                    <CustomerTableBody
                      customers={customers || []}
                      selectedCustomers={selectedCustomers}
                      onSelectCustomer={(code) => {
                        const customer = customers?.find(c => c.code === code);
                        if (customer) bulkSelection.toggleItem(customer);
                      }}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </Table>
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="relative h-full flex items-center justify-center z-10">
            <CustomerTableEmpty onClearFilters={onClearFilters} />
          </div>
        )}
      </div>

      {/* Smart Pagination with Bulk Actions */}
      {hasCustomers && (
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