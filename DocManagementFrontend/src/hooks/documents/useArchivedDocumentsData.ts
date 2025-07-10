import { useState, useMemo, useCallback } from 'react';
import { Document } from '@/models/document';
import { useArchivedDocumentsFilter } from './useArchivedDocumentsFilter';
import { format, parseISO, isValid } from "date-fns";

export function useArchivedDocumentsData(documents: Document[]) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  
  // Use the new filter hook
  const { activeFilters } = useArchivedDocumentsFilter();

  // Apply comprehensive filtering based on the filter context
  const filteredByAdvancedFilters = useMemo(() => {
    let filtered = [...documents];

    // Apply search filter
    if (activeFilters.searchQuery?.trim()) {
      const query = activeFilters.searchQuery.toLowerCase();
      const searchField = activeFilters.searchField || "all";

      filtered = filtered.filter((doc) => {
        switch (searchField) {
          case "documentKey":
            return doc.documentKey?.toLowerCase().includes(query);
          case "title":
            return doc.title?.toLowerCase().includes(query);
          case "documentType":
            return doc.documentType?.typeName?.toLowerCase().includes(query);
          case "createdBy":
            return doc.createdBy?.username?.toLowerCase().includes(query);
          case "erpDocumentCode":
            return doc.erpDocumentCode?.toLowerCase().includes(query);
          case "all":
          default:
            return (
              doc.documentKey?.toLowerCase().includes(query) ||
              doc.title?.toLowerCase().includes(query) ||
              doc.documentType?.typeName?.toLowerCase().includes(query) ||
              doc.createdBy?.username?.toLowerCase().includes(query) ||
              doc.erpDocumentCode?.toLowerCase().includes(query)
            );
        }
      });
    }

    // Apply type filter
    if (activeFilters.typeFilter && activeFilters.typeFilter !== "any") {
      const typeFilterField = activeFilters.typeFilterField || "typeName";
      
      filtered = filtered.filter((doc) => {
        if (typeFilterField === "typeName") {
          return doc.documentType?.typeName === activeFilters.typeFilter;
        } else if (typeFilterField === "id") {
          return String(doc.documentType?.id) === activeFilters.typeFilter;
        }
        return true;
      });
    }

    // Apply date range filter
    if (activeFilters.dateRange?.from || activeFilters.dateRange?.to) {
      const dateField = activeFilters.dateFilterField || "docDate";
      const fromDate = activeFilters.dateRange.from;
      const toDate = activeFilters.dateRange.to;

      filtered = filtered.filter((doc) => {
        let docDate: Date | null = null;
        
        try {
          switch (dateField) {
            case "docDate":
              docDate = doc.docDate ? parseISO(doc.docDate) : null;
              break;
            case "comptableDate":
              docDate = doc.comptableDate ? parseISO(doc.comptableDate) : null;
              break;
            case "createdAt":
              docDate = doc.createdAt ? parseISO(doc.createdAt) : null;
              break;
            case "updatedAt":
              docDate = doc.updatedAt ? parseISO(doc.updatedAt) : null;
              break;
          }
        } catch (error) {
          return false;
        }

        if (!docDate || !isValid(docDate)) return false;

        if (fromDate && docDate < fromDate) return false;
        if (toDate && docDate > toDate) return false;

        return true;
      });
    }

    return filtered;
  }, [documents, activeFilters]);

  // Sort documents based on sortConfig
  const sortedItems = useMemo(() => {
    const sortableItems = [...filteredByAdvancedFilters];
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

        // Handle date fields specially
        if (sortConfig.key === 'docDate' || sortConfig.key === 'comptableDate' || 
            sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
          try {
            const aDate = aValue ? parseISO(aValue) : null;
            const bDate = bValue ? parseISO(bValue) : null;
            
            if (aDate && bDate && isValid(aDate) && isValid(bDate)) {
              const result = aDate.getTime() - bDate.getTime();
              return sortConfig.direction === 'ascending' ? result : -result;
            }
          } catch (error) {
            // Fall back to string comparison
          }
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
  }, [filteredByAdvancedFilters, sortConfig]);

  // Request sort function
  const requestSort = useCallback((key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  return {
    filteredItems: sortedItems,
    sortConfig,
    setSortConfig,
    requestSort,
    filteredCount: sortedItems.length,
    totalCount: documents.length,
    // Keep backward compatibility
    searchQuery: activeFilters.searchQuery || "",
    setSearchQuery: () => {}, // Deprecated - use filter context instead
  };
} 