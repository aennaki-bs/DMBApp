import { UserDto } from "@/services/adminService";
import { Table } from "@/components/ui/table";
import { UserTableHeader } from "./content/UserTableHeader";
import { UserTableBody } from "./content/UserTableBody";
import { UserTableEmpty } from "./UserTableEmpty";
import { ScrollArea } from "@/components/ui/scroll-area";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";
import { Loader2, UserCog, Trash2, X, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { ReactNode } from "react";

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
  isLoading?: boolean;
  isError?: boolean;
  // Bulk actions props
  onBulkDelete?: () => void;
  onBulkChangeRole?: () => void;
  onClearSelection?: () => void;
  totalCount?: number;
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
  isLoading = false,
  isError = false,
  // Bulk actions props
  onBulkDelete,
  onBulkChangeRole,
  onClearSelection,
  totalCount,
}: UserTableContentProps) {
  const { theme } = useTheme();

  // Use pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    paginatedData: paginatedUsers,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: users || [],
    initialPageSize: 15,
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
      // Deselect all users on current page
      currentPageUserIds.forEach((userId) => {
        if (selectedUsers.includes(userId)) {
          onSelectUser(userId);
        }
      });
    } else {
      // Select all users on current page only
      currentPageUserIds.forEach((userId) => {
        if (!selectedUsers.includes(userId)) {
          onSelectUser(userId);
        }
      });
    }
  };

  // Get theme-specific colors for bulk actions - Enhanced Professional Look
  const getThemeColors = () => {
    const themeVariant = theme.variant;
    const isDark = theme.mode === "dark";

    switch (themeVariant) {
      case "ocean-blue":
        return {
          gradient: isDark
            ? "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 50%, rgba(51, 65, 85, 0.95) 100%)"
            : "linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.98) 50%, rgba(226, 232, 240, 0.95) 100%)",
          border: isDark
            ? "rgba(59, 130, 246, 0.3)"
            : "rgba(59, 130, 246, 0.2)",
          text: isDark ? "rgb(226, 232, 240)" : "rgb(51, 65, 85)",
          textAccent: isDark ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)",
          buttonBg: isDark
            ? "rgba(59, 130, 246, 0.15)"
            : "rgba(59, 130, 246, 0.08)",
          buttonBgHover: isDark
            ? "rgba(59, 130, 246, 0.25)"
            : "rgba(59, 130, 246, 0.15)",
          buttonBorder: isDark
            ? "rgba(59, 130, 246, 0.4)"
            : "rgba(59, 130, 246, 0.3)",
          buttonBorderHover: isDark
            ? "rgba(96, 165, 250, 0.6)"
            : "rgba(96, 165, 250, 0.5)",
          buttonText: isDark ? "rgb(196, 210, 255)" : "rgb(59, 130, 246)",
          progressColors: ["#3b82f6", "#60a5fa", "#93c5fd"],
          iconGradient: isDark
            ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
            : "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
          statsBg: isDark
            ? "rgba(59, 130, 246, 0.08)"
            : "rgba(59, 130, 246, 0.05)",
          statsAccent: isDark ? "#60a5fa" : "#3b82f6",
        };
      case "emerald-green":
        return {
          gradient: isDark
            ? "linear-gradient(135deg, rgba(6, 20, 15, 0.95) 0%, rgba(6, 78, 59, 0.98) 50%, rgba(4, 120, 87, 0.95) 100%)"
            : "linear-gradient(135deg, rgba(236, 253, 245, 0.95) 0%, rgba(209, 250, 229, 0.98) 50%, rgba(167, 243, 208, 0.95) 100%)",
          border: isDark
            ? "rgba(16, 185, 129, 0.3)"
            : "rgba(16, 185, 129, 0.2)",
          text: isDark ? "rgb(209, 250, 229)" : "rgb(6, 78, 59)",
          textAccent: isDark ? "rgb(52, 211, 153)" : "rgb(16, 185, 129)",
          buttonBg: isDark
            ? "rgba(16, 185, 129, 0.15)"
            : "rgba(16, 185, 129, 0.08)",
          buttonBgHover: isDark
            ? "rgba(16, 185, 129, 0.25)"
            : "rgba(16, 185, 129, 0.15)",
          buttonBorder: isDark
            ? "rgba(16, 185, 129, 0.4)"
            : "rgba(16, 185, 129, 0.3)",
          buttonBorderHover: isDark
            ? "rgba(52, 211, 153, 0.6)"
            : "rgba(52, 211, 153, 0.5)",
          buttonText: isDark ? "rgb(167, 243, 208)" : "rgb(16, 185, 129)",
          progressColors: ["#10b981", "#34d399", "#6ee7b7"],
          iconGradient: isDark
            ? "linear-gradient(135deg, #10b981 0%, #047857 100%)"
            : "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
          statsBg: isDark
            ? "rgba(16, 185, 129, 0.08)"
            : "rgba(16, 185, 129, 0.05)",
          statsAccent: isDark ? "#34d399" : "#10b981",
        };
      case "purple-haze":
        return {
          gradient: isDark
            ? "linear-gradient(135deg, rgba(24, 7, 37, 0.95) 0%, rgba(88, 28, 135, 0.98) 50%, rgba(124, 58, 237, 0.95) 100%)"
            : "linear-gradient(135deg, rgba(250, 245, 255, 0.95) 0%, rgba(243, 232, 255, 0.98) 50%, rgba(221, 214, 254, 0.95) 100%)",
          border: isDark
            ? "rgba(139, 92, 246, 0.3)"
            : "rgba(139, 92, 246, 0.2)",
          text: isDark ? "rgb(221, 214, 254)" : "rgb(88, 28, 135)",
          textAccent: isDark ? "rgb(167, 139, 250)" : "rgb(139, 92, 246)",
          buttonBg: isDark
            ? "rgba(139, 92, 246, 0.15)"
            : "rgba(139, 92, 246, 0.08)",
          buttonBgHover: isDark
            ? "rgba(139, 92, 246, 0.25)"
            : "rgba(139, 92, 246, 0.15)",
          buttonBorder: isDark
            ? "rgba(139, 92, 246, 0.4)"
            : "rgba(139, 92, 246, 0.3)",
          buttonBorderHover: isDark
            ? "rgba(167, 139, 250, 0.6)"
            : "rgba(167, 139, 250, 0.5)",
          buttonText: isDark ? "rgb(196, 181, 253)" : "rgb(139, 92, 246)",
          progressColors: ["#8b5cf6", "#a78bfa", "#c4b5fd"],
          iconGradient: isDark
            ? "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
            : "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
          statsBg: isDark
            ? "rgba(139, 92, 246, 0.08)"
            : "rgba(139, 92, 246, 0.05)",
          statsAccent: isDark ? "#a78bfa" : "#8b5cf6",
        };
      case "orange-sunset":
        return {
          gradient: isDark
            ? "linear-gradient(135deg, rgba(45, 17, 5, 0.95) 0%, rgba(194, 65, 12, 0.98) 50%, rgba(234, 88, 12, 0.95) 100%)"
            : "linear-gradient(135deg, rgba(255, 247, 237, 0.95) 0%, rgba(254, 235, 200, 0.98) 50%, rgba(253, 186, 116, 0.95) 100%)",
          border: isDark
            ? "rgba(251, 146, 60, 0.3)"
            : "rgba(251, 146, 60, 0.2)",
          text: isDark ? "rgb(254, 215, 170)" : "rgb(194, 65, 12)",
          textAccent: isDark ? "rgb(251, 146, 60)" : "rgb(234, 88, 12)",
          buttonBg: isDark
            ? "rgba(251, 146, 60, 0.15)"
            : "rgba(251, 146, 60, 0.08)",
          buttonBgHover: isDark
            ? "rgba(251, 146, 60, 0.25)"
            : "rgba(251, 146, 60, 0.15)",
          buttonBorder: isDark
            ? "rgba(251, 146, 60, 0.4)"
            : "rgba(251, 146, 60, 0.3)",
          buttonBorderHover: isDark
            ? "rgba(252, 165, 85, 0.6)"
            : "rgba(252, 165, 85, 0.5)",
          buttonText: isDark ? "rgb(253, 186, 116)" : "rgb(234, 88, 12)",
          progressColors: ["#ea580c", "#fb923c", "#fcd34d"],
          iconGradient: isDark
            ? "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)"
            : "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)",
          statsBg: isDark
            ? "rgba(251, 146, 60, 0.08)"
            : "rgba(251, 146, 60, 0.05)",
          statsAccent: isDark ? "#fb923c" : "#ea580c",
        };
      case "dark-neutral":
        return {
          gradient: isDark
            ? "linear-gradient(135deg, rgba(15, 15, 15, 0.95) 0%, rgba(38, 38, 38, 0.98) 50%, rgba(64, 64, 64, 0.95) 100%)"
            : "linear-gradient(135deg, rgba(250, 250, 250, 0.95) 0%, rgba(245, 245, 245, 0.98) 50%, rgba(229, 229, 229, 0.95) 100%)",
          border: isDark
            ? "rgba(115, 115, 115, 0.3)"
            : "rgba(115, 115, 115, 0.2)",
          text: isDark ? "rgb(212, 212, 212)" : "rgb(64, 64, 64)",
          textAccent: isDark ? "rgb(163, 163, 163)" : "rgb(38, 38, 38)",
          buttonBg: isDark
            ? "rgba(115, 115, 115, 0.15)"
            : "rgba(115, 115, 115, 0.08)",
          buttonBgHover: isDark
            ? "rgba(115, 115, 115, 0.25)"
            : "rgba(115, 115, 115, 0.15)",
          buttonBorder: isDark
            ? "rgba(115, 115, 115, 0.4)"
            : "rgba(115, 115, 115, 0.3)",
          buttonBorderHover: isDark
            ? "rgba(163, 163, 163, 0.6)"
            : "rgba(163, 163, 163, 0.5)",
          buttonText: isDark ? "rgb(212, 212, 212)" : "rgb(82, 82, 82)",
          progressColors: ["#525252", "#737373", "#a3a3a3"],
          iconGradient: isDark
            ? "linear-gradient(135deg, #525252 0%, #262626 100%)"
            : "linear-gradient(135deg, #737373 0%, #525252 100%)",
          statsBg: isDark
            ? "rgba(115, 115, 115, 0.08)"
            : "rgba(115, 115, 115, 0.05)",
          statsAccent: isDark ? "#737373" : "#525252",
        };
      // Enhanced default theme
      default:
        return {
          gradient: isDark
            ? "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 50%, rgba(51, 65, 85, 0.95) 100%)"
            : "linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.98) 50%, rgba(226, 232, 240, 0.95) 100%)",
          border: isDark
            ? "rgba(59, 130, 246, 0.3)"
            : "rgba(59, 130, 246, 0.2)",
          text: isDark ? "rgb(226, 232, 240)" : "rgb(51, 65, 85)",
          textAccent: isDark ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)",
          buttonBg: isDark
            ? "rgba(59, 130, 246, 0.15)"
            : "rgba(59, 130, 246, 0.08)",
          buttonBgHover: isDark
            ? "rgba(59, 130, 246, 0.25)"
            : "rgba(59, 130, 246, 0.15)",
          buttonBorder: isDark
            ? "rgba(59, 130, 246, 0.4)"
            : "rgba(59, 130, 246, 0.3)",
          buttonBorderHover: isDark
            ? "rgba(96, 165, 250, 0.6)"
            : "rgba(96, 165, 250, 0.5)",
          buttonText: isDark ? "rgb(196, 210, 255)" : "rgb(59, 130, 246)",
          progressColors: ["#3b82f6", "#60a5fa", "#93c5fd"],
          iconGradient: isDark
            ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
            : "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
          statsBg: isDark
            ? "rgba(59, 130, 246, 0.08)"
            : "rgba(59, 130, 246, 0.05)",
          statsAccent: isDark ? "#60a5fa" : "#3b82f6",
        };
    }
  };

  const colors = getThemeColors();
  const selectionPercentage = totalCount
    ? (selectedUsers.length / totalCount) * 100
    : 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl table-glass-loading shadow-lg">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin table-glass-loading-spinner" />
              <p className="table-glass-loading-text">Loading users...</p>
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
                Failed to load users. Please try again.
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
        {hasUsers ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Fixed Header - Never Scrolls */}
            <div className="flex-shrink-0 overflow-x-auto table-glass-header">
              <div className="min-w-[1026px]">
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
            </div>

            {/* Scrollable Body - Only Content Scrolls - FILL REMAINING HEIGHT */}
            <div
              className="flex-1 overflow-hidden"
              style={{ maxHeight: "calc(100vh - 280px)" }}
            >
              <ScrollArea className="h-full w-full">
                <div className="min-w-[1026px] pb-2">
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
            </div>
          </div>
        ) : (
          <div className="relative h-full flex items-center justify-center z-10">
            <UserTableEmpty onClearFilters={onClearFilters} />
          </div>
        )}
      </div>

      {/* Combined Pagination and Bulk Actions Container */}
      {hasUsers && (
        <div className="table-glass-pagination p-4 rounded-2xl">
          {selectedUsers.length > 0 ? (
            /* Combined Layout: Pagination left, Bulk Actions right */
            <div className="flex items-center justify-between gap-4">
              {/* Left: Pagination */}
              <div className="flex-1">
                <SmartPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  pageSizeOptions={[10, 15, 25, 50, 100]}
                />
              </div>

              {/* Right: Bulk Actions */}
              <div className="flex items-center gap-4">
                {/* Selection Info */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div
                      className="p-2.5 rounded-xl shadow-lg backdrop-blur-sm border border-opacity-30"
                      style={{
                        background: colors.iconGradient,
                        borderColor: colors.border,
                        boxShadow: `0 8px 25px -5px ${colors.progressColors[0]}40, 0 4px 6px -2px ${colors.progressColors[0]}20`,
                      }}
                    >
                      <UserCog className="w-4 h-4 text-white drop-shadow-sm" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="font-bold text-base"
                      style={{ color: colors.textAccent }}
                    >
                      {selectedUsers.length}
                    </span>
                    <span
                      className="font-medium text-sm"
                      style={{ color: colors.text }}
                    >
                      User{selectedUsers.length !== 1 ? "s" : ""} Selected
                    </span>
                  </div>
                </div>

                {/* Enhanced Separator */}
                <div
                  className="w-px h-8 rounded-full"
                  style={{
                    background: `linear-gradient(to bottom, transparent, ${colors.border}, transparent)`,
                  }}
                ></div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {onClearSelection && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 transition-all duration-300 text-xs font-semibold backdrop-blur-md border rounded-lg shadow-sm hover:shadow-md"
                      style={{
                        backgroundColor: colors.buttonBg,
                        borderColor: colors.buttonBorder,
                        color: colors.buttonText,
                        boxShadow: `0 2px 8px -2px ${colors.progressColors[0]}20`,
                      }}
                      onMouseEnter={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.backgroundColor = colors.buttonBgHover;
                        target.style.borderColor = colors.buttonBorderHover;
                        target.style.color = colors.textAccent;
                        target.style.boxShadow = `0 4px 12px -2px ${colors.progressColors[0]}30`;
                        target.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.backgroundColor = colors.buttonBg;
                        target.style.borderColor = colors.buttonBorder;
                        target.style.color = colors.buttonText;
                        target.style.boxShadow = `0 2px 8px -2px ${colors.progressColors[0]}20`;
                        target.style.transform = "translateY(0px)";
                      }}
                      onClick={onClearSelection}
                    >
                      <X className="w-3 h-3 mr-1.5" />
                      <span>Clear</span>
                    </Button>
                  )}

                  {onBulkChangeRole && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 transition-all duration-300 text-xs font-semibold backdrop-blur-md border rounded-lg shadow-sm hover:shadow-md"
                      style={{
                        backgroundColor: colors.buttonBg,
                        borderColor: colors.buttonBorder,
                        color: colors.buttonText,
                        boxShadow: `0 2px 8px -2px ${colors.progressColors[0]}20`,
                      }}
                      onMouseEnter={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.backgroundColor = colors.buttonBgHover;
                        target.style.borderColor = colors.buttonBorderHover;
                        target.style.color = colors.textAccent;
                        target.style.boxShadow = `0 4px 12px -2px ${colors.progressColors[0]}30`;
                        target.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.backgroundColor = colors.buttonBg;
                        target.style.borderColor = colors.buttonBorder;
                        target.style.color = colors.buttonText;
                        target.style.boxShadow = `0 2px 8px -2px ${colors.progressColors[0]}20`;
                        target.style.transform = "translateY(0px)";
                      }}
                      onClick={onBulkChangeRole}
                    >
                      <Settings className="w-3 h-3 mr-1.5" />
                      <span>Change Role</span>
                    </Button>
                  )}

                  {onBulkDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 transition-all duration-300 text-xs font-semibold backdrop-blur-md border rounded-lg shadow-sm hover:shadow-md"
                      style={{
                        backgroundColor: colors.buttonBg,
                        borderColor: colors.buttonBorder,
                        color: colors.buttonText,
                        boxShadow: `0 2px 8px -2px ${colors.progressColors[0]}20`,
                      }}
                      onMouseEnter={(e) => {
                        const target = e.target as HTMLElement;
                        const isDark = theme.mode === "dark";
                        // Special red hover for delete action
                        target.style.backgroundColor = isDark
                          ? "rgba(239, 68, 68, 0.15)"
                          : "rgba(239, 68, 68, 0.08)";
                        target.style.borderColor = isDark
                          ? "rgba(239, 68, 68, 0.4)"
                          : "rgba(239, 68, 68, 0.3)";
                        target.style.color = isDark
                          ? "rgb(252, 165, 165)"
                          : "rgb(239, 68, 68)";
                        target.style.boxShadow =
                          "0 4px 12px -2px rgba(239, 68, 68, 0.3)";
                        target.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.backgroundColor = colors.buttonBg;
                        target.style.borderColor = colors.buttonBorder;
                        target.style.color = colors.buttonText;
                        target.style.boxShadow = `0 2px 8px -2px ${colors.progressColors[0]}20`;
                        target.style.transform = "translateY(0px)";
                      }}
                      onClick={onBulkDelete}
                    >
                      <Trash2 className="w-3 h-3 mr-1.5" />
                      <span>Delete</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Normal Layout: Only Pagination */
            <SmartPagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[10, 15, 25, 50, 100]}
            />
          )}
        </div>
      )}
    </div>
  );
}
