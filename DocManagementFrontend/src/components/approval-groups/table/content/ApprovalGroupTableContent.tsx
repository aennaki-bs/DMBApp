import { Table } from "@/components/ui/table";
import { ApprovalGroup } from "@/models/approval";
import { ApprovalGroupTableHeader } from "./ApprovalGroupTableHeader";
import { ApprovalGroupTableBody } from "./ApprovalGroupTableBody";
import {
  SortDirection,
  SortField,
} from "../../hooks/useApprovalGroupManagement";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface ApprovalGroupTableContentProps {
  groups: ApprovalGroup[];
  selectedGroups: number[];
  onSelectGroup: (id: number) => void;
  onSelectAll: () => void;
  onEditGroup: (group: ApprovalGroup) => void;
  onDeleteGroup: (group: ApprovalGroup) => void;
  sortBy: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export function ApprovalGroupTableContent({
  groups,
  selectedGroups,
  onSelectGroup,
  onSelectAll,
  onEditGroup,
  onDeleteGroup,
  sortBy,
  sortDirection,
  onSort,
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
          onSelectGroup(groupId);
        }
      });
    } else {
      // Select all groups on current page only
      currentPageGroupIds.forEach((groupId) => {
        if (!selectedGroups.includes(groupId)) {
          onSelectGroup(groupId);
        }
      });
    }
  };

  return (
    <div className="h-full flex flex-col gap-3" style={{ minHeight: "100%" }}>
      <div className="flex-1 relative overflow-hidden rounded-2xl table-glass-container min-h-0">
        {hasGroups ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Fixed Header - Never Scrolls */}
            <div className="flex-shrink-0 overflow-x-auto table-glass-header">
              <div className="min-w-[960px]">
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

            {/* Scrollable Body - Only Content Scrolls - FILL REMAINING HEIGHT */}
            <div
              className="flex-1 overflow-hidden"
              style={{ maxHeight: "calc(100vh - 280px)" }}
            >
              <ScrollArea className="h-full w-full">
                <div className="min-w-[960px] pb-2">
                  <Table className="table-fixed w-full">
                    <ApprovalGroupTableBody
                      groups={paginatedGroups}
                      selectedGroups={selectedGroups}
                      onSelectGroup={onSelectGroup}
                      onEditGroup={onEditGroup}
                      onDeleteGroup={onDeleteGroup}
                    />
                  </Table>
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="relative h-full flex items-center justify-center z-10">
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="mb-6 p-4 rounded-full table-glass-empty-icon">
                <Loader2 className="h-12 w-12" />
              </div>

              <h3 className="text-xl font-semibold table-glass-empty-title mb-2">
                No approval groups found
              </h3>

              <p className="table-glass-empty-description mb-6 max-w-md">
                Create your first approval group to get started with document
                approvals.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Smart Pagination */}
      {hasGroups && (
        <div className="table-glass-pagination p-4 rounded-b-2xl">
          <SmartPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[10, 15, 25, 50, 100]}
          />
        </div>
      )}
    </div>
  );
}
