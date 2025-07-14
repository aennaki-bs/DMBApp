import { useState, useEffect, useCallback } from "react";
import { SubTypesTableContent } from "./SubTypesTableContent";
import { useSubTypes } from "@/hooks/useSubTypes";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { usePagination } from "@/hooks/usePagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Filter, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { DocumentType } from "@/models/document";
import { SubType } from "@/models/subtype";
import SubTypeDialogs from "./SubTypeDialogs";

const SEARCH_FIELDS = [
  { id: "all", label: "All fields" },
  { id: "subTypeKey", label: "Series Code" },
  { id: "description", label: "Description" },
];

const STATUS_OPTIONS = [
  { id: "any", label: "Any Status", value: "any" },
  { id: "active", label: "Active Only", value: "active" },
  { id: "inactive", label: "Inactive Only", value: "inactive" },
];

interface SubTypesTableProps {
  documentType: DocumentType;
  openCreateDialog: boolean;
  setOpenCreateDialog: (open: boolean) => void;
}

export function SubTypesTable({
  documentType,
  openCreateDialog,
  setOpenCreateDialog
}: SubTypesTableProps) {
  const {
    subTypes,
    isLoading,
    error,
    fetchSubTypes,
    handleCreate,
    handleEdit,
    handleDelete,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedSubType,
    setSelectedSubType,
    seriesUsageMap,
    isSeriesRestricted,
    getSeriesDocumentCount
  } = useSubTypes(documentType.id);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [statusFilter, setStatusFilter] = useState("any");
  const [sortBy, setSortBy] = useState<string>("subTypeKey");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filter popover state
  const [filterOpen, setFilterOpen] = useState(false);

  // Professional filter/search bar styling
  const filterCardClass =
    "w-full flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-background/50 to-primary/5 backdrop-blur-xl shadow-lg border border-primary/10";

  // Apply filters to data
  const filteredSubTypes = subTypes?.filter((subType) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchTargets = {
        all: [subType.subTypeKey, subType.description || ""].join(" ").toLowerCase(),
        subTypeKey: subType.subTypeKey?.toLowerCase() || "",
        description: subType.description?.toLowerCase() || "",
      };

      const searchTarget = searchTargets[searchField as keyof typeof searchTargets] || searchTargets.all;
      if (!searchTarget.includes(query)) return false;
    }

    // Status filter
    if (statusFilter === "active" && !subType.isActive) return false;
    if (statusFilter === "inactive" && subType.isActive) return false;

    return true;
  }) || [];

  // Apply sorting
  const sortedSubTypes = [...filteredSubTypes].sort((a, b) => {
    let aVal = a[sortBy as keyof SubType];
    let bVal = b[sortBy as keyof SubType];

    // Handle date sorting
    if (sortBy === "startDate" || sortBy === "endDate") {
      aVal = new Date(aVal as string).getTime();
      bVal = new Date(bVal as string).getTime();
    }

    // Handle string/boolean sorting
    if (typeof aVal === "string") aVal = aVal.toLowerCase();
    if (typeof bVal === "string") bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const pagination = usePagination({
    data: sortedSubTypes,
    initialPageSize: 10,
  });

  // Bulk selection
  const bulkSelection = useBulkSelection({
    data: sortedSubTypes,
    paginatedData: pagination.paginatedData,
    keyField: "id" as keyof SubType,
    currentPage: pagination.currentPage,
    pageSize: pagination.pageSize,
  });

  const paginatedSubTypes = pagination.paginatedData;
  const selectedSubTypes = bulkSelection.selectedItems.map(item => item.id);

  // Filter out restricted series from selection for display and actions
  const selectedSelectableSubTypes = selectedSubTypes.filter(id => !isSeriesRestricted(id));
  const hasRestrictedInSelection = selectedSubTypes.length > selectedSelectableSubTypes.length;

  // Automatically remove restricted series from selection
  useEffect(() => {
    const restrictedInSelection = selectedSubTypes.filter(id => isSeriesRestricted(id));

    if (restrictedInSelection.length > 0) {
      // Find the actual SubType objects for the restricted items and remove them
      const restrictedSubTypes = sortedSubTypes.filter(subType =>
        subType.id && restrictedInSelection.includes(subType.id)
      );

      // Remove each restricted item from selection
      restrictedSubTypes.forEach(subType => {
        if (bulkSelection.selectedItems.some(item => item.id === subType.id)) {
          bulkSelection.toggleItem(subType);
        }
      });
    }
  }, [selectedSubTypes, seriesUsageMap, sortedSubTypes, bulkSelection, isSeriesRestricted]);

  // Clear all filters
  const clearAllFilters = () => {
    setStatusFilter("any");
    setSearchQuery("");
    setFilterOpen(false);
  };

  // Check if any filters are active
  const isFilterActive = searchQuery !== '' || statusFilter !== 'any';

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "f") {
        e.preventDefault();
        setFilterOpen(true);
      }
      if (e.key === "Escape" && filterOpen) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filterOpen]);

  // Handle sort
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  // Initial load
  useEffect(() => {
    fetchSubTypes();
  }, [documentType.id, fetchSubTypes]);

  // Handle create - this will be called from the page header
  const handleCreateClick = useCallback(() => {
    setOpenCreateDialog(true);
  }, [setOpenCreateDialog]);

  // Handle edit
  const handleEditSubType = (subType: SubType) => {
    // Check if series is restricted before allowing edit
    if (subType.id && isSeriesRestricted(subType.id)) {
      const docCount = getSeriesDocumentCount(subType.id);
      toast.error(`Cannot edit series - it is being used by ${docCount} document(s)`, {
        duration: 5000,
        description: 'This series is currently in use and cannot be modified.'
      });
      return;
    }

    setSelectedSubType(subType);
    setEditDialogOpen(true);
  };

  // Handle delete
  const handleDeleteSubType = (id: number) => {
    // Check if series is restricted before allowing delete
    if (isSeriesRestricted(id)) {
      const docCount = getSeriesDocumentCount(id);
      toast.error(`Cannot delete series - it is being used by ${docCount} document(s)`, {
        duration: 5000,
        description: 'Please remove or update the documents using this series first.'
      });
      return;
    }

    const subType = sortedSubTypes.find(st => st.id === id);
    if (subType) {
      setSelectedSubType(subType);
      setDeleteDialogOpen(true);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    // Only consider selectable series for deletion
    if (selectedSelectableSubTypes.length === 0) {
      toast.warning("No selectable series available for deletion");
      return;
    }

    // Double-check that none of the selected series are restricted
    const stillRestrictedSeries = selectedSelectableSubTypes.filter(id => isSeriesRestricted(id));

    if (stillRestrictedSeries.length > 0) {
      toast.error(`Some selected series are now in use and cannot be deleted`, {
        duration: 5000,
        description: 'Please refresh the page and try again.'
      });
      return;
    }

    console.log("Bulk delete series:", selectedSelectableSubTypes);
    toast.success(`${selectedSelectableSubTypes.length} series will be deleted (functionality to be implemented)`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive py-10 text-center">
        <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
        Failed to load series
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col gap-6 w-full"
      style={{ minHeight: "100%" }}
    >
      {/* Professional Search + Filter Bar - No Add Series button */}
      <div className={filterCardClass}>
        {/* Search and field select */}
        <div className="flex-1 flex items-center gap-4 min-w-0">
          <div className="relative">
            <Select value={searchField} onValueChange={setSearchField}>
              <SelectTrigger className="w-[140px] h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg rounded-xl">
                <SelectValue>
                  {SEARCH_FIELDS.find((opt) => opt.id === searchField)?.label || "All fields"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-xl shadow-2xl">
                {SEARCH_FIELDS.map((opt) => (
                  <SelectItem
                    key={opt.id}
                    value={opt.id}
                    className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary rounded-lg"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            <Input
              placeholder="Search series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg group-hover:shadow-xl placeholder:text-muted-foreground/60"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/60 group-hover:text-primary transition-colors duration-300">
              <svg
                className="h-5 w-5"
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

        {/* Filter popover only */}
        <div className="flex items-center gap-3">
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-12 px-6 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 shadow-lg rounded-xl flex items-center gap-3 transition-all duration-300 hover:shadow-xl"
              >
                <Filter className="h-5 w-5" />
                Filters
                <span className="ml-2 px-2 py-0.5 rounded border border-blue-700 text-xs text-blue-300 bg-blue-900/40 font-mono">Alt+F</span>
                {isFilterActive && (
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-background/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl p-6">
              <div className="mb-4 text-foreground font-bold text-lg flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Advanced Filters
              </div>
              <div className="flex flex-col gap-4">
                {/* Status Filter */}
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-popover-foreground">Status</span>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-10 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg rounded-lg">
                      <SelectValue>
                        {STATUS_OPTIONS.find((opt) => opt.value === statusFilter)?.label || "Any Status"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-xl shadow-2xl">
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt.id}
                          value={opt.value}
                          className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary rounded-lg"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters Button */}
                {isFilterActive && (
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="mt-2 h-10 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 shadow-lg rounded-lg transition-all duration-300"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 min-h-0">
        <SubTypesTableContent
          subTypes={paginatedSubTypes}
          allSubTypes={sortedSubTypes}
          selectedSubTypes={selectedSubTypes}
          bulkSelection={bulkSelection}
          pagination={pagination}
          onEdit={handleEditSubType}
          onDelete={handleDeleteSubType}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          onClearFilters={clearAllFilters}
          onBulkDelete={handleBulkDelete}
          onCreateSeries={handleCreateClick}
          isLoading={isLoading}
          isError={!!error}
          seriesUsageMap={seriesUsageMap}
          isSeriesRestricted={isSeriesRestricted}
          getSeriesDocumentCount={getSeriesDocumentCount}
        />
      </div>

      {/* Dialogs */}
      <SubTypeDialogs
        createDialogOpen={openCreateDialog}
        setCreateDialogOpen={setOpenCreateDialog}
        editDialogOpen={editDialogOpen}
        setEditDialogOpen={setEditDialogOpen}
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        selectedSubType={selectedSubType}
        documentTypeId={documentType.id}
        onCreateSubmit={(data) => {
          handleCreate(data);
          setOpenCreateDialog(false);
        }}
        onEditSubmit={handleEdit}
        onDeleteConfirm={handleDelete}
      />
    </div>
  );
}
