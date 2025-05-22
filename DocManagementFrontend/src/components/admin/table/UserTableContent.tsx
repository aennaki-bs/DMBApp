import { UserDto } from "@/services/adminService";
import { Table } from "@/components/ui/table";
import { UserTableHeader } from "./content/UserTableHeader";
import { UserTableBody } from "./content/UserTableBody";
import { UserTableEmpty } from "./UserTableEmpty";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  // Check if we have users to display
  const hasUsers = users && users.length > 0;

  return (
    <div className="rounded-xl border border-blue-900/30 overflow-hidden bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
      {hasUsers ? (
        // Only show the ScrollArea and Table when we have users
        <ScrollArea className="h-[calc(100vh-280px)] min-h-[400px]">
          <div className="min-w-[800px]">
            <Table>
              <UserTableHeader
                selectedCount={selectedUsers.length}
                totalCount={users?.length || 0}
                onSelectAll={onSelectAll}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <UserTableBody
                users={users}
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
      ) : (
        // Show empty state without the ScrollArea when no users
        <UserTableEmpty onClearFilters={onClearFilters} />
      )}
    </div>
  );
}
