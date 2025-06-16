import { useState } from "react";
import { toast } from "sonner";
import approvalService from "@/services/approvalService";
import { ApproversTableContent } from "./table/ApproversTableContent";
import { BulkActionsBar } from "@/components/admin/table/BulkActionsBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApproversManagement } from "./hooks/useApproversManagement";
import { AlertTriangle, Filter, X } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const DEFAULT_APPROVER_SEARCH_FIELDS = [
  { id: "all", label: "All Fields" },
  { id: "username", label: "Approver Name" },
  { id: "comment", label: "Comment" },
];

export function ApproversTable() {
  const {
    selectedApprovers,
    editingApprover,
    viewingApprover,
    deletingApprover,
    deleteMultipleOpen,
    searchQuery,
    setSearchQuery,
    searchField,
    setSearchField,
    approvers: filteredApprovers,
    isLoading,
    isError,
    refetch,
    setEditingApprover,
    setViewingApprover,
    setDeletingApprover,
    setDeleteMultipleOpen,
    handleSort,
    sortBy,
    sortDirection,
    handleSelectApprover,
    handleSelectAll,
    handleApproverEdited,
    handleMultipleDeleted,
    clearSelectedApprovers,
    deleteApprover,
  } = useApproversManagement();

  // Filter popover state
  const [filterOpen, setFilterOpen] = useState(false);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterOpen(false);
  };

  const handleDeleteMultiple = async () => {
    try {
      await Promise.all(
        selectedApprovers.map((approverId) => deleteApprover(approverId))
      );
      toast.success(
        `${selectedApprovers.length} approvers deleted successfully`
      );
      handleMultipleDeleted();
    } catch (error) {
      toast.error("Failed to delete approvers");
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
        Error loading approvers
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
                    {DEFAULT_APPROVER_SEARCH_FIELDS.find(
                      (opt) => opt.id === searchField
                    )?.label || "All Fields"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-lg shadow-xl">
                  {DEFAULT_APPROVER_SEARCH_FIELDS.map((opt) => (
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

            <div className="relative flex-1 group min-w-[200px]">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-sm"></div>
              <Input
                placeholder="Search approvers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative h-9 text-sm pl-10 pr-4 rounded-md focus:ring-1 transition-all duration-200 shadow-sm group-hover:shadow-md"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-hover:text-foreground transition-colors duration-200">
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
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 table-search-select rounded-lg shadow-xl p-4">
                <div className="mb-3 table-search-text font-semibold text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4 table-search-icon" />
                  Advanced Filters
                </div>
                <div className="flex flex-col gap-3">
                  <div className="text-xs table-search-text">
                    Additional filters will be available in future updates
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs table-search-text hover:table-search-text-hover hover:table-search-select rounded-md transition-all duration-200 flex items-center gap-1.5"
                      onClick={clearAllFilters}
                    >
                      <X className="h-3 w-3" /> Clear All
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ApproversTableContent
          approvers={filteredApprovers}
          selectedApprovers={selectedApprovers}
          onSelectAll={() => handleSelectAll(filteredApprovers || [])}
          onSelectApprover={handleSelectApprover}
          onEdit={(approver) => {
            setEditingApprover(approver);
            console.log("Edit approver:", approver);
          }}
          onView={(approver) => {
            setViewingApprover(approver);
            console.log("View approver:", approver);
          }}
          onDelete={setDeletingApprover}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          onClearFilters={clearAllFilters}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      {selectedApprovers.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedApprovers.length}
          onChangeRole={() => {
            // Not applicable for approvers, but required by interface
          }}
          onDelete={() => setDeleteMultipleOpen(true)}
        />
      )}

      {/* TODO: Add dialogs for edit, view, delete confirmation, and bulk delete */}
    </div>
  );
}
