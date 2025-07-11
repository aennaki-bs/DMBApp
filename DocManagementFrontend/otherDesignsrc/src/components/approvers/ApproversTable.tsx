import { useState, useEffect } from "react";
import { toast } from "sonner";
import approvalService from "@/services/approvalService";
import { ApproversTableContent } from "./table/ApproversTableContent";
import { BulkActionsBar } from "@/components/responsibility-centre/table/BulkActionsBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApproversManagement } from "./hooks/useApproversManagement";
import {
  AlertTriangle,
  Filter,
  X,
  Search,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BulkDeleteDialog } from "../approval-groups/dialogs/BulkDeleteDialog";
import { useTranslation } from "@/hooks/useTranslation";

const DEFAULT_APPROVER_SEARCH_FIELDS = [
  { id: "all", label: "All Fields" },
  { id: "username", label: "Approver Name" },
  { id: "comment", label: "Comment" },
];

interface ApproversTableProps {
  onRefetchReady?: (refetchFn: () => void) => void;
}

export function ApproversTable({ onRefetchReady }: ApproversTableProps) {
  const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { t, tWithParams } = useTranslation();

  const {
    selectedApprovers,
    editingApprover,
    viewingApprover,
    deletingApprover,
    searchQuery,
    setSearchQuery,
    searchField,
    setSearchField,
    approvers: filteredApprovers,
    isLoading,
    isError,
    refetch,
    isFetching,
    isRefetching,
    setEditingApprover,
    setViewingApprover,
    setDeletingApprover,
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
      toast.success("Approvers refreshed successfully!", {
        duration: 2000,
      });
    } catch (error) {
      toast.error("Failed to refresh approvers");
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
        Error loading approvers
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
                    {DEFAULT_APPROVER_SEARCH_FIELDS.find(
                      (opt) => opt.id === searchField
                    )?.label || "All Fields"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="table-search-select rounded-lg shadow-xl">
                  {DEFAULT_APPROVER_SEARCH_FIELDS.map((opt) => (
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
                placeholder="Search approvers..."
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
              title="Refresh approvers"
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
                  className="h-9 px-3 text-xs table-search-text hover:table-search-text-hover transition-all duration-200"
                >
                  <Filter className="h-3.5 w-3.5 mr-1.5" />
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-72 p-4 table-search-select shadow-xl rounded-lg"
                align="end"
              >
                <div className="space-y-4">
                  <div className="text-sm font-medium table-search-text">
                    Additional filters will be available in future updates
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {searchQuery && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-1 cursor-pointer transition-all duration-200 hover:bg-primary/20 hover:text-primary-foreground table-glass-badge"
                  onClick={clearAllFilters}
                >
                  Search: {searchQuery}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              </div>
            )}

            {searchQuery && (
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

      {/* Bulk Actions Bar */}
      {selectedApprovers.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedApprovers.length}
          totalCount={filteredApprovers?.length}
          onClearSelection={clearSelectedApprovers}
          onDelete={() => setDeleteMultipleOpen(true)}
        />
      )}

      {deleteMultipleOpen && (
        <BulkDeleteDialog
          open={deleteMultipleOpen}
          onOpenChange={setDeleteMultipleOpen}
          onConfirm={handleDeleteMultiple}
          selectedCount={selectedApprovers.length}
        />
      )}

      {/* TODO: Add dialogs for edit, view, delete confirmation */}
    </div>
  );
}
