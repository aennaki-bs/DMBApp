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
      // If the API doesn't have this endpoint yet, fall back to getting all documents and sorting them
      const allDocs = await documentService.getAllDocuments();
      return allDocs
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, limit);
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

  deleteMultipleDocuments: async (ids: number[]): Promise<{ successful: number[], failed: { id: number, error: string }[] }> => {
    const results = {
      successful: [] as number[],
      failed: [] as { id: number, error: string }[]
    };

    // Process deletions with detailed error tracking
    const deletePromises = ids.map(async (id) => {
      try {
        await api.delete(`/Documents/${id}`);
        results.successful.push(id);
        return { success: true, id };
      } catch (error: any) {
        const errorMessage = error.response?.data || error.message || 'Unknown error';
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
      
      let errorMessage = '';
      if (successCount > 0) {
        errorMessage = `Partially completed: ${successCount} documents deleted successfully, ${failCount} failed.`;
      } else {
        errorMessage = `Failed to delete ${failCount} documents.`;
      }
      
      // Add details about failed deletions
      const failedDetails = results.failed.map(f => `Document ${f.id}: ${f.error}`).join('; ');
      errorMessage += ` Failures: ${failedDetails}`;
      
      const error = new Error(errorMessage) as any;
      error.results = results;
      throw error;
    }

    return results;
  },
};

export default documentService;
