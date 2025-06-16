import { useState, useEffect } from "react";
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
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApprovers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await approvalService.getAllApprovators();
      
      if (Array.isArray(response)) {
        setApprovers(response);
      } else {
        setError("Failed to fetch approvers");
        setApprovers([]);
      }
    } catch (err) {
      console.error("Error fetching approvers:", err);
      setError("An error occurred while fetching approvers");
      setApprovers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchApprovers();
  };

  const deleteApprover = async (id: number) => {
    try {
      await approvalService.deleteApprovator(id);
      await fetchApprovers(); // Refetch data
      return { success: true };
    } catch (err) {
      console.error("Error deleting approver:", err);
      return { success: false, error: "An error occurred while deleting approver" };
    }
  };

  useEffect(() => {
    fetchApprovers();
  }, []);

  return {
    approvers,
    isLoading,
    error,
    refetch,
    deleteApprover,
  };
}
