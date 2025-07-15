import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import vendorService from '@/services/vendorService';
import { Vendor } from '@/models/vendor';
import { useBulkSelection } from './useBulkSelection';
import { usePagination } from './usePagination';

type VendorSortField = 'vendorCode' | 'name' | 'address' | 'city' | 'country' | 'createdAt';
type VendorSortDirection = 'asc' | 'desc';

export function useVendorManagement() {
    const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
    const [viewingVendor, setViewingVendor] = useState<Vendor | null>(null);
    const [deletingVendor, setDeletingVendor] = useState<string | null>(null);
    const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchField, setSearchField] = useState('all');
    const [sortBy, setSortBy] = useState<VendorSortField>('createdAt');
    const [sortDirection, setSortDirection] = useState<VendorSortDirection>('desc');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const { data: vendors, isLoading, isError, refetch } = useQuery({
        queryKey: ['vendors'],
        queryFn: () => vendorService.getAll(),
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Filter vendors based on search and filters - ensure we have a fallback array
    const filteredVendors = (vendors || []).filter(vendor => {
        const matchesSearch = searchQuery === "" || (
            searchField === "all" ? (
                vendor.vendorCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (vendor.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (vendor.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (vendor.country || '').toLowerCase().includes(searchQuery.toLowerCase())
            ) :
                searchField === "vendorCode" ? vendor.vendorCode.toLowerCase().includes(searchQuery.toLowerCase()) :
                    searchField === "name" ? vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) :
                        searchField === "address" ? (vendor.address || '').toLowerCase().includes(searchQuery.toLowerCase()) :
                            searchField === "city" ? (vendor.city || '').toLowerCase().includes(searchQuery.toLowerCase()) :
                                searchField === "country" ? (vendor.country || '').toLowerCase().includes(searchQuery.toLowerCase()) :
                                    true
        );

        return matchesSearch;
    });

    // Sort the filtered vendors
    const sortedVendors = [...filteredVendors].sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sortBy) {
            case 'vendorCode':
                aValue = a.vendorCode;
                bValue = b.vendorCode;
                break;
            case 'name':
                aValue = a.name;
                bValue = b.name;
                break;
            case 'address':
                aValue = a.address || '';
                bValue = b.address || '';
                break;
            case 'city':
                aValue = a.city || '';
                bValue = b.city || '';
                break;
            case 'country':
                aValue = a.country || '';
                bValue = b.country || '';
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
        data: sortedVendors,
        initialPageSize: 10,
    });

    const { paginatedData: paginatedVendors } = pagination;

    // Bulk selection with correct parameters
    const bulkSelection = useBulkSelection<Vendor>({
        data: sortedVendors,
        paginatedData: paginatedVendors,
        keyField: 'vendorCode',
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
    });

    const { selectedItems } = bulkSelection;

    // Handler functions that depend on bulkSelection
    const handleVendorEdited = () => {
        refetch();
        setEditingVendor(null);
    };

    const handleVendorDeleted = () => {
        refetch();
        setDeletingVendor(null);
        bulkSelection.clearSelection();
    };

    const handleMultipleDeleted = () => {
        refetch();
        bulkSelection.clearSelection();
        setDeleteMultipleOpen(false);
    };

    // Handle sorting
    const handleSort = (field: VendorSortField) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    const handleSelectVendor = (vendor: Vendor, checked: boolean) => {
        bulkSelection.toggleItem(vendor);
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
        vendors: sortedVendors,
        paginatedVendors,
        isLoading,
        isError,
        refetch,

        // Selection
        selectedItems,
        bulkSelection,

        // Pagination
        pagination,

        // Dialogs/modals
        editingVendor,
        setEditingVendor,
        viewingVendor,
        setViewingVendor,
        deletingVendor,
        setDeletingVendor,
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
        handleSelectVendor,
        handleSelectAll,
        handleVendorEdited,
        handleVendorDeleted,
        handleMultipleDeleted,
        clearAllFilters,
    };
} 