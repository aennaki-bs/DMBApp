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

  // Professional precise search with exact matching priority (same as useCircuitSteps)
  const createSmartSearch = (query: string, searchField: string = 'all') => {
    if (!query || !query.trim()) return () => true;

    // Clean and normalize the search query
    const cleanQuery = query.toLowerCase().trim();

    // Split into phrases (if quoted) and individual terms
    const phrases: string[] = [];
    const terms: string[] = [];

    // Check for quoted phrases first
    const quotedPhrases = cleanQuery.match(/"([^"]+)"/g);
    let remainingQuery = cleanQuery;

    if (quotedPhrases) {
      quotedPhrases.forEach(phrase => {
        phrases.push(phrase.replace(/"/g, ''));
        remainingQuery = remainingQuery.replace(phrase, '').trim();
      });
    }

    // Add remaining terms
    if (remainingQuery) {
      terms.push(...remainingQuery.split(/\s+/).filter(term => term.length > 0));
    }

    // Remove duplicates
    const uniqueTerms = [...new Set(terms)];
    const uniquePhrases = [...new Set(phrases)];

    return (step: any) => {
      // Create searchable content based on selected field
      let searchContent = '';

      switch (searchField) {
        case 'title':
          searchContent = step.title || '';
          break;
        case 'currentStatus':
          searchContent = step.currentStatusTitle || '';
          break;
        case 'nextStatus':
          searchContent = step.nextStatusTitle || '';
          break;
        case 'all':
        default:
          searchContent = [
            step.title,
            step.currentStatusTitle,
            step.nextStatusTitle,
            step.descriptif,
            step.stepKey
          ].filter(Boolean).join(' | '); // Use separator to maintain field boundaries
          break;
      }

      const normalizedContent = searchContent.toLowerCase();

      // PRIORITY 1: Exact phrase matching (highest priority)
      if (uniquePhrases.length > 0) {
        const phraseMatches = uniquePhrases.every(phrase => {
          return normalizedContent.includes(phrase);
        });
        if (phraseMatches) return true;
      }

      // PRIORITY 2: All terms must be found (exact word matching)
      if (uniqueTerms.length > 0) {
        const allTermsMatch = uniqueTerms.every(term => {
          // Exact word boundary matching - no partial words
          const wordBoundaryRegex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          return wordBoundaryRegex.test(normalizedContent);
        });
        if (allTermsMatch) return true;
      }

      // PRIORITY 3: Exact substring matching (for compound words)
      if (uniqueTerms.length > 0) {
        const substringMatches = uniqueTerms.every(term => {
          return normalizedContent.includes(term);
        });
        if (substringMatches) return true;
      }

      // If no exact matches found, return false (no fuzzy matching)
      return false;
    };
  };

  // Filter and search logic
  const filteredSteps = useMemo(() => {
    if (!allSteps) return [];

    return allSteps.filter((step) => {
      // Apply intelligent search filter
      if (!createSmartSearch(searchQuery, searchField)(step)) {
        return false;
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