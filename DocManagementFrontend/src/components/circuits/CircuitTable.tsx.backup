import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { CircuitTableContent } from "./table/CircuitTableContent";
import { BulkActionsBar } from "@/components/admin/table/BulkActionsBar";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import EditCircuitDialog from "./EditCircuitDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCircuitManagement } from "./hooks/useCircuitManagement";
import { AlertTriangle, Filter, X } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const DEFAULT_CIRCUIT_SEARCH_FIELDS = [
  { id: "all", label: "All Fields" },
  { id: "code", label: "Circuit Code" },
  { id: "title", label: "Title" },
  { id: "description", label: "Description" },
];

const STATUS_OPTIONS = [
  { id: "any", value: "any", label: "Any Status" },
  { id: "active", value: "active", label: "Active" },
  { id: "inactive", value: "inactive", label: "Inactive" },
];

export function CircuitTable() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSimpleUser = user?.role === "SimpleUser";

  const {
    selectedCircuits,
    editingCircuit,
    deletingCircuit,
    deleteMultipleOpen,
    searchQuery,
    setSearchQuery,
    searchField,
    setSearchField,
    statusFilter,
    setStatusFilter,
    circuits: filteredCircuits,
    isLoading,
    isError,
    apiError,
    refetch,
    setEditingCircuit,
    setDeletingCircuit,
    setDeleteMultipleOpen,
    handleSort,
    sortBy,
    sortDirection,
    handleSelectCircuit,
    handleSelectAll,
    handleCircuitEdited,
    handleMultipleDeleted,
    clearSelectedCircuits,
    handleToggleActive,
    handleDelete,
    handleBulkDelete,
    handleStatusChange,
    clearAllFilters,
    loadingCircuits,
  } = useCircuitManagement();

  // Filter popover state
  const [filterOpen, setFilterOpen] = useState(false);

  // Dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const handleEditCircuit = (circuit: Circuit) => {
    setEditingCircuit(circuit);
    setEditOpen(true);
  };

  const handleViewCircuit = (circuit: Circuit) => {
    navigate(`/circuits/${circuit.id}/steps`);
  };

  const handleDeleteCircuit = (circuit: Circuit) => {
    setDeletingCircuit(circuit);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingCircuit) {
      await handleDelete(deletingCircuit);
      setDeleteOpen(false);
    }
  };

  const confirmBulkDelete = async () => {
    await handleBulkDelete();
    setBulkDeleteOpen(false);
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
        Error loading circuits
      </div>
    );
  }

  return (
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

      {/* Compact Search + Filter Bar */}
      <div className="p-4 rounded-xl table-search-bar shadow-lg">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          {/* Search and field select */}
          <div className="flex-1 flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger className="w-[130px] h-9 text-sm table-search-select hover:table-search-select focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-200 shadow-sm rounded-md flex-shrink-0">
                  <SelectValue>
                    {DEFAULT_CIRCUIT_SEARCH_FIELDS.find(
                      (opt) => opt.id === searchField
                    )?.label || "All Fields"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="table-search-select rounded-lg shadow-xl">
                  {DEFAULT_CIRCUIT_SEARCH_FIELDS.map((opt) => (
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
                placeholder="Search circuits..."
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
                  {statusFilter !== "any" && (
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
                  {/* Status Filter */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs table-search-text font-medium">
                      Status
                    </span>
                    <Select
                      value={statusFilter}
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger className="w-full h-8 text-xs table-search-select focus:ring-1 transition-colors duration-200 shadow-sm rounded-md">
                        <SelectValue>
                          {
                            STATUS_OPTIONS.find(
                              (opt) => opt.value === statusFilter
                            )?.label
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="table-search-select">
                        {STATUS_OPTIONS.map((opt) => (
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
                  {(statusFilter !== "any" || searchQuery) && (
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
        <CircuitTableContent
          circuits={filteredCircuits}
          selectedCircuits={selectedCircuits}
          onSelectAll={() => handleSelectAll(filteredCircuits || [])}
          onSelectCircuit={handleSelectCircuit}
          onEdit={handleEditCircuit}
          onView={handleViewCircuit}
          onDelete={handleDeleteCircuit}
          onToggleActive={handleToggleActive}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          onClearFilters={clearAllFilters}
          isLoading={isLoading}
          isError={isError}
          loadingCircuits={loadingCircuits}
          isSimpleUser={isSimpleUser}
        />
      </div>

      {selectedCircuits.length > 0 && !isSimpleUser && (
        <BulkActionsBar
          selectedCount={selectedCircuits.length}
          onChangeRole={() => {
            // Not applicable for circuits, but required by interface
          }}
          onDelete={() => setBulkDeleteOpen(true)}
        />
      )}

      {/* Edit Circuit Dialog */}
      {editingCircuit && (
        <EditCircuitDialog
          circuit={editingCircuit}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={() => {
            handleCircuitEdited();
            setEditOpen(false);
            setEditingCircuit(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingCircuit && (
        <DeleteConfirmDialog
          title="Delete Circuit"
          description={`Are you sure you want to delete the circuit "${deletingCircuit.title}"? This action cannot be undone.`}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={confirmDelete}
          confirmText="Delete"
          destructive={true}
        />
      )}

      {/* Bulk Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        title="Delete Circuits"
        description={`Are you sure you want to delete ${selectedCircuits.length} circuits? This action cannot be undone.`}
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onConfirm={confirmBulkDelete}
        confirmText="Delete"
        destructive={true}
      />
    </div>
  );
}
