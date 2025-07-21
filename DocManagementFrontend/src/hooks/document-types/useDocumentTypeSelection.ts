import { useState, useEffect } from 'react';
import { DocumentType, DocumentTypeAssociations } from '@/models/document';
import documentTypeService from '@/services/documents/documentTypeService';

// Configuration flag - set to false if association checking APIs are not available
const ENABLE_ASSOCIATION_CHECKING = false;

export const useDocumentTypeSelection = (types: DocumentType[]) => {
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [associations, setAssociations] = useState<Record<number, DocumentTypeAssociations>>({});
  const [isLoadingAssociations, setIsLoadingAssociations] = useState(false);
  const [associationsLoadError, setAssociationsLoadError] = useState(false);

  // Load associations for all document types
  useEffect(() => {
    const loadAssociations = async () => {
      if (!types.length || !ENABLE_ASSOCIATION_CHECKING) {
        console.log('Association checking disabled or no types to check');
        return;
      }

      setIsLoadingAssociations(true);
      setAssociationsLoadError(false);
      try {
        const typeIds = types.map(type => type.id!).filter(id => id !== undefined);
        console.log('Loading associations for document types:', typeIds);
        
        const associationsData = await documentTypeService.checkMultipleDocumentTypeAssociations(typeIds);
        console.log('Loaded associations:', associationsData);
        
        setAssociations(associationsData);
      } catch (error) {
        console.error('Failed to load document type associations:', error);
        setAssociationsLoadError(true);
        // Set empty associations on error - this will make all types selectable as fallback
        setAssociations({});
      } finally {
        setIsLoadingAssociations(false);
      }
    };

    loadAssociations();
  }, [types]);

  // Helper function to check if a type can be selected
  const canSelectType = (type: DocumentType): boolean => {
    if (!type.id) {
      console.log(`Type rejected: no ID - ${type.typeName}`);
      return false;
    }
    
    // If association checking is disabled, allow all types to be selected
    if (!ENABLE_ASSOCIATION_CHECKING) {
      console.log(`Type ${type.id} (${type.typeName}): association checking disabled, allowing selection`);
      return true;
    }
    
    // Check existing document counter (backward compatibility)
    const hasDocuments = type.documentCounter && type.documentCounter > 0;
    
    // If associations are still loading or failed to load, allow selection for types without documents
    if (isLoadingAssociations || associationsLoadError) {
      console.log(`Type ${type.id} (${type.typeName}): associations loading/error, allowing selection based on documentCounter only`);
      return !hasDocuments;
    }
    
    // Check circuit and document associations
    const typeAssociations = associations[type.id];
    
    // If no association data exists for this type, assume it has no associations (allow selection)
    if (!typeAssociations) {
      console.log(`Type ${type.id} (${type.typeName}): no association data found, allowing selection if no documents`);
      return !hasDocuments;
    }
    
    const hasAssociations = typeAssociations.hasAssociations;
    
    console.log(`Type ${type.id} (${type.typeName}): hasDocuments=${hasDocuments}, hasAssociations=${hasAssociations}, canSelect=${!hasDocuments && !hasAssociations}`);
    
    // Type cannot be selected if it has documents OR other associations
    return !hasDocuments && !hasAssociations;
  };

  // Helper function to get reason why type cannot be selected
  const getDisabledReason = (type: DocumentType): string | null => {
    if (!type.id) return 'Invalid document type';
    
    // If association checking is disabled, allow all selections (no disabled reason)
    if (!ENABLE_ASSOCIATION_CHECKING) {
      return null;
    }
    
    const hasDocuments = type.documentCounter && type.documentCounter > 0;
    
    // If associations are loading, show loading message
    if (isLoadingAssociations) {
      return hasDocuments ? `Cannot select: has ${type.documentCounter} document(s)` : null;
    }
    
    // If associations failed to load, only check documents
    if (associationsLoadError) {
      return hasDocuments ? `Cannot select: has ${type.documentCounter} document(s) (association check failed)` : null;
    }
    
    const typeAssociations = associations[type.id];
    
    // If no association data, only check documents
    if (!typeAssociations) {
      return hasDocuments ? `Cannot select: has ${type.documentCounter} document(s)` : null;
    }
    
    if (hasDocuments && typeAssociations.circuitCount > 0) {
      return `Cannot select: has ${type.documentCounter} document(s) and ${typeAssociations.circuitCount} circuit(s)`;
    } else if (hasDocuments) {
      return `Cannot select: has ${type.documentCounter} document(s)`;
    } else if (typeAssociations.circuitCount > 0) {
      return `Cannot select: has ${typeAssociations.circuitCount} associated circuit(s)`;
    }
    
    return null;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // If association checking is disabled, select ALL types
      if (!ENABLE_ASSOCIATION_CHECKING) {
        const allTypeIds = types
          .map(type => type.id!)
          .filter(id => id !== undefined);
        console.log('Association checking disabled - selecting all types:', allTypeIds);
        setSelectedTypes(allTypeIds);
      } else {
        // If association checking is enabled, only select selectable types
        const selectableTypeIds = types
          .filter(type => canSelectType(type))
          .map(type => type.id!)
          .filter(id => id !== undefined);
        console.log('Selecting selectable types:', selectableTypeIds);
        setSelectedTypes(selectableTypeIds);
      }
    } else {
      setSelectedTypes([]);
    }
  };

  const handleSelectType = (id: number, checked: boolean) => {
    const type = types.find(t => t.id === id);
    if (!type) {
      console.warn(`Type with id ${id} not found`);
      return;
    }
    
    // If association checking is disabled, allow all selections
    if (!ENABLE_ASSOCIATION_CHECKING) {
      console.log(`Association checking disabled - allowing selection of type ${id} (${type.typeName})`);
      if (checked) {
        setSelectedTypes(prev => [...prev, id]);
      } else {
        setSelectedTypes(prev => prev.filter(typeId => typeId !== id));
      }
      return;
    }
    
    // If association checking is enabled, check if type can be selected
    const canSelect = canSelectType(type);
    console.log(`Attempting to select type ${id} (${type.typeName}): canSelect=${canSelect}, checked=${checked}`);
    
    if (!canSelect) {
      console.warn(`Cannot select type ${id} (${type.typeName}):`, getDisabledReason(type));
      return;
    }

    if (checked) {
      setSelectedTypes(prev => [...prev, id]);
    } else {
      setSelectedTypes(prev => prev.filter(typeId => typeId !== id));
    }
  };

  // Get selectable types count for UI display
  const selectableTypesCount = ENABLE_ASSOCIATION_CHECKING 
    ? types.filter(type => canSelectType(type)).length 
    : types.length;
  const totalTypesCount = types.length;

  return {
    selectedTypes,
    setSelectedTypes,
    handleSelectType,
    handleSelectAll,
    canSelectType,
    getDisabledReason,
    associations,
    isLoadingAssociations,
    associationsLoadError,
    selectableTypesCount,
    totalTypesCount,
    associationCheckingEnabled: ENABLE_ASSOCIATION_CHECKING
  };
};
