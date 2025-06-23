import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SearchBar, SearchField, FilterConfig } from "./SearchBar";
import { DataTable } from "./DataTable";
import { BulkActions, BulkAction } from "./BulkActions";
import { DataPagination } from "./DataPagination";
import { usePagination } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";

export interface PageAction {
  label: string;
  onClick: () => void;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "destructive"
    | "ghost"
    | "link";
  icon?: LucideIcon;
}

interface ManagementLayoutProps<T = any> {
  // Page Header Props
  title: string;
  subtitle: string;
  icon: LucideIcon;
  actions?: PageAction[];

  // Search Props
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchField: string;
  onSearchFieldChange: (field: string) => void;
  searchFields: SearchField[];
  searchPlaceholder?: string;

  // Filter Props
  filters?: FilterConfig[];
  onClearFilters?: () => void;

  // Data Props
  data: T[];
  isLoading?: boolean;
  isEmpty?: boolean;

  // Table Props
  tableHeaders: ReactNode;
  tableRows: ReactNode;
  emptyState?: ReactNode;

  // Selection Props
  selectedItems: any[];
  onSelectItem?: (id: any) => void;
  onSelectAll?: (items: T[]) => void;

  // Bulk Actions Props
  bulkActions?: BulkAction[];
  bulkEntityName?: string;
  bulkIcon?: LucideIcon;

  // Pagination Props
  enablePagination?: boolean;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  customPagination?: ReactNode;

  // Table Configuration
  tableMinWidth?: string;
  tableMaxHeight?: string;
  stickyHeader?: boolean;

  // Additional Content
  children?: ReactNode;
  className?: string;
}

export function ManagementLayout<T = any>({
  // Page Header
  title,
  subtitle,
  icon,
  actions = [],

  // Search
  searchQuery,
  onSearchChange,
  searchField,
  onSearchFieldChange,
  searchFields,
  searchPlaceholder = "Search...",

  // Filters
  filters = [],
  onClearFilters,

  // Data
  data,
  isLoading = false,
  isEmpty = false,

  // Table
  tableHeaders,
  tableRows,
  emptyState,

  // Selection
  selectedItems = [],
  onSelectItem,
  onSelectAll,

  // Bulk Actions
  bulkActions = [],
  bulkEntityName = "item",
  bulkIcon,

  // Pagination
  enablePagination = true,
  initialPageSize = 15,
  pageSizeOptions = [10, 15, 25, 50, 100],
  customPagination,

  // Table Configuration
  tableMinWidth = "700px",
  tableMaxHeight = "calc(100vh - 320px)",
  stickyHeader = true,

  // Additional
  children,
  className,
}: ManagementLayoutProps<T>) {
  // Use pagination hook if pagination is enabled and no custom pagination provided
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: data || [],
    initialPageSize,
  });

  // Determine what data to display
  const displayData =
    enablePagination && !customPagination ? paginatedData : data;
  const hasData = data && data.length > 0;
  const showPagination = enablePagination && hasData && !customPagination;

  return (
    <PageLayout title={title} subtitle={subtitle} icon={icon} actions={actions}>
      <div
        className={cn("flex flex-col h-full w-full px-1 gap-3 pb-4", className)}
      >
        {/* Search + Filter Bar */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          searchField={searchField}
          onSearchFieldChange={onSearchFieldChange}
          searchFields={searchFields}
          searchPlaceholder={searchPlaceholder}
          filters={filters}
          onClearFilters={onClearFilters}
        />

        {/* Main Content with Fixed Table Layout */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Data Table */}
          <DataTable
            headers={tableHeaders}
            isLoading={isLoading}
            isEmpty={!hasData && !isLoading}
            emptyState={emptyState}
            minWidth={tableMinWidth}
            maxHeight="none"
            stickyHeader={stickyHeader}
          >
            {tableRows}
          </DataTable>

          {/* Pagination */}
          {showPagination && (
            <div className="flex-shrink-0 mt-3 mb-2">
              <DataPagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={pageSizeOptions}
              />
            </div>
          )}

          {/* Custom Pagination */}
          {customPagination && hasData && (
            <div className="flex-shrink-0 mt-3 mb-2">{customPagination}</div>
          )}
        </div>

        {/* Bulk Actions */}
        {bulkActions.length > 0 && (
          <BulkActions
            selectedCount={selectedItems.length}
            actions={bulkActions}
            entityName={bulkEntityName}
            icon={bulkIcon}
          />
        )}

        {/* Additional Content (Modals, Dialogs, etc.) */}
        {children}
      </div>
    </PageLayout>
  );
}

export default ManagementLayout;
