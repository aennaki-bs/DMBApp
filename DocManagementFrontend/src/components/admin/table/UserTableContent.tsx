
import { UserDto } from '@/services/adminService';
import { Table } from '@/components/ui/table';
import { UserTableHeader } from './content/UserTableHeader';
import { UserTableBody } from './content/UserTableBody';
import { UserTableEmpty } from './UserTableEmpty';

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
}: UserTableContentProps) {
  return (
    <div className="rounded-md border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <UserTableHeader 
            selectedCount={selectedUsers.length}
            totalCount={users?.length || 0}
            onSelectAll={onSelectAll}
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
      
      {users?.length === 0 && <UserTableEmpty />}
    </div>
  );
}
