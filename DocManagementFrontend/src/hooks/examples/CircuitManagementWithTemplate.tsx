import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ManagementPageTemplate } from "@/components/templates/ManagementPageTemplate";
import { CircuitTableHeader } from "@/components/circuits/table/CircuitTableHeader";
import { CircuitTableBody } from "@/components/circuits/table/CircuitTableBody";
import { CreateCircuitDialog } from "@/components/circuits/CreateCircuitDialog";
import { EditCircuitDialog } from "@/components/circuits/EditCircuitDialog";
import { DeleteCircuitDialog } from "@/components/circuits/DeleteCircuitDialog";
import { BulkActivateDialog } from "@/components/circuits/BulkActivateDialog";
import { BulkDeactivateDialog } from "@/components/circuits/BulkDeactivateDialog";
import {
  GitBranch,
  Plus,
  Download,
  Play,
  Pause,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import circuitService from "@/services/circuitService";

// Circuit search fields
const CIRCUIT_SEARCH_FIELDS = [
  { id: "all", label: "All Fields", value: "all" },
  { id: "name", label: "Circuit Name", value: "name" },
  { id: "description", label: "Description", value: "description" },
  { id: "documentType", label: "Document Type", value: "documentType" },
];

export default function CircuitManagementWithTemplate() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isSimpleUser = user?.role === "SimpleUser";

  // Data state
  const [circuits, setCircuits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [statusFilter, setStatusFilter] = useState("any");
  const [typeFilter, setTypeFilter] = useState("any");

  // Selection state
  const [selectedCircuits, setSelectedCircuits] = useState<number[]>([]);

  // Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [editingCircuit, setEditingCircuit] = useState(null);
  const [deletingCircuit, setDeletingCircuit] = useState(null);
  const [bulkActivateOpen, setBulkActivateOpen] = useState(false);
  const [bulkDeactivateOpen, setBulkDeactivateOpen] = useState(false);

  // Sort state
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, navigate]);

  // Load circuits
  useEffect(() => {
    loadCircuits();
  }, []);

  const loadCircuits = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const data = await circuitService.getAllCircuits();
      setCircuits(data);
    } catch (error) {
      console.error("Failed to load circuits:", error);
      setIsError(true);
      toast.error("Failed to load circuits");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter circuits based on search and filters
  const filteredCircuits = circuits.filter((circuit) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchIn =
        searchField === "all"
          ? `${circuit.name} ${circuit.description} ${
              circuit.documentType?.name || ""
            }`
          : circuit[searchField] || "";

      if (!searchIn.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== "any") {
      const isActive = circuit.isActive;
      if (statusFilter === "active" && !isActive) return false;
      if (statusFilter === "inactive" && isActive) return false;
    }

    // Type filter
    if (typeFilter !== "any") {
      if (circuit.documentType?.id !== parseInt(typeFilter)) return false;
    }

    return true;
  });

  // Sort circuits
  const sortedCircuits = [...filteredCircuits].sort((a, b) => {
    let aValue = a[sortBy] || "";
    let bValue = b[sortBy] || "";

    if (typeof aValue === "string") aValue = aValue.toLowerCase();
    if (typeof bValue === "string") bValue = bValue.toLowerCase();

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Page actions (header buttons)
  const pageActions = [
    {
      label: "Export Circuits",
      variant: "outline" as const,
      icon: Download,
      onClick: () => handleExport(),
    },
    ...(isSimpleUser
      ? []
      : [
          {
            label: "New Circuit",
            variant: "default" as const,
            icon: Plus,
            onClick: () => setCreateOpen(true),
          },
        ]),
  ];

  // Filter configuration
  const filters = [
    {
      key: "status",
      label: "Status",
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { id: "any", label: "Any Status", value: "any" },
        { id: "active", label: "Active", value: "active" },
        { id: "inactive", label: "Inactive", value: "inactive" },
      ],
    },
    {
      key: "type",
      label: "Document Type",
      value: typeFilter,
      onChange: setTypeFilter,
      options: [
        { id: "any", label: "Any Type", value: "any" },
        // Add document type options dynamically
        ...circuits
          .map((c) => c.documentType)
          .filter(
            (type, index, self) =>
              type && self.findIndex((t) => t?.id === type.id) === index
          )
          .map((type) => ({
            id: type.id.toString(),
            label: type.name,
            value: type.id.toString(),
          })),
      ],
    },
  ];

  // Bulk actions configuration
  const bulkActions = isSimpleUser
    ? []
    : [
        {
          label: "Activate",
          variant: "outline" as const,
          icon: Play,
          onClick: () => setBulkActivateOpen(true),
        },
        {
          label: "Deactivate",
          variant: "outline" as const,
          icon: Pause,
          onClick: () => setBulkDeactivateOpen(true),
        },
        {
          label: "Delete",
          variant: "destructive" as const,
          icon: Trash2,
          onClick: () => handleBulkDelete(),
        },
      ];

  // Event handlers
  const handleSelectCircuit = (circuitId: number) => {
    setSelectedCircuits((prev) =>
      prev.includes(circuitId)
        ? prev.filter((id) => id !== circuitId)
        : [...prev, circuitId]
    );
  };

  const handleSelectAll = (circuits: any[]) => {
    const allIds = circuits.map((c) => c.id);
    const allSelected = allIds.every((id) => selectedCircuits.includes(id));

    if (allSelected) {
      setSelectedCircuits((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      setSelectedCircuits((prev) => [...new Set([...prev, ...allIds])]);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const handleExport = () => {
    toast.info("Export functionality coming soon");
  };

  const handleBulkDelete = () => {
    if (selectedCircuits.length === 0) {
      toast.error("Please select circuits to delete");
      return;
    }
    // Open bulk delete confirmation dialog
    toast.info("Bulk delete functionality coming soon");
  };

  const handleClearFilters = () => {
    setStatusFilter("any");
    setTypeFilter("any");
    setSearchQuery("");
  };

  const handleCircuitCreated = () => {
    loadCircuits();
    setCreateOpen(false);
    toast.success("Circuit created successfully");
  };

  const handleCircuitUpdated = () => {
    loadCircuits();
    setEditingCircuit(null);
    toast.success("Circuit updated successfully");
  };

  const handleCircuitDeleted = () => {
    loadCircuits();
    setDeletingCircuit(null);
    toast.success("Circuit deleted successfully");
  };

  const handleBulkActivate = async () => {
    try {
      await Promise.all(
        selectedCircuits.map((id) => circuitService.activateCircuit(id))
      );
      loadCircuits();
      setSelectedCircuits([]);
      setBulkActivateOpen(false);
      toast.success(`${selectedCircuits.length} circuits activated`);
    } catch (error) {
      toast.error("Failed to activate circuits");
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      await Promise.all(
        selectedCircuits.map((id) => circuitService.deactivateCircuit(id))
      );
      loadCircuits();
      setSelectedCircuits([]);
      setBulkDeactivateOpen(false);
      toast.success(`${selectedCircuits.length} circuits deactivated`);
    } catch (error) {
      toast.error("Failed to deactivate circuits");
    }
  };

  // Empty state component
  const emptyState = (
    <div className="text-center py-10">
      <GitBranch className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg font-medium mb-2">No circuits found</h3>
      <p className="text-muted-foreground mb-4">
        {searchQuery || statusFilter !== "any" || typeFilter !== "any"
          ? "No circuits match your current filters."
          : "Get started by creating your first circuit."}
      </p>
      {(searchQuery || statusFilter !== "any" || typeFilter !== "any") && (
        <button
          onClick={handleClearFilters}
          className="text-primary hover:underline"
        >
          Clear filters
        </button>
      )}
      {!isSimpleUser &&
        !searchQuery &&
        statusFilter === "any" &&
        typeFilter === "any" && (
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Circuit
          </button>
        )}
    </div>
  );

  return (
    <ManagementPageTemplate
      // Page Header
      title="Circuit Management"
      subtitle={
        isSimpleUser
          ? "View document workflow circuits"
          : "Create and manage document workflow circuits"
      }
      icon={GitBranch}
      actions={pageActions}
      // Search
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchField={searchField}
      onSearchFieldChange={setSearchField}
      searchFields={CIRCUIT_SEARCH_FIELDS}
      searchPlaceholder="Search circuits..."
      // Filters
      filters={filters}
      onClearFilters={handleClearFilters}
      // Data
      data={sortedCircuits}
      isLoading={isLoading}
      isError={isError}
      errorMessage="Failed to load circuits. Please try again."
      // Selection
      selectedItems={selectedCircuits}
      onSelectItem={handleSelectCircuit}
      onSelectAll={handleSelectAll}
      // Table
      tableHeader={
        <CircuitTableHeader
          onSort={handleSort}
          sortBy={sortBy}
          sortDirection={sortDirection}
          selectedCount={selectedCircuits.length}
          totalCount={sortedCircuits.length}
          onSelectAll={() => handleSelectAll(sortedCircuits)}
        />
      }
      tableBody={
        <CircuitTableBody
          circuits={sortedCircuits}
          selectedCircuits={selectedCircuits}
          onSelectCircuit={handleSelectCircuit}
          onEditCircuit={setEditingCircuit}
          onDeleteCircuit={setDeletingCircuit}
          isSimpleUser={isSimpleUser}
        />
      }
      emptyState={emptyState}
      // Bulk Actions
      bulkActions={bulkActions}
      // Sorting
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSort={handleSort}
    >
      {/* Modals and Dialogs */}
      <CreateCircuitDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleCircuitCreated}
      />

      {editingCircuit && (
        <EditCircuitDialog
          circuit={editingCircuit}
          open={!!editingCircuit}
          onOpenChange={(open) => !open && setEditingCircuit(null)}
          onSuccess={handleCircuitUpdated}
        />
      )}

      {deletingCircuit && (
        <DeleteCircuitDialog
          circuit={deletingCircuit}
          open={!!deletingCircuit}
          onOpenChange={(open) => !open && setDeletingCircuit(null)}
          onSuccess={handleCircuitDeleted}
        />
      )}

      <BulkActivateDialog
        open={bulkActivateOpen}
        onOpenChange={setBulkActivateOpen}
        selectedCount={selectedCircuits.length}
        onConfirm={handleBulkActivate}
      />

      <BulkDeactivateDialog
        open={bulkDeactivateOpen}
        onOpenChange={setBulkDeactivateOpen}
        selectedCount={selectedCircuits.length}
        onConfirm={handleBulkDeactivate}
      />
    </ManagementPageTemplate>
  );
}
