import { Table } from "@/components/ui/table";
import { ApproversTableHeader } from "./ApproversTableHeader";
import { ApproversTableBody } from "./ApproversTableBody";
import { ApproversTableEmpty } from "./ApproversTableEmpty";
import { ScrollArea } from "@/components/ui/scroll-area";
import PaginationWithBulkActions, { BulkAction } from "@/components/shared/PaginationWithBulkActions";
import { Loader2, UserCheck, Trash2 } from "lucide-react";
import { BulkSelectionState } from "@/hooks/useBulkSelection";

interface Approver {
  id: number;
  userId: number;
  username: string;
  comment?: string;
  stepId?: number;
  stepTitle?: string;
  allAssociations?: { stepId: number; stepTitle: string }[];
}

interface ApproversTableContentProps {
  approvers: Approver[] | undefined;
  allApprovers?: Approver[] | undefined;
  selectedApprovers: any[];
  bulkSelection: BulkSelectionState<Approver> & {
    toggleItem: (item: Approver) => void;
    toggleSelectCurrentPage: () => void;
    isSelected: (item: Approver) => boolean;
  };
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    handlePageChange: (page: number) => void;
    handlePageSizeChange: (size: number) => void;
  };
  onEdit: (approver: Approver) => void;
  onDelete: (approverId: number) => void;
  sortBy: string;
  sortDirection: string;
  onSort: (field: string) => void;
  onClearFilters: () => void;
  onBulkDelete?: () => void;
  onAddApprover?: () => void;
  isLoading?: boolean;
  isError?: boolean;
}

export function ApproversTableContent({
  approvers,
  allApprovers,
  selectedApprovers,
  bulkSelection,
  pagination,
  onEdit,
  onDelete,
  sortBy,
  sortDirection,
  onSort,
  onClearFilters,
  onBulkDelete,
  onAddApprover,
  isLoading = false,
  isError = false,
}: ApproversTableContentProps) {
  // Use pagination from props
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    handlePageChange,
    handlePageSizeChange,
  } = pagination;

  // Check if we have approvers to display
  const hasApprovers = approvers && approvers.length > 0;

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      id: 'delete',
      label: 'Delete Approvers',
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
              <p className="text-muted-foreground">Loading approvers...</p>
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
                Failed to load approvers. Please try again.
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

        {hasApprovers ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Fixed Header - Never Scrolls */}
            <div className="flex-shrink-0 overflow-x-auto border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
              <div className="min-w-[876px]">
                <Table className="table-fixed w-full">
                  <ApproversTableHeader
                    selectedCount={bulkSelection.currentPageSelectedCount}
                    totalCount={approvers?.length || 0}
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
                <div className="min-w-[876px] pb-4">
                  <Table className="table-fixed w-full">
                    <ApproversTableBody
                      approvers={approvers || []}
                      selectedApprovers={selectedApprovers}
                      onSelectApprover={(approverId) => {
                        const approver = approvers?.find(a => a.id === approverId);
                        if (approver) bulkSelection.toggleItem(approver);
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
            <ApproversTableEmpty 
              onClearFilters={onClearFilters} 
              onAddApprover={onAddApprover || (() => {})}
            />
          </div>
        )}
      </div>

      {/* Smart Pagination with Bulk Actions */}
      {hasApprovers && (
        <PaginationWithBulkActions
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          bulkSelection={bulkSelection as any}
          bulkActions={bulkActions}
        />
      )}
    </div>
  );
} 