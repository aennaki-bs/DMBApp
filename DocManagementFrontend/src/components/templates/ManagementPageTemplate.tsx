import { useState, ReactNode } from "react";
import { LucideIcon, Filter, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { PageLayout } from "@/components/layout/PageLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table } from "@/components/ui/table";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";

// Types for the template
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

export interface SearchField {
  id: string;
  label: string;
  value: string;
}

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

export interface BulkAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "destructive";
  icon?: LucideIcon;
}

export interface ManagementPageTemplateProps<T = any> {
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
  isError?: boolean;
  errorMessage?: string;

  // Selection Props
  selectedItems: any[];
  onSelectItem: (id: any) => void;
  onSelectAll: (items: T[]) => void;

  // Table Props
  tableHeader: ReactNode;
  tableBody: ReactNode;
  emptyState?: ReactNode;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (field: string) => void;

  // Bulk Actions Props
  bulkActions?: BulkAction[];

  // Pagination Props (optional - will use built-in pagination if not provided)
  customPagination?: ReactNode;
  initialPageSize?: number;
  pageSizeOptions?: number[];

  // Additional Content
  additionalContent?: ReactNode;
  children?: ReactNode;
}

export function ManagementPageTemplate<T = any>({
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
  isError = false,
  errorMessage = "Failed to load data. Please try again.",

  // Selection
  selectedItems,
  onSelectItem,
  onSelectAll,

  // Table
  tableHeader,
  tableBody,
  emptyState,
  sortBy,
  sortDirection,
  onSort,

  // Bulk Actions
  bulkActions = [],

  // Pagination
  customPagination,
  initialPageSize = 15,
  pageSizeOptions = [10, 15, 25, 50, 100],

  // Additional
  additionalContent,
  children,
}: ManagementPageTemplateProps<T>) {
  // Filter popover state
  const [filterOpen, setFilterOpen] = useState(false);

  // Use pagination hook if no custom pagination provided
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

  // Check if any filters are active
  const hasActiveFilters = filters.some(
    (filter) => filter.value !== "any" && filter.value !== ""
  );

  // Clear all filters
  const clearAllFilters = () => {
    filters.forEach((filter) => filter.onChange("any"));
    onClearFilters?.();
    setFilterOpen(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <PageLayout
        title={title}
        subtitle={subtitle}
        icon={icon}
        actions={actions}
      >
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl table-glass-loading shadow-lg">
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin table-glass-loading-spinner" />
                <p className="table-glass-loading-text">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Error state
  if (isError) {
    return (
      <PageLayout
        title={title}
        subtitle={subtitle}
        icon={icon}
        actions={actions}
      >
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl table-glass-error shadow-lg">
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 rounded-full table-glass-error-icon flex items-center justify-center">
                  <span className="font-bold">!</span>
                </div>
                <p className="table-glass-error-text">{errorMessage}</p>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  const hasData = data && data.length > 0;
  const displayData = customPagination ? data : paginatedData;

  return (
    <PageLayout title={title} subtitle={subtitle} icon={icon} actions={actions}>
      <div
        className="h-full flex flex-col gap-5 w-full px-1"
        style={{ minHeight: "100%" }}
      >
        {/* Search + Filter Bar */}
        <div className="p-4 rounded-xl table-search-bar shadow-lg">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            {/* Search and field select */}
            <div className="flex-1 flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <Select value={searchField} onValueChange={onSearchFieldChange}>
                  <SelectTrigger className="w-[130px] h-9 text-sm table-search-select hover:table-search-select focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-200 shadow-sm rounded-md flex-shrink-0">
                    <SelectValue>
                      {searchFields.find((opt) => opt.id === searchField)
                        ?.label || "All Fields"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="table-search-select rounded-lg shadow-xl">
                    {searchFields.map((opt) => (
                      <SelectItem
                        key={opt.id}
                        value={opt.id}
                        className="text-xs hover:table-search-select focus:table-search-select rounded-md"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative flex-1 group min-w-[200px]">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-sm"></div>
                <Input
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="relative h-9 text-sm table-search-input pl-10 pr-4 rounded-md focus:ring-1 transition-all duration-200 shadow-sm group-hover:shadow-md"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 table-search-icon group-hover:table-search-icon transition-colors duration-200">
                  <Search className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Filter popover */}
            {filters.length > 0 && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-4 text-sm table-search-select hover:table-search-select shadow-sm rounded-md flex items-center gap-2 transition-all duration-200 hover:shadow-md whitespace-nowrap"
                    >
                      <Filter className="h-3.5 w-3.5" />
                      Filter
                      {hasActiveFilters && (
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 table-search-select rounded-lg shadow-xl p-4">
                    <div className="mb-3 table-search-text font-semibold text-sm flex items-center gap-2">
                      <Filter className="h-4 w-4 table-search-icon" />
                      Advanced Filters
                    </div>
                    <div className="flex flex-col gap-3">
                      {filters.map((filter) => (
                        <div key={filter.key} className="flex flex-col gap-1">
                          <span className="text-xs table-search-text font-medium">
                            {filter.label}
                          </span>
                          <Select
                            value={filter.value}
                            onValueChange={filter.onChange}
                          >
                            <SelectTrigger className="w-full h-8 text-xs table-search-select focus:ring-1 transition-colors duration-200 shadow-sm rounded-md">
                              <SelectValue>
                                {
                                  filter.options.find(
                                    (opt) => opt.value === filter.value
                                  )?.label
                                }
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="table-search-select">
                              {filter.options.map((opt) => (
                                <SelectItem
                                  key={opt.id}
                                  value={opt.value}
                                  className="text-xs hover:table-search-select"
                                >
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end mt-4">
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs table-search-text hover:table-search-text-hover hover:table-search-select rounded-md transition-all duration-200 flex items-center gap-1.5"
                          onClick={clearAllFilters}
                        >
                          <X className="h-3 w-3" /> Clear All
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0">
          <div
            className="h-full flex flex-col gap-3"
            style={{ minHeight: "100%" }}
          >
            <div className="flex-1 relative overflow-hidden rounded-2xl table-glass-container min-h-0">
              {hasData ? (
                <div className="relative h-full flex flex-col z-10">
                  {/* Fixed Header - Never Scrolls */}
                  <div className="flex-shrink-0 overflow-x-auto table-glass-header">
                    <div className="min-w-[1026px]">
                      <Table className="table-fixed w-full">
                        {tableHeader}
                      </Table>
                    </div>
                  </div>

                  {/* Scrollable Body - Only Content Scrolls */}
                  <div
                    className="flex-1 overflow-hidden"
                    style={{ maxHeight: "calc(100vh - 280px)" }}
                  >
                    <ScrollArea className="h-full w-full">
                      <div className="min-w-[1026px] pb-2">
                        <Table className="table-fixed w-full">
                          {tableBody}
                        </Table>
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                <div className="relative h-full flex items-center justify-center z-10">
                  {emptyState || (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No data available</p>
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={clearAllFilters}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pagination */}
            {hasData &&
              (customPagination || (
                <SmartPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  pageSizeOptions={pageSizeOptions}
                />
              ))}
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedItems.length > 0 && bulkActions.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedItems.length}
            actions={bulkActions}
          />
        )}

        {/* Additional Content */}
        {additionalContent}

        {/* Children (for modals, dialogs, etc.) */}
        {children}
      </div>
    </PageLayout>
  );
}

// Bulk Actions Bar Component
interface BulkActionsBarProps {
  selectedCount: number;
  actions: BulkAction[];
}

function BulkActionsBar({ selectedCount, actions }: BulkActionsBarProps) {
  return createPortal(
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-6 right-16 transform -translate-x-1/2 z-[9999] w-[calc(100vw-4rem)] max-w-4xl mx-auto"
    >
      <div className="bulk-actions-container backdrop-blur-lg shadow-[0_8px_32px_var(--bulk-actions-shadow)] rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 ring-2">
        <div className="flex items-center bulk-actions-text font-medium">
          <div className="bulk-actions-icon-bg p-1.5 rounded-xl mr-3 flex-shrink-0">
            <Filter className="w-5 h-5 bulk-actions-text" />
          </div>
          <span className="text-sm sm:text-base text-center sm:text-left">
            <span className="font-bold bulk-actions-text-accent">
              {selectedCount}
            </span>{" "}
            items selected
          </span>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "outline"}
              size="sm"
              className={`transition-all duration-200 shadow-lg min-w-[80px] font-medium ${
                action.variant === "destructive"
                  ? "bg-red-900/40 border-red-500/40 text-red-200 hover:text-red-100 hover:bg-red-900/60 hover:border-red-400/60"
                  : "bulk-actions-button"
              }`}
              onClick={action.onClick}
            >
              {action.icon && <action.icon className="w-4 h-4 mr-1.5" />}
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </motion.div>,
    document.body
  );
}

export default ManagementPageTemplate;
