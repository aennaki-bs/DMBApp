
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

  deleteMultipleDocuments: async (ids: number[]): Promise<void> => {
    try {
      // Since the API doesn't support bulk deletion, we'll delete one by one
      await Promise.all(ids.map(id => api.delete(`/Documents/${id}`)));
    } catch (error) {
      console.error('Error deleting multiple documents:', error);
      throw error;
    }
  },
};

export default documentService;
