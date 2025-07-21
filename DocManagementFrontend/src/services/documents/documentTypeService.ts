
import api from '../api';
import { DocumentType } from '../../models/document';
import { DocumentTypeUpdateRequest } from '../../models/documentType';

const documentTypeService = {
  getAllDocumentTypes: async (): Promise<DocumentType[]> => {
    try {
      const response = await api.get('/Documents/Types');
      return response.data;
    } catch (error) {
      console.error('Error fetching document types:', error);
      throw error;
    }
  },

  createDocumentType: async (documentType: Partial<DocumentType>): Promise<void> => {
    try {
      await api.post('/Documents/Types', documentType);
    } catch (error) {
      console.error('Error creating document type:', error);
      throw error;
    }
  },

  updateDocumentType: async (id: number, documentType: DocumentTypeUpdateRequest): Promise<void> => {
    try {
      await api.put(`/Documents/Types/${id}`, documentType);
    } catch (error) {
      console.error(`Error updating document type with ID ${id}:`, error);
      throw error;
    }
  },

  validateTypeName: async (typeName: string): Promise<boolean> => {
    try {
      const response = await api.post('/Documents/valide-type', { typeName });
      return response.data === "True";
    } catch (error) {
      console.error('Error validating type name:', error);
      throw error;
    }
  },

  deleteDocumentType: async (id: number): Promise<void> => {
    try {
      await api.delete(`/Documents/Types/${id}`);
    } catch (error) {
      console.error(`Error deleting document type with ID ${id}:`, error);
      throw error;
    }
  },
  
  deleteMultipleDocumentTypes: async (ids: number[]): Promise<void> => {
    try {
      // Since the API doesn't support bulk deletion, we'll delete one by one
      await Promise.all(ids.map(id => api.delete(`/Documents/Types/${id}`)));
    } catch (error) {
      console.error('Error deleting multiple document types:', error);
      throw error;
    }
  },

  // New association checking functions
  getDocumentTypeAssociations: async (id: number): Promise<DocumentTypeAssociations> => {
    try {
      console.log(`Checking associations for document type ${id}`);
      
      // Use Promise.allSettled to handle cases where endpoints might not exist
      const [circuitResult, documentResult] = await Promise.allSettled([
        api.get(`/Circuit?documentTypeId=${id}`).catch(() => ({ data: [] })),
        api.get(`/Documents?typeId=${id}&pageSize=1`).catch(() => ({ data: { totalCount: 0, length: 0 } }))
      ]);

      let circuitCount = 0;
      let documentCount = 0;

      // Handle circuit result
      if (circuitResult.status === 'fulfilled') {
        const circuitData = circuitResult.value?.data;
        circuitCount = Array.isArray(circuitData) ? circuitData.length : 0;
        console.log(`Document type ${id}: found ${circuitCount} associated circuits`);
      } else {
        console.warn(`Document type ${id}: circuit association check failed, assuming no circuits`);
      }

      // Handle document result  
      if (documentResult.status === 'fulfilled') {
        const documentData = documentResult.value?.data;
        documentCount = documentData?.totalCount || documentData?.length || 0;
        console.log(`Document type ${id}: found ${documentCount} associated documents`);
      } else {
        console.warn(`Document type ${id}: document association check failed, assuming no documents`);
      }

      const hasAssociations = circuitCount > 0 || documentCount > 0;
      
      console.log(`Document type ${id}: circuitCount=${circuitCount}, documentCount=${documentCount}, hasAssociations=${hasAssociations}`);
      
      return {
        circuitCount,
        documentCount,
        hasAssociations
      };
    } catch (error) {
      console.error(`Error checking associations for document type ${id}:`, error);
      // Return safe defaults if API fails - no associations means it can be selected
      return {
        circuitCount: 0,
        documentCount: 0,
        hasAssociations: false
      };
    }
  },

  checkMultipleDocumentTypeAssociations: async (ids: number[]): Promise<Record<number, DocumentTypeAssociations>> => {
    try {
      console.log('Checking associations for multiple document types:', ids);
      
      // Process each ID individually to avoid failing all if one fails
      const associations = await Promise.allSettled(
        ids.map(async (id) => {
          try {
            const result = await documentTypeService.getDocumentTypeAssociations(id);
            return { id, associations: result };
          } catch (error) {
            console.warn(`Failed to check associations for document type ${id}, using safe defaults`);
            return { 
              id, 
              associations: { 
                circuitCount: 0, 
                documentCount: 0, 
                hasAssociations: false 
              } 
            };
          }
        })
      );

      const result = associations.reduce((acc, settledResult) => {
        if (settledResult.status === 'fulfilled') {
          const { id, associations } = settledResult.value;
          acc[id] = associations;
        }
        return acc;
      }, {} as Record<number, DocumentTypeAssociations>);

      console.log('Multiple association check results:', result);
      return result;
    } catch (error) {
      console.error('Error checking multiple document type associations:', error);
      // Return empty object - this will allow all types to be selectable
      return {};
    }
  },

  // Helper function to check if a document type can be selected/deleted
  canPerformActionsOnDocumentType: async (id: number): Promise<boolean> => {
    try {
      const associations = await documentTypeService.getDocumentTypeAssociations(id);
      const canPerform = !associations.hasAssociations;
      console.log(`Document type ${id}: canPerformActions=${canPerform}`);
      return canPerform;
    } catch (error) {
      console.error(`Error checking if actions can be performed on document type ${id}:`, error);
      // Be conservative - if we can't check, allow actions (assume no associations)
      return true;
    }
  },
};

export default documentTypeService;
