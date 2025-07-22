import { useDocumentApproval } from '@/hooks/document-workflow/useDocumentApproval';

interface DocumentEditingStatus {
  isEditingDisabled: boolean;
  isLineEditingDisabled: boolean;
  disabledReason: string | null;
  hasPendingApprovals: boolean;
}

/**
 * Custom hook to determine if document editing operations should be disabled
 * based on approval status and other business rules
 */
export function useDocumentEditingStatus(documentId: number): DocumentEditingStatus {
  const {
    hasPendingApprovals,
    latestApprovalStatus,
    wasRejected
  } = useDocumentApproval(documentId);

  // Determine if editing should be disabled
  const isEditingDisabled = hasPendingApprovals;
  const isLineEditingDisabled = hasPendingApprovals;

  // Provide user-friendly reason for why editing is disabled
  let disabledReason: string | null = null;
  if (hasPendingApprovals) {
    disabledReason = "Document operations are disabled while waiting for approval. Actions will be enabled once the approval is accepted or rejected.";
  }

  return {
    isEditingDisabled,
    isLineEditingDisabled,
    disabledReason,
    hasPendingApprovals
  };
} 