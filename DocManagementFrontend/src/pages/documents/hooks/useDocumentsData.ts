import { useState, useEffect, useMemo } from 'react';
import { Document } from '@/models/document';
import documentService from '@/services/documentService';
import { toast } from 'sonner';
import { useDocumentsFilter } from './useDocumentsFilter';

export function useDocumentsData() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useFakeData, setUseFakeData] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  
  const { searchQuery, dateRange, activeFilters } = useDocumentsFilter();

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const data = await documentService.getAllDocuments();
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
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (useFakeData) {
      toast.info('You are currently viewing test data', {
        duration: 5000,
        position: 'top-right',
      });
    }
  }, [useFakeData]);

  const deleteDocument = async (id: number) => {
    if (useFakeData) {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } else {
      await documentService.deleteDocument(id);
      fetchDocuments();
    }
  };

  const deleteMultipleDocuments = async (ids: number[]) => {
    if (useFakeData) {
      setDocuments(prev => prev.filter(doc => !ids.includes(doc.id)));
    } else {
      await documentService.deleteMultipleDocuments(ids);
      fetchDocuments();
    }
  };

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };
  
  const sortedItems = useMemo(() => {
    let sortableItems = [...documents];
    
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        switch(sortConfig.key) {
          case 'title':
            aValue = a.title;
            bValue = b.title;
            break;
          case 'documentKey':
            aValue = a.documentKey;
            bValue = b.documentKey;
            break;
          case 'documentType':
            aValue = a.documentType.typeName;
            bValue = b.documentType.typeName;
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'createdBy':
            aValue = a.createdBy.username;
            bValue = b.createdBy.username;
            break;
          case 'docDate':
            aValue = new Date(a.docDate).getTime();
            bValue = new Date(b.docDate).getTime();
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableItems;
  }, [documents, sortConfig]);

  const filteredItems = useMemo(() => {
    return sortedItems.filter(doc => {
      // Text search filter based on search field
      let matchesSearch = true;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchField = activeFilters.searchField || 'all';
        
        if (searchField === 'all') {
          matchesSearch = 
            (doc.title && doc.title.toLowerCase().includes(query)) || 
            (doc.documentKey && doc.documentKey.toLowerCase().includes(query)) ||
            (doc.documentType && doc.documentType.typeName && doc.documentType.typeName.toLowerCase().includes(query)) ||
            (doc.createdBy && doc.createdBy.username && doc.createdBy.username.toLowerCase().includes(query));
        } else if (searchField === 'documentType.typeName') {
          matchesSearch = doc.documentType && doc.documentType.typeName && 
            doc.documentType.typeName.toLowerCase().includes(query);
        } else if (searchField === 'createdBy.username') {
          matchesSearch = doc.createdBy && doc.createdBy.username && 
            doc.createdBy.username.toLowerCase().includes(query);
        } else {
          // Handle nested properties with dot notation
          const fieldParts = searchField.split('.');
          let fieldValue: any = doc;
          
          for (const part of fieldParts) {
            if (!fieldValue || typeof fieldValue !== 'object') {
              fieldValue = undefined;
              break;
            }
            fieldValue = fieldValue[part];
          }
          
          matchesSearch = fieldValue && String(fieldValue).toLowerCase().includes(query);
        }
      }
      
      // Status filter
      let matchesStatus = true;
      if (activeFilters.statusFilter && activeFilters.statusFilter !== 'any') {
        matchesStatus = doc.status.toString() === activeFilters.statusFilter;
      }
      
      // Type filter
      let matchesType = true;
      if (activeFilters.typeFilter && activeFilters.typeFilter !== 'any') {
        matchesType = doc.typeId.toString() === activeFilters.typeFilter;
      }
      
      // Date range filter
      let matchesDateRange = true;
      if (dateRange && dateRange.from) {
        const docDate = new Date(doc.docDate);
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        
        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          matchesDateRange = docDate >= fromDate && docDate <= toDate;
        } else {
          matchesDateRange = docDate >= fromDate;
        }
      }
      
      return matchesSearch && matchesStatus && matchesType && matchesDateRange;
    });
  }, [sortedItems, searchQuery, dateRange, activeFilters]);

  return { 
    documents,
    filteredItems,
    isLoading,
    fetchDocuments,
    deleteDocument,
    deleteMultipleDocuments,
    useFakeData,
    sortConfig,
    setSortConfig,
    requestSort
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
