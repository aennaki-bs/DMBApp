import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import circuitService from "@/services/circuitService";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Plus,
  AlertCircle,
  Network,
  Filter,
  X,
  RefreshCw,
  Search,
  Trash2,
  CheckSquare,
  MoreHorizontal,
  CircuitBoard,
  Settings,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { StatusTable } from "@/components/statuses/StatusTable";
import { StatusFormDialog } from "@/components/statuses/dialogs/StatusFormDialog";
import { DeleteStatusDialog } from "@/components/statuses/dialogs/DeleteStatusDialog";
import { toast } from "sonner";
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
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DocumentStatus } from "@/models/documentCircuit";
import { PageLayout } from "@/components/layout/PageLayout";
import { BulkActionsBar } from "@/components/responsibility-centre/table/BulkActionsBar";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { Table } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";
import { Loader2 } from "lucide-react";

// Search field options
const DEFAULT_STATUS_SEARCH_FIELDS = [
  { id: "all", label: "All Fields" },
  { id: "statusKey", label: "Status Code" },
  { id: "title", label: "Title" },
  { id: "description", label: "Description" },
];

// Status type options
const STATUS_TYPE_OPTIONS = [
  { id: "any", label: "Any Type", value: "any" },
  { id: "initial", label: "Initial", value: "initial" },
  { id: "final", label: "Final", value: "final" },
  { id: "normal", label: "Normal", value: "normal" },
  { id: "flexible", label: "Flexible", value: "flexible" },
];

export default function CircuitStatusesPage() {
  const { circuitId } = useParams<{ circuitId: string }>();
  const { user } = useAuth();
  const isSimpleUser = user?.role === "SimpleUser";
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // State management
  const [apiError, setApiError] = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | null>(
    null
  );
  const [selectedStatuses, setSelectedStatuses] = useState<number[]>([]);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [statusTypeFilter, setStatusTypeFilter] = useState("any");
  const [filterOpen, setFilterOpen] = useState(false);

  // Fetch circuit details
  const {
    data: circuit,
    isLoading: isCircuitLoading,
    isError: isCircuitError,
    refetch: refetchCircuit,
  } = useQuery({
    queryKey: ["circuit", circuitId],
    queryFn: () => circuitService.getCircuitById(Number(circuitId)),
    enabled: !!circuitId,
  });

  // Fetch statuses for the circuit
  const {
    data: statuses = [],
    isLoading: isStatusesLoading,
    isError: isStatusesError,
    refetch: refetchStatuses,
  } = useQuery({
    queryKey: ["circuit-statuses", circuitId],
    queryFn: () => circuitService.getCircuitStatuses(Number(circuitId)),
    enabled: !!circuitId,
  });

  // Filter and search statuses
  const filteredStatuses = statuses.filter((status) => {
    // Apply search filter
    const matchesSearch =
      !searchQuery ||
      (() => {
        const query = searchQuery.toLowerCase();
        switch (searchField) {
          case "statusKey":
            return status.statusKey?.toLowerCase().includes(query);
          case "title":
            return status.title?.toLowerCase().includes(query);
          case "description":
            return status.description?.toLowerCase().includes(query);
          case "all":
          default:
            return (
              status.statusKey?.toLowerCase().includes(query) ||
              status.title?.toLowerCase().includes(query) ||
              status.description?.toLowerCase().includes(query)
            );
        }
      })();

    // Apply status type filter
    let matchesType = true;
    if (statusTypeFilter !== "any") {
      switch (statusTypeFilter) {
        case "initial":
          matchesType = status.isInitial === true;
          break;
        case "final":
          matchesType = status.isFinal === true;
          break;
        case "normal":
          matchesType =
            !status.isInitial && !status.isFinal && !status.isFlexible;
          break;
        case "flexible":
          matchesType = status.isFlexible === true;
          break;
      }
    }

    return matchesSearch && matchesType;
  });

  // Pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedStatuses,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: filteredStatuses || [],
    initialPageSize: 15,
  });

  // Handler to refresh all data after changes
  const handleRefreshData = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ["circuit", circuitId] });
      await queryClient.invalidateQueries({
        queryKey: ["circuit-statuses", circuitId],
      });
      await refetchCircuit();
      await refetchStatuses();
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    }
  };

  // Handler logic for add/edit/delete
  const handleAddStatus = () => {
    if (circuit?.isActive) return;
    setSelectedStatus(null);
    setFormDialogOpen(true);
  };

  const handleEditStatus = (status: DocumentStatus) => {
    if (circuit?.isActive) return;
    setSelectedStatus(status);
    setFormDialogOpen(true);
  };

  const handleDeleteStatus = (status: DocumentStatus) => {
    if (circuit?.isActive) return;
    setSelectedStatus(status);
    setDeleteDialogOpen(true);
  };

  // Handle successful operations
  const handleOperationSuccess = () => {
    handleRefreshData();
    setSelectedStatuses([]);
  };

  // Handle bulk selection
  const handleSelectStatus = (statusId: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedStatuses((prev) => [...prev, statusId]);
    } else {
      setSelectedStatuses((prev) => prev.filter((id) => id !== statusId));
    }
  };

  const handleSelectAll = () => {
    const currentPageIds = paginatedStatuses.map((status) => status.statusId);
    const allCurrentSelected = currentPageIds.every((id) =>
      selectedStatuses.includes(id)
    );

    if (allCurrentSelected) {
      setSelectedStatuses((prev) =>
        prev.filter((id) => !currentPageIds.includes(id))
      );
    } else {
      setSelectedStatuses((prev) => [
        ...prev,
        ...currentPageIds.filter((id) => !prev.includes(id)),
      ]);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (circuit?.isActive) {
      toast.error("Cannot delete statuses in an active circuit");
      return;
    }

    if (selectedStatuses.length === 0) {
      toast.error("No statuses selected");
      return;
    }

    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(
        selectedStatuses.map((statusId) =>
          circuitService.deleteStatus(statusId)
        )
      );
      toast.success(`Successfully deleted ${selectedStatuses.length} statuses`);
      setSelectedStatuses([]);
      setBulkDeleteDialogOpen(false);
      handleRefreshData();
    } catch (error) {
      toast.error("Failed to delete some statuses");
      console.error(error);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusTypeFilter("any");
    setFilterOpen(false);
  };

  const isLoading = isCircuitLoading || isStatusesLoading;
  const isError = isCircuitError || isStatusesError;

  // Page actions
  const pageActions = [
    {
      label: "Circuit Steps",
      variant: "outline" as const,
      icon: Settings,
      onClick: () => navigate(`/circuits/${circuitId}/steps`),
    },
    {
      label: "Refresh",
      variant: "outline" as const,
      icon: RefreshCw,
      onClick: handleRefreshData,
    },
    ...(circuit?.isActive
      ? []
      : [
          {
            label: "Add Status",
            variant: "default" as const,
            icon: Plus,
            onClick: handleAddStatus,
          },
        ]),
  ];

  if (isLoading) {
    return (
      <PageLayout
        title="Circuit Statuses"
        subtitle="Loading circuit information..."
        icon={CircuitBoard}
        backTo="/circuits"
        actions={[]}
      >
        <div className="flex justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading statuses...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (isError || !circuit) {
    return (
      <PageLayout
        title="Circuit Statuses"
        subtitle="Error loading circuit"
        icon={CircuitBoard}
        backTo="/circuits"
        actions={[]}
      >
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {apiError ||
              "Failed to load circuit statuses. Please try again later."}
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`${circuit.title || circuit.circuitKey} - Statuses`}
      subtitle={`Circuit: ${circuit.circuitKey} (${
        circuit.isActive ? "Active" : "Inactive"
      } Circuit)`}
      icon={CircuitBoard}
      backTo="/circuits"
      actions={pageActions}
    >
      <div
        className="h-full flex flex-col gap-5 w-full px-1"
        style={{ minHeight: "100%" }}
      >
        {/* API Error Alert */}
        {apiError && (
          <Alert
            variant="destructive"
            className="mb-4 border-red-800 bg-red-950/50 text-red-300"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        {/* Modern Search + Filter Bar */}
        <div className="p-4 rounded-xl table-glass-container shadow-lg">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            {/* Search and field select */}
            <div className="flex-1 flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <Select value={searchField} onValueChange={setSearchField}>
                  <SelectTrigger className="w-[130px] h-9 text-sm table-search-select hover:table-search-select focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-200 shadow-sm rounded-md flex-shrink-0">
                    <SelectValue>
                      {DEFAULT_STATUS_SEARCH_FIELDS.find(
                        (opt) => opt.id === searchField
                      )?.label || "All Fields"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="table-search-select rounded-lg shadow-xl">
                    {DEFAULT_STATUS_SEARCH_FIELDS.map((opt) => (
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
                  placeholder="Search statuses..."
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
                    Filter
                    {statusTypeFilter !== "any" && (
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 table-search-select rounded-lg shadow-xl p-4">
                  <div className="mb-3 table-search-text font-semibold text-sm flex items-center gap-2">
                    <Filter className="h-4 w-4 table-search-icon" />
                    Advanced Filters
                  </div>
                  <div className="flex flex-col gap-3">
                    {/* Status Type Filter */}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs table-search-text font-medium">
                        Status Type
                      </span>
                      <Select
                        value={statusTypeFilter}
                        onValueChange={setStatusTypeFilter}
                      >
                        <SelectTrigger className="w-full h-8 text-xs table-search-select focus:ring-1 transition-colors duration-200 shadow-sm rounded-md">
                          <SelectValue>
                            {
                              STATUS_TYPE_OPTIONS.find(
                                (opt) => opt.value === statusTypeFilter
                              )?.label
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="table-search-select">
                          {STATUS_TYPE_OPTIONS.map((opt) => (
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
                    {(statusTypeFilter !== "any" || searchQuery) && (
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

        {/* Modern Table */}
        <div className="flex-1 min-h-0">
          <StatusTable
            statuses={paginatedStatuses}
            selectedStatuses={selectedStatuses}
            onSelectAll={handleSelectAll}
            onSelectStatus={handleSelectStatus}
            onEdit={handleEditStatus}
            onDelete={handleDeleteStatus}
            isLoading={isLoading}
            isError={isError}
            isSimpleUser={isSimpleUser}
            circuitIsActive={circuit?.isActive}
          />
        </div>

        {/* Smart Pagination */}
        {filteredStatuses.length > 0 && (
          <div className="table-glass-pagination p-4 rounded-2xl">
            <SmartPagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[10, 15, 25, 50, 100]}
              showFirstLast={true}
              maxVisiblePages={5}
            />
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedStatuses.length > 0 && !isSimpleUser && !circuit?.isActive && (
          <BulkActionsBar
            selectedCount={selectedStatuses.length}
            totalCount={filteredStatuses?.length}
            onClearSelection={() => setSelectedStatuses([])}
            onDelete={handleBulkDelete}
            itemName="status"
          />
        )}

        {/* Dialogs */}
        <StatusFormDialog
          open={formDialogOpen}
          onOpenChange={setFormDialogOpen}
          status={selectedStatus}
          circuitId={Number(circuitId)}
          onSuccess={handleOperationSuccess}
        />

        <DeleteStatusDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          status={selectedStatus}
          onSuccess={handleOperationSuccess}
        />

        <DeleteConfirmDialog
          title="Delete Multiple Statuses"
          description={`Are you sure you want to delete ${selectedStatuses.length} statuses? This action cannot be undone.`}
          open={bulkDeleteDialogOpen}
          onOpenChange={setBulkDeleteDialogOpen}
          onConfirm={confirmBulkDelete}
          confirmText="Delete"
          destructive={true}
        />
      </div>
    </PageLayout>
  );
}
