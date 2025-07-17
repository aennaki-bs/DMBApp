import api from '../api';
import { Document, CreateDocumentRequest, UpdateDocumentRequest } from '../../models/document';

const documentService = {
  getAllDocuments: async (): Promise<Document[]> => {
    try {
      const response = await api.get('/Documents');
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  getMyDocuments: async (): Promise<Document[]> => {
    try {
      const response = await api.get('/Documents/my-documents');
      return response.data;
    } catch (error) {
      console.error('Error fetching my documents:', error);
      throw error;
    }
  },

  getDocumentById: async (id: number): Promise<Document> => {
    try {
      const response = await api.get(`/Documents/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching document with ID ${id}:`, error);
      throw error;
    }
  },

  getRecentDocuments: async (limit: number = 5): Promise<Document[]> => {
    try {
      const response = await api.get(`/Documents/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent documents:', error);
      // If the API doesn't have this endpoint yet, fall back to getting my documents and sorting them
      const allDocs = await documentService.getMyDocuments();
      return allDocs
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, limit);
    }
  },

  getArchivedDocuments: async (): Promise<Document[]> => {
    try {
      const response = await api.get('/Documents/archived');
      return response.data;
    } catch (error) {
      console.error('Error fetching archived documents:', error);
      throw error;
    }
  },

  getCompletedNotArchivedDocuments: async (): Promise<Document[]> => {
    try {
      const response = await api.get('/Documents/completed-not-archived');
      return response.data;
    } catch (error) {
      console.error('Error fetching completed but not archived documents:', error);
      throw error;
    }
  },

  createDocument: async (document: CreateDocumentRequest): Promise<Document> => {
    try {
      const response = await api.post('/Documents', document);
      return response.data;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },

  updateDocument: async (id: number, document: UpdateDocumentRequest): Promise<void> => {
    try {
      await api.put(`/Documents/${id}`, document);
    } catch (error) {
      console.error(`Error updating document with ID ${id}:`, error);
      throw error;
    }
  },

  deleteDocument: async (id: number): Promise<void> => {
    try {
      await api.delete(`/Documents/${id}`);
    } catch (error) {
      console.error(`Error deleting document with ID ${id}:`, error);
      throw error;
    }
  },

  deleteMultipleDocuments: async (ids: number[]): Promise<{ 
    successful: number[], 
    failed: { id: number, error: string }[],
    archivedCount?: number,
    archivedDocuments?: { id: number, documentKey: string, erpCode: string }[]
  }> => {
    const results = {
      successful: [] as number[],
      failed: [] as { id: number, error: string }[],
      archivedCount: 0,
      archivedDocuments: [] as { id: number, documentKey: string, erpCode: string }[]
    };

    // Use the bulk delete endpoint
    try {
      console.log('[DEBUG Frontend] Sending bulk delete request for document IDs:', ids);
      const response = await api.post('/Documents/bulk-delete', ids);
      
      console.log('[DEBUG Frontend] Bulk delete response:', response.data);
      
      // Extract enhanced response data
      const {
        successCount = 0,
        failedIds = [],
        archivedCount = 0,
        archivedDocuments = [],
        otherFailedCount = 0,
        message = ''
      } = response.data;

      // Mark successful ones
      results.successful = ids.filter(id => !failedIds.includes(id));
      results.archivedCount = archivedCount;
      results.archivedDocuments = archivedDocuments;
      
      // If there are failures, categorize them
      if (failedIds && failedIds.length > 0) {
        // Create detailed error messages for failed documents
        const archivedIds = archivedDocuments.map(doc => doc.id);
        
        results.failed = failedIds.map((id: number) => {
          if (archivedIds.includes(id)) {
            const archivedDoc = archivedDocuments.find(doc => doc.id === id);
            return {
              id,
              error: `Document fully archived (${archivedDoc?.erpCode || 'unknown code'}) and cannot be deleted`
            };
          } else {
            return {
              id,
              error: 'Failed to delete document for unknown reason'
            };
          }
        });
        
        // Create comprehensive error message
        let errorMessage = message;
        if (!errorMessage) {
          if (archivedCount > 0 && otherFailedCount > 0) {
            errorMessage = `${successCount} documents deleted. ${archivedCount} could not be deleted (fully archived), ${otherFailedCount} failed for other reasons.`;
          } else if (archivedCount > 0) {
            errorMessage = `${successCount} documents deleted. ${archivedCount} could not be deleted because they are fully archived.`;
          } else if (otherFailedCount > 0) {
            errorMessage = `${successCount} documents deleted. ${otherFailedCount} documents failed for other reasons.`;
          } else {
            errorMessage = 'Some documents could not be deleted';
          }
        }
        
        // Throw error for partial failure handling in UI
        const error = new Error(errorMessage) as any;
        error.results = results;
        error.isPartialFailure = true;
        error.archivedCount = archivedCount;
        error.archivedDocuments = archivedDocuments;
        throw error;
      }
      
      // All successful
      return results;
      
    } catch (error: any) {
      // If this was a partial failure with our enhanced error info, re-throw it
      if (error.results && error.isPartialFailure) {
        throw error;
      }
      
      // Complete failure of bulk endpoint, try individual deletions as fallback
      console.warn('Bulk delete endpoint failed, falling back to individual deletions:', error);
      
      const deletePromises = ids.map(async (id) => {
        try {
          await api.delete(`/Documents/${id}`);
          results.successful.push(id);
          return { success: true, id };
        } catch (error: any) {
          let errorMessage = 'Unknown error';
          
          // Extract specific error messages
          if (error.response?.data) {
            if (typeof error.response.data === 'string') {
              errorMessage = error.response.data;
            } else if (error.response.data.message) {
              errorMessage = error.response.data.message;
            }
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          // Detect archival errors
          if (errorMessage.includes('fully archived') || errorMessage.includes('archived to the ERP system')) {
            errorMessage = 'Document fully archived and cannot be deleted';
          }
          
          results.failed.push({ id, error: errorMessage });
          return { success: false, id, error: errorMessage };
        }
      });

      // Wait for all deletions to complete (whether successful or failed)
      await Promise.allSettled(deletePromises);

      // If there were any failures, throw an error with details
      if (results.failed.length > 0) {
        const successCount = results.successful.length;
        const failCount = results.failed.length;
        const archivedFailures = results.failed.filter(f => f.error.includes('fully archived'));
        
        let errorMessage = '';
        if (successCount > 0) {
          errorMessage = `${successCount} documents deleted successfully. `;
        }
        
        if (archivedFailures.length > 0) {
          errorMessage += `${archivedFailures.length} documents could not be deleted (fully archived). `;
        }
        
        const otherFailures = failCount - archivedFailures.length;
        if (otherFailures > 0) {
          errorMessage += `${otherFailures} documents failed for other reasons.`;
        }
        
        const error = new Error(errorMessage.trim()) as any;
        error.results = results;
        error.archivedCount = archivedFailures.length;
        throw error;
      }

      return results;
    }
  },
};

export default documentService;
