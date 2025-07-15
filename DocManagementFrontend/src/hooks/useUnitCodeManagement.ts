import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import lineElementsService from '@/services/lineElementsService';
import { UniteCode } from '@/models/lineElements';
import { useBulkSelection } from './useBulkSelection';
import { usePagination } from './usePagination';

type UnitCodeSortField = 'code' | 'description' | 'createdAt';
type UnitCodeSortDirection = 'asc' | 'desc';

export function useUnitCodeManagement() {
    const [editingUnitCode, setEditingUnitCode] = useState<UniteCode | null>(null);
    const [viewingUnitCode, setViewingUnitCode] = useState<UniteCode | null>(null);
    const [deletingUnitCode, setDeletingUnitCode] = useState<string | null>(null);
    const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchField, setSearchField] = useState('all');
    const [sortBy, setSortBy] = useState<UnitCodeSortField>('createdAt');
    const [sortDirection, setSortDirection] = useState<UnitCodeSortDirection>('desc');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const { data: unitCodes, isLoading, isError, refetch } = useQuery({
        queryKey: ['unit-codes'],
        queryFn: lineElementsService.uniteCodes.getAll,
    });

    // Filter unit codes based on search and filters - ensure we have a fallback array
    const filteredUnitCodes = (unitCodes || []).filter(unitCode => {
        const matchesSearch = searchQuery === "" || (
            searchField === "all" ? (
                unitCode.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                unitCode.description.toLowerCase().includes(searchQuery.toLowerCase())
            ) :
                searchField === "code" ? unitCode.code.toLowerCase().includes(searchQuery.toLowerCase()) :
                    searchField === "description" ? unitCode.description.toLowerCase().includes(searchQuery.toLowerCase()) :
                        true
        );

        return matchesSearch;
    });

    // Sort the filtered unit codes
    const sortedUnitCodes = [...filteredUnitCodes].sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sortBy) {
            case 'code':
                aValue = a.code;
                bValue = b.code;
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
        data: sortedUnitCodes,
        initialPageSize: 10,
    });

    const { paginatedData: paginatedUnitCodes } = pagination;

    // Bulk selection with correct parameters
    const bulkSelection = useBulkSelection<UniteCode>({
        data: sortedUnitCodes,
        paginatedData: paginatedUnitCodes,
        keyField: 'code',
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
    });

    const { selectedItems } = bulkSelection;

    // Handler functions that depend on bulkSelection
    const handleUnitCodeEdited = () => {
        refetch();
        setEditingUnitCode(null);
    };

    const handleUnitCodeDeleted = () => {
        refetch();
        setDeletingUnitCode(null);
        bulkSelection.clearSelection();
    };

    const handleMultipleDeleted = () => {
        refetch();
        bulkSelection.clearSelection();
        setDeleteMultipleOpen(false);
    };

    // Handle sorting
    const handleSort = (field: UnitCodeSortField) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    const handleSelectUnitCode = (unitCode: UniteCode, checked: boolean) => {
        bulkSelection.toggleItem(unitCode);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            bulkSelection.selectCurrentPage();
        } else {
            bulkSelection.clearSelection();
        }
    };

    // Clear filters
    const clearAllFilters = () => {
        setSearchQuery('');
        setSearchField('all');
        setShowAdvancedFilters(false);
    };

    return {
        // Data
        unitCodes: sortedUnitCodes,
        paginatedUnitCodes,
        isLoading,
        isError,
        refetch,

        // Selection
        selectedItems,
        bulkSelection,

        // Pagination
        pagination,

        // Dialogs/modals
        editingUnitCode,
        setEditingUnitCode,
        viewingUnitCode,
        setViewingUnitCode,
        deletingUnitCode,
        setDeletingUnitCode,
        deleteMultipleOpen,
        setDeleteMultipleOpen,

        // Search and filters
        searchQuery,
        setSearchQuery,
        searchField,
        setSearchField,
        showAdvancedFilters,
        setShowAdvancedFilters,

        // Sorting
        sortBy,
        sortDirection,
        handleSort,

        // Actions
        handleSelectUnitCode,
        handleSelectAll,
        handleUnitCodeEdited,
        handleUnitCodeDeleted,
        handleMultipleDeleted,
        clearAllFilters,
    };
} 