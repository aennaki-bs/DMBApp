import api from './api/index';
import { SubType } from '../models/subtype';
import { toast } from 'sonner';

// Fallback subtypes for testing when API fails
const FALLBACK_SUBTYPES: Record<number, SubType[]> = {
  1: [ // For document type ID 1 (Invoice)
    { 
      id: 101, 
      name: "Standard Invoice", 
      subTypeKey: "SI",
      description: "Standard invoice for regular billing",
      startDate: "2023-01-01", 
      endDate: "2023-12-31",
      documentTypeId: 1,
      isActive: true
    },
    { 
      id: 102, 
      name: "Tax Invoice", 
      subTypeKey: "TI",
      description: "Invoice with tax details included",
      startDate: "2023-01-01", 
      endDate: "2023-12-31",
      documentTypeId: 1,
      isActive: true
    }
  ],
  2: [ // For document type ID 2 (Contract)
    { 
      id: 201, 
      name: "Employment Contract", 
      subTypeKey: "EC",
      description: "Contract for employment purposes",
      startDate: "2023-01-01", 
      endDate: "2024-12-31",
      documentTypeId: 2,
      isActive: true
    },
    { 
      id: 202, 
      name: "Service Agreement", 
      subTypeKey: "SA",
      description: "Agreement for service provision",
      startDate: "2023-01-01", 
      endDate: "2024-12-31",
      documentTypeId: 2,
      isActive: true
    }
  ],
  3: [ // For document type ID 3 (Report)
    { 
      id: 301, 
      name: "Monthly Report", 
      subTypeKey: "MR",
      description: "Regular monthly reporting document",
      startDate: "2023-01-01", 
      endDate: "2023-12-31",
      documentTypeId: 3,
      isActive: true
    },
    { 
      id: 302, 
      name: "Annual Report", 
      subTypeKey: "AR",
      description: "Yearly comprehensive report",
      startDate: "2023-01-01", 
      endDate: "2023-12-31",
      documentTypeId: 3,
      isActive: true
    }
  ]
};

const subTypeService = {
  getAllSubTypes: async (): Promise<SubType[]> => {
    try {
      const response = await api.get('/Documents/SubTypes');
      console.log('All subtypes response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching all subtypes:', error);
      
      // Create a flat array of all fallback subtypes
      const allFallbackSubtypes = Object.values(FALLBACK_SUBTYPES).flat();
      console.log('Using fallback subtypes:', allFallbackSubtypes);
      
      toast.error('Failed to fetch subtypes. Using test data.');
      return allFallbackSubtypes;
    }
  },

  getSubTypesByDocType: async (docTypeId: number): Promise<SubType[]> => {
    try {
      console.log(`Fetching subtypes for document type ID: ${docTypeId}`);
      const response = await api.get(`/SubType/by-document-type/${docTypeId}`);
      console.log(`Subtypes for document type ${docTypeId}:`, response.data);
      
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('Invalid subtypes response format:', response.data);
        
        // Use fallback subtypes for this document type
        const fallbackForType = FALLBACK_SUBTYPES[docTypeId] || [];
        console.log(`Using fallback subtypes for type ${docTypeId}:`, fallbackForType);
        
        toast.warning('Invalid subtypes response. Using test data.');
        return fallbackForType;
      }
    } catch (error) {
      console.error(`Error fetching subtypes for document type ${docTypeId}:`, error);
      
      // Use fallback subtypes for this document type
      const fallbackForType = FALLBACK_SUBTYPES[docTypeId] || [];
      console.log(`Using fallback subtypes for type ${docTypeId} after error:`, fallbackForType);
      
      toast.error('Failed to fetch subtypes. Using test data.');
      return fallbackForType;
    }
  },

  getSubType: async (id: number): Promise<SubType> => {
    try {
      const response = await api.get(`/Documents/SubTypes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subtype with ID ${id}:`, error);
      throw error;
    }
  },

  getSubTypesForDate: async (docTypeId: number, date: Date | string): Promise<SubType[]> => {
    let formattedDate: string;
    if (date instanceof Date) {
      formattedDate = date.toISOString();
    } else {
      formattedDate = date;
    }
    
    try {
      const response = await api.get(`/SubType/for-date/${docTypeId}/${formattedDate}`);
      
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('Invalid subtypes for date response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching subtypes for document type ${docTypeId} and date ${formattedDate}:`, error);
      throw error;
    }
  },

  createSubType: async (subType: Partial<SubType>): Promise<void> => {
    try {
      await api.post('/Documents/SubTypes', subType);
    } catch (error) {
      console.error('Error creating subtype:', error);
      throw error;
    }
  },

  updateSubType: async (id: number, subType: Partial<SubType>): Promise<void> => {
    try {
      await api.put(`/Documents/SubTypes/${id}`, subType);
    } catch (error) {
      console.error(`Error updating subtype with ID ${id}:`, error);
      throw error;
    }
  },

  deleteSubType: async (id: number): Promise<void> => {
    try {
      await api.delete(`/Documents/SubTypes/${id}`);
    } catch (error) {
      console.error(`Error deleting subtype with ID ${id}:`, error);
      throw error;
    }
  },
  
  deleteMultipleSubTypes: async (ids: number[]): Promise<void> => {
    try {
      // Since the API doesn't support bulk deletion, we'll delete one by one
      await Promise.all(ids.map(id => api.delete(`/Documents/SubTypes/${id}`)));
    } catch (error) {
      console.error('Error deleting multiple subtypes:', error);
      throw error;
    }
  }
};

export default subTypeService;
