import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import approvalService from "@/services/approvalService";
import { ApprovalGroup } from "@/models/approval";

export type SortDirection = "asc" | "desc";
export type SortField = "name" | "ruleType" | "comment" | "approversCount";

export function useApprovalGroupManagement() {
  // Selection state
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);

  // Edit/View/Delete state
  const [editingGroup, setEditingGroup] = useState<ApprovalGroup | null>(null);
  const [viewingGroup, setViewingGroup] = useState<ApprovalGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<number | null>(null);
  const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [ruleTypeFilter, setRuleTypeFilter] = useState("any");

  // Sorting state
  const [sortBy, setSortBy] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Fetch groups
  const {
    data: groups = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["approval-groups"],
    queryFn: () => approvalService.getAllApprovalGroups(),
  });

  // Filter and search groups
  const filteredGroups = useMemo(() => {
    let filtered = [...groups];

    // Apply rule type filter
    if (ruleTypeFilter !== "any") {
      filtered = filtered.filter((group) => group.ruleType === ruleTypeFilter);
    }

    // Apply search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();

      if (searchField === "all") {
        filtered = filtered.filter(
          (group) =>
            group.name.toLowerCase().includes(query) ||
            group.comment?.toLowerCase().includes(query) ||
            group.ruleType.toLowerCase().includes(query)
        );
      } else if (searchField === "name") {
        filtered = filtered.filter((group) =>
          group.name.toLowerCase().includes(query)
        );
      } else if (searchField === "comment") {
        filtered = filtered.filter((group) =>
          group.comment?.toLowerCase().includes(query)
        );
      } else if (searchField === "ruleType") {
        filtered = filtered.filter((group) =>
          group.ruleType.toLowerCase().includes(query)
        );
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "ruleType":
          aValue = a.ruleType.toLowerCase();
          bValue = b.ruleType.toLowerCase();
          break;
        case "comment":
          aValue = (a.comment || "").toLowerCase();
          bValue = (b.comment || "").toLowerCase();
          break;
        case "approversCount":
          aValue = a.approvers?.length || 0;
          bValue = b.approvers?.length || 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [groups, searchQuery, searchField, ruleTypeFilter, sortBy, sortDirection]);

  // Selection handlers
  const handleSelectGroup = useCallback((groupId: number, checked: boolean) => {
    setSelectedGroups((prev) =>
      checked ? [...prev, groupId] : prev.filter((id) => id !== groupId)
    );
  }, []);

  const handleSelectAll = useCallback((groups: ApprovalGroup[]) => {
    setSelectedGroups((prev) =>
      prev.length === groups.length ? [] : groups.map((g) => g.id)
    );
  }, []);

  const clearSelectedGroups = useCallback(() => {
    setSelectedGroups([]);
  }, []);

  // Sorting handler
  const handleSort = useCallback((field: SortField) => {
    setSortBy((prevSortBy) => {
      if (prevSortBy === field) {
        setSortDirection((prevDirection) =>
          prevDirection === "asc" ? "desc" : "asc"
        );
      } else {
        setSortDirection("asc");
      }
      return field;
    });
  }, []);

  // Edit/Delete handlers
  const handleGroupEdited = useCallback(() => {
    refetch();
    setEditingGroup(null);
  }, [refetch]);

  const handleMultipleDeleted = useCallback(() => {
    refetch();
    setSelectedGroups([]);
    setDeleteMultipleOpen(false);
  }, [refetch]);

  return {
    // Data
    groups: filteredGroups,
    isLoading,
    isError,
    refetch,

    // Selection
    selectedGroups,
    handleSelectGroup,
    handleSelectAll,
    clearSelectedGroups,

    // Edit/View/Delete state
    editingGroup,
    setEditingGroup,
    viewingGroup,
    setViewingGroup,
    deletingGroup,
    setDeletingGroup,
    deleteMultipleOpen,
    setDeleteMultipleOpen,

    // Search and filters
    searchQuery,
    setSearchQuery,
    searchField,
    setSearchField,
    ruleTypeFilter,
    setRuleTypeFilter,

    // Sorting
    sortBy,
    sortDirection,
    handleSort,

    // Handlers
    handleGroupEdited,
    handleMultipleDeleted,
  };
}
