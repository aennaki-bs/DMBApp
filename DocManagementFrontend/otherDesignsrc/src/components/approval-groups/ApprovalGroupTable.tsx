import { useState, useEffect } from "react";
import { toast } from "sonner";
import approvalService from "@/services/approvalService";
import { ApprovalGroup } from "@/models/approval";
import { ApprovalGroupTableContent } from "./table/ApprovalGroupTableContent";
import { BulkActionsBar } from "@/components/responsibility-centre/table/BulkActionsBar";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import ApprovalGroupEditDialog from "@/components/approval/ApprovalGroupEditDialog";
import ApprovalGroupViewDialog from "@/components/approval/ApprovalGroupViewDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApprovalGroupManagement } from "./hooks/useApprovalGroupManagement";
import { AlertTriangle, Filter, X, Search, RefreshCw } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BulkDeleteDialog } from "./dialogs/BulkDeleteDialog";
import { useTranslation } from "@/hooks/useTranslation";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ApprovalGroupManageUsersDialog } from "./dialogs/ApprovalGroupManageUsersDialog";

const DEFAULT_APPROVAL_GROUP_SEARCH_FIELDS = [
  { id: "all", label: "All Fields" },
  { id: "name", label: "Group Name" },
  { id: "comment", label: "Comment" },
  { id: "ruleType", label: "Rule Type" },
];

interface ApprovalGroupTableProps {
  onRefetchReady?: (refetchFn: () => void) => void;
}

export function ApprovalGroupTable({
  onRefetchReady,
}: ApprovalGroupTableProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [manageUsersDialogOpen, setManageUsersDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const [editingGroup, setEditingGroup] = useState<ApprovalGroup | null>(null);
  const [viewingGroup, setViewingGroup] = useState<ApprovalGroup | null>(null);
  const [managingGroup, setManagingGroup] = useState<ApprovalGroup | null>(
    null
  );
  const [deletingGroup, setDeletingGroup] = useState<number | null>(null);

  const { t, tWithParams } = useTranslation();

  const {
    selectedGroups,
    editingGroup: managementEditingGroup,
    viewingGroup: managementViewingGroup,
    deletingGroup: managementDeletingGroup,
    deleteMultipleOpen: managementDeleteMultipleOpen,
    searchQuery,
    setSearchQuery,
    searchField,
    setSearchField,
    ruleTypeFilter,
    setRuleTypeFilter,
    groups: filteredGroups,
    isLoading,
    isError,
    refetch,
    isFetching,
    isRefetching,
    handleSort,
    sortBy,
    sortDirection,
    handleSelectGroup,
    handleSelectAll,
    handleGroupEdited,
    handleMultipleDeleted,
    clearSelectedGroups,
  } = useApprovalGroupManagement();

  // Filter popover state
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter options
  const ruleTypeOptions = [
    { id: "any", label: "Any Rule Type", value: "any" },
    { id: "All", label: "All Must Approve", value: "All" },
    { id: "Any", label: "Any Can Approve", value: "Any" },
    { id: "Sequential", label: "Sequential", value: "Sequential" },
  ];

  // Apply filters immediately when changed
  const handleRuleTypeChange = (value: string) => {
    setRuleTypeFilter(value);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setRuleTypeFilter("any");
    setSearchQuery("");
    setFilterOpen(false);
  };

  const handleDeleteMultiple = async () => {
    try {
      await Promise.all(
        selectedGroups.map((groupId) =>
          approvalService.deleteApprovalGroup(groupId)
        )
      );
      toast.success(
        `${selectedGroups.length} approval groups deleted successfully`
      );
      handleMultipleDeleted();
    } catch (error) {
      toast.error("Failed to delete approval groups");
      console.error(error);
    }
  };

  // Pass refetch function to parent component
  useEffect(() => {
    if (onRefetchReady && refetch) {
      onRefetchReady(refetch);
    }
  }, [onRefetchReady, refetch]);

  // Enhanced manual refresh with visual feedback
  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await refetch();
      toast.success("Approval groups refreshed successfully!", {
        duration: 2000,
      });
    } catch (error) {
      toast.error("Failed to refresh approval groups");
    } finally {
      setIsManualRefreshing(false);
    }
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
        Error loading approval groups
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col gap-5 w-full px-1"
      style={{ minHeight: "100%" }}
    >
      {/* Modern Search + Filter Bar */}
      <div className="p-4 rounded-xl table-glass-container shadow-lg">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          {/* Auto-refresh indicator */}
          {isFetching && !isLoading && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-md text-xs text-primary">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Auto-refreshing...</span>
            </div>
          )}

          {/* Search and field select */}
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 min-w-0">
            <div className="relative w-full sm:w-auto">
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger className="w-full sm:w-[130px] h-9 text-sm table-search-select hover:table-search-select focus:ring-1 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all duration-200 shadow-sm rounded-md flex-shrink-0">
                  <SelectValue>
                    {DEFAULT_APPROVAL_GROUP_SEARCH_FIELDS.find(
                      (opt) => opt.id === searchField
                    )?.label || "All Fields"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="table-search-select rounded-lg shadow-xl">
                  {DEFAULT_APPROVAL_GROUP_SEARCH_FIELDS.map((opt) => (
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

            <div className="relative flex-1 group min-w-0">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-sm"></div>
              <Input
                placeholder="Search approval groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative h-9 text-sm table-search-input pl-10 pr-4 rounded-md focus:ring-1 transition-all duration-200 shadow-sm group-hover:shadow-md w-full"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 table-search-icon group-hover:table-search-icon transition-colors duration-200">
                <Search className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            {/* Manual Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isManualRefreshing}
              className="h-9 px-3 text-xs table-search-text hover:table-search-text-hover transition-all duration-200"
              title="Refresh approval groups"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 mr-1.5 ${
                  isManualRefreshing ? "animate-spin" : ""
                }`}
              />
              {isManualRefreshing ? "Refreshing..." : "Refresh"}
            </Button>

            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-9 px-3 text-xs table-search-text hover:table-search-text-hover transition-all duration-200 ${
                    ruleTypeFilter !== "any" ? "table-glass-badge" : ""
                  }`}
                >
                  <Filter className="h-3.5 w-3.5 mr-1.5" />
                  Filter
                  {ruleTypeFilter !== "any" && (
                    <span className="ml-1 px-1.5 py-0.5 bg-primary/20 text-primary rounded text-xs">
                      1
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-72 p-4 table-search-select shadow-xl rounded-lg"
                align="end"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium table-search-text">
                      Rule Type
                    </label>
                    <Select
                      value={ruleTypeFilter}
                      onValueChange={handleRuleTypeChange}
                    >
                      <SelectTrigger className="h-8 text-xs table-search-select hover:table-search-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="table-search-select">
                        {ruleTypeOptions.map((option) => (
                          <SelectItem
                            key={option.id}
                            value={option.value}
                            className="text-xs hover:table-search-select focus:table-search-select"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {(searchQuery || ruleTypeFilter !== "any") && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {searchQuery && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-1 cursor-pointer transition-all duration-200 hover:bg-primary/20 hover:text-primary-foreground table-glass-badge"
                    onClick={clearAllFilters}
                  >
                    Search: {searchQuery}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
                {ruleTypeFilter !== "any" && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-1 cursor-pointer transition-all duration-200 hover:bg-primary/20 hover:text-primary-foreground table-glass-badge"
                    onClick={clearAllFilters}
                  >
                    Type: {ruleTypeFilter}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
              </div>
            )}

            {(searchQuery || ruleTypeFilter !== "any") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-8 px-2 text-xs table-search-text hover:table-search-text-hover hover:table-search-select rounded-md transition-all duration-200 flex items-center gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ApprovalGroupTableContent
          groups={filteredGroups}
          selectedGroups={selectedGroups}
          onSelectAll={() => handleSelectAll(filteredGroups || [])}
          onSelectGroup={handleSelectGroup}
          onEditGroup={(group) => {
            setEditingGroup(group);
            setEditDialogOpen(true);
          }}
          onViewGroup={(group) => {
            setViewingGroup(group);
            setViewDialogOpen(true);
          }}
          onDeleteGroup={(group) => setDeletingGroup(group.id)}
          onManageApprovers={(group) => {
            setManagingGroup(group);
            setManageUsersDialogOpen(true);
          }}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      {selectedGroups.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedGroups.length}
          totalCount={filteredGroups?.length}
          onClearSelection={clearSelectedGroups}
          onDelete={() => setDeleteMultipleOpen(true)}
        />
      )}

      {/* Edit Group Dialog */}
      {editingGroup && (
        <ApprovalGroupEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          group={editingGroup}
          onSuccess={() => {
            handleGroupEdited();
            setEditDialogOpen(false);
            setEditingGroup(null);
          }}
        />
      )}

      {/* View Group Dialog */}
      {viewingGroup && (
        <ApprovalGroupViewDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          group={viewingGroup}
          isAssociated={false}
        />
      )}

      {deletingGroup !== null && (
        <DeleteConfirmDialog
          title="Delete Approval Group"
          description="Are you sure you want to delete this approval group? This action cannot be undone."
          open={deletingGroup !== null}
          onOpenChange={(open) => !open && setDeletingGroup(null)}
          onConfirm={async () => {
            try {
              if (deletingGroup) {
                await approvalService.deleteApprovalGroup(deletingGroup);
                toast.success("Approval group deleted successfully");
                setDeletingGroup(null);
                refetch();
              }
            } catch (error) {
              toast.error("Failed to delete approval group");
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
          selectedCount={selectedGroups.length}
        />
      )}

      {/* Manage Users Dialog */}
      <ApprovalGroupManageUsersDialog
        group={managingGroup}
        isOpen={manageUsersDialogOpen}
        onClose={() => {
          setManageUsersDialogOpen(false);
          setManagingGroup(null);
        }}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}
