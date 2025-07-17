
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import circuitService from '@/services/circuitService';
import stepService from '@/services/stepService';
import approvalService from '@/services/approvalService';

// Professional search hook with debouncing
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export function useCircuitSteps(circuitId: string) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [selectedSteps, setSelectedSteps] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [apiError, setApiError] = useState('');
  const [searchStats, setSearchStats] = useState({ totalResults: 0, searchTime: 0 });

  // Professional debounced search - 300ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch the circuit
  const {
    data: circuit,
    isLoading: isCircuitLoading,
    isError: isCircuitError,
    error: circuitError
  } = useQuery({
    queryKey: ['circuit', circuitId],
    queryFn: () => circuitService.getCircuitById(Number(circuitId)),
    enabled: !!circuitId,
    meta: {
      onSettled: (data, err) => {
        if (err) {
          const errorMessage = err instanceof Error
            ? err.message
            : 'Failed to load circuit';
          setApiError(errorMessage);
        }
      }
    }
  });

  // Fetch the steps for this circuit
  const {
    data: circuitSteps = [],
    isLoading: isStepsLoading,
    isError: isStepsError,
    error: stepsError,
    refetch: refetchSteps
  } = useQuery({
    queryKey: ['circuit-steps', circuitId],
    queryFn: () => {
      if (circuitId) {
        return stepService.getStepsByCircuitId(Number(circuitId));
      }
      return Promise.resolve([]);
    },
    enabled: !!circuitId && !isCircuitError,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: false, // Only refresh when tab is active
    staleTime: 10000, // Consider data stale after 10 seconds
    meta: {
      onSettled: (data, err) => {
        if (err) {
          const errorMessage = err instanceof Error
            ? err.message
            : 'Failed to load steps';
          setApiError(errorMessage);
        }
      }
    }
  });

  // Fetch approval groups
  const {
    data: approvalGroups = [],
    isLoading: isApprovalGroupsLoading
  } = useQuery({
    queryKey: ['approval-groups'],
    queryFn: () => approvalService.getAllApprovalGroups(),
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch approvators (individual approvers)
  const {
    data: approvators = [],
    isLoading: isApprovatorsLoading
  } = useQuery({
    queryKey: ['approvators'],
    queryFn: () => approvalService.getAllApprovators(),
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Enhanced steps with approval information
  const stepsWithApprovalInfo = circuitSteps?.map(step => {
    let approvalName = '';
    let approvalType = '';

    if (step.requiresApproval) {
      // Check for group approval
      const groupId = step.approvalGroupId || step.approvatorsGroupId;
      if (groupId) {
        const group = approvalGroups.find(g => g.id === groupId);
        approvalName = group?.name || 'Unknown Group';
        approvalType = 'group';
      }
      // Check for individual approval
      else {
        const userId = step.approvalUserId || step.approvatorId;
        if (userId) {
          const approvator = approvators.find(a => a.userId === userId || a.id === userId);
          approvalName = approvator?.username || 'Unknown User';
          approvalType = 'individual';
        }
      }
    }

    return {
      ...step,
      approvalName,
      approvalType
    };
  }) || [];

  // Professional precise search with exact matching priority
  const createSmartSearch = useCallback((query: string, searchField: string = 'all') => {
    if (!query || !query.trim()) return { filter: () => true, stats: { totalResults: 0, searchTime: 0 } };

    const startTime = performance.now();

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

    return {
      filter: (step: any) => {
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
              step.stepKey,
              step.approvalName
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
      },
      stats: {
        searchTime: performance.now() - startTime,
        totalResults: 0
      }
    };
  }, []);

  // Filter steps based on search query with intelligent matching
  const { filter: smartFilter, stats: currentSearchStats } = createSmartSearch(debouncedSearchQuery, searchField);
  const steps = stepsWithApprovalInfo?.filter(smartFilter) || [];

  // Update search statistics
  useEffect(() => {
    setSearchStats({
      totalResults: steps.length,
      searchTime: currentSearchStats.searchTime
    });
  }, [steps.length, currentSearchStats.searchTime]);

  // Reset selections when changing circuits
  useEffect(() => {
    setSelectedSteps([]);
  }, [circuitId]);

  // Handle step selection
  const handleStepSelection = (id: number, checked: boolean) => {
    setSelectedSteps(prev => {
      if (checked) {
        return [...prev, id];
      } else {
        return prev.filter(stepId => stepId !== id);
      }
    });
  };

  // Handle select all steps
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allStepIds = steps.map(step => step.id);
      setSelectedSteps(allStepIds);
    } else {
      setSelectedSteps([]);
    }
  };

  const isLoading = isCircuitLoading || isStepsLoading || isApprovalGroupsLoading || isApprovatorsLoading;
  const isError = isCircuitError || isStepsError;

  return {
    circuit,
    steps,
    searchQuery,
    searchField,
    selectedSteps,
    apiError,
    viewMode,
    isLoading,
    isError,
    setSearchQuery,
    setSearchField,
    handleStepSelection,
    handleSelectAll,
    setViewMode,
    setSelectedSteps,
    refetchSteps,
    searchStats // Expose search stats
  };
}
