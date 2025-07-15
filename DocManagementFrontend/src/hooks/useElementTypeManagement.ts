import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import lineElementsService from '@/services/lineElementsService';
import { LignesElementType } from '@/models/lineElements';
import { useBulkSelection } from './useBulkSelection';
import { usePagination } from './usePagination';

type ElementTypeSortField = 'code' | 'typeElement' | 'description' | 'createdAt';
type ElementTypeSortDirection = 'asc' | 'desc';

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

    // Filter element types based on search and filters - ensure we have a fallback array
    const filteredElementTypes = (elementTypes || []).filter(et => {
        const matchesSearch = searchQuery === "" || (
            searchField === "all" ? (
                et.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                et.typeElement.toLowerCase().includes(searchQuery.toLowerCase()) ||
                et.description.toLowerCase().includes(searchQuery.toLowerCase())
            ) :
                searchField === "code" ? et.code.toLowerCase().includes(searchQuery.toLowerCase()) :
                    searchField === "type" ? et.typeElement.toLowerCase().includes(searchQuery.toLowerCase()) :
                        searchField === "description" ? et.description.toLowerCase().includes(searchQuery.toLowerCase()) :
                            true
        );

        const matchesType = typeFilter === "any" || et.typeElement === typeFilter;

        return matchesSearch && matchesType;
    });

    // Sort the filtered element types
    const sortedElementTypes = [...filteredElementTypes].sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sortBy) {
            case 'code':
                aValue = a.code;
                bValue = b.code;
                break;
            case 'typeElement':
                aValue = a.typeElement;
                bValue = b.typeElement;
                break;
            case 'description':
                aValue = a.description;
                bValue = b.description;
                break;
            case 'createdAt':
                aValue = new Date(a.createdAt || 0);
                bValue = new Date(b.createdAt || 0);
                break;
            default:
                return 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination
    const pagination = usePagination({
        data: sortedElementTypes,
        initialPageSize: 10,
    });

    const { paginatedData: paginatedElementTypes } = pagination;

    // Bulk selection with correct parameters
    const bulkSelection = useBulkSelection<LignesElementType>({
        data: sortedElementTypes,
        paginatedData: paginatedElementTypes,
        keyField: 'id',
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
    });

    const { selectedItems: selectedElementTypes } = bulkSelection;

    // Handler functions that depend on bulkSelection
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

    // Handle sorting
    const handleSort = (field: ElementTypeSortField) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    const handleSelectElementType = (elementType: LignesElementType, checked: boolean) => {
        bulkSelection.toggleItem(elementType);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            bulkSelection.selectCurrentPage();
        } else {
            bulkSelection.clearSelection();
        }
    };

    return {
        // Data
        elementTypes: sortedElementTypes,
        paginatedElementTypes,
        isLoading,
        isError,
        refetch,

        // Selection
        selectedElementTypes,
        bulkSelection,

        // Pagination
        pagination,

        // Dialogs/modals
        editingElementType,
        setEditingElementType,
        viewingElementType,
        setViewingElementType,
        deletingElementType,
        setDeletingElementType,
        deleteMultipleOpen,
        setDeleteMultipleOpen,

        // Search and filters
        searchQuery,
        setSearchQuery,
        searchField,
        setSearchField,
        typeFilter,
        setTypeFilter,
        showAdvancedFilters,
        setShowAdvancedFilters,

        // Sorting
        sortBy,
        sortDirection,
        handleSort,

        // Actions
        handleSelectElementType,
        handleSelectAll,
        handleElementTypeEdited,
        handleElementTypeDeleted,
        handleMultipleDeleted,
    };
} 