import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import adminService, { UserDto } from '@/services/adminService';
import { usePagination } from './usePagination';
import { useBulkSelection } from './useBulkSelection';

export type UserSortField = 'firstName' | 'lastName' | 'username' | 'email' | 'role' | 'isActive' | 'createdAt';
export type UserSortDirection = 'asc' | 'desc';

export function useUserManagement() {
    const [editingUser, setEditingUser] = useState<UserDto | null>(null);
    const [editEmailUser, setEditEmailUser] = useState<UserDto | null | null>(null);
    const [viewingUserLogs, setViewingUserLogs] = useState<number | null>(null);
    const [deletingUser, setDeletingUser] = useState<number | null>(null);
    const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchField, setSearchField] = useState('all');
    const [roleFilter, setRoleFilter] = useState('any');
    const [statusFilter, setStatusFilter] = useState('any');
    const [roleChangeOpen, setRoleChangeOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [sortBy, setSortBy] = useState<UserSortField>('createdAt');
    const [sortDirection, setSortDirection] = useState<UserSortDirection>('desc');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const { data: users, isLoading, isError, refetch } = useQuery({
        queryKey: ['admin-users'],
        queryFn: adminService.getAllUsers,
    });

    const handleUserEdited = () => {
        refetch();
        setEditingUser(null);
    };

    const handleUserEmailEdited = () => {
        refetch();
        setEditEmailUser(null);
    };

    const handleUserDeleted = () => {
        refetch();
        setDeletingUser(null);
        bulkSelection.clearSelection();
    };

    const handleMultipleDeleted = () => {
        refetch();
        bulkSelection.clearSelection();
        setDeleteMultipleOpen(false);
    };

    const getRoleName = (role: any) => {
        if (!role) return '';
        if (typeof role === 'string') return role;
        if (typeof role === 'object' && role.roleName) return role.roleName;
        return '';
    };

    const filteredUsers = users?.filter(user => {
        if (statusFilter !== 'any') {
            const isActive = statusFilter === 'active';
            if (user.isActive !== isActive) return false;
        }
        if (roleFilter !== 'any' && getRoleName(user.role) !== roleFilter) return false;
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        switch (searchField) {
            case 'username':
                return user.username.toLowerCase().includes(searchLower);
            case 'email':
                return user.email.toLowerCase().includes(searchLower);
            case 'firstName':
                return user.firstName.toLowerCase().includes(searchLower);
            case 'lastName':
                return user.lastName.toLowerCase().includes(searchLower);
            case 'role':
                return getRoleName(user.role).toLowerCase().includes(searchLower);
            case 'fullName':
                return (
                    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower) ||
                    `${user.lastName} ${user.firstName}`.toLowerCase().includes(searchLower)
                );
            case 'all':
            default:
                return (
                    user.username.toLowerCase().includes(searchLower) ||
                    user.firstName.toLowerCase().includes(searchLower) ||
                    user.lastName.toLowerCase().includes(searchLower) ||
                    user.email.toLowerCase().includes(searchLower) ||
                    getRoleName(user.role).toLowerCase().includes(searchLower) ||
                    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower)
                );
        }
    }) || [];

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        let aValue: any = a[sortBy];
        let bValue: any = b[sortBy];
        if (sortBy === 'role') {
            aValue = getRoleName(a.role);
            bValue = getRoleName(b.role);
        }
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

    const handleSort = (field: UserSortField) => {
        if (sortBy === field) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    // Use pagination hook
    const pagination = usePagination({
        data: sortedUsers,
        initialPageSize: 15,
    });

    // Use enhanced bulk selection hook
    const bulkSelection = useBulkSelection({
        data: sortedUsers,
        paginatedData: pagination.paginatedData,
        keyField: 'id',
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
    });

    return {
        // Selection state and actions
        selectedUsers: bulkSelection.selectedItems,
        bulkSelection,

        // Pagination
        pagination,

        // User data
        users: sortedUsers,
        paginatedUsers: pagination.paginatedData,

        // Modal states
        editingUser,
        editEmailUser,
        viewingUserLogs,
        deletingUser,
        deleteMultipleOpen,

        // Search and filters
        searchQuery,
        setSearchQuery,
        searchField,
        setSearchField,
        roleFilter,
        setRoleFilter,
        statusFilter,
        setStatusFilter,
        showAdvancedFilters,
        setShowAdvancedFilters,

        // Role change
        roleChangeOpen,
        selectedRole,

        // API state
        isLoading,
        isError,
        refetch,

        // Setters
        setEditingUser,
        setEditEmailUser,
        setViewingUserLogs,
        setDeletingUser,
        setDeleteMultipleOpen,
        setRoleChangeOpen,
        setSelectedRole,

        // Sorting
        handleSort,
        sortBy,
        sortDirection,

        // Selection handlers (for backward compatibility)
        handleSelectUser: bulkSelection.toggleItem,
        handleSelectAll: bulkSelection.toggleSelectCurrentPage,

        // Lifecycle handlers
        handleUserEdited,
        handleUserEmailEdited,
        handleUserDeleted,
        handleMultipleDeleted,
    };
} 