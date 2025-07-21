import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import documentService from '@/services/documentService';
import { DocumentType } from '@/models/document';
import { usePagination } from './usePagination';
import { useBulkSelection } from './useBulkSelection';
import { getErpTypeFromNumber } from '@/utils/erpTypeUtils';

export type DocumentTypeSortField = 'typeName' | 'typeAttr' | 'tierType' | 'typeNumber' | 'createdAt';
export type DocumentTypeSortDirection = 'asc' | 'desc';

export function useDocumentTypeManagement() {
    const [editingType, setEditingType] = useState<DocumentType | null>(null);
    const [deletingType, setDeletingType] = useState<number | null>(null);
    const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchField, setSearchField] = useState('all');
    const [tierTypeFilter, setTierTypeFilter] = useState('any');
    const [hasDocumentsFilter, setHasDocumentsFilter] = useState('any');
    const [erpTypeFilter, setErpTypeFilter] = useState('any');
    const [sortBy, setSortBy] = useState<DocumentTypeSortField>('typeName');
    const [sortDirection, setSortDirection] = useState<DocumentTypeSortDirection>('asc');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    
    // Auto-refresh state
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds default
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    const { data: types, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ['document-types'],
        queryFn: async () => {
            const data = await documentService.getAllDocumentTypes();
            setLastRefresh(new Date());
            return data;
        },
        refetchInterval: autoRefreshEnabled ? refreshInterval : false,
        refetchIntervalInBackground: false, // Only refresh when tab is active
        staleTime: 5000, // Consider data stale after 5 seconds
        refetchOnWindowFocus: true, // Refresh when window gains focus
        onSuccess: () => {
            if (autoRefreshEnabled) {
                console.log('Document types auto-refreshed at:', new Date().toLocaleTimeString());
            }
        },
        onError: (error) => {
            console.error('Failed to fetch document types:', error);
            toast.error('Failed to refresh document types');
        }
    });

    // Manual refresh function
    const handleManualRefresh = async () => {
        try {
            await refetch();
            toast.success('Document types refreshed');
        } catch (error) {
            toast.error('Failed to refresh document types');
        }
    };

    // Toggle auto-refresh
    const toggleAutoRefresh = () => {
        setAutoRefreshEnabled(prev => {
            const newValue = !prev;
            if (newValue) {
                toast.success(`Auto-refresh enabled (${refreshInterval / 1000}s interval)`);
            } else {
                toast.info('Auto-refresh disabled');
            }
            return newValue;
        });
    };

    // Change refresh interval
    const updateRefreshInterval = (newInterval: number) => {
        setRefreshInterval(newInterval);
        if (autoRefreshEnabled) {
            toast.success(`Refresh interval updated to ${newInterval / 1000} seconds`);
        }
    };

    const handleTypeEdited = () => {
        refetch();
        setEditingType(null);
    };

    const handleTypeDeleted = () => {
        refetch();
        setDeletingType(null);
        bulkSelection.clearSelection();
    };

    const handleMultipleDeleted = () => {
        refetch();
        bulkSelection.clearSelection();
        setDeleteMultipleOpen(false);
    };

    const filteredTypes = types?.filter(type => {
        if (tierTypeFilter !== 'any') {
            if (tierTypeFilter === 'none' && type.tierType !== 0) return false;
            if (tierTypeFilter !== 'none' && type.tierType !== parseInt(tierTypeFilter)) return false;
        }

        if (erpTypeFilter !== 'any') {
            const erpTypeName = getErpTypeFromNumber(type.typeNumber);
            if (erpTypeName !== erpTypeFilter) return false;
        }

        if (hasDocumentsFilter !== 'any') {
            const hasDocuments = type.documentCounter && type.documentCounter > 0;
            if (hasDocumentsFilter === 'yes' && !hasDocuments) return false;
            if (hasDocumentsFilter === 'no' && hasDocuments) return false;
        }
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        switch (searchField) {
            case 'typeName':
                return type.typeName?.toLowerCase().includes(searchLower) || false;
            case 'typeAttr':
                return type.typeAttr?.toLowerCase().includes(searchLower) || false;
            case 'all':
            default:
                return (
                    type.typeName?.toLowerCase().includes(searchLower) ||
                    type.typeAttr?.toLowerCase().includes(searchLower) ||
                    false
                );
        }
    }) || [];

    const sortedTypes = [...filteredTypes].sort((a, b) => {
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

    const handleSort = (field: DocumentTypeSortField) => {
        if (sortBy === field) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    // Use pagination hook
    const pagination = usePagination({
        data: sortedTypes,
        initialPageSize: 15,
    });

    // Use enhanced bulk selection hook with ALL items (no filtering)
    const bulkSelection = useBulkSelection({
        data: sortedTypes,
        paginatedData: pagination.paginatedData,
        keyField: 'id',
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
    });

    return {
        // Selection state and actions
        selectedTypes: bulkSelection.selectedItems,
        bulkSelection,

        // Pagination
        pagination,

        // Type data
        types: sortedTypes,
        paginatedTypes: pagination.paginatedData,

        // Modal states
        editingType,
        deletingType,
        deleteMultipleOpen,

        // Search and filters
        searchQuery,
        setSearchQuery,
        searchField,
        setSearchField,
        tierTypeFilter,
        setTierTypeFilter,
        hasDocumentsFilter,
        setHasDocumentsFilter,
        erpTypeFilter,
        setErpTypeFilter,
        showAdvancedFilters,
        setShowAdvancedFilters,

        // API state
        isLoading,
        isError,
        refetch,
        isFetching,

        // Setters
        setEditingType,
        setDeletingType,
        setDeleteMultipleOpen,

        // Sorting
        handleSort,
        sortBy,
        sortDirection,

        // Selection handlers (for backward compatibility)
        handleSelectType: bulkSelection.toggleItem,
        handleSelectAll: bulkSelection.toggleSelectCurrentPage,

        // Lifecycle handlers
        handleTypeEdited,
        handleTypeDeleted,
        handleMultipleDeleted,

        // Auto-refresh
        autoRefreshEnabled,
        refreshInterval,
        lastRefresh,
        handleManualRefresh,
        toggleAutoRefresh,
        updateRefreshInterval,
    };
} 