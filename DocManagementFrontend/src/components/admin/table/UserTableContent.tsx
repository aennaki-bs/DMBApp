import { UserDto } from "@/services/adminService";
import { Table } from "@/components/ui/table";
import { UserTableHeader } from "./content/UserTableHeader";
import { UserTableBody } from "./content/UserTableBody";
import { UserTableEmpty } from "./UserTableEmpty";
import { ScrollArea } from "@/components/ui/scroll-area";
import PaginationWithBulkActions, { BulkAction } from "@/components/shared/PaginationWithBulkActions";
import { Loader2, UserCheck, Trash2 } from "lucide-react";
import { BulkSelectionState } from "@/hooks/useBulkSelection";

interface UserTableContentProps {
  users: UserDto[] | undefined;
  allUsers?: UserDto[] | undefined;
  selectedUsers: any[];
  bulkSelection: BulkSelectionState<UserDto> & {
    toggleItem: (item: UserDto) => void;
    toggleSelectCurrentPage: () => void;
    isSelected: (item: UserDto) => boolean;
  };
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    handlePageChange: (page: number) => void;
    handlePageSizeChange: (size: number) => void;
  };
  onToggleStatus: (userId: number, currentStatus: boolean) => void;
  onRoleChange: (userId: number, roleName: string) => void;
  onEdit: (user: UserDto) => void;
  onEditEmail: (user: UserDto) => void;
  onViewLogs: (userId: number) => void;
  onDelete: (userId: number) => void;
  sortBy: string;
  sortDirection: string;
  onSort: (field: string) => void;
  onClearFilters: () => void;
  onBulkRoleChange?: () => void;
  onBulkDelete?: () => void;
  isLoading?: boolean;
  isError?: boolean;
}

export function UserTableContent({
  users,
  allUsers,
  selectedUsers,
  bulkSelection,
  pagination,
  onToggleStatus,
  onRoleChange,
  onEdit,
  onEditEmail,
  onViewLogs,
  onDelete,
  sortBy,
  sortDirection,
  onSort,
  onClearFilters,
  onBulkRoleChange,
  onBulkDelete,
  isLoading = false,
  isError = false,
}: UserTableContentProps) {
  // Use pagination from props
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    handlePageChange,
    handlePageSizeChange,
  } = pagination;

  // Check if we have users to display
  const hasUsers = users && users.length > 0;

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      id: 'change-role',
      label: 'Change Role',
      icon: <UserCheck className="h-4 w-4" />,
      variant: 'outline',
      onClick: () => onBulkRoleChange?.(),
      shortcut: 'R',
    },
    {
      id: 'delete',
      label: 'Delete Users',
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
              <p className="text-muted-foreground">Loading users...</p>
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
                Failed to load users. Please try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4" style={{ minHeight: "100%" }}>
      <div className="flex-1 relative overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 shadow-lg min-h-0">
        {/* Subtle animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/2 via-transparent to-primary/2 animate-pulse"></div>

        {hasUsers ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Fixed Header - Never Scrolls */}
            <div className="flex-shrink-0 overflow-x-auto border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="min-w-[1026px]">
                <Table className="table-fixed w-full table-compact">
                  <UserTableHeader
                    selectedCount={bulkSelection.currentPageSelectedCount}
                    totalCount={users?.length || 0}
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
                    <UserTableBody
                      users={users || []}
                      selectedUsers={selectedUsers}
                      onSelectUser={(userId) => {
                        const user = users?.find(u => u.id === userId);
                        if (user) bulkSelection.toggleItem(user);
                      }}
                      onToggleStatus={onToggleStatus}
                      onRoleChange={onRoleChange}
                      onEdit={onEdit}
                      onEditEmail={onEditEmail}
                      onViewLogs={onViewLogs}
                      onDelete={onDelete}
                    />
                  </Table>
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="relative h-full flex items-center justify-center z-10">
            <UserTableEmpty onClearFilters={onClearFilters} />
          </div>
        )}
      </div>

      {/* Smart Pagination with Bulk Actions */}
      {hasUsers && (
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
