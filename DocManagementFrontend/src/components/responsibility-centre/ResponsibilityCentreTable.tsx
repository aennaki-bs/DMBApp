import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ResponsibilityCentreTableContent } from "./table/ResponsibilityCentreTableContent";
import { BulkActionsBar } from "./table/BulkActionsBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useResponsibilityCentreManagement } from "./hooks/useResponsibilityCentreManagement";
import { AlertTriangle, Filter, X, Search, RefreshCw } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { ResponsibilityCentre } from "@/models/responsibilityCentre";
import { EditResponsibilityCentreDialog } from "./EditResponsibilityCentreDialog";
import { ViewCentreDetailsDialog } from "./ViewCentreDetailsDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { AssociateUsersDialog } from "./AssociateUsersDialog";
import { BulkDeleteDialog } from "./dialogs/BulkDeleteDialog";

const DEFAULT_CENTRE_SEARCH_FIELDS = [
  { id: "all", label: "All Fields" },
  { id: "code", label: "Centre Code" },
  { id: "descr", label: "Description" },
];

interface ResponsibilityCentreTableProps {
  onRefetchReady?: (refetchFn: () => void) => void;
}

export function ResponsibilityCentreTable({
  onRefetchReady,
}: ResponsibilityCentreTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [editingCentre, setEditingCentre] =
    useState<ResponsibilityCentre | null>(null);
  const [viewingCentre, setViewingCentre] =
    useState<ResponsibilityCentre | null>(null);
  const [deletingCentre, setDeletingCentre] =
    useState<ResponsibilityCentre | null>(null);
  const [associatingCentre, setAssociatingCentre] =
    useState<ResponsibilityCentre | null>(null);
  const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { t } = useTranslation();

  const {
    selectedCentres,
    filteredCentres,
    isLoading,
    isError,
    sortBy,
    sortDirection,
    handleSelectCentre,
    handleSelectAll,
    handleSort,
    handleEditCentre,
    handleDeleteCentre,
    handleBulkDelete,
    refreshCentres,
    getSelectedCount,
    getFilteredSelectedCount,
    clearSelectedCentres,
    isAllFilteredSelected,
  } = useResponsibilityCentreManagement({
    searchQuery,
    searchField,
  });

  // Filter popover state
  const [filterOpen, setFilterOpen] = useState(false);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterOpen(false);
  };

  const handleDeleteMultiple = async () => {
    try {
      await handleBulkDelete();
      setDeleteMultipleOpen(false);
    } catch (error) {
      toast.error("Failed to delete centres");
      console.error(error);
    }
  };

  // Pass refetch function to parent component
  useEffect(() => {
    if (onRefetchReady && refreshCentres) {
      onRefetchReady(refreshCentres);
    }
  }, [onRefetchReady, refreshCentres]);

  // Enhanced manual refresh with visual feedback
  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await refreshCentres();
      toast.success("Responsibility centres refreshed successfully!", {
        duration: 2000,
      });
    } catch (error) {
      toast.error("Failed to refresh centres");
    } finally {
      setIsManualRefreshing(false);
    }
  };

  // Handle edit centre submission
  const handleEditSubmit = async (centreId: number, data: any) => {
    try {
      await handleEditCentre(centreId, data);
      setEditingCentre(null);
    } catch (error) {
      console.error("Failed to edit centre:", error);
    }
  };

  // Handle delete centre submission
  const handleDeleteSubmit = async (centreId: number) => {
    try {
      await handleDeleteCentre(centreId);
      setDeletingCentre(null);
    } catch (error) {
      console.error("Failed to delete centre:", error);
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
        Error loading responsibility centres
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
          {/* Search and field select */}
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 min-w-0">
            <div className="relative w-full sm:w-auto">
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger className="w-full sm:w-[130px] h-9 text-sm table-search-select hover:table-search-select focus:ring-1 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all duration-200 shadow-sm rounded-md flex-shrink-0">
                  <SelectValue>
                    {DEFAULT_CENTRE_SEARCH_FIELDS.find(
                      (opt) => opt.id === searchField
                    )?.label || "All Fields"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="table-search-select rounded-lg shadow-xl">
                  {DEFAULT_CENTRE_SEARCH_FIELDS.map((opt) => (
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
                placeholder="Search responsibility centres..."
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
              title="Refresh responsibility centres"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 mr-1.5 ${
                  isManualRefreshing ? "animate-spin" : ""
                }`}
              />
              {isManualRefreshing ? "Refreshing..." : "Refresh"}
            </Button>

            {/* Filter Button */}
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-9 px-3 text-xs table-search-text hover:table-search-text-hover transition-all duration-200 ${
                    searchQuery ? "table-glass-badge" : ""
                  }`}
                >
                  <Filter className="h-3.5 w-3.5 mr-1.5" />
                  Filter
                  {searchQuery && (
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
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm table-search-text">
                      Active Filters
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-6 px-2 text-xs table-search-text hover:table-search-text-hover transition-colors duration-200"
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {searchQuery && (
                      <div className="flex items-center justify-between p-2 table-search-select rounded-lg">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium table-search-text">
                            Search Query
                          </span>
                          <span className="text-xs table-search-text/70 truncate max-w-[200px]">
                            "{searchQuery}"
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchQuery("")}
                          className="h-6 w-6 p-0 table-search-text hover:table-search-text-hover transition-colors duration-200"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Active Filter Badges */}
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

            {/* Clear Button */}
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

      {/* Table Content */}
      <div className="flex-1 min-h-0">
        <ResponsibilityCentreTableContent
          centres={filteredCentres || []}
          selectedCentres={selectedCentres}
          onSelectAll={handleSelectAll}
          onSelectCentre={(centreId: number) => {
            const isSelected = selectedCentres.includes(centreId);
            handleSelectCentre(centreId, !isSelected);
          }}
          onEdit={setEditingCentre}
          onViewDetails={setViewingCentre}
          onDelete={setDeletingCentre}
          onAssociateUsers={setAssociatingCentre}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          onClearFilters={clearAllFilters}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      {/* Bulk Actions Bar - positioned at bottom of screen */}
      {getSelectedCount() > 0 && (
        <BulkActionsBar
          selectedCount={getSelectedCount()}
          totalCount={filteredCentres?.length || 0}
          onDelete={() => setDeleteMultipleOpen(true)}
          onClearSelection={clearSelectedCentres}
        />
      )}

      {/* Dialogs */}
      {editingCentre && (
        <EditResponsibilityCentreDialog
          centre={editingCentre}
          isOpen={true}
          onClose={() => setEditingCentre(null)}
          onSave={handleEditSubmit}
        />
      )}

      {viewingCentre && (
        <ViewCentreDetailsDialog
          centre={viewingCentre}
          isOpen={true}
          onClose={() => setViewingCentre(null)}
        />
      )}

      {deletingCentre && (
        <DeleteConfirmDialog
          centre={deletingCentre}
          isOpen={true}
          onClose={() => setDeletingCentre(null)}
          onConfirm={() => handleDeleteSubmit(deletingCentre.id)}
        />
      )}

      {associatingCentre && (
        <AssociateUsersDialog
          centre={associatingCentre}
          isOpen={true}
          onClose={() => setAssociatingCentre(null)}
          onSuccess={refreshCentres}
        />
      )}

      {/* Bulk Delete Dialog */}
      {deleteMultipleOpen && (
        <BulkDeleteDialog
          selectedCount={getSelectedCount()}
          isOpen={deleteMultipleOpen}
          onClose={() => setDeleteMultipleOpen(false)}
          onConfirm={handleDeleteMultiple}
        />
      )}
    </div>
  );
}
