import { useState } from 'react';
import api from '@/services/api';
import { DocumentWorkflowStatus, MoveToStatusRequest } from '@/models/documentCircuit';

/**
 * Hook for managing circuit workflow operations
 */
export function useCircuitWorkflow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get the current workflow status for a document
   */
  const getWorkflowStatus = async (documentId: number): Promise<DocumentWorkflowStatus> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/Workflow/document/${documentId}/workflow-status`);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data || 'Failed to get workflow status');
      throw new Error(err.response?.data || 'Failed to get workflow status');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get available transitions for a document
   */
  const getAvailableTransitions = async (documentId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/Workflow/document/${documentId}/available-transitions`);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data || 'Failed to get available transitions');
      throw new Error(err.response?.data || 'Failed to get available transitions');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Move a document to a new status
   */
  const moveToStatus = async (request: MoveToStatusRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/Workflow/move-to-status', {
        documentId: request.documentId,
        targetStatusId: request.targetStatusId,
        comments: request.comments
      });
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Failed to change document status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getWorkflowStatus,
    getAvailableTransitions,
    moveToStatus
  };
} 