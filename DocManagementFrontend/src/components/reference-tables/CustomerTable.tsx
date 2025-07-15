import { useState, useEffect } from "react";
import { Users, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CustomersTableContent } from "./table/CustomersTableContent";
import { useCustomerManagement } from "@/hooks/useCustomerManagement";
import { DEFAULT_CUSTOMER_SEARCH_FIELDS } from "@/components/table/constants/filters";

export function CustomerTable() {
  const {
    // Data
    customers: filteredCustomers,
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
  } = useCustomerManagement();

  // Handle customer actions (disabled)
  const handleEditCustomer = (customer: any) => {
    // Disabled - no action
  };

  const handleViewCustomer = (customer: any) => {
    // Disabled - no action
  };

  const handleDeleteCustomer = (code: string) => {
    // Disabled - no action
  };

  const handleBulkDelete = () => {
    // Disabled - no action
  };

  // Filter card styling
  const filterCardClass = cn(
    "w-full flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl",
    "bg-gradient-to-r from-primary/5 via-background/50 to-primary/5",
    "backdrop-blur-xl shadow-lg border border-primary/10",
    "transition-all duration-300 hover:shadow-xl"
  );

  // Active filters count
  const activeFiltersCount = (searchQuery ? 1 : 0);
  const hasActiveFilters = activeFiltersCount > 0;

  // Determine if filters should be shown - only show if there are items OR active search filters
  const shouldShowFilters = (filteredCustomers && filteredCustomers.length > 0) || searchQuery;

  return (
    <div
      className="h-full flex flex-col gap-6 w-full"
      style={{ minHeight: "100%" }}
    >
      {/* Document-style Search + Filter Bar */}
      {shouldShowFilters && (
        <div className={filterCardClass}>
          {/* Search and field select */}
          <div className="flex-1 flex items-center gap-4 min-w-0">
            <div className="relative">
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger className="w-[140px] h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg rounded-xl">
                  <SelectValue>
                    {DEFAULT_CUSTOMER_SEARCH_FIELDS.find(
                      (opt) => opt.id === searchField
                    )?.label || "All Fields"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-xl shadow-2xl">
                  {DEFAULT_CUSTOMER_SEARCH_FIELDS.map((opt) => (
                    <SelectItem
                      key={opt.id}
                      value={opt.id as string}
                      className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary rounded-lg"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1 min-w-0 group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg group-hover:shadow-xl placeholder:text-muted-foreground/60"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/60 group-hover:text-primary transition-colors duration-300">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Filter popover */}
          <div className="flex items-center gap-2">
            <Popover open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:border-primary/40 shadow-lg rounded-xl transition-all duration-300 hover:bg-background/80 hover:shadow-xl",
                    hasActiveFilters && "border-primary/50 bg-primary/5 text-primary"
                  )}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  {hasActiveFilters && (
                    <Badge
                      variant="secondary"
                      className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                  <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">Alt</span>F
                  </kbd>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-xl shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">Advanced Filters</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdvancedFilters(false)}
                      className="h-8 w-8 p-0 hover:bg-primary/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Search Field
                      </label>
                      <Select value={searchField} onValueChange={setSearchField}>
                        <SelectTrigger className="bg-background/80 border-primary/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background/95 backdrop-blur-md border-primary/20">
                          {DEFAULT_CUSTOMER_SEARCH_FIELDS.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg transition-all duration-200 flex items-center gap-2"
                        onClick={clearAllFilters}
                      >
                        <X className="h-4 w-4" /> Clear All
                      </Button>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 min-h-0">
        <CustomersTableContent
          customers={paginatedCustomers}
          allCustomers={filteredCustomers}
          selectedItems={selectedItems}
          bulkSelection={bulkSelection}
          pagination={pagination}
          onEdit={handleEditCustomer}
          onView={handleViewCustomer}
          onDelete={handleDeleteCustomer}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          onClearFilters={clearAllFilters}
          onBulkDelete={handleBulkDelete}
          isLoading={isLoading}
          isError={isError}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}

export default CustomerTable;
