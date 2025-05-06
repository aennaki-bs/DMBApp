
import { useState } from 'react';
import { toast } from 'sonner';
import adminService from '@/services/adminService';
import { UserTableHeader } from './table/UserTableHeader';
import { UserTableContent } from './table/UserTableContent';
import { BulkActionsBar } from './table/BulkActionsBar';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { EditUserDialog } from './EditUserDialog';
import { EditUserEmailDialog } from './EditUserEmailDialog';
import { ViewUserLogsDialog } from './ViewUserLogsDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserManagement } from './hooks/useUserManagement';
import { AlertTriangle } from 'lucide-react';

export function UserTable() {
  const {
    selectedUsers,
    editingUser,
    editEmailUser,
    viewingUserLogs,
    deletingUser,
    deleteMultipleOpen,
    searchQuery,
    roleChangeOpen,
    selectedRole,
    users: filteredUsers,
    isLoading,
    isError,
    refetch, // Now properly destructured from the hook
    setEditingUser,
    setEditEmailUser,
    setViewingUserLogs,
    setDeletingUser,
    setDeleteMultipleOpen,
    setSearchQuery,
    setRoleChangeOpen,
    setSelectedRole,
    handleSelectUser,
    handleSelectAll,
    handleUserEdited,
    handleUserEmailEdited,
    handleUserDeleted,
    handleMultipleDeleted,
  } = useUserManagement();

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await adminService.updateUser(userId, { isActive: newStatus });
      toast.success(`User ${newStatus ? 'activated' : 'blocked'} successfully`);
      refetch();
    } catch (error) {
      toast.error(`Failed to ${currentStatus ? 'block' : 'activate'} user`);
      console.error(error);
    }
  };

  const handleUserRoleChange = async (userId: number, roleName: string) => {
    try {
      await adminService.updateUser(userId, { roleName });
      toast.success(`User role changed to ${roleName}`);
      refetch();
    } catch (error) {
      toast.error('Failed to change user role');
      console.error(error);
    }
  };

  const handleBulkRoleChange = async () => {
    if (!selectedRole || selectedUsers.length === 0) {
      toast.error('Please select a role and at least one user');
      return;
    }

    try {
      const updatePromises = selectedUsers.map(userId => 
        adminService.updateUser(userId, { roleName: selectedRole })
      );
      
      await Promise.all(updatePromises);
      toast.success(`Role updated to ${selectedRole} for ${selectedUsers.length} users`);
      refetch();
      setRoleChangeOpen(false);
      setSelectedRole('');
    } catch (error) {
      toast.error('Failed to update roles for selected users');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 py-10 text-center">
        <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
        Error loading users. Please try again.
      </div>
    );
  }

  return (
    <div>
      <UserTableHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <UserTableContent 
        users={filteredUsers}
        selectedUsers={selectedUsers}
        onSelectAll={() => handleSelectAll(filteredUsers || [])}
        onSelectUser={handleSelectUser}
        onToggleStatus={handleToggleUserStatus}
        onRoleChange={handleUserRoleChange}
        onEdit={setEditingUser}
        onEditEmail={setEditEmailUser}
        onViewLogs={setViewingUserLogs}
        onDelete={setDeletingUser}
      />

      {selectedUsers.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedUsers.length}
          onChangeRole={() => setRoleChangeOpen(true)}
          onDelete={() => setDeleteMultipleOpen(true)}
        />
      )}

      {editingUser && (
        <EditUserDialog 
          user={editingUser} 
          open={!!editingUser} 
          onOpenChange={(open) => !open && setEditingUser(null)}
          onSuccess={handleUserEdited}
        />
      )}

      {editEmailUser && (
        <EditUserEmailDialog 
          user={editEmailUser}
          open={!!editEmailUser}
          onOpenChange={(open) => !open && setEditEmailUser(null)}
          onSuccess={handleUserEmailEdited}
        />
      )}

      {viewingUserLogs !== null && (
        <ViewUserLogsDialog
          userId={viewingUserLogs}
          open={viewingUserLogs !== null}
          onOpenChange={(open) => !open && setViewingUserLogs(null)}
        />
      )}

      {deletingUser !== null && (
        <DeleteConfirmDialog
          title="Delete User"
          description="Are you sure you want to delete this user? This action cannot be undone."
          open={deletingUser !== null}
          onOpenChange={(open) => !open && setDeletingUser(null)}
          onConfirm={async () => {
            try {
              if (deletingUser) {
                await adminService.deleteUser(deletingUser);
                toast.success('User deleted successfully');
                handleUserDeleted();
              }
            } catch (error) {
              toast.error('Failed to delete user');
              console.error(error);
            }
          }}
        />
      )}

      {deleteMultipleOpen && (
        <DeleteConfirmDialog
          title="Delete Multiple Users"
          description={`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`}
          open={deleteMultipleOpen}
          onOpenChange={setDeleteMultipleOpen}
          onConfirm={async () => {
            try {
              await adminService.deleteMultipleUsers(selectedUsers);
              toast.success(`${selectedUsers.length} users deleted successfully`);
              handleMultipleDeleted();
            } catch (error) {
              toast.error('Failed to delete users');
              console.error(error);
            }
          }}
        />
      )}

      {roleChangeOpen && (
        <DeleteConfirmDialog
          title="Change Role for Selected Users"
          description={`Select the role to assign to ${selectedUsers.length} users:`}
          open={roleChangeOpen}
          onOpenChange={setRoleChangeOpen}
          onConfirm={handleBulkRoleChange}
          confirmText="Change Role"
          cancelText="Cancel"
          destructive={false}
        >
          <div className="py-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full bg-[#0a1033] border-blue-900/30 text-white">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a1033] border-blue-900/30">
                {["Admin", "FullUser", "SimpleUser"].map(role => (
                  <SelectItem 
                    key={role} 
                    value={role} 
                    className="text-white hover:bg-blue-900/20"
                  >
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DeleteConfirmDialog>
      )}
    </div>
  );
}
