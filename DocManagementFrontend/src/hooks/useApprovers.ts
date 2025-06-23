import { useQuery } from "@tanstack/react-query";
import approvalService from "@/services/approvalService";

export interface Approver {
  id: number;
  userId: number;
  username: string;
  comment?: string;
  stepId?: number;
  stepTitle?: string;
  allAssociations?: { stepId: number; stepTitle: string }[];
}

export function useApprovers() {
  // Fetch approvers with enhanced configuration
  const {
    data: approvers = [],
    isLoading,
    isError,
    refetch,
    isFetching,
    isRefetching,
  } = useQuery({
    queryKey: ["approvers"],
    queryFn: () => approvalService.getAllApprovators(),
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true, // Always refetch on component mount
    refetchInterval: 60 * 1000, // Auto-refresh every 60 seconds
    refetchIntervalInBackground: false, // Don't refetch when tab is not active
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  const deleteApprover = async (id: number) => {
    try {
      await approvalService.deleteApprovator(id);
      await refetch(); // Refetch data after deletion
      return { success: true };
    } catch (err) {
      console.error("Error deleting approver:", err);
      return { success: false, error: "An error occurred while deleting approver" };
    }
  };

  return {
    approvers,
    isLoading,
    error: isError,
    refetch,
    isFetching,
    isRefetching,
    deleteApprover,
  };
}
