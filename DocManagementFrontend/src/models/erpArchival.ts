export interface ErpArchivalError {
  id: number;
  documentId: number;
  ligneId?: number;
  errorType: string;
  errorMessage: string;
  errorDetails?: string;
  ligneCode?: string;
  occurredAt: string;
  resolvedAt?: string;
  isResolved: boolean;
  resolutionNotes?: string;
  resolvedByUsername?: string;
}

export interface DocumentErpStatus {
  documentId: number;
  documentKey: string;
  isArchived: boolean;
  erpDocumentCode?: string;
  hasErrors: boolean;
  hasUnresolvedErrors: boolean;
  errors: ErpArchivalError[];
  ligneStatuses: LigneErpStatus[];
  lastArchivalAttempt?: string;
  archivalStatusSummary: string;
}

export interface LigneErpStatus {
  ligneId: number;
  ligneCode?: string;
  title: string;
  isArchived: boolean;
  erpLineCode?: string;
  hasErrors: boolean;
  errors: ErpArchivalError[];
}

export interface ResolveErpErrorRequest {
  resolutionNotes: string;
}

export interface RetryErpArchivalRequest {
  ligneIds?: number[];
  reason?: string;
}

export interface ErpArchivalSummary {
  totalDocuments: number;
  archivedDocuments: number;
  pendingDocuments: number;
  documentsWithErrors: number;
  totalLines: number;
  archivedLines: number;
  linesWithErrors: number;
  recentErrors: ErpArchivalError[];
}

export enum ErpErrorType {
  DocumentArchival = "DocumentArchival",
  LineArchival = "LineArchival", 
  ValidationError = "ValidationError",
  NetworkError = "NetworkError",
  AuthenticationError = "AuthenticationError",
  BusinessRuleError = "BusinessRuleError"
} 