import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useBulkSelection } from './useBulkSelection';
import { usePagination } from './usePagination';
import { Step } from '@/models/step';
import { useCircuitSteps } from './useCircuitSteps';
import stepService from '@/services/stepService';

export function useStepManagement(circuitId?: string) {
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [statusFilter, setStatusFilter] = useState('any');
  const [circuitFilter, setCircuitFilter] = useState('any');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Sorting state
  const [sortBy, setSortBy] = useState('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Selection and dialog states
  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [deletingStep, setDeletingStep] = useState<Step | null>(null);
  const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);

  // Get steps from the circuit steps hook
  const {
    steps: allSteps = [],
    isLoading,
    isError,
    refetchSteps,
  } = useCircuitSteps(circuitId || '');

  // Filter and search logic
  const filteredSteps = useMemo(() => {
    if (!allSteps) return [];

    return allSteps.filter((step) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchFields = {
          all: [step.title, step.descriptif, step.stepKey].join(' ').toLowerCase(),
          title: step.title.toLowerCase(),
          descriptif: step.descriptif?.toLowerCase() || '',
          stepKey: step.stepKey?.toLowerCase() || '',
        };

        const fieldToSearch = searchFields[searchField as keyof typeof searchFields] || searchFields.all;
        if (!fieldToSearch.includes(query)) {
          return false;
        }
      }

      // Status filter (you can customize this based on your step status logic)
      if (statusFilter !== 'any') {
        // Add status filtering logic here if needed
      }

      // Circuit filter
      if (circuitFilter !== 'any' && circuitId) {
        if (step.circuitId.toString() !== circuitId) {
          return false;
        }
      }

      return true;
    });
  }, [allSteps, searchQuery, searchField, statusFilter, circuitFilter, circuitId]);

  // Sorting logic
  const sortedSteps = useMemo(() => {
    if (!filteredSteps) return [];

    return [...filteredSteps].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'currentStatusTitle':
          aValue = a.currentStatusTitle;
          bValue = b.currentStatusTitle;
          break;
        case 'nextStatusTitle':
          aValue = a.nextStatusTitle;
          bValue = b.nextStatusTitle;
          break;
        case 'stepKey':
          aValue = a.stepKey;
          bValue = b.stepKey;
          break;
        default:
          aValue = a.title;
          bValue = b.title;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredSteps, sortBy, sortDirection]);

  // Pagination hook
  const pagination = usePagination({
    data: sortedSteps,
    initialPageSize: 25,
  });

  // Bulk selection hook
  const bulkSelection = useBulkSelection<Step>({
    data: sortedSteps,
    paginatedData: pagination.paginatedData,
    currentPage: pagination.currentPage,
    pageSize: pagination.pageSize,
    keyField: 'id',
  });

  // Get paginated steps
  const paginatedSteps = pagination.paginatedData;
  const selectedSteps = bulkSelection.selectedItems.map(step => step.id);

  // Handlers
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleStepEdited = () => {
    refetchSteps();
    setEditingStep(null);
    toast.success('Step updated successfully');
  };

  const handleStepDeleted = () => {
    refetchSteps();
    setDeletingStep(null);
    toast.success('Step deleted successfully');
  };

  const handleMultipleDeleted = async () => {
    try {
      const selectedIds = bulkSelection.selectedItems.map(step => step.id);
      await stepService.deleteMultipleSteps(selectedIds);
      bulkSelection.clearSelection();
      refetchSteps();
      setDeleteMultipleOpen(false);
      toast.success(`Successfully deleted ${selectedIds.length} steps`);
    } catch (error) {
      console.error('Failed to delete steps:', error);
      toast.error('Failed to delete selected steps');
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSearchField('all');
    setStatusFilter('any');
    setCircuitFilter('any');
    setShowAdvancedFilters(false);
  };

  // Auto-set circuit filter when circuitId is provided
  useEffect(() => {
    if (circuitId) {
      setCircuitFilter(circuitId);
    }
  }, [circuitId]);

  return {
    // Data
    steps: sortedSteps,
    paginatedSteps,
    selectedSteps,
    allSteps,

    // States
    isLoading,
    isError,
    editingStep,
    deletingStep,
    deleteMultipleOpen,

    // Search and filter
    searchQuery,
    setSearchQuery,
    searchField,
    setSearchField,
    statusFilter,
    setStatusFilter,
    circuitFilter,
    setCircuitFilter,
    showAdvancedFilters,
    setShowAdvancedFilters,

    // Sorting
    sortBy,
    sortDirection,
    handleSort,

    // Selection
    bulkSelection,
    pagination,

    // Handlers
    setEditingStep,
    setDeletingStep,
    setDeleteMultipleOpen,
    handleStepEdited,
    handleStepDeleted,
    handleMultipleDeleted,
    clearAllFilters,
    refetch: refetchSteps,
  };
} 