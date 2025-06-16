import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import circuitService from "@/services/circuitService";

export type SortField = "circuitKey" | "title" | "descriptif" | "isActive";
export type SortDirection = "asc" | "desc";

export function useCircuitManagement() {
  // Core data
  const [allCircuits, setAllCircuits] = useState<Circuit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [apiError, setApiError] = useState("");

  // Selection state
  const [selectedCircuits, setSelectedCircuits] = useState<number[]>([]);

  // Dialog states
  const [editingCircuit, setEditingCircuit] = useState<Circuit | null>(null);
  const [deletingCircuit, setDeletingCircuit] = useState<Circuit | null>(null);
  const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [statusFilter, setStatusFilter] = useState("any");

  // Sorting state
  const [sortBy, setSortBy] = useState<SortField>("circuitKey");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Loading states for individual circuits
  const [loadingCircuits, setLoadingCircuits] = useState<number[]>([]);

  // Fetch circuits
  const fetchCircuits = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setApiError("");
      const circuits = await circuitService.getAllCircuits();
      setAllCircuits(circuits || []);
    } catch (error: any) {
      console.error("Error fetching circuits:", error);
      setIsError(true);
      setApiError(error?.message || "Failed to load circuits");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and search circuits
  const filteredCircuits = useMemo(() => {
    if (!allCircuits) return [];

    let filtered = [...allCircuits];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((circuit) => {
        switch (searchField) {
          case "code":
            return circuit.circuitKey?.toLowerCase().includes(query);
          case "title":
            return circuit.title?.toLowerCase().includes(query);
          case "description":
            return circuit.descriptif?.toLowerCase().includes(query);
          case "all":
          default:
            return (
              circuit.circuitKey?.toLowerCase().includes(query) ||
              circuit.title?.toLowerCase().includes(query) ||
              circuit.descriptif?.toLowerCase().includes(query)
            );
        }
      });
    }

    // Apply status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((circuit) => circuit.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((circuit) => !circuit.isActive);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = "";
      let bValue = "";

      switch (sortBy) {
        case "circuitKey":
          aValue = a.circuitKey || "";
          bValue = b.circuitKey || "";
          break;
        case "title":
          aValue = a.title || "";
          bValue = b.title || "";
          break;
        case "descriptif":
          aValue = a.descriptif || "";
          bValue = b.descriptif || "";
          break;
        case "isActive":
          aValue = a.isActive ? "1" : "0";
          bValue = b.isActive ? "1" : "0";
          break;
      }

      const comparison = aValue.localeCompare(bValue);
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [allCircuits, searchQuery, searchField, statusFilter, sortBy, sortDirection]);

  // Selection handlers
  const handleSelectCircuit = (circuitId: number, checked: boolean) => {
    if (checked) {
      setSelectedCircuits([...selectedCircuits, circuitId]);
    } else {
      setSelectedCircuits(selectedCircuits.filter((id) => id !== circuitId));
    }
  };

  const handleSelectAll = (circuits: Circuit[]) => {
    const circuitIds = circuits.map((circuit) => circuit.id);
    const allSelected = circuitIds.every((id) => selectedCircuits.includes(id));

    if (allSelected) {
      // Deselect all
      setSelectedCircuits(selectedCircuits.filter((id) => !circuitIds.includes(id)));
    } else {
      // Select all
      const newSelected = [...selectedCircuits];
      circuitIds.forEach((id) => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      setSelectedCircuits(newSelected);
    }
  };

  const clearSelectedCircuits = () => {
    setSelectedCircuits([]);
  };

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  // Filter handlers
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("any");
  };

  // Action handlers
  const handleToggleActive = async (circuit: Circuit) => {
    setLoadingCircuits((prev) => [...prev, circuit.id]);
    try {
      await circuitService.toggleCircuitActivation(circuit);
      await fetchCircuits();
      toast.success(
        `Circuit ${circuit.isActive ? "deactivated" : "activated"} successfully`
      );
    } catch (error: any) {
      toast.error(error?.message || "Failed to update circuit status");
    } finally {
      setLoadingCircuits((prev) => prev.filter((id) => id !== circuit.id));
    }
  };

  const handleDelete = async (circuit: Circuit) => {
    try {
      await circuitService.deleteCircuit(circuit.id);
      await fetchCircuits();
      toast.success("Circuit deleted successfully");
      setDeletingCircuit(null);
      clearSelectedCircuits();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete circuit");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedCircuits.map((circuitId) => circuitService.deleteCircuit(circuitId))
      );
      await fetchCircuits();
      toast.success(`${selectedCircuits.length} circuits deleted successfully`);
      setDeleteMultipleOpen(false);
      clearSelectedCircuits();
    } catch (error: any) {
      toast.error("Failed to delete circuits");
    }
  };

  const handleCircuitEdited = () => {
    fetchCircuits();
    clearSelectedCircuits();
  };

  const handleMultipleDeleted = () => {
    fetchCircuits();
    clearSelectedCircuits();
  };

  // Clear selections when data changes
  useEffect(() => {
    if (allCircuits) {
      const validIds = allCircuits.map((circuit) => circuit.id);
      setSelectedCircuits((prev) => prev.filter((id) => validIds.includes(id)));
    }
  }, [allCircuits]);

  // Initial load
  useEffect(() => {
    fetchCircuits();
  }, []);

  return {
    // Data
    circuits: filteredCircuits,
    isLoading,
    isError,
    apiError,
    refetch: fetchCircuits,

    // Selection
    selectedCircuits,
    handleSelectCircuit,
    handleSelectAll,
    clearSelectedCircuits,

    // Dialog states
    editingCircuit,
    setEditingCircuit,
    deletingCircuit,
    setDeletingCircuit,
    deleteMultipleOpen,
    setDeleteMultipleOpen,

    // Search and filter
    searchQuery,
    setSearchQuery,
    searchField,
    setSearchField,
    statusFilter,
    setStatusFilter,
    handleStatusChange,
    clearAllFilters,

    // Sorting
    sortBy,
    sortDirection,
    handleSort,

    // Actions
    handleToggleActive,
    handleDelete,
    handleBulkDelete,
    handleCircuitEdited,
    handleMultipleDeleted,
    loadingCircuits,
  };
} 