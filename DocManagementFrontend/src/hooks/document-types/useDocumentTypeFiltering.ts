import { useState, useMemo } from 'react';
import { DocumentType } from '@/models/document';

// Define types for smart filtering
export interface SmartFilterConfig {
  operator: 'AND' | 'OR';
  conditions: SmartFilterCondition[];
}

export interface SmartFilterCondition {
  id: string;
  field: string;
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'isEmpty' | 'isNotEmpty';
  value: string | number | boolean | Date | null;
  secondValue?: string | number | Date | null; // For 'between' operator
}

export const useDocumentTypeFiltering = (documentTypes: DocumentType[]) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterConfig, setFilterConfig] = useState<{
    field: string | null;
    value: string | null;
    dateRange?: { from?: Date; to?: Date };
  }>({
    field: null,
    value: null,
  });

  // Add smart filter state
  const [smartFilterConfig, setSmartFilterConfig] = useState<SmartFilterConfig>({
    operator: 'AND',
    conditions: []
  });

  // Add smart filter active state
  const [isSmartFilterActive, setIsSmartFilterActive] = useState<boolean>(false);

  const filteredTypes = useMemo(() => {
    if (!documentTypes) return [];

    let filtered = documentTypes;

    // Apply basic text search filtering
    if (searchQuery) {
      filtered = filtered.filter(type =>
        (type.typeName && type.typeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (type.typeKey && type.typeKey.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (type.typeAttr && type.typeAttr.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply standard filtering
    if (filterConfig.field && filterConfig.value) {
      filtered = filtered.filter(type => {
        switch (filterConfig.field) {
          case 'typeName':
            return type.typeName?.toLowerCase().includes(filterConfig.value!.toLowerCase());
          case 'typeKey':
            return type.typeKey?.toLowerCase().includes(filterConfig.value!.toLowerCase());
          case 'documentCounter':
            return type.documentCounter?.toString() === filterConfig.value;
          case 'createdAt':
          case 'updatedAt':
            if (!filterConfig.dateRange) return true;

            const date = new Date(type[filterConfig.field]);
            const from = filterConfig.dateRange.from;
            const to = filterConfig.dateRange.to;

            if (from && to) {
              return date >= from && date <= to;
            } else if (from) {
              return date >= from;
            } else if (to) {
              return date <= to;
            }
            return true;
          default:
            return true;
        }
      });
    }

    // Apply smart filtering if active
    if (isSmartFilterActive && smartFilterConfig.conditions.length > 0) {
      filtered = filtered.filter(type => {
        // For AND operator, all conditions must be true
        if (smartFilterConfig.operator === 'AND') {
          return smartFilterConfig.conditions.every(condition =>
            evaluateCondition(type, condition)
          );
        }
        // For OR operator, at least one condition must be true
        else {
          return smartFilterConfig.conditions.some(condition =>
            evaluateCondition(type, condition)
          );
        }
      });
    }

    return filtered;
  }, [documentTypes, searchQuery, filterConfig, smartFilterConfig, isSmartFilterActive]);

  // Helper function to evaluate a single condition against a document type
  const evaluateCondition = (type: DocumentType, condition: SmartFilterCondition): boolean => {
    const { field, operator, value, secondValue } = condition;
    const fieldValue = type[field as keyof DocumentType];

    // Handle null/undefined field values
    if (fieldValue === undefined || fieldValue === null) {
      return operator === 'isEmpty';
    }

    // Convert to string for string operations
    const stringFieldValue = String(fieldValue).toLowerCase();
    const stringValue = value !== null ? String(value).toLowerCase() : '';

    switch (operator) {
      case 'contains':
        return stringFieldValue.includes(stringValue);
      case 'equals':
        return stringFieldValue === stringValue;
      case 'startsWith':
        return stringFieldValue.startsWith(stringValue);
      case 'endsWith':
        return stringFieldValue.endsWith(stringValue);
      case 'greaterThan':
        return typeof fieldValue === 'number' && typeof value === 'number'
          ? fieldValue > value
          : new Date(fieldValue as string) > new Date(value as string);
      case 'lessThan':
        return typeof fieldValue === 'number' && typeof value === 'number'
          ? fieldValue < value
          : new Date(fieldValue as string) < new Date(value as string);
      case 'between':
        if (typeof fieldValue === 'number' && typeof value === 'number' && typeof secondValue === 'number') {
          return fieldValue >= value && fieldValue <= secondValue;
        } else {
          // Handle date comparisons by converting all values to Date objects
          try {
            const dateField = new Date(String(fieldValue));
            const dateValue = new Date(String(value));
            const dateSecondValue = secondValue ? new Date(String(secondValue)) : new Date();

            // Check if valid dates
            if (!isNaN(dateField.getTime()) && !isNaN(dateValue.getTime()) && !isNaN(dateSecondValue.getTime())) {
              return dateField >= dateValue && dateField <= dateSecondValue;
            }
            return false;
          } catch (error) {
            return false;
          }
        }
      case 'isEmpty':
        return !fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '');
      case 'isNotEmpty':
        return !!fieldValue && (typeof fieldValue !== 'string' || fieldValue.trim() !== '');
      default:
        return false;
    }
  };

  const applyFilter = (config: {
    field: string | null;
    value: string | null;
    dateRange?: { from?: Date; to?: Date };
  }) => {
    setFilterConfig(config);
  };

  // Add function to apply smart filter
  const applySmartFilter = (config: SmartFilterConfig) => {
    setSmartFilterConfig(config);
    setIsSmartFilterActive(true);
  };

  // Add function to clear smart filter
  const clearSmartFilter = () => {
    setSmartFilterConfig({
      operator: 'AND',
      conditions: []
    });
    setIsSmartFilterActive(false);
  };

  // Add function to toggle smart filter active state
  const toggleSmartFilter = (active: boolean) => {
    setIsSmartFilterActive(active);
  };

  return {
    searchQuery,
    setSearchQuery,
    filterConfig,
    applyFilter,
    filteredTypes,
    // Add smart filter properties and functions
    smartFilterConfig,
    applySmartFilter,
    clearSmartFilter,
    isSmartFilterActive,
    toggleSmartFilter
  };
};
