
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import circuitService from '@/services/circuitService';
import stepService from '@/services/stepService';
import approvalService from '@/services/approvalService';

export function useCircuitSteps(circuitId: string) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSteps, setSelectedSteps] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [apiError, setApiError] = useState('');

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

  // Filter steps based on search query
  const steps = stepsWithApprovalInfo?.filter(step => {
    if (!searchQuery) return true;

    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      step.title.toLowerCase().includes(lowerCaseQuery) ||
      step.descriptif?.toLowerCase().includes(lowerCaseQuery) ||
      step.stepKey.toLowerCase().includes(lowerCaseQuery)
    );
  }) || [];

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
    selectedSteps,
    apiError,
    viewMode,
    isLoading,
    isError,
    setSearchQuery,
    handleStepSelection,
    handleSelectAll,
    setViewMode,
    setSelectedSteps,
    refetchSteps
  };
}
