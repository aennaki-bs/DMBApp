import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import customerService from '@/services/customerService';
import { Customer } from '@/models/customer';
import { useBulkSelection } from './useBulkSelection';
import { usePagination } from './usePagination';

type CustomerSortField = 'code' | 'name' | 'address' | 'city' | 'country' | 'createdAt';
type CustomerSortDirection = 'asc' | 'desc';

export function useCustomerManagement() {
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
    const [deletingCustomer, setDeletingCustomer] = useState<string | null>(null);
    const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchField, setSearchField] = useState('all');
    const [sortBy, setSortBy] = useState<CustomerSortField>('createdAt');
    const [sortDirection, setSortDirection] = useState<CustomerSortDirection>('desc');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const { data: customers, isLoading, isError, refetch } = useQuery({
        queryKey: ['customers'],
        queryFn: () => customerService.getAll(),
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Filter customers based on search and filters - ensure we have a fallback array
    const filteredCustomers = (customers || []).filter(customer => {
        const matchesSearch = searchQuery === "" || (
            searchField === "all" ? (
                customer.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (customer.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (customer.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (customer.country || '').toLowerCase().includes(searchQuery.toLowerCase())
            ) :
                searchField === "code" ? customer.code.toLowerCase().includes(searchQuery.toLowerCase()) :
                    searchField === "name" ? customer.name.toLowerCase().includes(searchQuery.toLowerCase()) :
                        searchField === "address" ? (customer.address || '').toLowerCase().includes(searchQuery.toLowerCase()) :
                            searchField === "city" ? (customer.city || '').toLowerCase().includes(searchQuery.toLowerCase()) :
                                searchField === "country" ? (customer.country || '').toLowerCase().includes(searchQuery.toLowerCase()) :
                                    true
        );

        return matchesSearch;
    });

    // Sort the filtered customers
    const sortedCustomers = [...filteredCustomers].sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sortBy) {
            case 'code':
                aValue = a.code;
                bValue = b.code;
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
        data: sortedCustomers,
        initialPageSize: 10,
    });

    const { paginatedData: paginatedCustomers } = pagination;

    // Bulk selection with correct parameters
    const bulkSelection = useBulkSelection<Customer>({
        data: sortedCustomers,
        paginatedData: paginatedCustomers,
        keyField: 'code',
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
    });

    const { selectedItems } = bulkSelection;

    // Handler functions that depend on bulkSelection
    const handleCustomerEdited = () => {
        refetch();
        setEditingCustomer(null);
    };

    const handleCustomerDeleted = () => {
        refetch();
        setDeletingCustomer(null);
        bulkSelection.clearSelection();
    };

    const handleMultipleDeleted = () => {
        refetch();
        bulkSelection.clearSelection();
        setDeleteMultipleOpen(false);
    };

    // Handle sorting
    const handleSort = (field: CustomerSortField) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    const handleSelectCustomer = (customer: Customer, checked: boolean) => {
        bulkSelection.toggleItem(customer);
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
        customers: sortedCustomers,
        paginatedCustomers,
        isLoading,
        isError,
        refetch,

        // Selection
        selectedItems,
        bulkSelection,

        // Pagination
        pagination,

        // Dialogs/modals
        editingCustomer,
        setEditingCustomer,
        viewingCustomer,
        setViewingCustomer,
        deletingCustomer,
        setDeletingCustomer,
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
        handleSelectCustomer,
        handleSelectAll,
        handleCustomerEdited,
        handleCustomerDeleted,
        handleMultipleDeleted,
        clearAllFilters,
    };
} 