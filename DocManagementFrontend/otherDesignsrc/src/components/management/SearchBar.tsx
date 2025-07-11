import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface SearchBarProps {
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

  // Styling
  className?: string;
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  searchField,
  onSearchFieldChange,
  searchFields,
  searchPlaceholder = "Search...",
  filters = [],
  onClearFilters,
  className,
}: SearchBarProps) {
  const [filterOpen, setFilterOpen] = useState(false);

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

  return (
    <div
      className={cn(
        "flex-shrink-0 p-3 rounded-xl table-search-bar shadow-lg",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
        {/* Search and field select */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {/* Search Field Selector */}
          <div className="relative flex-shrink-0">
            <Select value={searchField} onValueChange={onSearchFieldChange}>
              <SelectTrigger className="w-[110px] h-8 text-xs table-search-select hover:table-search-select focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-200 shadow-sm rounded-md">
                <SelectValue>
                  {searchFields.find((opt) => opt.id === searchField)?.label ||
                    "All Fields"}
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

          {/* Search Input */}
          <div className="relative flex-1 group min-w-[150px]">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-sm"></div>
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="relative h-8 text-xs table-search-input pl-8 pr-3 rounded-md focus:ring-1 transition-all duration-200 shadow-sm group-hover:shadow-md"
            />
            <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 table-search-icon group-hover:table-search-icon transition-colors duration-200">
              <Search className="h-3.5 w-3.5" />
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
                  className="h-8 px-3 text-xs table-search-select hover:table-search-select shadow-sm rounded-md flex items-center gap-1.5 transition-all duration-200 hover:shadow-md whitespace-nowrap"
                >
                  <Filter className="h-3 w-3" />
                  Filter
                  {hasActiveFilters && (
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 table-search-select rounded-lg shadow-xl p-3">
                <div className="mb-2 table-search-text font-semibold text-xs flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 table-search-icon" />
                  Advanced Filters
                </div>
                <div className="flex flex-col gap-2">
                  {filters.map((filter) => (
                    <div key={filter.key} className="flex flex-col gap-1">
                      <span className="text-xs table-search-text font-medium">
                        {filter.label}
                      </span>
                      <Select
                        value={filter.value}
                        onValueChange={filter.onChange}
                      >
                        <SelectTrigger className="w-full h-7 text-xs table-search-select focus:ring-1 transition-colors duration-200 shadow-sm rounded-md">
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
                <div className="flex justify-end mt-3">
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs table-search-text hover:table-search-text-hover hover:table-search-select rounded-md transition-all duration-200 flex items-center gap-1"
                      onClick={clearAllFilters}
                    >
                      <X className="h-2.5 w-2.5" /> Clear All
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </div>
  );
}
