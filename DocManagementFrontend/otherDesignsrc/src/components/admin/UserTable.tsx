import { useState } from "react";
import { toast } from "sonner";
import adminService from "@/services/adminService";
import { UserTableHeader } from "./table/UserTableHeader";
import { UserTableContent } from "./table/UserTableContent";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { DirectEditUserModal } from "./DirectEditUserModal";
import { DirectEditUserEmailModal } from "./DirectEditUserEmailModal";
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
import { useTranslation } from "@/hooks/useTranslation";

export function UserTable() {
  const [directEditModalOpen, setDirectEditModalOpen] = useState(false);
  const [directEditEmailModalOpen, setDirectEditEmailModalOpen] =
    useState(false);
  const { t, tWithParams } = useTranslation();

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
    handleMultipleDeleted,
    clearSelectedUsers,
  } = useUserManagement();

  const handleToggleUserStatus = async (
    userId: number,
    currentStatus: boolean
  ) => {
    try {
      const newStatus = !currentStatus;
      await adminService.updateUser(userId, { isActive: newStatus });
      toast.success(
        newStatus
          ? t("userManagement.userActivated")
          : t("userManagement.userBlocked")
      );
      refetch();
    } catch (error) {
      toast.error(
        currentStatus
          ? t("userManagement.failedToBlock")
          : t("userManagement.failedToActivate")
      );
      console.error(error);
    }
  };

  const handleUserRoleChange = async (userId: number, roleName: string) => {
    try {
      await adminService.updateUser(userId, { roleName });
      toast.success(
        tWithParams("userManagement.roleChanged", { role: roleName })
      );
      refetch();
    } catch (error) {
      toast.error(t("userManagement.failedToChangeRole"));
      console.error(error);
    }
  };

  const handleBulkRoleChange = async () => {
    console.log("handleBulkRoleChange called", { selectedRole, selectedUsers });

    if (!selectedRole || selectedUsers.length === 0) {
      toast.error("Please select a role and at least one user");
      return;
    }

    try {
      console.log(
        "Starting bulk role update for users:",
        selectedUsers,
        "to role:",
        selectedRole
      );

      const updatePromises = selectedUsers.map((userId) =>
        adminService.updateUser(userId, { roleName: selectedRole })
      );

      await Promise.all(updatePromises);

      console.log("Bulk role update successful");

      toast.success(
        tWithParams("userManagement.roleUpdateSuccess", {
          role: selectedRole,
          count: selectedUsers.length,
        })
      );

      // Refresh data and clear state
      await refetch();
      setRoleChangeOpen(false);
      setSelectedRole("");
      clearSelectedUsers();
    } catch (error) {
      console.error("Bulk role update failed:", error);
      toast.error(t("userManagement.failedToUpdateRoles"));
    }
  };

  const handleDeleteMultiple = async () => {
    try {
      await adminService.deleteMultipleUsers(selectedUsers);
      toast.success(
        tWithParams("userManagement.deleteSuccess", {
          count: selectedUsers.length,
        })
      );
      handleMultipleDeleted();
    } catch (error) {
      toast.error(t("userManagement.failedToDelete"));
      console.error(error);
    }
  };

  // Handle user edit using the direct modal
  const handleEditUser = async (userId: number, userData: any) => {
    try {
      await adminService.updateUser(userId, userData);
      refetch();
      return Promise.resolve();
    } catch (error) {
      console.error(`Failed to update user ${userId}:`, error);
      return Promise.reject(error);
    }
  };

  // Handle email edit using the direct modal
  const handleEditUserEmail = async (userId: number, newEmail: string) => {
    try {
      await adminService.updateUserEmail(userId, newEmail);
      refetch();
      handleUserEmailEdited();
      return Promise.resolve();
    } catch (error) {
      console.error(`Failed to update email for user ${userId}:`, error);
      return Promise.reject(error);
    }
  };

  // Professional filter/search bar styling
  const filterCardClass =
    "w-full flex flex-col md:flex-row items-center gap-2.5 p-3 rounded-lg bg-gradient-to-r from-primary/4 via-background/40 to-primary/4 backdrop-blur-lg shadow-md border border-primary/8";

  // Filter popover state
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter options
  const statusOptions = [
    { id: "any", label: t("userManagement.anyStatus"), value: "any" },
    { id: "active", label: t("userManagement.active"), value: "active" },
    { id: "inactive", label: t("userManagement.inactive"), value: "inactive" },
  ];
  const roleOptions = [
    { id: "any", label: t("userManagement.anyRole"), value: "any" },
    { id: "Admin", label: t("userManagement.admin"), value: "Admin" },
    { id: "FullUser", label: t("userManagement.fullUser"), value: "FullUser" },
    {
      id: "SimpleUser",
      label: t("userManagement.simpleUser"),
      value: "SimpleUser",
    },
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
    setSearchQuery("");
    setFilterOpen(false); // Close popover after clearing
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-destructive py-10 text-center">
        <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
        {t("userManagement.errorLoading")}
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col gap-5 w-full px-1"
      style={{ minHeight: "100%" }}
    >
      {/* Compact Search + Filter Bar */}
      <div className="p-4 rounded-xl table-glass-container shadow-lg">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          {/* Search and field select */}
          <div className="flex-1 flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger className="w-[130px] h-9 text-sm table-search-select hover:table-search-select focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-200 shadow-sm rounded-md flex-shrink-0">
                  <SelectValue>
                    {DEFAULT_USER_SEARCH_FIELDS.find(
                      (opt) => opt.id === searchField
                    )?.label || t("userManagement.allFields")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="table-search-select rounded-lg shadow-xl">
                  {DEFAULT_USER_SEARCH_FIELDS.map((opt) => (
                    <SelectItem
                      key={opt.id}
                      value={opt.id as string}
                      className="text-xs hover:table-search-select focus:table-search-select rounded-md"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1 group min-w-[200px]">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-sm"></div>
              <Input
                placeholder={t("userManagement.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative h-9 text-sm table-search-input pl-10 pr-4 rounded-md focus:ring-1 transition-all duration-200 shadow-sm group-hover:shadow-md"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 table-search-icon group-hover:table-search-icon transition-colors duration-200">
                <svg
                  className="h-4 w-4"
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
          </div>
          {/* Filter popover */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 text-sm table-search-select hover:table-search-select shadow-sm rounded-md flex items-center gap-2 transition-all duration-200 hover:shadow-md whitespace-nowrap"
                >
                  <Filter className="h-3.5 w-3.5" />
                  {t("userManagement.filter")}
                  {(statusFilter !== "any" || roleFilter !== "any") && (
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 table-search-select rounded-lg shadow-xl p-4">
                <div className="mb-3 table-search-text font-semibold text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4 table-search-icon" />
                  {t("userManagement.advancedFilters")}
                </div>
                <div className="flex flex-col gap-3">
                  {/* Status Filter */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs table-search-text font-medium">
                      {t("userManagement.status")}
                    </span>
                    <Select
                      value={statusFilter}
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger className="w-full h-8 text-xs table-search-select focus:ring-1 transition-colors duration-200 shadow-sm rounded-md">
                        <SelectValue>
                          {
                            statusOptions.find(
                              (opt) => opt.value === statusFilter
                            )?.label
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="table-search-select">
                        {statusOptions.map((opt) => (
                          <SelectItem
                            key={opt.id}
                            value={opt.value}
                            className="text-xs hover:table-search-select"
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Role Filter */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs table-search-text font-medium">
                      {t("userManagement.role")}
                    </span>
                    <Select value={roleFilter} onValueChange={handleRoleChange}>
                      <SelectTrigger className="w-full h-8 text-xs table-search-select focus:ring-1 transition-colors duration-200 shadow-sm rounded-md">
                        <SelectValue>
                          {
                            roleOptions.find((opt) => opt.value === roleFilter)
                              ?.label
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="table-search-select">
                        {roleOptions.map((opt) => (
                          <SelectItem
                            key={opt.id}
                            value={opt.value}
                            className="text-xs hover:table-search-select"
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
                      className="h-7 px-2 text-xs table-search-text hover:table-search-text-hover hover:table-search-select rounded-md transition-all duration-200 flex items-center gap-1.5"
                      onClick={clearAllFilters}
                    >
                      <X className="h-3 w-3" /> {t("userManagement.clearAll")}
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <UserTableContent
          users={filteredUsers}
          selectedUsers={selectedUsers}
          onSelectAll={() => handleSelectAll(filteredUsers || [])}
          onSelectUser={handleSelectUser}
          onToggleStatus={handleToggleUserStatus}
          onRoleChange={handleUserRoleChange}
          onEdit={(user) => {
            console.log("Editing user:", user);
            setEditingUser(user);
            setDirectEditModalOpen(true);
          }}
          onEditEmail={(user) => {
            console.log("Editing email for user:", user);
            setEditEmailUser(user);
            setDirectEditEmailModalOpen(true);
          }}
          onViewLogs={setViewingUserLogs}
          onDelete={setDeletingUser}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          onClearFilters={clearAllFilters}
          isLoading={isLoading}
          isError={isError}
          // Bulk actions props
          onBulkDelete={() => setDeleteMultipleOpen(true)}
          onBulkChangeRole={() => setRoleChangeOpen(true)}
          onClearSelection={clearSelectedUsers}
          totalCount={filteredUsers?.length}
        />
      </div>

      {/* Direct Edit Modal */}
      <DirectEditUserModal
        user={editingUser}
        isOpen={directEditModalOpen}
        onClose={() => {
          setDirectEditModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleEditUser}
      />

      {/* Direct Email Edit Modal */}
      <DirectEditUserEmailModal
        user={editEmailUser}
        isOpen={directEditEmailModalOpen}
        onClose={() => {
          setDirectEditEmailModalOpen(false);
          setEditEmailUser(null);
        }}
        onSave={handleEditUserEmail}
      />

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
                setDeletingUser(null);
                refetch();
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
          onOpenChange={(open) => {
            setRoleChangeOpen(open);
            if (!open) {
              // Reset selected role when dialog is cancelled
              setSelectedRole("");
            }
          }}
          onConfirm={handleBulkRoleChange}
          selectedCount={selectedUsers.length}
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
        />
      )}
    </div>
  );
}
