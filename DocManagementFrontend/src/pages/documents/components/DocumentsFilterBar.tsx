import { useState, useEffect } from "react";
import { useDocumentsFilter } from "../hooks/useDocumentsFilter";
import { Button } from "@/components/ui/button";
import { Filter, Search, X } from "lucide-react";
import {
  DEFAULT_STATUS_FILTERS,
  DEFAULT_TYPE_FILTERS,
  DEFAULT_DOCUMENT_SEARCH_FIELDS,
} from "@/components/table";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function DocumentsFilterBar() {
  const {
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
    activeFilters,
    applyFilters,
    resetFilters,
  } = useDocumentsFilter();

  const [searchField, setSearchField] = useState(
    activeFilters.searchField || "all"
  );
  const [isDatePickerEnabled, setIsDatePickerEnabled] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Advanced filters state
  const [statusFilter, setStatusFilter] = useState(
    activeFilters.statusFilter || "any"
  );
  const [typeFilter, setTypeFilter] = useState(
    activeFilters.typeFilter || "any"
  );
  const [advancedDateRange, setAdvancedDateRange] = useState(dateRange);

  useEffect(() => {
    setIsDatePickerEnabled(searchField === "docDate");
    if (searchField !== "docDate" && dateRange) {
      setDateRange(undefined);
    }
  }, [searchField, dateRange, setDateRange]);

  // Update local state when activeFilters change
  useEffect(() => {
    setSearchField(activeFilters.searchField || "all");
    setStatusFilter(activeFilters.statusFilter || "any");
    setTypeFilter(activeFilters.typeFilter || "any");
  }, [activeFilters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters({
      ...activeFilters,
      searchQuery: query,
      searchField,
    });
  };

  const handleSearchFieldChange = (field: string) => {
    setSearchField(field);
    applyFilters({
      ...activeFilters,
      searchField: field,
    });
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    applyFilters({
      ...activeFilters,
      statusFilter: value,
    });
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    applyFilters({
      ...activeFilters,
      typeFilter: value,
    });
  };

  const clearAllFilters = () => {
    setStatusFilter("any");
    setTypeFilter("any");
    setAdvancedDateRange(undefined);
    resetFilters();
    setFilterOpen(false);
  };

  // Check if any filters are active
  const hasActiveFilters =
    activeFilters.statusFilter !== "any" ||
    activeFilters.typeFilter !== "any" ||
    activeFilters.dateRange !== undefined;

  return (
    <div className="flex flex-col gap-2">
      <div className="w-full flex flex-col md:flex-row items-center gap-2">
        {/* Search and field select */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <Select value={searchField} onValueChange={handleSearchFieldChange}>
            <SelectTrigger className="w-[120px] bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-800/40 shadow-sm rounded-md">
              <SelectValue>
                {DEFAULT_DOCUMENT_SEARCH_FIELDS.find(
                  (opt) => opt.id === searchField
                )?.label || "All fields"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
              {DEFAULT_DOCUMENT_SEARCH_FIELDS.map((opt) => (
                <SelectItem
                  key={opt.id}
                  value={String(opt.id)}
                  className="hover:bg-blue-800/40"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="bg-[#22306e] text-blue-100 border border-blue-900/40 pl-10 pr-8 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-800/40 shadow-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  applyFilters({
                    ...activeFilters,
                    searchQuery: "",
                  });
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter popover */}
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "bg-[#22306e] text-blue-100 border border-blue-900/40 hover:bg-blue-800/40 shadow-sm rounded-md flex items-center gap-2",
                hasActiveFilters && "border-blue-500 bg-blue-900/40"
              )}
            >
              <Filter
                className={cn(
                  "h-4 w-4",
                  hasActiveFilters ? "text-blue-300" : "text-blue-400"
                )}
              />
              Filter
              {hasActiveFilters && (
                <Badge className="ml-1 bg-blue-600 text-white text-xs py-0 px-1.5 rounded-full">
                  {
                    Object.values(activeFilters).filter(
                      (val) => val !== "any" && val !== undefined && val !== ""
                    ).length
                  }
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-[#1e2a4a] border border-blue-900/40 rounded-xl shadow-lg p-4 animate-fade-in">
            <div className="mb-2 text-blue-200 font-semibold">
              Filter Documents
            </div>

            <div className="space-y-4">
              {/* Status filter */}
              <div>
                <label className="text-sm text-blue-300 block mb-1">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full bg-[#22306e] text-blue-100 border border-blue-900/40">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
                    {DEFAULT_STATUS_FILTERS.map((option) => (
                      <SelectItem key={option.id} value={String(option.id)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type filter */}
              <div>
                <label className="text-sm text-blue-300 block mb-1">
                  Document Type
                </label>
                <Select value={typeFilter} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-full bg-[#22306e] text-blue-100 border border-blue-900/40">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
                    {DEFAULT_TYPE_FILTERS.map((option) => (
                      <SelectItem key={option.id} value={String(option.id)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/40"
                >
                  Clear all
                </Button>
                <Button
                  size="sm"
                  onClick={() => setFilterOpen(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-2">
          {activeFilters.statusFilter !== "any" && (
            <Badge
              className="bg-blue-900/60 hover:bg-blue-800/60 text-blue-100 px-2 py-1 flex items-center gap-1"
              variant="outline"
            >
              Status:{" "}
              {
                DEFAULT_STATUS_FILTERS.find(
                  (s) => s.id === activeFilters.statusFilter
                )?.label
              }
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => {
                  setStatusFilter("any");
                  applyFilters({
                    ...activeFilters,
                    statusFilter: "any",
                  });
                }}
              />
            </Badge>
          )}

          {activeFilters.typeFilter !== "any" && (
            <Badge
              className="bg-blue-900/60 hover:bg-blue-800/60 text-blue-100 px-2 py-1 flex items-center gap-1"
              variant="outline"
            >
              Type:{" "}
              {
                DEFAULT_TYPE_FILTERS.find(
                  (t) => t.id === activeFilters.typeFilter
                )?.label
              }
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => {
                  setTypeFilter("any");
                  applyFilters({
                    ...activeFilters,
                    typeFilter: "any",
                  });
                }}
              />
            </Badge>
          )}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 h-6 px-2"
            >
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
