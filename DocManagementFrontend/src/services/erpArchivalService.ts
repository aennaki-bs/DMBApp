import api from './api';
import {
  DocumentErpStatus,
  ErpArchivalError,
  ResolveErpErrorRequest,
  RetryErpArchivalRequest,
  ErpArchivalSummary
} from '@/models/erpArchival';

const erpArchivalService = {
  // Get ERP status for a document
  getDocumentErpStatus: async (documentId: number): Promise<DocumentErpStatus> => {
    try {
      const response = await api.get(`/Documents/${documentId}/erp-status`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ERP status for document ${documentId}:`, error);
      throw error;
    }
  },

  // Get ERP errors for a document
  getDocumentErpErrors: async (documentId: number): Promise<ErpArchivalError[]> => {
    try {
      const response = await api.get(`/Documents/${documentId}/erp-errors`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ERP errors for document ${documentId}:`, error);
      throw error;
    }
  },

  // Resolve an ERP error
  resolveErpError: async (errorId: number, request: ResolveErpErrorRequest): Promise<void> => {
    try {
      await api.post(`/Documents/erp-errors/${errorId}/resolve`, request);
    } catch (error) {
      console.error(`Error resolving ERP error ${errorId}:`, error);
      throw error;
    }
  },

  // Retry document archival
  retryDocumentArchival: async (documentId: number, request: RetryErpArchivalRequest): Promise<void> => {
    try {
      await api.post(`/Documents/${documentId}/retry-archival`, request);
    } catch (error) {
      console.error(`Error retrying document archival for ${documentId}:`, error);
      throw error;
    }
  },

  // Retry line archival
  retryLineArchival: async (documentId: number, request: RetryErpArchivalRequest): Promise<void> => {
    try {
      await api.post(`/Documents/${documentId}/retry-line-archival`, request);
    } catch (error) {
      console.error(`Error retrying line archival for document ${documentId}:`, error);
      throw error;
    }
  },

  // Manual ERP archival (existing endpoint)
  manualErpArchival: async (documentId: number): Promise<{ erpDocumentCode: string }> => {
    try {
      const response = await api.post(`/Documents/${documentId}/archive-to-erp`);
      return response.data;
    } catch (error) {
      console.error(`Error manually archiving document ${documentId}:`, error);
      throw error;
    }
  },

  // Manual ERP line creation (existing endpoint)
  manualErpLineCreation: async (documentId: number): Promise<any> => {
    try {
      const response = await api.post(`/Documents/${documentId}/create-lines-in-erp`);
      return response.data;
    } catch (error) {
      console.error(`Error manually creating ERP lines for document ${documentId}:`, error);
      throw error;
    }
  }
};

export default erpArchivalService; 