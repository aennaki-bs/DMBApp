import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import responsibilityCentreService from "@/services/responsibilityCentreService";
import { ResponsibilityCentre } from "@/models/responsibilityCentre";

interface UseResponsibilityCentreManagementProps {
  searchQuery: string;
  searchField: string;
}

export function useResponsibilityCentreManagement({
  searchQuery,
  searchField,
}: UseResponsibilityCentreManagementProps) {
  const [centres, setCentres] = useState<ResponsibilityCentre[]>([]);
  const [selectedCentres, setSelectedCentres] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [sortBy, setSortBy] = useState("code");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Fetch centres
  const fetchCentres = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const response =
        await responsibilityCentreService.getAllResponsibilityCentres();
      setCentres(response);
    } catch (error) {
      console.error("Failed to fetch responsibility centres:", error);
      setIsError(true);
      toast.error("Failed to load responsibility centres");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter centres based on search
  const filteredCentres = useMemo(() => {
    if (!searchQuery.trim()) {
      return centres;
    }

    const query = searchQuery.toLowerCase();

    return centres.filter((centre) => {
      if (searchField === "all") {
        return (
          centre.code.toLowerCase().includes(query) ||
          centre.descr.toLowerCase().includes(query)
        );
      } else if (searchField === "code") {
        return centre.code.toLowerCase().includes(query);
      } else if (searchField === "descr") {
        return centre.descr.toLowerCase().includes(query);
      }
      return true;
    });
  }, [centres, searchQuery, searchField]);

  // Sort centres
  const sortedAndFilteredCentres = useMemo(() => {
    const sorted = [...filteredCentres].sort((a, b) => {
      let aValue: any = a[sortBy as keyof ResponsibilityCentre];
      let bValue: any = b[sortBy as keyof ResponsibilityCentre];

      // Handle numeric values
      if (sortBy === "usersCount" || sortBy === "documentsCount") {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else {
        // Handle string values
        aValue = String(aValue || "").toLowerCase();
        bValue = String(bValue || "").toLowerCase();
      }

      if (aValue < bValue) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [filteredCentres, sortBy, sortDirection]);

  // Handle centre selection with functional updates
  const handleSelectCentre = useCallback(
    (centreId: number, checked: boolean) => {
      setSelectedCentres((prevSelected) => {
        const isCurrentlySelected = prevSelected.includes(centreId);

        if (checked && !isCurrentlySelected) {
          return [...prevSelected, centreId];
        } else if (!checked && isCurrentlySelected) {
          return prevSelected.filter((id) => id !== centreId);
        }

        return prevSelected;
      });
    },
    []
  );

  // Utility functions
  const isAllFilteredSelected = useCallback(
    (centresToCheck?: ResponsibilityCentre[]) => {
      const centres = centresToCheck || sortedAndFilteredCentres;
      if (centres.length === 0) return false;
      return centres.every((centre) => selectedCentres.includes(centre.id));
    },
    [selectedCentres, sortedAndFilteredCentres]
  );

  const getSelectedCount = useCallback(() => {
    return selectedCentres.length;
  }, [selectedCentres]);

  const getFilteredSelectedCount = useCallback(() => {
    return selectedCentres.filter((id) =>
      sortedAndFilteredCentres.some((centre) => centre.id === id)
    ).length;
  }, [selectedCentres, sortedAndFilteredCentres]);

  // Clear all selections
  const clearSelectedCentres = useCallback(() => {
    setSelectedCentres([]);
  }, []);

  // Handle select all with improved logic
  const handleSelectAll = useCallback(() => {
    setSelectedCentres((prevSelected) => {
      const allFilteredIds = sortedAndFilteredCentres.map(
        (centre) => centre.id
      );
      const allFilteredSelected = allFilteredIds.every((id) =>
        prevSelected.includes(id)
      );

      if (allFilteredSelected) {
        // Deselect all filtered centres
        return prevSelected.filter((id) => !allFilteredIds.includes(id));
      } else {
        // Select all filtered centres
        const newSelected = new Set([...prevSelected, ...allFilteredIds]);
        return Array.from(newSelected);
      }
    });
  }, [sortedAndFilteredCentres]);

  // Handle sort
  const handleSort = useCallback(
    (field: string) => {
      if (sortBy === field) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(field);
        setSortDirection("asc");
      }
    },
    [sortBy]
  );

  // Handle edit centre
  const handleEditCentre = useCallback(
    async (centreId: number, data: any) => {
      try {
        await responsibilityCentreService.updateResponsibilityCentre(
          centreId,
          data
        );
        await fetchCentres();
        toast.success("Centre updated successfully");
      } catch (error) {
        console.error("Failed to update centre:", error);
        toast.error("Failed to update centre");
      }
    },
    [fetchCentres]
  );

  // Handle delete centre
  const handleDeleteCentre = useCallback(async (centreId: number) => {
    try {
      await responsibilityCentreService.deleteResponsibilityCentre(centreId);
      setCentres((prev) => prev.filter((centre) => centre.id !== centreId));
      setSelectedCentres((prev) => prev.filter((id) => id !== centreId));
      toast.success("Centre deleted successfully");
    } catch (error) {
      console.error("Failed to delete centre:", error);
      toast.error("Failed to delete centre");
    }
  }, []);

  // Handle bulk delete
  const handleBulkDelete = useCallback(async () => {
    try {
      await Promise.all(
        selectedCentres.map((centreId) =>
          responsibilityCentreService.deleteResponsibilityCentre(centreId)
        )
      );
      setCentres((prev) =>
        prev.filter((centre) => !selectedCentres.includes(centre.id))
      );
      setSelectedCentres([]);
      toast.success(`${selectedCentres.length} centre(s) deleted successfully`);
    } catch (error) {
      console.error("Failed to delete centres:", error);
      toast.error("Failed to delete some centres");
    }
  }, [selectedCentres]);

  // Refresh centres
  const refreshCentres = useCallback(() => {
    fetchCentres();
  }, [fetchCentres]);

  // Initial fetch
  useEffect(() => {
    fetchCentres();
  }, [fetchCentres]);

  return {
    centres,
    filteredCentres: sortedAndFilteredCentres,
    selectedCentres,
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
    // New utility functions
    isAllFilteredSelected,
    getSelectedCount,
    getFilteredSelectedCount,
    clearSelectedCentres,
  };
}
