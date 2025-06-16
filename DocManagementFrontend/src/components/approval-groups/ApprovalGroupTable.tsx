import { useState } from "react";
import { toast } from "sonner";
import approvalService from "@/services/approvalService";
import { ApprovalGroupTableContent } from "./table/ApprovalGroupTableContent";
import { BulkActionsBar } from "@/components/admin/table/BulkActionsBar";
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
import { AlertTriangle, Filter, X, Search } from "lucide-react";
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

const DEFAULT_APPROVAL_GROUP_SEARCH_FIELDS = [
  { id: "all", label: "All Fields" },
  { id: "name", label: "Group Name" },
  { id: "comment", label: "Comment" },
  { id: "ruleType", label: "Rule Type" },
];

export function ApprovalGroupTable() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { t, tWithParams } = useTranslation();

  const {
    selectedGroups,
    editingGroup,
    viewingGroup,
    deletingGroup,
    deleteMultipleOpen,
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
    setEditingGroup,
    setViewingGroup,
    setDeletingGroup,
    setDeleteMultipleOpen,
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
      {/* Compact Search + Filter Bar */}
      <div className="p-4 rounded-xl table-glass-container shadow-lg">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          {/* Search and field select */}
          <div className="flex-1 flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger className="w-[130px] h-9 text-sm hover:bg-muted/50 focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200 shadow-sm rounded-md flex-shrink-0">
                  <SelectValue>
                    {DEFAULT_APPROVAL_GROUP_SEARCH_FIELDS.find(
                      (opt) => opt.id === searchField
                    )?.label || "All Fields"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-lg shadow-xl">
                  {DEFAULT_APPROVAL_GROUP_SEARCH_FIELDS.map((opt) => (
                    <SelectItem
                      key={opt.id}
                      value={opt.id as string}
                      className="text-xs hover:bg-muted/50 focus:bg-muted/50 rounded-md"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1 group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-sm"></div>
              <Input
                placeholder="Search approval groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative h-9 text-sm pl-10 pr-4 rounded-md focus:ring-1 transition-all duration-200 shadow-sm group-hover:shadow-md"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                <Search className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center gap-2">
            {(searchQuery || ruleTypeFilter !== "any") && (
              <div className="flex items-center gap-1.5">
                {searchQuery && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-1 cursor-pointer transition-colors duration-150"
                    onClick={clearAllFilters}
                  >
                    Search: {searchQuery}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
                {ruleTypeFilter !== "any" && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-1 cursor-pointer transition-colors duration-150"
                    onClick={clearAllFilters}
                  >
                    Type: {ruleTypeFilter}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
              </div>
            )}

            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-9 px-3 text-xs transition-all duration-200 ${
                    ruleTypeFilter !== "any"
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Filter className="h-3.5 w-3.5 mr-1.5" />
                  Filter
                  {ruleTypeFilter !== "any" && (
                    <div className="ml-1.5 w-1.5 h-1.5 rounded-full bg-primary"></div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4" align="end">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-3">Rule Type</h4>
                    <div className="space-y-2">
                      {ruleTypeOptions.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={option.value}
                            checked={ruleTypeFilter === option.value}
                            onCheckedChange={() =>
                              setRuleTypeFilter(option.value)
                            }
                            className="h-4 w-4"
                          />
                          <label
                            htmlFor={option.value}
                            className="text-sm cursor-pointer"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    {ruleTypeFilter !== "any" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs hover:bg-muted/50 rounded-md transition-all duration-200 flex items-center gap-1.5"
                        onClick={clearAllFilters}
                      >
                        <X className="h-3 w-3" /> Clear All
                      </Button>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ApprovalGroupTableContent
          groups={filteredGroups}
          selectedGroups={selectedGroups}
          onSelectAll={() => handleSelectAll(filteredGroups || [])}
          onSelectGroup={handleSelectGroup}
          onEdit={(group) => {
            setEditingGroup(group);
            setEditDialogOpen(true);
          }}
          onView={(group) => {
            setViewingGroup(group);
            setViewDialogOpen(true);
          }}
          onDelete={setDeletingGroup}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          onClearFilters={clearAllFilters}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      {selectedGroups.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedGroups.length}
          onChangeRole={() => {
            // Not applicable for approval groups, but required by interface
          }}
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
    </div>
  );
}
