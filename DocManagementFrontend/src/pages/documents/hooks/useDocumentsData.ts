import { useState, useEffect, useMemo, useCallback } from 'react';
import { Document } from '@/models/document';
import documentService from '@/services/documentService';
import { toast } from 'sonner';
export function useDocumentsData() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useFakeData, setUseFakeData] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await documentService.getMyDocuments();
      setDocuments(data);
      setUseFakeData(false);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      toast.error('Failed to load documents. Using test data instead.');
      setDocuments(mockDocuments);
      setUseFakeData(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    if (useFakeData) {
      toast.info('You are currently viewing test data', {
        duration: 5000,
        position: 'top-right',
      });
    }
  }, [useFakeData]);

  const deleteDocument = useCallback(async (id: number) => {
    if (useFakeData) {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } else {
      await documentService.deleteDocument(id);
      fetchDocuments();
    }
  }, [useFakeData, fetchDocuments]);

  const deleteMultipleDocuments = useCallback(async (ids: number[]) => {
    if (useFakeData) {
      setDocuments(prev => prev.filter(doc => !ids.includes(doc.id)));
      return { successful: ids, failed: [] };
    } else {
      try {
        const results = await documentService.deleteMultipleDocuments(ids);
        
        // If we get here, either all succeeded or some failed but we have detailed results
        if (results.successful.length > 0) {
          fetchDocuments(); // Refresh the document list
        }
        
        return results;
      } catch (error: any) {
        // Handle the error with detailed results if available
        if (error.results) {
          const { successful, failed } = error.results;
          
          if (successful.length > 0) {
            fetchDocuments(); // Refresh the document list for successful deletions
          }
          
          // Re-throw with the structured results
          throw error;
        }
        
        // If no structured results, throw the original error
        throw error;
      }
    }
  }, [useFakeData, fetchDocuments]);

  // Sort documents based on sortConfig
  const sortedItems = useMemo(() => {
    const sortableItems = [...documents];
    if (sortConfig !== null) {
      sortableItems.sort((a: any, b: any) => {
        // Handle nested properties with dot notation
        const getSortValue = (item: any, key: string) => {
          const keys = key.split('.');
          let value = item;
          for (const k of keys) {
            if (!value) return '';
            value = value[k];
          }
          return value;
        };

        const aValue = getSortValue(a, sortConfig.key);
        const bValue = getSortValue(b, sortConfig.key);

        if (aValue === bValue) {
          return 0;
        }

        // Handle different data types
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const result = aValue.localeCompare(bValue, undefined, { sensitivity: 'base' });
          return sortConfig.direction === 'ascending' ? result : -result;
        } else {
          const result = aValue > bValue ? 1 : -1;
          return sortConfig.direction === 'ascending' ? result : -result;
        }
      });
    }
    return sortableItems;
  }, [documents, sortConfig]);

  // Request sort function
  const requestSort = useCallback((key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);



  return {
    documents: sortedItems,
    isLoading,
    fetchDocuments,
    deleteDocument,
    deleteMultipleDocuments,
    useFakeData,
    sortConfig,
    setSortConfig,
    requestSort,
  };
}

// Mock data for testing
const mockDocuments: Document[] = [
  {
    id: 1,
    documentKey: "DOC-2023-001",
    title: "Project Proposal",
    content: "This is a sample project proposal document.",
    docDate: new Date().toISOString(),
    comptableDate: new Date().toISOString(),
    status: 1,
    documentAlias: "Project-Proposal-001",
    documentType: { id: 1, typeName: "Proposal" },
    createdBy: { id: 1, username: "john.doe", firstName: "John", lastName: "Doe", email: "john@example.com", role: "Admin" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lignesCount: 3,
    typeId: 1,
    createdByUserId: 1
  },
  {
    id: 2,
    documentKey: "DOC-2023-002",
    title: "Financial Report",
    content: "Quarterly financial report for Q2 2023.",
    docDate: new Date().toISOString(),
    comptableDate: new Date().toISOString(),
    status: 1,
    documentAlias: "Financial-Report-Q2",
    documentType: { id: 2, typeName: "Report" },
    createdBy: { id: 2, username: "jane.smith", firstName: "Jane", lastName: "Smith", email: "jane@example.com", role: "FullUser" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lignesCount: 5,
    typeId: 2,
    createdByUserId: 2
  },
  {
    id: 3,
    documentKey: "DOC-2023-003",
    title: "Meeting Minutes",
    content: "Minutes from the board meeting on August 15, 2023.",
    docDate: new Date().toISOString(),
    comptableDate: new Date().toISOString(),
    status: 0,
    documentAlias: "Board-Minutes-Aug15",
    documentType: { id: 3, typeName: "Minutes" },
    createdBy: { id: 1, username: "john.doe", firstName: "John", lastName: "Doe", email: "john@example.com", role: "Admin" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lignesCount: 2,
    typeId: 3,
    createdByUserId: 1
  },
  {
    id: 4,
    documentKey: "DOC-2023-004",
    title: "Product Specifications",
    content: "Technical specifications for the new product line.",
    docDate: new Date().toISOString(),
    comptableDate: new Date().toISOString(),
    status: 2,
    documentAlias: "Product-Specs-2023",
    documentType: { id: 4, typeName: "Specifications" },
    createdBy: { id: 3, username: "alex.tech", firstName: "Alex", lastName: "Tech", email: "alex@example.com", role: "FullUser" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lignesCount: 0,
    typeId: 4,
    createdByUserId: 3
  },
  {
    id: 5,
    documentKey: "DOC-2023-005",
    title: "Legal Contract",
    content: "Legal contract for the new partnership.",
    docDate: new Date().toISOString(),
    comptableDate: new Date().toISOString(),
    status: 0,
    documentAlias: "Legal-Contract-2023",
    documentType: { id: 5, typeName: "Contract" },
    createdBy: { id: 4, username: "legal.team", firstName: "Legal", lastName: "Team", email: "legal@example.com", role: "FullUser" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lignesCount: 8,
    typeId: 5,
    createdByUserId: 4
  }
];
