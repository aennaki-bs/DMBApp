import { UserDto } from "@/services/adminService";
import { Table } from "@/components/ui/table";
import { UserTableHeader } from "./content/UserTableHeader";
import { UserTableBody } from "./content/UserTableBody";
import { UserTableEmpty } from "./UserTableEmpty";
import { ScrollArea } from "@/components/ui/scroll-area";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";

interface UserTableContentProps {
  users: UserDto[] | undefined;
  selectedUsers: number[];
  onSelectAll: () => void;
  onSelectUser: (userId: number) => void;
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
}

export function UserTableContent({
  users,
  selectedUsers,
  onSelectAll,
  onSelectUser,
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
}: UserTableContentProps) {
  // Use pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedUsers,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: users || [],
    initialPageSize: 25,
  });

  // Check if we have users to display
  const hasUsers = users && users.length > 0;

  // Handle select all for paginated data
  const handleSelectAll = () => {
    const currentPageUserIds = paginatedUsers.map((user) => user.id);
    const allCurrentSelected = currentPageUserIds.every((id) =>
      selectedUsers.includes(id)
    );

    if (allCurrentSelected) {
      // If all current page users are selected, deselect them
      const newSelected = selectedUsers.filter(
        (id) => !currentPageUserIds.includes(id)
      );
      onSelectAll(); // This should handle the logic in parent component
    } else {
      // If not all current page users are selected, select them all
      onSelectAll();
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-900/30 overflow-hidden bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
        {hasUsers ? (
          <>
            {/* Fixed Header - Never Scrolls */}
            <div className="min-w-[1026px] border-b border-blue-900/30">
              <Table className="table-fixed w-full">
                <UserTableHeader
                  selectedCount={
                    selectedUsers.filter((id) =>
                      paginatedUsers.some((user) => user.id === id)
                    ).length
                  }
                  totalCount={paginatedUsers.length}
                  onSelectAll={handleSelectAll}
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={onSort}
                />
              </Table>
            </div>

            {/* Scrollable Body - Only Content Scrolls */}
            <ScrollArea className="h-[calc(100vh-380px)] min-h-[300px]">
              <div className="min-w-[1026px]">
                <Table className="table-fixed w-full">
                  <UserTableBody
                    users={paginatedUsers}
                    selectedUsers={selectedUsers}
                    onSelectUser={onSelectUser}
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
          </>
        ) : (
          <UserTableEmpty onClearFilters={onClearFilters} />
        )}
      </div>

      {/* Smart Pagination */}
      {hasUsers && (
        <SmartPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
