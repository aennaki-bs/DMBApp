import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import lineElementsService from '@/services/lineElementsService';
import { LignesElementType } from '@/models/lineElements';
import { usePagination } from './usePagination';
import { useBulkSelection } from './useBulkSelection';

export type ElementTypeSortField = 'code' | 'typeElement' | 'description' | 'tableName' | 'createdAt' | 'updatedAt';
export type ElementTypeSortDirection = 'asc' | 'desc';

export function useElementTypeManagement() {
    const [editingElementType, setEditingElementType] = useState<LignesElementType | null>(null);
    const [viewingElementType, setViewingElementType] = useState<LignesElementType | null>(null);
    const [deletingElementType, setDeletingElementType] = useState<number | null>(null);
    const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchField, setSearchField] = useState('all');
    const [typeFilter, setTypeFilter] = useState('any');
    const [sortBy, setSortBy] = useState<ElementTypeSortField>('createdAt');
    const [sortDirection, setSortDirection] = useState<ElementTypeSortDirection>('desc');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const { data: elementTypes, isLoading, isError, refetch } = useQuery({
        queryKey: ['element-types'],
        queryFn: lineElementsService.elementTypes.getAll,
    });

    const handleElementTypeEdited = () => {
        refetch();
        setEditingElementType(null);
    };

    const handleElementTypeDeleted = () => {
        refetch();
        setDeletingElementType(null);
        bulkSelection.clearSelection();
    };

    const handleMultipleDeleted = () => {
        refetch();
        bulkSelection.clearSelection();
        setDeleteMultipleOpen(false);
    };

    const filteredElementTypes = elementTypes?.filter(elementType => {
        // Type filter
        if (typeFilter !== 'any' && elementType.typeElement !== typeFilter) return false;

        // Search filter
        if (!searchQuery) return true;

        const searchLower = searchQuery.toLowerCase();
        switch (searchField) {
            case 'code':
                return elementType.code.toLowerCase().includes(searchLower);
            case 'type':
                return elementType.typeElement.toLowerCase().includes(searchLower);
            case 'description':
                return elementType.description.toLowerCase().includes(searchLower);
            case 'all':
            default:
                return (
                    elementType.code.toLowerCase().includes(searchLower) ||
                    elementType.typeElement.toLowerCase().includes(searchLower) ||
                    elementType.description.toLowerCase().includes(searchLower) ||
                    elementType.tableName.toLowerCase().includes(searchLower)
                );
        }
    }) || [];

    const sortedElementTypes = [...filteredElementTypes].sort((a, b) => {
        let aValue: any = a[sortBy];
        let bValue: any = b[sortBy];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (field: ElementTypeSortField) => {
        if (sortBy === field) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    // Use pagination hook
    const pagination = usePagination({
        data: sortedElementTypes,
        initialPageSize: 15,
    });

    // Use enhanced bulk selection hook
    const bulkSelection = useBulkSelection({
        data: sortedElementTypes,
        paginatedData: pagination.paginatedData,
        keyField: 'id',
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
    });

    return {
        // Selection state and actions
        selectedElementTypes: bulkSelection.selectedItems,
        bulkSelection,

        // Pagination
        pagination,

        // Element type data
        elementTypes: sortedElementTypes,
        paginatedElementTypes: pagination.paginatedData,

        // Modal states
        editingElementType,
        viewingElementType,
        deletingElementType,
        deleteMultipleOpen,

        // Search and filters
        searchQuery,
        setSearchQuery,
        searchField,
        setSearchField,
        typeFilter,
        setTypeFilter,
        showAdvancedFilters,
        setShowAdvancedFilters,

        // API state
        isLoading,
        isError,
        refetch,

        // Setters
        setEditingElementType,
        setViewingElementType,
        setDeletingElementType,
        setDeleteMultipleOpen,

        // Sorting
        handleSort,
        sortBy,
        sortDirection,

        // Selection handlers (for backward compatibility)
        handleSelectElementType: bulkSelection.toggleItem,
        handleSelectAll: bulkSelection.toggleSelectCurrentPage,

        // Lifecycle handlers
        handleElementTypeEdited,
        handleElementTypeDeleted,
        handleMultipleDeleted,
    };
} 