import { ApprovalGroup } from "@/models/approval";
import { Table } from "@/components/ui/table";
import { ApprovalGroupTableHeader } from "./content/ApprovalGroupTableHeader";
import { ApprovalGroupTableBody } from "./content/ApprovalGroupTableBody";
import { ApprovalGroupTableEmpty } from "./ApprovalGroupTableEmpty";
import { ScrollArea } from "@/components/ui/scroll-area";
import PaginationWithBulkActions, { BulkAction } from "@/components/shared/PaginationWithBulkActions";
import { Loader2, Trash2, Edit, RotateCcw } from "lucide-react";
import { BulkSelectionState } from "@/hooks/useBulkSelection";

interface ApprovalGroupTableContentProps {
  groups: ApprovalGroup[] | undefined;
  allGroups?: ApprovalGroup[] | undefined;
  selectedGroups: any[];
  bulkSelection: BulkSelectionState<ApprovalGroup> & {
    toggleItem: (item: ApprovalGroup) => void;
    selectCurrentPage: () => void;
    deselectCurrentPage: () => void;
    selectAllPages: () => void;
    deselectAll: () => void;
    invertCurrentPage: () => void;
    toggleSelectCurrentPage: () => void;
    clearSelection: () => void;
    getSelectedObjects: () => ApprovalGroup[];
    getSelectedObjectsFromCurrentPage: () => ApprovalGroup[];
    isSelected: (item: ApprovalGroup) => boolean;
    isIndeterminate: boolean;
  };
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    handlePageChange: (page: number) => void;
    handlePageSizeChange: (size: number) => void;
  };
  onView: (group: ApprovalGroup) => void;
  onEdit: (group: ApprovalGroup) => void;
  onDelete: (groupId: number) => void;
  sortBy: string;
  sortDirection: string;
  onSort: (field: string) => void;
  onClearFilters: () => void;
  onBulkDelete?: () => void;
  onBulkReactivate?: () => void;
  onCreateGroup?: () => void;
  isLoading?: boolean;
  isError?: boolean;
  associatedGroups: Record<number, boolean>;
  checkingAssociation: boolean;
}

export function ApprovalGroupTableContent({
  groups,
  allGroups,
  selectedGroups,
  bulkSelection,
  pagination,
  onView,
  onEdit,
  onDelete,
  sortBy,
  sortDirection,
  onSort,
  onClearFilters,
  onBulkDelete,
  onBulkReactivate,
  onCreateGroup,
  isLoading = false,
  isError = false,
  associatedGroups,
  checkingAssociation,
}: ApprovalGroupTableContentProps) {
  // Use pagination from props
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    handlePageChange,
    handlePageSizeChange,
  } = pagination;

  // Check if we have groups to display
  const hasGroups = groups && groups.length > 0;

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      id: 'reactivate',
      label: 'Reactivate Groups',
      icon: <RotateCcw className="h-4 w-4" />,
      variant: 'outline',
      onClick: () => onBulkReactivate?.(),
      shortcut: 'R',
    },
    {
      id: 'delete',
      label: 'Delete Groups',
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
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading approval groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4" style={{ minHeight: "100%" }}>
      <div className="flex-1 relative overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-lg min-h-0">
        {/* Subtle animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/2 via-transparent to-primary/2 animate-pulse"></div>

        {hasGroups ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Fixed Header - Never Scrolls */}
            <div className="flex-shrink-0 overflow-x-auto border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
              <div className="min-w-[1026px]">
                <Table className="table-fixed w-full table-compact">
                  <ApprovalGroupTableHeader
                    selectedCount={bulkSelection.currentPageSelectedCount}
                    totalCount={groups?.filter(g => !associatedGroups[g.id]).length || 0}
                    onSelectAll={bulkSelection.toggleSelectCurrentPage}
                    isCurrentPageFullySelected={bulkSelection.isCurrentPageFullySelected}
                    isPartialSelection={bulkSelection.isPartialSelection}
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
                <div className="min-w-[1000px] pb-4">
                  <Table className="table-fixed w-full table-compact">
                    <ApprovalGroupTableBody
                      groups={groups || []}
                      selectedGroups={selectedGroups}
                      onSelectGroup={(groupId) => {
                        const group = groups?.find(g => g.id === groupId);
                        if (group && !associatedGroups[group.id]) {
                          bulkSelection.toggleItem(group);
                        }
                      }}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      associatedGroups={associatedGroups}
                      checkingAssociation={checkingAssociation}
                    />
                  </Table>
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="relative h-full flex items-center justify-center z-10">
            <ApprovalGroupTableEmpty
              onClearFilters={onClearFilters}
              onCreateGroup={onCreateGroup}
            />
          </div>
        )}
      </div>

      {/* Smart Pagination with Bulk Actions */}
      {hasGroups && (
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