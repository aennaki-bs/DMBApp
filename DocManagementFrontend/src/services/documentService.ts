import { Document, DocumentType, CreateDocumentRequest, UpdateDocumentRequest } from "@/models/document";
import { documentService, documentTypeService, ligneService, sousLigneService } from './documents';
import { DocumentTypeUpdateRequest } from '@/models/documentType';

// Re-export all services as properties of a single object for backward compatibility
const combinedDocumentService = {
  // Document methods
  getAllDocuments: documentService.getAllDocuments,
  getDocumentById: documentService.getDocumentById,
  getRecentDocuments: documentService.getRecentDocuments,
  createDocument: documentService.createDocument,
  updateDocument: documentService.updateDocument,
  deleteDocument: documentService.deleteDocument,
  deleteMultipleDocuments: documentService.deleteMultipleDocuments,

  // Document Types methods
  getAllDocumentTypes: documentTypeService.getAllDocumentTypes,
  createDocumentType: documentTypeService.createDocumentType,
  updateDocumentType: async (id: number, documentType: DocumentTypeUpdateRequest): Promise<void> => {
    try {
      await documentTypeService.updateDocumentType(id, documentType);
    } catch (error) {
      console.error(`Error updating document type with ID ${id}:`, error);
      throw error;
    }
  },
  validateTypeName: documentTypeService.validateTypeName,
  deleteDocumentType: documentTypeService.deleteDocumentType,
  deleteMultipleDocumentTypes: documentTypeService.deleteMultipleDocumentTypes,

  // Ligne methods
  getAllLignes: ligneService.getAllLignes,
  getLigneById: ligneService.getLigneById,
  getLignesByDocumentId: ligneService.getLignesByDocumentId,
  createLigne: ligneService.createLigne,
  updateLigne: ligneService.updateLigne,
  deleteLigne: ligneService.deleteLigne,

  // SousLigne methods
  getAllSousLignes: sousLigneService.getAllSousLignes,
  getSousLigneById: sousLigneService.getSousLigneById,
  getSousLignesByLigneId: sousLigneService.getSousLignesByLigneId,
  getSousLignesByDocumentId: sousLigneService.getSousLignesByDocumentId,
  createSousLigne: sousLigneService.createSousLigne,
  updateSousLigne: sousLigneService.updateSousLigne,
  deleteSousLigne: sousLigneService.deleteSousLigne,

  validateTypeCode: async (typeKey: string): Promise<boolean> => {
    try {
      // If API endpoint exists, use it
      // const response = await api.post('/Documents/valide-typekey', { typeKey });
      // return response.data === "True";
      
      // For now, we're implementing client-side validation
      // First check if code is 2-3 characters
      if (typeKey.length < 2 || typeKey.length > 3) {
        return false;
      }
      
      // Then check if code already exists
      const types = await documentTypeService.getAllDocumentTypes();
      return !types.some(type => type.typeKey === typeKey);
    } catch (error) {
      console.error('Error validating type code:', error);
      throw error;
    }
  },

  // Generate a unique type code
  generateTypeCode: async (typeName: string): Promise<string> => {
    try {
      // Extract initials from type name (first 2-3 characters)
      let code = '';
      if (typeName) {
        const words = typeName.split(' ');
        if (words.length > 1) {
          // If multiple words, use first letters of first 2-3 words
          code = words.slice(0, 3).map(word => word[0]).join('').toUpperCase();
        } else {
          // If single word, use first 2-3 letters
          code = typeName.substring(0, 3).toUpperCase();
        }
      }
      
      // Ensure code is 2-3 characters
      if (code.length < 2) {
        // Pad with 'X' if too short
        code = code.padEnd(2, 'X');
      } else if (code.length > 3) {
        // Truncate if too long
        code = code.substring(0, 3);
      }
      
      // Ensure code is unique
      const types = await documentTypeService.getAllDocumentTypes();
      if (types.some(type => type.typeKey === code)) {
        // If code already exists, append a number
        let counter = 1;
        let newCode = code;
        while (types.some(type => type.typeKey === newCode) && counter < 100) {
          newCode = code.substring(0, 2) + counter;
          counter++;
        }
        code = newCode;
      }
      
      return code;
    } catch (error) {
      console.error('Error generating type code:', error);
      throw error;
    }
  }
};

export default combinedDocumentService;
