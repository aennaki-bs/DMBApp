import { useState, useMemo } from 'react';
import { DocumentType, TierType } from '@/models/document';
import { DateRange } from 'react-day-picker';
import { getErpTypeFromNumber } from '@/utils/erpTypeUtils';

export interface DocumentTypeFilterState {
    searchQuery: string;
    searchField: string;
    hasDocuments: 'any' | 'yes' | 'no';
    tierType: TierType | 'any';
    erpType: string | 'any';
    createdDateRange?: DateRange;
}

const initialFilterState: DocumentTypeFilterState = {
    searchQuery: '',
    searchField: 'all',
    hasDocuments: 'any',
    tierType: 'any',
    erpType: 'any',
    createdDateRange: undefined,
};

export function useDocumentTypeSmartFilter(documentTypes: DocumentType[]) {
    const [filters, setFilters] = useState<DocumentTypeFilterState>(initialFilterState);
    const [sortField, setSortField] = useState<string>('typeName');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Apply filters to document types
    const filteredTypes = useMemo(() => {
        if (!documentTypes) return [];

        return documentTypes.filter(type => {
            // Search query filtering
            if (filters.searchQuery) {
                const searchLower = filters.searchQuery.toLowerCase();

                switch (filters.searchField) {
                    case 'typeName':
                        if (!type.typeName?.toLowerCase().includes(searchLower)) return false;
                        break;

                    case 'typeAttr':
                        if (!type.typeAttr?.toLowerCase().includes(searchLower)) return false;
                        break;
                    case 'all':
                    default:
                        const matchesSearch =
                            (type.typeName && type.typeName.toLowerCase().includes(searchLower)) ||
                            (type.typeKey && type.typeKey.toLowerCase().includes(searchLower)) ||
                            (type.typeAttr && type.typeAttr.toLowerCase().includes(searchLower));

                        if (!matchesSearch) return false;
                        break;
                }
            }

            // Has documents filtering
            if (filters.hasDocuments !== 'any') {
                const hasDocuments = (type.documentCounter || 0) > 0;
                if (filters.hasDocuments === 'yes' && !hasDocuments) return false;
                if (filters.hasDocuments === 'no' && hasDocuments) return false;
            }

            // Tier type filtering
            if (filters.tierType !== 'any' && type.tierType !== filters.tierType) {
                return false;
            }

            // ERP type filtering
            if (filters.erpType !== 'any') {
                // First check if there's a direct erpType field
                if (type.erpType && type.erpType === filters.erpType) {
                    // Match found on the direct field
                } else {
                    // Otherwise check using the typeNumber
                    const erpTypeName = getErpTypeFromNumber(type.typeNumber);
                    if (erpTypeName !== filters.erpType) {
                        return false;
                    }
                }
            }

            // Date range filtering
            if (filters.createdDateRange && (filters.createdDateRange.from || filters.createdDateRange.to)) {
                const createdAt = new Date(type.createdAt || '');

                if (filters.createdDateRange.from && createdAt < filters.createdDateRange.from) {
                    return false;
                }

                if (filters.createdDateRange.to && createdAt > filters.createdDateRange.to) {
                    return false;
                }
            }

            return true;
        });
    }, [documentTypes, filters]);

    // Sort filtered types
    const sortedTypes = useMemo(() => {
        return [...filteredTypes].sort((a, b) => {
            const aValue = a[sortField as keyof DocumentType];
            const bValue = b[sortField as keyof DocumentType];

            if (aValue === undefined && bValue === undefined) return 0;
            if (aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
            if (bValue === undefined) return sortDirection === 'asc' ? -1 : 1;

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc'
                    ? aValue - bValue
                    : bValue - aValue;
            }

            return 0;
        });
    }, [filteredTypes, sortField, sortDirection]);

    // Handle sort
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Update filters
    const updateFilters = (newFilters: Partial<DocumentTypeFilterState>) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters
        }));
    };

    // Reset filters
    const resetFilters = () => {
        setFilters(initialFilterState);
    };

    // Calculate if any filters are active
    const isFilterActive = useMemo(() => {
        return (
            filters.searchQuery !== '' ||
            filters.hasDocuments !== 'any' ||
            filters.tierType !== 'any' ||
            filters.erpType !== 'any' ||
            !!filters.createdDateRange
        );
    }, [filters]);

    // Count active filters
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.searchQuery) count++;
        if (filters.hasDocuments !== 'any') count++;
        if (filters.tierType !== 'any') count++;
        if (filters.erpType !== 'any') count++;
        if (filters.createdDateRange?.from || filters.createdDateRange?.to) count++;
        return count;
    }, [filters]);

    return {
        filters,
        updateFilters,
        resetFilters,
        filteredTypes: sortedTypes,
        sortField,
        sortDirection,
        handleSort,
        isFilterActive,
        activeFilterCount
    };
} 