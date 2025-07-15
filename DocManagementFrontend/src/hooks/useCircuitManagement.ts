import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import circuitService from '@/services/circuitService';
// Circuit interface is globally available from vite-env.d.ts
import { useBulkSelection } from './useBulkSelection';
import { usePagination } from './usePagination';

type CircuitSortField = 'circuitKey' | 'title' | 'descriptif' | 'documentType' | 'isActive' | 'createdAt';
type CircuitSortDirection = 'asc' | 'desc';

export function useCircuitManagement() {
    const [editingCircuit, setEditingCircuit] = useState<Circuit | null>(null);
    const [viewingCircuit, setViewingCircuit] = useState<Circuit | null>(null);
    const [deletingCircuit, setDeletingCircuit] = useState<Circuit | null>(null);
    const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchField, setSearchField] = useState('all');
    const [statusFilter, setStatusFilter] = useState('any');
    const [typeFilter, setTypeFilter] = useState('any');
    const [sortBy, setSortBy] = useState<CircuitSortField>('createdAt');
    const [sortDirection, setSortDirection] = useState<CircuitSortDirection>('desc');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

    const { data: circuits, isLoading, isError, refetch } = useQuery({
        queryKey: ['circuits'],
        queryFn: () => circuitService.getAllCircuits(),
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Filter circuits based on search and filters - ensure we have a fallback array
    const filteredCircuits = (circuits || []).filter(circuit => {
        const matchesSearch = searchQuery === "" || (
            searchField === "all" ? (
                (circuit.circuitKey || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (circuit.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (circuit.descriptif || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (circuit.documentType?.typeName || '').toLowerCase().includes(searchQuery.toLowerCase())
            ) :
                searchField === "circuitKey" ? (circuit.circuitKey || '').toLowerCase().includes(searchQuery.toLowerCase()) :
                    searchField === "title" ? (circuit.title || '').toLowerCase().includes(searchQuery.toLowerCase()) :
                        searchField === "descriptif" ? (circuit.descriptif || '').toLowerCase().includes(searchQuery.toLowerCase()) :
                            searchField === "documentType" ? (circuit.documentType?.typeName || '').toLowerCase().includes(searchQuery.toLowerCase()) :
                                true
        );

        const matchesStatus = statusFilter === "any" ||
            (statusFilter === "active" && circuit.isActive) ||
            (statusFilter === "inactive" && !circuit.isActive);

        const matchesType = typeFilter === "any" ||
            String(circuit.documentTypeId) === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    // Sort the filtered circuits
    const sortedCircuits = [...filteredCircuits].sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sortBy) {
            case 'circuitKey':
                aValue = a.circuitKey || '';
                bValue = b.circuitKey || '';
                break;
            case 'title':
                aValue = a.title || '';
                bValue = b.title || '';
                break;
            case 'descriptif':
                aValue = a.descriptif || '';
                bValue = b.descriptif || '';
                break;
            case 'documentType':
                aValue = a.documentType?.typeName || '';
                bValue = b.documentType?.typeName || '';
                break;
            case 'isActive':
                aValue = a.isActive ? 1 : 0;
                bValue = b.isActive ? 1 : 0;
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
        data: sortedCircuits,
        initialPageSize: 10,
    });

    const { paginatedData: paginatedCircuits } = pagination;

    // Bulk selection with correct parameters
    const bulkSelection = useBulkSelection<Circuit>({
        data: sortedCircuits,
        paginatedData: paginatedCircuits,
        keyField: 'id',
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
    });

    const { selectedItems } = bulkSelection;

    // Handler functions that depend on bulkSelection
    const handleCircuitEdited = () => {
        refetch();
        setEditingCircuit(null);
    };

    const handleCircuitDeleted = () => {
        refetch();
        setDeletingCircuit(null);
        bulkSelection.clearSelection();
    };

    const handleMultipleDeleted = () => {
        refetch();
        bulkSelection.clearSelection();
        setDeleteMultipleOpen(false);
    };

    // Handle sorting
    const handleSort = (field: CircuitSortField) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    const handleSelectCircuit = (circuit: Circuit, checked: boolean) => {
        bulkSelection.toggleItem(circuit);
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
        setStatusFilter('any');
        setTypeFilter('any');
        setShowAdvancedFilters(false);
    };

    // Filter badge calculation
    const getActiveFiltersCount = () => {
        let count = 0;
        if (searchQuery) count++;
        if (statusFilter !== 'any') count++;
        if (typeFilter !== 'any') count++;
        return count;
    };

    // Filter badges for display
    const getFilterBadges = () => {
        const badges = [];
        if (searchQuery) {
            badges.push({
                id: 'search',
                label: `Search: ${searchQuery}`,
                onRemove: () => setSearchQuery(''),
            });
        }
        if (statusFilter !== 'any') {
            badges.push({
                id: 'status',
                label: `Status: ${statusFilter}`,
                onRemove: () => setStatusFilter('any'),
            });
        }
        if (typeFilter !== 'any') {
            badges.push({
                id: 'type',
                label: `Type: ${typeFilter}`,
                onRemove: () => setTypeFilter('any'),
            });
        }
        return badges;
    };

    return {
        // Data
        circuits: sortedCircuits,
        paginatedCircuits,
        isLoading,
        isError,
        refetch,

        // Selection
        selectedItems,
        bulkSelection,

        // Pagination
        pagination,

        // Dialogs/modals
        editingCircuit,
        setEditingCircuit,
        viewingCircuit,
        setViewingCircuit,
        deletingCircuit,
        setDeletingCircuit,
        deleteMultipleOpen,
        setDeleteMultipleOpen,

        // Search and filters
        searchQuery,
        setSearchQuery,
        searchField,
        setSearchField,
        statusFilter,
        setStatusFilter,
        typeFilter,
        setTypeFilter,
        showAdvancedFilters,
        setShowAdvancedFilters,

        // View mode
        viewMode,
        setViewMode,

        // Sorting
        sortBy,
        sortDirection,
        handleSort,

        // Actions
        handleSelectCircuit,
        handleSelectAll,
        handleCircuitEdited,
        handleCircuitDeleted,
        handleMultipleDeleted,
        clearAllFilters,

        // Helper functions
        getActiveFiltersCount,
        getFilterBadges,
    };
} 