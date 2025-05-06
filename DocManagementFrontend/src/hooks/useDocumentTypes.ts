
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { DocumentType } from '@/models/document';
import documentService from '@/services/documentService';

// Import our new utilities
import { useDocumentTypeFiltering } from './document-types/useDocumentTypeFiltering';
import { useDocumentTypeSorting } from './document-types/useDocumentTypeSorting';
import { useDocumentTypeSelection } from './document-types/useDocumentTypeSelection';
import { useDocumentTypePagination } from './document-types/useDocumentTypePagination';

export const useDocumentTypes = () => {
  const [types, setTypes] = useState<DocumentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  const fetchTypes = async () => {
    try {
      setIsLoading(true);
      const data = await documentService.getAllDocumentTypes();
      setTypes(data);
    } catch (error) {
      console.error('Failed to fetch document types:', error);
      toast.error('Failed to load document types');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  // Use our new utilities
  const { searchQuery, setSearchQuery, filteredTypes } = useDocumentTypeFiltering(types);
  const { sortField, sortDirection, handleSort, sortedTypes } = useDocumentTypeSorting(filteredTypes);
  const { selectedTypes, handleSelectType, handleSelectAll } = useDocumentTypeSelection(sortedTypes);
  
  // Store the result of applying filtering and sorting for pagination and other operations
  const filteredAndSortedTypes = useMemo(() => sortedTypes, [sortedTypes]);
  
  const { 
    currentPage, 
    setCurrentPage, 
    paginatedTypes, 
    totalPages 
  } = useDocumentTypePagination(filteredAndSortedTypes, itemsPerPage);

  return {
    types: paginatedTypes,
    isLoading,
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    handleSort,
    currentPage,
    setCurrentPage,
    totalPages,
    selectedTypes,
    handleSelectType,
    handleSelectAll,
    fetchTypes,
    filteredAndSortedTypes
  };
};
