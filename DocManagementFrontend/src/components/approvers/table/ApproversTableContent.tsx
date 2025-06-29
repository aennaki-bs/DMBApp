import { Approver } from "@/hooks/useApprovers";
import { SortField, SortDirection } from "../hooks/useApproversManagement";
import { ApproversTableHeader } from "./content/ApproversTableHeader";
import { ApproversTableBody } from "./content/ApproversTableBody";
import { ApproversTableEmpty } from "./ApproversTableEmpty";
import { Table } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";
import { Loader2 } from "lucide-react";

interface ApproversTableContentProps {
  approvers: Approver[];
  selectedApprovers: number[];
  onSelectAll: () => void;
  onSelectApprover: (approverId: number, checked: boolean) => void;
  onEdit: (approver: Approver) => void;
  onView: (approver: Approver) => void;
  onDelete: (approverId: number) => void;
  sortBy: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onClearFilters?: () => void;
  isLoading: boolean;
  isError: boolean;
}

export function ApproversTableContent({
  approvers,
  selectedApprovers,
  onSelectAll,
  onSelectApprover,
  onEdit,
  onView,
  onDelete,
  sortBy,
  sortDirection,
  onSort,
  onClearFilters,
  isLoading,
  isError,
}: ApproversTableContentProps) {
  // Use pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedApprovers,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: approvers || [],
    initialPageSize: 15,
  });

  // Check if we have approvers to display
  const hasApprovers = approvers && approvers.length > 0;

  // Handle select all for paginated data
  const handleSelectAll = () => {
    const currentPageApproverIds = paginatedApprovers.map(
      (approver) => approver.id
    );
    const allCurrentSelected = currentPageApproverIds.every((id) =>
      selectedApprovers.includes(id)
    );

    if (allCurrentSelected) {
      // Deselect all approvers on current page
      currentPageApproverIds.forEach((approverId) => {
        if (selectedApprovers.includes(approverId)) {
          onSelectApprover(approverId, false);
        }
      });
    } else {
      // Select all approvers on current page only
      currentPageApproverIds.forEach((approverId) => {
        if (!selectedApprovers.includes(approverId)) {
          onSelectApprover(approverId, true);
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
              <p className="table-glass-loading-text">Loading approvers...</p>
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
                Failed to load approvers. Please try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3" style={{ minHeight: "100%" }}>
      <div className="flex-1 relative overflow-hidden rounded-2xl table-glass-container min-h-0">
        {hasApprovers ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Fixed Header - Never Scrolls */}
            <div className="flex-shrink-0 overflow-x-auto table-glass-header">
              <div className="min-w-[1026px]">
                <Table className="table-fixed w-full">
                  <ApproversTableHeader
                    approvers={paginatedApprovers}
                    selectedApprovers={selectedApprovers.filter((id) =>
                      paginatedApprovers.some((approver) => approver.id === id)
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
                <div className="min-w-[1026px] pb-2">
                  <Table className="table-fixed w-full">
                    <ApproversTableBody
                      approvers={paginatedApprovers}
                      selectedApprovers={selectedApprovers}
                      onSelectApprover={onSelectApprover}
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
            <ApproversTableEmpty onClearFilters={onClearFilters} />
          </div>
        )}
      </div>

      {/* Smart Pagination */}
      {hasApprovers && (
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
