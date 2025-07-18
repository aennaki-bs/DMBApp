import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, ArrowLeft, FileText, Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PageLayout } from "@/components/layout/PageLayout";
import { StatusTableContent } from "@/components/statuses/StatusTableContent";
import { StatusFormDialog } from "@/components/statuses/dialogs/StatusFormDialog";
import { DeleteStatusDialog } from "@/components/statuses/dialogs/DeleteStatusDialog";
import { DocumentStatus } from "@/models/documentCircuit";
import circuitService from "@/services/circuitService";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { usePagination } from "@/hooks/usePagination";

const SEARCH_FIELDS = [
  { id: "all", label: "All fields" },
  { id: "title", label: "Title" },
  { id: "description", label: "Description" },
];

const TYPE_OPTIONS = [
  { id: "any", label: "Any Type", value: "any" },
  { id: "initial", label: "Initial", value: "initial" },
  { id: "normal", label: "Normal", value: "normal" },
  { id: "final", label: "Final", value: "final" },
];

export default function CircuitStatusesPage() {
  const { circuitId } = useParams<{ circuitId: string }>();
  const navigate = useNavigate();

  // Circuit data
  const {
    data: circuit,
    isLoading: circuitLoading,
    isError: circuitError,
  } = useQuery({
    queryKey: ["circuit", circuitId],
    queryFn: () => circuitService.getCircuitById(Number(circuitId)),
    enabled: !!circuitId,
  });

  // Statuses data
  const {
    data: allStatuses = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["circuitStatuses", circuitId],
    queryFn: () => circuitService.getCircuitStatuses(Number(circuitId)),
    enabled: !!circuitId,
  });

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [typeFilter, setTypeFilter] = useState("any");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingStatus, setEditingStatus] = useState<DocumentStatus | null>(null);
  const [deletingStatus, setDeletingStatus] = useState<DocumentStatus | null>(null);
  const [sortBy, setSortBy] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");

  // Filter functions
  const getFilteredStatuses = () => {
    let filtered = allStatuses;

    // Map statuses to ensure consistent ID field
    filtered = filtered.map(status => ({
      ...status,
      id: status.id || status.statusId || status.Id // Normalize ID field
    }));

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((status) => {
        const searchableText = `${status.title || status.Title || ''} ${status.description || status.Description || status.descriptif || status.Descriptif || ''}`.toLowerCase();

        if (searchField === "all") {
          return searchableText.includes(query);
        } else if (searchField === "title") {
          return (status.title || status.Title || '').toLowerCase().includes(query);
        } else if (searchField === "description") {
          return (status.description || status.Description || status.descriptif || status.Descriptif || '').toLowerCase().includes(query);
        }
        return false;
      });
    }

    // Apply type filter
    if (typeFilter !== "any") {
      filtered = filtered.filter((status) => {
        switch (typeFilter) {
          case "initial":
            return status.isInitial || status.IsInitial || status.type === "Initial";
          case "final":
            return status.isFinal || status.IsFinal || status.type === "Final";
          case "normal":
            return !(status.isInitial || status.IsInitial || status.isFinal || status.IsFinal) && status.type !== "Initial" && status.type !== "Final";
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const filteredStatuses = getFilteredStatuses();

  // Ensure all statuses have normalized ID field for bulk selection
  const normalizedStatuses = filteredStatuses.map(status => ({
    ...status,
    id: status.id || status.statusId || status.Id || status.statusKey // Ensure consistent ID field
  }));

  // Pagination
  const pagination = usePagination({
    data: normalizedStatuses,
    initialPageSize: 25,
  });

  // Bulk selection
  const bulkSelection = useBulkSelection<any>({
    data: normalizedStatuses,
    paginatedData: pagination.paginatedData,
    currentPage: pagination.currentPage,
    pageSize: pagination.pageSize,
    keyField: "id", // Now guaranteed to exist
  });

  // Ensure the selected items array uses the correct ID field
  const selectedStatusIds = bulkSelection.selectedItems.map(status =>
    status.id || status.statusId || status.Id
  );

  // Filter popover state
  const [filterOpen, setFilterOpen] = useState(false);

  // Professional filter/search bar styling - exact match to Circuit Management
  const filterCardClass =
    "w-full flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-background/50 to-primary/5 backdrop-blur-xl shadow-lg border border-primary/10";

  // Clear all filters
  const handleClearAllFilters = () => {
    setTypeFilter("any");
    setSearchQuery("");
    setSearchField("all");
    setFilterOpen(false);
  };

  // Check if any filters are active
  const isFilterActive = searchQuery !== '' || typeFilter !== 'any';

  // Sorting handler
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  // CRUD handlers
  const handleEditStatus = (status: any) => {
    console.log("Edit handler called with status:", status);
    setEditingStatus(status);
  };

  const handleDeleteStatus = (statusId: number) => {
    console.log("Delete handler called with statusId:", statusId);
    console.log("Available statuses:", filteredStatuses);

    const status = filteredStatuses.find(s => {
      const sId = s.id || s.statusId || s.Id;
      console.log("Checking status:", s, "ID:", sId);
      return sId === statusId;
    });

    console.log("Found status:", status);
    if (status) {
      setDeletingStatus(status);
    } else {
      console.error("Status not found for ID:", statusId);
    }
  };

  const handleStatusCreated = () => {
    setShowCreateDialog(false);
    refetch();
    toast.success("Status created successfully");
  };

  const handleStatusUpdated = () => {
    setEditingStatus(null);
    refetch();
    toast.success("Status updated successfully");
  };

  const handleStatusDeleted = () => {
    setDeletingStatus(null);
    refetch();
    toast.success("Status deleted successfully");
  };

  const handleBulkDelete = async () => {
    if (circuit.isActive) {
      toast.error("Cannot delete statuses in active circuit");
      return;
    }

    try {
      const selectedCount = bulkSelection.selectedItems.length;
      for (const statusId of bulkSelection.selectedItems) {
        await circuitService.deleteStatus(statusId);
      }
      bulkSelection.clearSelection();
      refetch();
      toast.success(`${selectedCount} statuses deleted successfully`);
    } catch (error) {
      console.error("Failed to delete statuses:", error);
      toast.error("Failed to delete selected statuses");
    }
  };

  // Page actions
  const pageActions = [
    {
      label: "Back to Circuits",
      variant: "outline" as const,
      icon: ArrowLeft,
      onClick: () => navigate("/circuits"),
    },
    {
      label: "Circuit Steps",
      variant: "outline" as const,
      icon: FileText,
      onClick: () => navigate(`/circuits/${circuitId}/steps`),
    },
    {
      label: "Add Status",
      variant: "default" as const,
      icon: Plus,
      onClick: () => setShowCreateDialog(true),
      disabled: circuit?.isActive,
      tooltip: circuit?.isActive ? "Cannot add statuses to an active circuit" : undefined,
    },
  ];

  if (circuitLoading) {
    return <div>Loading...</div>;
  }

  if (circuitError || !circuit) {
    return <div>Circuit not found</div>;
  }

  return (
    <PageLayout
      title={`${circuit.title} - Statuses`}
      subtitle={`Circuit: ${circuit.circuitKey} (${circuit.isActive ? "Active Circuit" : "Inactive Circuit"})`}
      icon={FileText}
      actions={pageActions}
    >
      <div
        className="h-full flex flex-col gap-6 w-full"
        style={{ minHeight: "100%" }}
      >
        {/* Circuit Management Style Search + Filter Bar */}
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

            <div className="relative min-w-[300px] flex-1 group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              <Input
                placeholder="Search circuits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg group-hover:shadow-xl placeholder:text-muted-foreground/60"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/60 group-hover:text-primary transition-colors duration-300">
                <Search className="h-5 w-5" />
              </div>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-background/80 rounded-lg"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Filter controls */}
          <div className="flex items-center gap-3">
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-12 px-6 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 shadow-lg rounded-xl flex items-center gap-3 transition-all duration-300 hover:shadow-xl"
                >
                  <Filter className="h-5 w-5" />
                  Filters
                  {isFilterActive && (
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-xl shadow-2xl p-6">
                <div className="mb-4 text-foreground font-bold text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  Advanced Filters
                </div>
                <div className="flex flex-col gap-4">
                  {/* Type Filter */}
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-popover-foreground">Status Type</span>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full bg-background/50 backdrop-blur-sm text-foreground border border-border focus:ring-primary focus:border-primary transition-colors duration-200 hover:bg-background/70 shadow-sm rounded-md">
                        <SelectValue>
                          {TYPE_OPTIONS.find((opt) => opt.value === typeFilter)?.label}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-popover/95 backdrop-blur-lg text-popover-foreground border border-border">
                        {TYPE_OPTIONS.map((opt) => (
                          <SelectItem
                            key={opt.id}
                            value={opt.value}
                            className="hover:bg-accent hover:text-accent-foreground"
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
                      onClick={handleClearAllFilters}
                      className="w-full bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 hover:text-destructive transition-all duration-200"
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Use UserTableContent Pattern */}
        <div className="flex-1 min-h-0">
          <StatusTableContent
            statuses={pagination.paginatedData}
            selectedStatuses={bulkSelection.selectedItems}
            bulkSelection={bulkSelection}
            pagination={pagination}
            onEdit={handleEditStatus}
            onDelete={handleDeleteStatus}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
            onClearFilters={handleClearAllFilters}
            onBulkDelete={handleBulkDelete}
            isLoading={isLoading}
            isError={isError}
            isCircuitActive={circuit?.isActive || false}
          />
        </div>
      </div>

      {/* Dialogs */}
      <StatusFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleStatusCreated}
        circuitId={Number(circuitId)}
      />

      {editingStatus && (
        <StatusFormDialog
          status={editingStatus}
          open={!!editingStatus}
          onOpenChange={(open) => !open && setEditingStatus(null)}
          onSuccess={handleStatusUpdated}
        />
      )}

      {deletingStatus && (
        <DeleteStatusDialog
          status={deletingStatus}
          open={!!deletingStatus}
          onOpenChange={(open) => !open && setDeletingStatus(null)}
          onSuccess={handleStatusDeleted}
        />
      )}
    </PageLayout>
  );
}
