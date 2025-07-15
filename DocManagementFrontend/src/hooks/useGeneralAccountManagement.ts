import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import lineElementsService from '@/services/lineElementsService';
import { GeneralAccounts } from '@/models/lineElements';
import { useBulkSelection } from './useBulkSelection';
import { usePagination } from './usePagination';

type GeneralAccountSortField = 'code' | 'description' | 'accountType' | 'createdAt';
type GeneralAccountSortDirection = 'asc' | 'desc';

export function useGeneralAccountManagement() {
    const [editingAccount, setEditingAccount] = useState<GeneralAccounts | null>(null);
    const [viewingAccount, setViewingAccount] = useState<GeneralAccounts | null>(null);
    const [deletingAccount, setDeletingAccount] = useState<string | null>(null);
    const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchField, setSearchField] = useState('all');
    const [sortBy, setSortBy] = useState<GeneralAccountSortField>('createdAt');
    const [sortDirection, setSortDirection] = useState<GeneralAccountSortDirection>('desc');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const { data: accounts, isLoading, isError, refetch } = useQuery({
        queryKey: ['general-accounts'],
        queryFn: lineElementsService.generalAccounts.getAll,
    });

    // Filter accounts based on search and filters - ensure we have a fallback array
    const filteredAccounts = (accounts || []).filter(account => {
        const matchesSearch = searchQuery === "" || (
            searchField === "all" ? (
                account.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                account.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (account.accountType || '').toLowerCase().includes(searchQuery.toLowerCase())
            ) :
                searchField === "code" ? account.code.toLowerCase().includes(searchQuery.toLowerCase()) :
                    searchField === "description" ? account.description.toLowerCase().includes(searchQuery.toLowerCase()) :
                        searchField === "accountType" ? (account.accountType || '').toLowerCase().includes(searchQuery.toLowerCase()) :
                            true
        );

        return matchesSearch;
    });

    // Sort the filtered accounts
    const sortedAccounts = [...filteredAccounts].sort((a, b) => {
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
            case 'accountType':
                aValue = a.accountType || '';
                bValue = b.accountType || '';
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
        data: sortedAccounts,
        initialPageSize: 10,
    });

    const { paginatedData: paginatedAccounts } = pagination;

    // Bulk selection with correct parameters
    const bulkSelection = useBulkSelection<GeneralAccounts>({
        data: sortedAccounts,
        paginatedData: paginatedAccounts,
        keyField: 'code',
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
    });

    const { selectedItems } = bulkSelection;

    // Handler functions that depend on bulkSelection
    const handleAccountEdited = () => {
        refetch();
        setEditingAccount(null);
    };

    const handleAccountDeleted = () => {
        refetch();
        setDeletingAccount(null);
        bulkSelection.clearSelection();
    };

    const handleMultipleDeleted = () => {
        refetch();
        bulkSelection.clearSelection();
        setDeleteMultipleOpen(false);
    };

    // Handle sorting
    const handleSort = (field: GeneralAccountSortField) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    const handleSelectAccount = (account: GeneralAccounts, checked: boolean) => {
        bulkSelection.toggleItem(account);
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
        accounts: sortedAccounts,
        paginatedAccounts,
        isLoading,
        isError,
        refetch,

        // Selection
        selectedItems,
        bulkSelection,

        // Pagination
        pagination,

        // Dialogs/modals
        editingAccount,
        setEditingAccount,
        viewingAccount,
        setViewingAccount,
        deletingAccount,
        setDeletingAccount,
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
        handleSelectAccount,
        handleSelectAll,
        handleAccountEdited,
        handleAccountDeleted,
        handleMultipleDeleted,
        clearAllFilters,
    };
} 