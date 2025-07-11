import { Filter, X, Search, RefreshCw } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DEFAULT_VENDOR_SEARCH_FIELDS = [
  { id: "all", label: "All Fields" },
  { id: "vendorCode", label: "Vendor Code" },
  { id: "name", label: "Name" },
  { id: "city", label: "City" },
  { id: "country", label: "Country" },
  { id: "address", label: "Address" },
];

interface VendorSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchField: string;
  setSearchField: (field: string) => void;
  countryFilter: string;
  setCountryFilter: (country: string) => void;
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
  countries: Array<{ id: string; label: string; value: string }>;
  clearAllFilters: () => void;
  handleManualRefresh: () => void;
  isManualRefreshing: boolean;
  isFetching: boolean;
  isLoading: boolean;
}

export function VendorSearchBar({
  searchQuery,
  setSearchQuery,
  searchField,
  setSearchField,
  countryFilter,
  setCountryFilter,
  filterOpen,
  setFilterOpen,
  countries,
  clearAllFilters,
  handleManualRefresh,
  isManualRefreshing,
  isFetching,
  isLoading,
}: VendorSearchBarProps) {
  return (
    <div className="flex-shrink-0 p-3 rounded-xl table-glass-container shadow-lg mb-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        {/* Auto-refresh indicator */}
        {isFetching && !isLoading && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-md text-xs text-primary">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Auto-refreshing...</span>
          </div>
        )}

        {/* Search and field select */}
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 min-w-0">
          <div className="relative w-full sm:w-auto">
            <Select value={searchField} onValueChange={setSearchField}>
              <SelectTrigger className="w-full sm:w-[130px] h-9 text-sm table-search-select hover:table-search-select focus:ring-1 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all duration-200 shadow-sm rounded-md flex-shrink-0">
                <SelectValue>
                  {DEFAULT_VENDOR_SEARCH_FIELDS.find(
                    (opt) => opt.id === searchField
                  )?.label || "All Fields"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="table-search-select rounded-lg shadow-xl">
                {DEFAULT_VENDOR_SEARCH_FIELDS.map((opt) => (
                  <SelectItem
                    key={opt.id}
                    value={opt.id as string}
                    className="text-xs hover:table-search-select focus:table-search-select rounded-md"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative flex-1 group min-w-0">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-sm"></div>
            <Input
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative h-9 text-sm table-search-input pl-10 pr-4 rounded-md focus:ring-1 transition-all duration-200 shadow-sm group-hover:shadow-md w-full"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 table-search-icon group-hover:table-search-icon transition-colors duration-200">
              <Search className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
          {/* Manual Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isManualRefreshing}
            className="h-9 px-3 text-xs table-search-text hover:table-search-text-hover transition-all duration-200"
            title="Refresh vendors"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1.5 ${
                isManualRefreshing ? "animate-spin" : ""
              }`}
            />
            {isManualRefreshing ? "Refreshing..." : "Refresh"}
          </Button>

          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-xs table-search-text hover:table-search-text-hover transition-all duration-200"
              >
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-72 p-4 table-search-select shadow-xl rounded-lg"
              align="end"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm table-search-text">
                    Active Filters
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-6 px-2 text-xs table-search-text hover:table-search-text-hover transition-colors duration-200"
                  >
                    Clear All
                  </Button>
                </div>

                <div className="space-y-3">
                  {/* Country Filter */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs table-search-text font-medium">
                      Country
                    </span>
                    <Select
                      value={countryFilter}
                      onValueChange={setCountryFilter}
                    >
                      <SelectTrigger className="w-full h-8 text-xs table-search-select focus:ring-1 transition-colors duration-200 shadow-sm rounded-md">
                        <SelectValue>
                          {
                            countries.find((opt) => opt.value === countryFilter)
                              ?.label
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="table-search-select">
                        {countries.map((opt) => (
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
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {searchQuery && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge
                variant="secondary"
                className="text-xs px-2 py-1 cursor-pointer transition-all duration-200 hover:bg-primary/20 hover:text-primary-foreground table-glass-badge"
                onClick={clearAllFilters}
              >
                Search: {searchQuery}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            </div>
          )}

          {(countryFilter !== "any" || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 px-2 text-xs table-search-text hover:table-search-text-hover hover:table-search-select rounded-md transition-all duration-200 flex items-center gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
