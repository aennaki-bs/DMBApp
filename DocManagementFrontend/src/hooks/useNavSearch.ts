import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Define the search result item structure
export interface SearchResultItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  path: string;
  category: string;
}

export function useNavSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const navigate = useNavigate();

  // Define the available pages/routes for search
  const availablePages = useMemo(() => [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Main dashboard with activity overview',
      path: '/dashboard',
      category: 'Pages',
      icon: 'LayoutDashboard'
    },
    {
      id: 'documents',
      title: 'Documents',
      description: 'Browse and manage all documents',
      path: '/documents',
      category: 'Pages',
      icon: 'FileText'
    },
    {
      id: 'document-types',
      title: 'Document Types',
      description: 'Manage document types and categories',
      path: '/document-types-management',
      category: 'Pages',
      icon: 'Layers'
    },
    {
      id: 'circuits',
      title: 'Circuits',
      description: 'Document workflow circuits',
      path: '/circuits',
      category: 'Pages',
      icon: 'GitBranch'
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage system users and permissions',
      path: '/user-management',
      category: 'Admin',
      icon: 'Users'
    },
    {
      id: 'approval-groups',
      title: 'Approval Groups',
      description: 'Manage document approval groups',
      path: '/approval-groups',
      category: 'Approval',
      icon: 'UsersRound'
    },
    {
      id: 'approvers',
      title: 'Approvers',
      description: 'Manage document approvers',
      path: '/approvers-management',
      category: 'Approval',
      icon: 'UserCog'
    },
    {
      id: 'pending-approvals',
      title: 'My Approvals',
      description: 'Documents waiting for your approval',
      path: '/pending-approvals',
      category: 'Approval',
      icon: 'ClipboardCheck'
    },
    {
      id: 'create-document',
      title: 'Create Document',
      description: 'Create a new document',
      path: '/documents/create',
      category: 'Actions',
      icon: 'FileText'
    },
    {
      id: 'profile',
      title: 'Profile',
      description: 'View and edit your profile',
      path: '/profile',
      category: 'User',
      icon: 'User'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Application settings and preferences',
      path: '/settings',
      category: 'User',
      icon: 'Settings'
    }
  ], []);

  // Filter search results based on query
  const performSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    const query = searchQuery.toLowerCase().trim();
    const results = availablePages.filter(page => {
      return (
        page.title.toLowerCase().includes(query) ||
        (page.description && page.description.toLowerCase().includes(query)) ||
        page.category.toLowerCase().includes(query)
      );
    });

    setSearchResults(results);
    setIsSearching(false);
  }, [searchQuery, availablePages]);

  // Update search results whenever the query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  // Navigate to search result
  const navigateToResult = (path: string) => {
    setSearchQuery('');
    setSearchResults([]);
    navigate(path);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    navigateToResult,
  };
} 