import { useState, useCallback, useMemo } from 'react';

export interface BulkSelectionOptions<T> {
    data: T[];
    paginatedData: T[];
    keyField: keyof T;
    currentPage: number;
    pageSize: number;
    onSelectionChange?: (selectedItems: any[]) => void;
}

export type SelectionMode = 'page' | 'all' | 'none';

export interface BulkSelectionState<T> {
    selectedItems: any[];
    selectedCount: number;
    currentPageSelectedCount: number;
    allPagesSelectedCount: number;
    isPartialSelection: boolean;
    isCurrentPageFullySelected: boolean;
    isAllDataFullySelected: boolean;
    selectionMode: SelectionMode;
}

export function useBulkSelection<T>({
    data,
    paginatedData,
    keyField,
    currentPage,
    pageSize,
    onSelectionChange,
}: BulkSelectionOptions<T>) {
    const [selectedItems, setSelectedItems] = useState<any[]>([]);

    // Get current page item keys
    const currentPageKeys = useMemo(() =>
        paginatedData.map((item) => item[keyField]),
        [paginatedData, keyField]
    );

    // Get all data keys
    const allDataKeys = useMemo(() =>
        data.map((item) => item[keyField]),
        [data, keyField]
    );

    // Calculate selection state
    const selectionState: BulkSelectionState<T> = useMemo(() => {
        const selectedSet = new Set(selectedItems);
        const currentPageSelectedCount = currentPageKeys.filter(key => selectedSet.has(key)).length;
        const allPagesSelectedCount = selectedItems.length;

        const isCurrentPageFullySelected = currentPageSelectedCount === currentPageKeys.length && currentPageKeys.length > 0;
        const isAllDataFullySelected = allPagesSelectedCount === allDataKeys.length && allDataKeys.length > 0;
        const isPartialSelection = currentPageSelectedCount > 0 && currentPageSelectedCount < currentPageKeys.length;

        let selectionMode: SelectionMode = 'none';
        if (isAllDataFullySelected) {
            selectionMode = 'all';
        } else if (isCurrentPageFullySelected || isPartialSelection) {
            selectionMode = 'page';
        }

        return {
            selectedItems,
            selectedCount: allPagesSelectedCount,
            currentPageSelectedCount,
            allPagesSelectedCount,
            isPartialSelection,
            isCurrentPageFullySelected,
            isAllDataFullySelected,
            selectionMode,
        };
    }, [selectedItems, currentPageKeys, allDataKeys]);

    // Handle individual item selection
    const toggleItem = useCallback((item: T) => {
        const itemKey = item[keyField];
        setSelectedItems(prev => {
            const newSelection = prev.includes(itemKey)
                ? prev.filter(key => key !== itemKey)
                : [...prev, itemKey];

            onSelectionChange?.(newSelection);
            return newSelection;
        });
    }, [keyField, onSelectionChange]);

    // Handle selecting all items on current page
    const selectCurrentPage = useCallback(() => {
        setSelectedItems(prev => {
            const prevSet = new Set(prev);
            const newItems = currentPageKeys.filter(key => !prevSet.has(key));
            const newSelection = [...prev, ...newItems];

            onSelectionChange?.(newSelection);
            return newSelection;
        });
    }, [currentPageKeys, onSelectionChange]);

    // Handle deselecting all items on current page
    const deselectCurrentPage = useCallback(() => {
        setSelectedItems(prev => {
            const currentPageSet = new Set(currentPageKeys);
            const newSelection = prev.filter(key => !currentPageSet.has(key));

            onSelectionChange?.(newSelection);
            return newSelection;
        });
    }, [currentPageKeys, onSelectionChange]);

    // Handle selecting all items across all pages
    const selectAllPages = useCallback(() => {
        setSelectedItems(() => {
            const newSelection = [...allDataKeys];
            onSelectionChange?.(newSelection);
            return newSelection;
        });
    }, [allDataKeys, onSelectionChange]);

    // Handle deselecting all items
    const deselectAll = useCallback(() => {
        setSelectedItems(() => {
            onSelectionChange?.([]);
            return [];
        });
    }, [onSelectionChange]);

    // Handle inverting selection on current page
    const invertCurrentPage = useCallback(() => {
        setSelectedItems(prev => {
            const prevSet = new Set(prev);
            const otherPageItems = prev.filter(key => !currentPageKeys.includes(key));
            const invertedCurrentPage = currentPageKeys.filter(key => !prevSet.has(key));
            const newSelection = [...otherPageItems, ...invertedCurrentPage];

            onSelectionChange?.(newSelection);
            return newSelection;
        });
    }, [currentPageKeys, onSelectionChange]);

    // Smart select all toggle (current page only) - clear other page selections
    const toggleSelectCurrentPage = useCallback(() => {
        if (selectionState.isCurrentPageFullySelected) {
            deselectCurrentPage();
        } else {
            // Clear all selections and select only current page
            setSelectedItems(() => {
                const newSelection = [...currentPageKeys];
                onSelectionChange?.(newSelection);
                return newSelection;
            });
        }
    }, [selectionState.isCurrentPageFullySelected, deselectCurrentPage, currentPageKeys, onSelectionChange]);

    // Clear all selections
    const clearSelection = useCallback(() => {
        setSelectedItems([]);
        onSelectionChange?.([]);
    }, [onSelectionChange]);

    // Get selected objects from data
    const getSelectedObjects = useCallback(() => {
        const selectedSet = new Set(selectedItems);
        return data.filter(item => selectedSet.has(item[keyField]));
    }, [selectedItems, data, keyField]);

    // Get selected objects from current page
    const getSelectedObjectsFromCurrentPage = useCallback(() => {
        const selectedSet = new Set(selectedItems);
        return paginatedData.filter(item => selectedSet.has(item[keyField]));
    }, [selectedItems, paginatedData, keyField]);

    return {
        // State
        ...selectionState,

        // Actions
        toggleItem,
        selectCurrentPage,
        deselectCurrentPage,
        selectAllPages,
        deselectAll,
        invertCurrentPage,
        toggleSelectCurrentPage,
        clearSelection,

        // Helpers
        getSelectedObjects,
        getSelectedObjectsFromCurrentPage,

        // Utils
        isSelected: (item: T) => selectedItems.includes(item[keyField]),
        isIndeterminate: selectionState.isPartialSelection,
    };
} 