import { useState } from "react";
import { toast } from "sonner";
import adminService from "@/services/adminService";
import { UserTableHeader } from "./table/UserTableHeader";
import { UserTableContent } from "./table/UserTableContent";
import { BulkActionsBar } from "./table/BulkActionsBar";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { EditUserDialog } from "./EditUserDialog";
import { EditUserEmailDialog } from "./EditUserEmailDialog";
import { ViewUserLogsDialog } from "./ViewUserLogsDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserManagement } from "./hooks/useUserManagement";
import { AlertTriangle, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DEFAULT_USER_SEARCH_FIELDS } from "@/components/table/constants/filters";
import { BulkRoleChangeDialog } from "./dialogs/BulkRoleChangeDialog";
import { BulkDeleteDialog } from "./dialogs/BulkDeleteDialog";

export function UserTable() {
  const {
    selectedUsers,
    editingUser,
    editEmailUser,
    viewingUserLogs,
    deletingUser,
    deleteMultipleOpen,
    searchQuery,
    setSearchQuery,
    searchField,
    setSearchField,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    showAdvancedFilters,
    setShowAdvancedFilters,
    roleChangeOpen,
    selectedRole,
    users: filteredUsers,
    isLoading,
    isError,
    refetch,
    setEditingUser,
    setEditEmailUser,
    setViewingUserLogs,
    setDeletingUser,
    setDeleteMultipleOpen,
    setRoleChangeOpen,
    setSelectedRole,
    handleSort,
    sortBy,
    sortDirection,
    handleSelectUser,
    handleSelectAll,
    handleUserEdited,
    handleUserEmailEdited,
    handleUserDeleted,
    handleMultipleDeleted,
  } = useUserManagement();

  const handleToggleUserStatus = async (
    userId: number,
    currentStatus: boolean
  ) => {
    try {
      const newStatus = !currentStatus;
      await adminService.updateUser(userId, { isActive: newStatus });
      toast.success(`User ${newStatus ? "activated" : "blocked"} successfully`);
      refetch();
    } catch (error) {
      toast.error(`Failed to ${currentStatus ? "block" : "activate"} user`);
      console.error(error);
    }
  };

  const handleUserRoleChange = async (userId: number, roleName: string) => {
    try {
      await adminService.updateUser(userId, { roleName });
      toast.success(`User role changed to ${roleName}`);
      refetch();
    } catch (error) {
      toast.error("Failed to change user role");
      console.error(error);
    }
  };

  const handleBulkRoleChange = async () => {
    if (!selectedRole || selectedUsers.length === 0) {
      toast.error("Please select a role and at least one user");
      return;
    }

    try {
      const updatePromises = selectedUsers.map((userId) =>
        adminService.updateUser(userId, { roleName: selectedRole })
      );

      await Promise.all(updatePromises);
      toast.success(
        `Role updated to ${selectedRole} for ${selectedUsers.length} users`
      );
      refetch();
      setRoleChangeOpen(false);
      setSelectedRole("");
    } catch (error) {
      toast.error("Failed to update roles for selected users");
      console.error(error);
    }
  };

  const handleDeleteMultiple = async () => {
    try {
      await adminService.deleteMultipleUsers(selectedUsers);
      toast.success(`${selectedUsers.length} users deleted successfully`);
      handleMultipleDeleted();
    } catch (error) {
      toast.error("Failed to delete users");
      console.error(error);
    }
  };

  // Document-style filter/search bar
  const filterCardClass =
    "w-full flex flex-col md:flex-row items-center gap-2 p-4 mb-4 rounded-xl bg-[#1e2a4a] shadow-lg border border-blue-900/40";

  // Filter popover state
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter options
  const statusOptions = [
    { id: "any", label: "Any Status", value: "any" },
    { id: "active", label: "Active", value: "active" },
    { id: "inactive", label: "Inactive", value: "inactive" },
  ];
  const roleOptions = [
    { id: "any", label: "Any Role", value: "any" },
    { id: "Admin", label: "Admin", value: "Admin" },
    { id: "FullUser", label: "Full User", value: "FullUser" },
    { id: "SimpleUser", label: "Simple User", value: "SimpleUser" },
  ];

  // Apply filters immediately when changed
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setStatusFilter("any");
    setRoleFilter("any");
    setFilterOpen(false); // Close popover after clearing
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
      {/* Document-style Search + Filter Bar */}
      <div className={filterCardClass}>
        {/* Search and field select */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <Select value={searchField} onValueChange={setSearchField}>
            <SelectTrigger className="w-[120px] bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-800/40 shadow-sm rounded-md">
              <SelectValue>
                {DEFAULT_USER_SEARCH_FIELDS.find(
                  (opt) => opt.id === searchField
                )?.label || "All fields"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
              {DEFAULT_USER_SEARCH_FIELDS.map((opt) => (
                <SelectItem
                  key={opt.id}
                  value={opt.id as string}
                  className="hover:bg-blue-800/40"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#22306e] text-blue-100 border border-blue-900/40 pl-10 pr-8 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-800/40 shadow-sm"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        {/* Filter popover */}
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-[#22306e] text-blue-100 border border-blue-900/40 hover:bg-blue-800/40 shadow-sm rounded-md flex items-center gap-2 ml-2"
            >
              <Filter className="h-4 w-4 text-blue-400" />
              Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-[#1e2a4a] border border-blue-900/40 rounded-xl shadow-lg p-4 animate-fade-in">
            <div className="mb-2 text-blue-200 font-semibold">
              Advanced Filters
            </div>
            <div className="flex flex-col gap-4">
              {/* Status Filter */}
              <div className="flex flex-col gap-1">
                <span className="text-sm text-blue-200">Status</span>
                <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-800/40 shadow-sm rounded-md">
                    <SelectValue>
                      {
                        statusOptions.find((opt) => opt.value === statusFilter)
                          ?.label
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
                    {statusOptions.map((opt) => (
                      <SelectItem
                        key={opt.id}
                        value={opt.value}
                        className="hover:bg-blue-800/40"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Role Filter */}
              <div className="flex flex-col gap-1">
                <span className="text-sm text-blue-200">Role</span>
                <Select value={roleFilter} onValueChange={handleRoleChange}>
                  <SelectTrigger className="w-full bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-800/40 shadow-sm rounded-md">
                    <SelectValue>
                      {
                        roleOptions.find((opt) => opt.value === roleFilter)
                          ?.label
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
                    {roleOptions.map((opt) => (
                      <SelectItem
                        key={opt.id}
                        value={opt.value}
                        className="hover:bg-blue-800/40"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              {(statusFilter !== "any" || roleFilter !== "any") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-300 hover:text-white flex items-center gap-1"
                  onClick={clearAllFilters}
                >
                  <X className="h-3 w-3" /> Clear All
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

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
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
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
                toast.success("User deleted successfully");
                handleUserDeleted();
              }
            } catch (error) {
              toast.error("Failed to delete user");
              console.error(error);
            }
          }}
        />
      )}

      {deleteMultipleOpen && (
        <BulkDeleteDialog
          open={deleteMultipleOpen}
          onOpenChange={setDeleteMultipleOpen}
          onConfirm={handleDeleteMultiple}
          selectedCount={selectedUsers.length}
        />
      )}

      {roleChangeOpen && (
        <BulkRoleChangeDialog
          open={roleChangeOpen}
          onOpenChange={setRoleChangeOpen}
          onConfirm={handleBulkRoleChange}
          selectedCount={selectedUsers.length}
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
        />
      )}
    </div>
  );
}
