import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import responsibilityCentreService from '@/services/responsibilityCentreService';
import { ResponsibilityCentre } from '@/models/responsibilityCentre';
import { usePagination } from './usePagination';
import { useBulkSelection } from './useBulkSelection';

export type ResponsibilityCentreSortField = 'code' | 'descr' | 'isActive' | 'createdAt' | 'usersCount' | 'documentsCount';
export type ResponsibilityCentreSortDirection = 'asc' | 'desc';

export function useResponsibilityCentreManagement() {
    const [editingCentre, setEditingCentre] = useState<ResponsibilityCentre | null>(null);
    const [deletingCentre, setDeletingCentre] = useState<number | null>(null);
    const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);
    const [associatingUsersForCentre, setAssociatingUsersForCentre] = useState<ResponsibilityCentre | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchField, setSearchField] = useState('all');
    const [statusFilter, setStatusFilter] = useState('any');
    const [sortBy, setSortBy] = useState<ResponsibilityCentreSortField>('createdAt');
    const [sortDirection, setSortDirection] = useState<ResponsibilityCentreSortDirection>('desc');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const { data: centres, isLoading, isError, refetch } = useQuery({
        queryKey: ['responsibility-centres'],
        queryFn: responsibilityCentreService.getAllResponsibilityCentres,
        refetchInterval: 30000, // Auto-refresh every 30 seconds
        refetchIntervalInBackground: false, // Only refresh when tab is active
        staleTime: 10000, // Consider data stale after 10 seconds
    });

    const handleCentreEdited = () => {
        refetch();
        setEditingCentre(null);
    };

    const handleCentreDeleted = () => {
        refetch();
        setDeletingCentre(null);
        bulkSelection.clearSelection();
    };

    const handleMultipleDeleted = () => {
        refetch();
        bulkSelection.clearSelection();
        setDeleteMultipleOpen(false);
    };

    const handleUsersAssociated = () => {
        refetch();
        setAssociatingUsersForCentre(null);
    };

    const filteredCentres = centres?.filter(centre => {
        if (statusFilter !== 'any') {
            const isActive = statusFilter === 'active';
            if (centre.isActive !== isActive) return false;
        }
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        switch (searchField) {
            case 'code':
                return centre.code.toLowerCase().includes(searchLower);
            case 'descr':
                return centre.descr.toLowerCase().includes(searchLower);
            case 'all':
            default:
                return (
                    centre.code.toLowerCase().includes(searchLower) ||
                    centre.descr.toLowerCase().includes(searchLower)
                );
        }
    }) || [];

    const sortedCentres = [...filteredCentres].sort((a, b) => {
        let aValue: any = a[sortBy];
        let bValue: any = b[sortBy];
        
        if (sortBy === 'isActive') {
            aValue = a.isActive ? 1 : 0;
            bValue = b.isActive ? 1 : 0;
        }
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (field: ResponsibilityCentreSortField) => {
        if (sortBy === field) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    // Use pagination hook
    const pagination = usePagination({
        data: sortedCentres,
        initialPageSize: 15,
    });

    // Use enhanced bulk selection hook
    const bulkSelection = useBulkSelection({
        data: sortedCentres,
        paginatedData: pagination.paginatedData,
        keyField: 'id',
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
    });

    return {
        // Selection state and actions
        selectedCentres: bulkSelection.selectedItems,
        bulkSelection,

        // Pagination
        pagination,

        // Centre data
        centres: sortedCentres,
        paginatedCentres: pagination.paginatedData,

        // Modal states
        editingCentre,
        deletingCentre,
        deleteMultipleOpen,
        associatingUsersForCentre,

        // Search and filters
        searchQuery,
        setSearchQuery,
        searchField,
        setSearchField,
        statusFilter,
        setStatusFilter,
        showAdvancedFilters,
        setShowAdvancedFilters,

        // API state
        isLoading,
        isError,
        refetch,

        // Setters
        setEditingCentre,
        setDeletingCentre,
        setDeleteMultipleOpen,
        setAssociatingUsersForCentre,

        // Sorting
        handleSort,
        sortBy,
        sortDirection,

        // Selection handlers (for backward compatibility)
        handleSelectCentre: bulkSelection.toggleItem,
        handleSelectAll: bulkSelection.toggleSelectCurrentPage,

        // Lifecycle handlers
        handleCentreEdited,
        handleCentreDeleted,
        handleMultipleDeleted,
        handleUsersAssociated,
    };
} 