import { ApprovalGroup } from "@/models/approval";
import { ApprovalGroupTableHeader } from "./content/ApprovalGroupTableHeader";
import { ApprovalGroupTableBody } from "./content/ApprovalGroupTableBody";
import { ApprovalGroupTableEmpty } from "./ApprovalGroupTableEmpty";
import { SortDirection, SortField } from "../hooks/useApprovalGroupManagement";
import { Table } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";
import { Loader2 } from "lucide-react";

interface ApprovalGroupTableContentProps {
  groups: ApprovalGroup[];
  selectedGroups: number[];
  onSelectAll: () => void;
  onSelectGroup: (groupId: number, checked: boolean) => void;
  onEditGroup: (group: ApprovalGroup) => void;
  onViewGroup: (group: ApprovalGroup) => void;
  onDeleteGroup: (group: ApprovalGroup) => void;
  onManageApprovers: (group: ApprovalGroup) => void;
  sortBy: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onClearFilters?: () => void;
  isLoading: boolean;
  isError: boolean;
}

export function ApprovalGroupTableContent({
  groups,
  selectedGroups,
  onSelectAll,
  onSelectGroup,
  onEditGroup,
  onViewGroup,
  onDeleteGroup,
  onManageApprovers,
  sortBy,
  sortDirection,
  onSort,
  onClearFilters,
  isLoading,
  isError,
}: ApprovalGroupTableContentProps) {
  // Use pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedGroups,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: groups || [],
    initialPageSize: 15,
  });

  // Check if we have groups to display
  const hasGroups = groups && groups.length > 0;

  // Handle select all for paginated data
  const handleSelectAll = () => {
    const currentPageGroupIds = paginatedGroups.map((group) => group.id);
    const allCurrentSelected = currentPageGroupIds.every((id) =>
      selectedGroups.includes(id)
    );

    if (allCurrentSelected) {
      // Deselect all groups on current page
      currentPageGroupIds.forEach((groupId) => {
        if (selectedGroups.includes(groupId)) {
          onSelectGroup(groupId, false);
        }
      });
    } else {
      // Select all groups on current page only
      currentPageGroupIds.forEach((groupId) => {
        if (!selectedGroups.includes(groupId)) {
          onSelectGroup(groupId, true);
        }
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl table-glass-loading shadow-lg">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin table-glass-loading-spinner" />
              <p className="table-glass-loading-text">
                Loading approval groups...
              </p>
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
        <div className="relative overflow-hidden rounded-2xl table-glass-error shadow-lg">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 rounded-full table-glass-error-icon flex items-center justify-center">
                <span className="font-bold">!</span>
              </div>
              <p className="table-glass-error-text">
                Failed to load approval groups. Please try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col gap-4 w-full px-1"
      style={{ minHeight: "100%" }}
    >
      {/* Modern Approval Groups Table */}
      <div className="flex-1 relative overflow-hidden rounded-2xl table-glass-container min-h-0 shadow-xl">
        {hasGroups ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Fixed Header with Glass Effect */}
            <div className="flex-shrink-0 overflow-x-auto table-glass-header border-b border-border/20">
              <div className="min-w-[1026px]">
                <Table className="table-fixed w-full">
                  <ApprovalGroupTableHeader
                    groups={paginatedGroups}
                    selectedGroups={selectedGroups.filter((id) =>
                      paginatedGroups.some((group) => group.id === id)
                    )}
                    onSelectAll={handleSelectAll}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={onSort}
                  />
                </Table>
              </div>
            </div>

            {/* Scrollable Body with Better Height Management */}
            <div
              className="flex-1 overflow-hidden"
              style={{ maxHeight: "calc(100vh - 320px)" }}
            >
              <ScrollArea className="h-full w-full">
                <div className="min-w-[1026px]">
                  <Table className="table-fixed w-full">
                    <ApprovalGroupTableBody
                      groups={paginatedGroups}
                      selectedGroups={selectedGroups}
                      onSelectGroup={onSelectGroup}
                      onEditGroup={onEditGroup}
                      onViewGroup={onViewGroup}
                      onDeleteGroup={onDeleteGroup}
                      onManageApprovers={onManageApprovers}
                    />
                  </Table>
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="relative h-full flex items-center justify-center z-10">
            <ApprovalGroupTableEmpty onClearFilters={onClearFilters} />
          </div>
        )}
      </div>

      {/* Enhanced Pagination with Glass Effect */}
      {hasGroups && (
        <div className="flex-shrink-0 table-glass-pagination p-4 rounded-2xl shadow-lg backdrop-blur-md">
          <SmartPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            className="justify-center"
            pageSizeOptions={[10, 15, 25, 50, 100]}
            showFirstLast={true}
            maxVisiblePages={5}
          />
        </div>
      )}
    </div>
  );
}
