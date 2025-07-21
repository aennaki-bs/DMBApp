
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import circuitService from "@/services/circuitService";
import { toast } from "sonner";

interface UseCircuitListProps {
  onApiError?: (message: string) => void;
  searchQuery: string;
}

export function useCircuitList({ onApiError, searchQuery }: UseCircuitListProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedCircuit, setSelectedCircuit] = useState<Circuit | null>(null);

  const {
    data: circuits,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['circuits'],
    queryFn: circuitService.getAllCircuits,
    meta: {
      onSettled: (data, err) => {
        if (err) {
          const errorMessage = err instanceof Error
            ? err.message
            : 'Failed to load circuits. Please try again later.';
          console.error('Circuit list error:', err);
          if (onApiError) onApiError(errorMessage);
        }
      }
    }
  });

  // Filter circuits based on search query
  const filteredCircuits = useMemo(() => {
    if (!searchQuery.trim() || !circuits) return circuits;

    const query = searchQuery.toLowerCase();
    return circuits.filter(circuit =>
      circuit.circuitKey?.toLowerCase().includes(query) ||
      circuit.title?.toLowerCase().includes(query) ||
      circuit.descriptif?.toLowerCase().includes(query)
    );
  }, [circuits, searchQuery]);

  // Dialog handlers
  const handleEdit = (circuit: Circuit) => {
    setSelectedCircuit(circuit);
    setEditDialogOpen(true);
  };

  const handleDelete = (circuit: Circuit) => {
    setSelectedCircuit(circuit);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (circuit: Circuit) => {
    setSelectedCircuit(circuit);
    setDetailsDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCircuit) return;

    try {
      await circuitService.deleteCircuit(selectedCircuit.id);

      // Use React Query cache invalidation for consistent behavior
      await queryClient.invalidateQueries({
        queryKey: ['circuits'],
        exact: false
      });

      // Also refetch for immediate UI update
      await queryClient.refetchQueries({
        queryKey: ['circuits'],
        exact: false
      });

      setDeleteDialogOpen(false);
      toast.success("Circuit deleted successfully", {
        description: "The circuit list has been updated automatically.",
        duration: 3000,
      });
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to delete circuit';
      toast.error(errorMessage, {
        description: "Please try again or contact support if the problem persists.",
      });
      if (onApiError) onApiError(errorMessage);
      console.error("Circuit deletion error:", error);
    }
  };

  return {
    circuits: filteredCircuits,
    isLoading,
    isError,
    selectedCircuit,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    detailsDialogOpen,
    setDetailsDialogOpen,
    handleEdit,
    handleDelete,
    handleViewDetails,
    confirmDelete,
    refetch
  };
}
