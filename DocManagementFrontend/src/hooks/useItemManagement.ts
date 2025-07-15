import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import lineElementsService from '@/services/lineElementsService';
import { Item } from '@/models/lineElements';
import { useBulkSelection } from './useBulkSelection';
import { usePagination } from './usePagination';

type ItemSortField = 'code' | 'description' | 'unite' | 'createdAt';
type ItemSortDirection = 'asc' | 'desc';

export function useItemManagement() {
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [viewingItem, setViewingItem] = useState<Item | null>(null);
    const [deletingItem, setDeletingItem] = useState<string | null>(null);
    const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchField, setSearchField] = useState('all');
    const [sortBy, setSortBy] = useState<ItemSortField>('createdAt');
    const [sortDirection, setSortDirection] = useState<ItemSortDirection>('desc');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const { data: items, isLoading, isError, refetch } = useQuery({
        queryKey: ['items'],
        queryFn: lineElementsService.items.getAll,
    });

    // Filter items based on search and filters - ensure we have a fallback array
    const filteredItems = (items || []).filter(item => {
        const matchesSearch = searchQuery === "" || (
            searchField === "all" ? (
                item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.unite || '').toLowerCase().includes(searchQuery.toLowerCase())
            ) :
                searchField === "code" ? item.code.toLowerCase().includes(searchQuery.toLowerCase()) :
                    searchField === "description" ? item.description.toLowerCase().includes(searchQuery.toLowerCase()) :
                        searchField === "unite" ? (item.unite || '').toLowerCase().includes(searchQuery.toLowerCase()) :
                            true
        );

        return matchesSearch;
    });

    // Sort the filtered items
    const sortedItems = [...filteredItems].sort((a, b) => {
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
            case 'unite':
                aValue = a.unite || '';
                bValue = b.unite || '';
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
        data: sortedItems,
        initialPageSize: 10,
    });

    const { paginatedData: paginatedItems } = pagination;

    // Bulk selection with correct parameters
    const bulkSelection = useBulkSelection<Item>({
        data: sortedItems,
        paginatedData: paginatedItems,
        keyField: 'code',
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
    });

    const { selectedItems } = bulkSelection;

    // Handler functions that depend on bulkSelection
    const handleItemEdited = () => {
        refetch();
        setEditingItem(null);
    };

    const handleItemDeleted = () => {
        refetch();
        setDeletingItem(null);
        bulkSelection.clearSelection();
    };

    const handleMultipleDeleted = () => {
        refetch();
        bulkSelection.clearSelection();
        setDeleteMultipleOpen(false);
    };

    // Handle sorting
    const handleSort = (field: ItemSortField) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    const handleSelectItem = (item: Item, checked: boolean) => {
        bulkSelection.toggleItem(item);
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
        items: sortedItems,
        paginatedItems,
        isLoading,
        isError,
        refetch,

        // Selection
        selectedItems,
        bulkSelection,

        // Pagination
        pagination,

        // Dialogs/modals
        editingItem,
        setEditingItem,
        viewingItem,
        setViewingItem,
        deletingItem,
        setDeletingItem,
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
        handleSelectItem,
        handleSelectAll,
        handleItemEdited,
        handleItemDeleted,
        handleMultipleDeleted,
        clearAllFilters,
    };
} 