import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import locationService from '@/services/locationService';
import { LocationDto } from '@/models/location';
import { useBulkSelection } from './useBulkSelection';
import { usePagination } from './usePagination';

type LocationSortField = 'locationCode' | 'description' | 'createdAt';
type LocationSortDirection = 'asc' | 'desc';

export function useLocationManagement() {
    const [editingLocation, setEditingLocation] = useState<LocationDto | null>(null);
    const [viewingLocation, setViewingLocation] = useState<LocationDto | null>(null);
    const [deletingLocation, setDeletingLocation] = useState<string | null>(null);
    const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchField, setSearchField] = useState('all');
    const [sortBy, setSortBy] = useState<LocationSortField>('createdAt');
    const [sortDirection, setSortDirection] = useState<LocationSortDirection>('desc');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const { data: locations, isLoading, isError, refetch } = useQuery({
        queryKey: ['locations'],
        queryFn: () => locationService.getAll(),
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Filter locations based on search and filters - ensure we have a fallback array
    const filteredLocations = (locations || []).filter(location => {
        const matchesSearch = searchQuery === "" || (
            searchField === "all" ? (
                location.locationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                location.description.toLowerCase().includes(searchQuery.toLowerCase())
            ) :
                searchField === "locationCode" ? location.locationCode.toLowerCase().includes(searchQuery.toLowerCase()) :
                    searchField === "description" ? location.description.toLowerCase().includes(searchQuery.toLowerCase()) :
                        true
        );

        return matchesSearch;
    });

    // Sort the filtered locations
    const sortedLocations = [...filteredLocations].sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sortBy) {
            case 'locationCode':
                aValue = a.locationCode;
                bValue = b.locationCode;
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
        data: sortedLocations,
        initialPageSize: 10,
    });

    const { paginatedData: paginatedLocations } = pagination;

    // Bulk selection with correct parameters
    const bulkSelection = useBulkSelection<LocationDto>({
        data: sortedLocations,
        paginatedData: paginatedLocations,
        keyField: 'locationCode',
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
    });

    const { selectedItems } = bulkSelection;

    // Handler functions that depend on bulkSelection
    const handleLocationEdited = () => {
        refetch();
        setEditingLocation(null);
    };

    const handleLocationDeleted = () => {
        refetch();
        setDeletingLocation(null);
        bulkSelection.clearSelection();
    };

    const handleMultipleDeleted = () => {
        refetch();
        bulkSelection.clearSelection();
        setDeleteMultipleOpen(false);
    };

    // Handle sorting
    const handleSort = (field: LocationSortField) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    const handleSelectLocation = (location: LocationDto, checked: boolean) => {
        bulkSelection.toggleItem(location);
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
        locations: sortedLocations,
        paginatedLocations,
        isLoading,
        isError,
        refetch,

        // Selection
        selectedItems,
        bulkSelection,

        // Pagination
        pagination,

        // Dialogs/modals
        editingLocation,
        setEditingLocation,
        viewingLocation,
        setViewingLocation,
        deletingLocation,
        setDeletingLocation,
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
        handleSelectLocation,
        handleSelectAll,
        handleLocationEdited,
        handleLocationDeleted,
        handleMultipleDeleted,
        clearAllFilters,
    };
} 