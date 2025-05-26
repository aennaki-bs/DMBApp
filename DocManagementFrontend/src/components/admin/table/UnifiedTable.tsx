import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Filter,
  Search,
  X,
  Trash2,
  Settings,
  LayoutList,
  LayoutGrid,
  Check,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface Column<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell: (item: T) => React.ReactNode;
  enableSorting?: boolean;
  isAction?: boolean;
}

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  onClick: (selectedItems: any[]) => void;
}

export interface FilterOption {
  id: string;
  label: string;
  options: {
    value: string;
    label: string;
  }[];
  value: string;
  onChange: (value: string) => void;
}

export interface SearchField {
  id: string;
  label: string;
}

interface UnifiedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  bulkActions?: BulkAction[];
  filterOptions?: FilterOption[];
  searchFields?: SearchField[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchFieldValue?: string;
  onSearchFieldChange?: (field: string) => void;
  showViewToggle?: boolean;
  viewMode?: "list" | "card";
  onViewModeChange?: (mode: "list" | "card") => void;
  selectedItems?: any[];
  onSelectItems?: (items: any[]) => void;
  emptyState?: React.ReactNode;
  headerAction?: React.ReactNode;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (field: string, direction: "asc" | "desc") => void;
}

export function UnifiedTable<T>({
  data,
  columns,
  keyField,
  title,
  subtitle,
  isLoading = false,
  bulkActions = [],
  filterOptions = [],
  searchFields = [],
  searchQuery = "",
  onSearchChange,
  searchFieldValue,
  onSearchFieldChange,
  showViewToggle = false,
  viewMode = "list",
  onViewModeChange,
  selectedItems = [],
  onSelectItems,
  emptyState,
  headerAction,
  sortBy,
  sortDirection,
  onSort,
}: UnifiedTableProps<T>) {
  const [filterOpen, setFilterOpen] = useState(false);

  // Handle selecting all items
  const handleSelectAll = () => {
    if (selectedItems.length === data.length) {
      onSelectItems?.([]);
    } else {
      const allKeys = data.map((item) => item[keyField]);
      onSelectItems?.(allKeys as any[]);
    }
  };

  // Handle selecting an individual item
  const handleSelectItem = (item: T) => {
    const itemKey = item[keyField];
    if (selectedItems.includes(itemKey)) {
      onSelectItems?.(selectedItems.filter((key) => key !== itemKey));
    } else {
      onSelectItems?.([...selectedItems, itemKey]);
    }
  };

  // Handle sorting
  const handleSortChange = (columnId: string) => {
    if (!onSort) return;

    if (sortBy === columnId) {
      onSort(columnId, sortDirection === "asc" ? "desc" : "asc");
    } else {
      onSort(columnId, "asc");
    }
  };

  // Get sort icon
  const getSortIcon = (columnId: string) => {
    if (sortBy !== columnId) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    filterOptions.forEach((option) => {
      option.onChange("any");
    });
    onSearchChange?.("");
    setFilterOpen(false);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border border-blue-500/30 shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl overflow-hidden mb-6">
        <div className="p-4 border-b border-blue-900/30 flex justify-between items-center">
          <div>
            <div className="h-6 w-48 bg-blue-800/50 rounded-md animate-pulse"></div>
            <div className="h-4 w-64 bg-blue-800/40 rounded-md animate-pulse mt-2"></div>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center">
                <div className="h-5 w-5 bg-blue-800/50 rounded-md mr-3 animate-pulse"></div>
                <div className="h-12 bg-blue-800/40 rounded-md w-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  const isEmpty = data.length === 0;
  if (isEmpty && emptyState) {
    return (
      <div className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border border-blue-500/30 shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl overflow-hidden mb-6">
        <div className="p-4 border-b border-blue-900/30 flex justify-between items-center">
          <div>
            {title && (
              <h2 className="text-xl font-semibold text-blue-100">{title}</h2>
            )}
            {subtitle && <p className="text-sm text-blue-300">{subtitle}</p>}
          </div>
          {headerAction}
        </div>
        <div className="p-8">{emptyState}</div>
      </div>
    );
  }

  // Separate action columns from regular columns
  const regularColumns = columns.filter((col) => !col.isAction);
  const actionColumn = columns.find((col) => col.isAction);

  // Build card view
  const renderCardView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {data.map((item) => {
        const itemKey = item[keyField];
        const isSelected = selectedItems.includes(itemKey);

        return (
          <motion.div
            key={String(itemKey)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-b from-[#1f3373]/90 to-[#0c1442]/90 backdrop-blur-sm rounded-xl border relative overflow-hidden transition-all duration-200 ${
              isSelected
                ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                : "border-blue-800/50 hover:border-blue-700/60"
            }`}
          >
            {/* Action button in top-right corner */}
            {actionColumn && (
              <div className="absolute top-2 right-2 z-10">
                {actionColumn.cell(item)}
              </div>
            )}

            <div className="p-4">
              {onSelectItems && (
                <div className="mb-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleSelectItem(item)}
                    className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-500"
                  />
                </div>
              )}
              <div className="space-y-4">
                {regularColumns.map((column) => (
                  <div key={column.id} className="space-y-1">
                    <div className="text-xs font-medium text-blue-400">
                      {column.header}
                    </div>
                    <div>{column.cell(item)}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  // Build table view
  const renderTableView = () => (
    <div className="relative overflow-x-auto">
      <Table className="w-full">
        <TableHeader className="bg-blue-900/30">
          <TableRow className="border-blue-900/50 hover:bg-transparent">
            {onSelectItems && (
              <TableHead className="w-12 text-center">
                <Checkbox
                  checked={
                    selectedItems.length === data.length && data.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                  className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-500"
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={column.id}
                className={cn(
                  "text-blue-300 font-medium",
                  column.enableSorting &&
                    onSort &&
                    "cursor-pointer hover:text-blue-100"
                )}
                onClick={() =>
                  column.enableSorting && onSort && handleSortChange(column.id)
                }
              >
                <div className="flex items-center">
                  {column.header}
                  {column.enableSorting && onSort && getSortIcon(column.id)}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            const itemKey = item[keyField];
            const isSelected = selectedItems.includes(itemKey);

            return (
              <TableRow
                key={String(itemKey)}
                className={`border-blue-900/30 transition-all duration-150 ${
                  isSelected
                    ? "bg-blue-900/30 border-l-4 border-l-blue-500"
                    : "hover:bg-blue-900/20"
                }`}
              >
                {onSelectItems && (
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleSelectItem(item)}
                        className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-500"
                      />
                    </div>
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell key={column.id}>{column.cell(item)}</TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border border-blue-500/30 shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl overflow-hidden mb-6">
      {/* Header with title and actions */}
      <div className="p-4 border-b border-blue-900/30 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          {title && (
            <h2 className="text-xl font-semibold text-blue-100">{title}</h2>
          )}
          {subtitle && <p className="text-sm text-blue-300">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {/* View mode toggle - always show when showViewToggle is true */}
          {showViewToggle && onViewModeChange && (
            <div className="flex items-center bg-[#22306e] rounded-md border border-blue-900/40 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewModeChange("list")}
                className={cn(
                  "rounded-r-none h-9 px-3",
                  viewMode === "list"
                    ? "bg-blue-600/50 text-blue-100 hover:bg-blue-600/60"
                    : "text-blue-400 hover:text-blue-300 hover:bg-blue-800/40"
                )}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewModeChange("card")}
                className={cn(
                  "rounded-l-none h-9 px-3",
                  viewMode === "card"
                    ? "bg-blue-600/50 text-blue-100 hover:bg-blue-600/60"
                    : "text-blue-400 hover:text-blue-300 hover:bg-blue-800/40"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          )}

          {headerAction}
        </div>
      </div>

      {/* Search and filter toolbar */}
      {(searchFields.length > 0 ||
        filterOptions.length > 0 ||
        searchQuery !== "" ||
        onSearchChange) && (
        <div className="p-4 border-b border-blue-900/30 bg-blue-900/20">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1 flex items-center gap-2 min-w-0">
              {searchFields.length > 0 && onSearchFieldChange && (
                <Select
                  value={searchFieldValue}
                  onValueChange={onSearchFieldChange}
                >
                  <SelectTrigger className="w-[120px] bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-800/40 shadow-sm rounded-md">
                    <SelectValue>
                      {searchFields.find(
                        (field) => field.id === searchFieldValue
                      )?.label || "All fields"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
                    {searchFields.map((field) => (
                      <SelectItem
                        key={field.id}
                        value={field.id}
                        className="hover:bg-blue-800/40"
                      >
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <div className="relative flex-1">
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="bg-[#22306e] text-blue-100 border border-blue-900/40 pl-10 pr-8 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-800/40 shadow-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange?.("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter button */}
              {filterOptions.length > 0 && (
                <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-[#22306e] text-blue-100 border border-blue-900/40 hover:bg-blue-800/40 shadow-sm rounded-md flex items-center gap-2"
                    >
                      <Filter className="h-4 w-4 text-blue-400" />
                      Filter
                      {filterOptions.some((opt) => opt.value !== "any") && (
                        <Badge className="ml-1 bg-blue-600 text-white">
                          {
                            filterOptions.filter((opt) => opt.value !== "any")
                              .length
                          }
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 bg-[#1e2a4a] border border-blue-900/40 rounded-xl shadow-lg p-4 animate-fade-in">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-blue-100">Filters</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFilters}
                          className="h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/40"
                        >
                          Clear All
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {filterOptions.map((filter) => (
                          <div key={filter.id} className="space-y-1">
                            <label className="text-sm text-blue-200">
                              {filter.label}
                            </label>
                            <Select
                              value={filter.value}
                              onValueChange={filter.onChange}
                            >
                              <SelectTrigger className="w-full bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500">
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
                                {filter.options.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    className="hover:bg-blue-800/40"
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>

          {/* Show active filters */}
          {filterOptions.some((opt) => opt.value !== "any") && (
            <div className="mt-3 flex flex-wrap gap-2">
              {filterOptions
                .filter((opt) => opt.value !== "any")
                .map((filter) => {
                  const option = filter.options.find(
                    (opt) => opt.value === filter.value
                  );
                  return (
                    <Badge
                      key={filter.id}
                      className="bg-blue-800 text-blue-200 hover:bg-blue-700 transition-colors px-3 py-1"
                    >
                      {filter.label}: {option?.label}
                      <button
                        className="ml-2 hover:text-white"
                        onClick={() => filter.onChange("any")}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Bulk actions bar */}
      {selectedItems.length > 0 && bulkActions.length > 0 && (
        <div className="px-4 py-2 bg-blue-800/30 border-b border-blue-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-blue-400" />
            <span className="text-blue-200">
              {selectedItems.length} item{selectedItems.length !== 1 && "s"}{" "}
              selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            {bulkActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || "outline"}
                size="sm"
                onClick={() => {
                  const selectedObjects = data.filter((item) =>
                    selectedItems.includes(item[keyField])
                  );
                  action.onClick(selectedObjects);
                }}
                className={
                  action.variant === "destructive"
                    ? "bg-red-900/30 text-red-300 border-red-800/50 hover:bg-red-800/40"
                    : "bg-blue-900/30 text-blue-300 border-blue-800/50 hover:bg-blue-800/40"
                }
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Table content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === "card" ? renderCardView() : renderTableView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
