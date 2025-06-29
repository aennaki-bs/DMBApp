import { useState, useEffect, useMemo } from "react";
import { useApprovers, Approver } from "@/hooks/useApprovers";

export type SortField = "username" | "comment";
export type SortDirection = "asc" | "desc";

export function useApproversManagement() {
  // Core data
  const { approvers: allApprovers, isLoading, error, refetch, deleteApprover } = useApprovers();

  // Selection state
  const [selectedApprovers, setSelectedApprovers] = useState<number[]>([]);

  // Dialog states
  const [editingApprover, setEditingApprover] = useState<Approver | null>(null);
  const [viewingApprover, setViewingApprover] = useState<Approver | null>(null);
  const [deletingApprover, setDeletingApprover] = useState<number | null>(null);
  const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");

  // Sorting state
  const [sortBy, setSortBy] = useState<SortField>("username");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Filter and search approvers
  const filteredApprovers = useMemo(() => {
    if (!allApprovers) return [];

    let filtered = [...allApprovers];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((approver) => {
        switch (searchField) {
          case "username":
            return approver.username?.toLowerCase().includes(query);
          case "comment":
            return approver.comment?.toLowerCase().includes(query);
          case "all":
          default:
            return (
              approver.username?.toLowerCase().includes(query) ||
              approver.comment?.toLowerCase().includes(query)
            );
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = "";
      let bValue = "";

      switch (sortBy) {
        case "username":
          aValue = a.username || "";
          bValue = b.username || "";
          break;
        case "comment":
          aValue = a.comment || "";
          bValue = b.comment || "";
          break;
      }

      const comparison = aValue.localeCompare(bValue);
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [allApprovers, searchQuery, searchField, sortBy, sortDirection]);

  // Selection handlers
  const handleSelectApprover = (approverId: number, checked: boolean) => {
    if (checked) {
      setSelectedApprovers([...selectedApprovers, approverId]);
    } else {
      setSelectedApprovers(selectedApprovers.filter((id) => id !== approverId));
    }
  };

  const handleSelectAll = (approvers: Approver[]) => {
    const approverIds = approvers.map((approver) => approver.id);
    const allSelected = approverIds.every((id) => selectedApprovers.includes(id));

    if (allSelected) {
      // Deselect all
      setSelectedApprovers(selectedApprovers.filter((id) => !approverIds.includes(id)));
    } else {
      // Select all
      const newSelected = [...selectedApprovers];
      approverIds.forEach((id) => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      setSelectedApprovers(newSelected);
    }
  };

  const clearSelectedApprovers = () => {
    setSelectedApprovers([]);
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

  // Action handlers
  const handleApproverEdited = () => {
    refetch();
    clearSelectedApprovers();
  };

  const handleMultipleDeleted = () => {
    refetch();
    clearSelectedApprovers();
  };

  // Clear selections when data changes
  useEffect(() => {
    if (allApprovers) {
      const validIds = allApprovers.map((approver) => approver.id);
      setSelectedApprovers((prev) => prev.filter((id) => validIds.includes(id)));
    }
  }, [allApprovers]);

  return {
    // Data
    approvers: filteredApprovers,
    isLoading,
    isError: !!error,
    refetch,

    // Selection
    selectedApprovers,
    handleSelectApprover,
    handleSelectAll,
    clearSelectedApprovers,

    // Dialog states
    editingApprover,
    setEditingApprover,
    viewingApprover,
    setViewingApprover,
    deletingApprover,
    setDeletingApprover,
    deleteMultipleOpen,
    setDeleteMultipleOpen,

    // Search and filter
    searchQuery,
    setSearchQuery,
    searchField,
    setSearchField,

    // Sorting
    sortBy,
    sortDirection,
    handleSort,

    // Actions
    handleApproverEdited,
    handleMultipleDeleted,
    deleteApprover,
  };
}
