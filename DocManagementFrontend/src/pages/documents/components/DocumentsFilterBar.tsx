import { useState, useEffect, useMemo } from "react";
import { useDocumentsFilter } from "../hooks/useDocumentsFilter";
import { Button } from "@/components/ui/button";
import {
  Filter,
  Search,
  X,
  Calendar,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import documentTypeService from "@/services/documentTypeService";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";

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
  const [advancedDateRange, setAdvancedDateRange] = useState<
    DateRange | undefined
  >(dateRange);

  // Fetch document types for the filter
  const { data: documentTypes } = useQuery({
    queryKey: ["documentTypes"],
    queryFn: () => documentTypeService.getAllDocumentTypes(),
  });

  // Generate document type filter options
  const typeFilterOptions = useMemo(() => {
    const baseOptions = [...DEFAULT_TYPE_FILTERS];

    if (documentTypes && documentTypes.length > 0) {
      documentTypes.forEach((type) => {
        baseOptions.push({
          id: type.id || 0,
          label: type.typeName,
          value: String(type.id),
        });
      });
    }

    return baseOptions;
  }, [documentTypes]);

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
    setAdvancedDateRange(activeFilters.dateRange);
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
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setAdvancedDateRange(range);
  };

  const applyAdvancedFilters = () => {
    applyFilters({
      ...activeFilters,
      statusFilter,
      typeFilter,
      dateRange: advancedDateRange,
    });
    setFilterOpen(false);
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

  // Count active filters
  const activeFilterCount = Object.values(activeFilters).filter(
    (val) => val !== "any" && val !== undefined && val !== ""
  ).length;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="w-full flex items-center justify-between gap-3">
        {/* Search bar */}
        <div className="flex-1 flex items-center gap-2 min-w-0 bg-[#1e2a4a] rounded-lg p-1 border border-blue-900/40 shadow-inner">
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

        {/* Filter dropdown button */}
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "bg-[#22306e] text-blue-100 border border-blue-900/40 hover:bg-blue-800/40 shadow-md rounded-md flex items-center gap-2 h-10 px-4 min-w-[120px] transition-all duration-200",
                hasActiveFilters && "border-blue-500 bg-blue-900/40"
              )}
            >
              <SlidersHorizontal
                className={cn(
                  "h-4 w-4",
                  hasActiveFilters ? "text-blue-300" : "text-blue-400"
                )}
              />
              <span className="flex-1 text-left">Filter</span>
              {hasActiveFilters ? (
                <Badge className="bg-blue-600 text-white text-xs py-0 px-1.5 rounded-full">
                  {activeFilterCount}
                </Badge>
              ) : (
                <ChevronDown className="h-4 w-4 text-blue-400" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[340px] sm:w-[400px] bg-[#1e2a4a] border border-blue-900/40 rounded-xl shadow-xl p-0 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 border-b border-blue-900/30 bg-gradient-to-r from-[#1a2c6b]/50 to-[#0a1033]/50"
            >
              <h3 className="text-lg font-medium text-blue-100 flex items-center">
                <Filter className="h-5 w-5 mr-2 text-blue-400" />
                Filter Documents
              </h3>
              <p className="text-sm text-blue-300/80 mt-1">
                Refine your document list using the filters below
              </p>
            </motion.div>

            <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Search field filter */}
              <div>
                <label className="text-sm font-medium text-blue-200 block mb-2">
                  Search In
                </label>
                <Select
                  value={searchField}
                  onValueChange={handleSearchFieldChange}
                >
                  <SelectTrigger className="w-full bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 shadow-sm">
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
              </div>

              {/* Status filter */}
              <div>
                <label className="text-sm font-medium text-blue-200 block mb-2">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 shadow-sm">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
                    {DEFAULT_STATUS_FILTERS.map((option) => (
                      <SelectItem
                        key={option.id}
                        value={String(option.value)}
                        className="hover:bg-blue-800/40"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type filter */}
              <div>
                <label className="text-sm font-medium text-blue-200 block mb-2">
                  Document Type
                </label>
                <Select value={typeFilter} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-full bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 shadow-sm">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40 max-h-[200px]">
                    {typeFilterOptions.map((option) => (
                      <SelectItem
                        key={option.id}
                        value={String(option.value)}
                        className="hover:bg-blue-800/40"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date range filter */}
              <div>
                <label className="text-sm font-medium text-blue-200 block mb-2">
                  Document Date Range
                </label>
                <div className="bg-[#22306e] text-blue-100 border border-blue-900/40 rounded-md p-4 shadow-inner">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={advancedDateRange?.from}
                    selected={advancedDateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={1}
                    className="bg-[#22306e]"
                    classNames={{
                      day_selected: "bg-blue-600 text-white hover:bg-blue-700",
                      day_today: "bg-blue-900/30 text-blue-100",
                      day_range_middle: "bg-blue-800/30 text-blue-100",
                      day_range_end: "bg-blue-600 text-white",
                      day_range_start: "bg-blue-600 text-white",
                      day_outside: "text-blue-500/50",
                      button_reset: "text-blue-400 hover:text-blue-300",
                      caption: "text-blue-200",
                      nav_button: "text-blue-300 hover:text-blue-200",
                      table: "border-blue-900/20",
                      head_cell: "text-blue-300",
                      cell: "text-blue-200",
                    }}
                  />
                </div>
                {advancedDateRange?.from && (
                  <div className="text-sm text-blue-300 mt-3 flex items-center justify-between bg-blue-900/20 p-2 rounded-md">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                      {format(advancedDateRange.from, "MMM dd, yyyy")}
                      {advancedDateRange.to &&
                        ` - ${format(advancedDateRange.to, "MMM dd, yyyy")}`}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAdvancedDateRange(undefined)}
                      className="h-7 px-2 text-xs text-blue-400 hover:text-blue-300"
                    >
                      <X className="h-3 w-3 mr-1" /> Clear
                    </Button>
                  </div>
                )}
              </div>

              <Separator className="bg-blue-900/30 my-4" />

              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/40 border-blue-900/40"
                >
                  Clear All
                </Button>
                <Button
                  size="sm"
                  onClick={applyAdvancedFilters}
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
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-wrap gap-2 mt-1"
          >
            {activeFilters.statusFilter !== "any" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Badge
                  className="bg-blue-900/40 hover:bg-blue-800/50 text-blue-100 px-3 py-1.5 flex items-center gap-1 rounded-md border border-blue-700/40 shadow-sm"
                  variant="outline"
                >
                  <span className="font-medium text-blue-300 mr-1">
                    Status:
                  </span>
                  {DEFAULT_STATUS_FILTERS.find(
                    (s) => s.value === activeFilters.statusFilter
                  )?.label || activeFilters.statusFilter}
                  <X
                    className="h-3.5 w-3.5 ml-2 cursor-pointer text-blue-400 hover:text-blue-300"
                    onClick={() => {
                      setStatusFilter("any");
                      applyFilters({
                        ...activeFilters,
                        statusFilter: "any",
                      });
                    }}
                  />
                </Badge>
              </motion.div>
            )}

            {activeFilters.typeFilter !== "any" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Badge
                  className="bg-blue-900/40 hover:bg-blue-800/50 text-blue-100 px-3 py-1.5 flex items-center gap-1 rounded-md border border-blue-700/40 shadow-sm"
                  variant="outline"
                >
                  <span className="font-medium text-blue-300 mr-1">Type:</span>
                  {typeFilterOptions.find(
                    (t) => t.value === activeFilters.typeFilter
                  )?.label || activeFilters.typeFilter}
                  <X
                    className="h-3.5 w-3.5 ml-2 cursor-pointer text-blue-400 hover:text-blue-300"
                    onClick={() => {
                      setTypeFilter("any");
                      applyFilters({
                        ...activeFilters,
                        typeFilter: "any",
                      });
                    }}
                  />
                </Badge>
              </motion.div>
            )}

            {activeFilters.dateRange && activeFilters.dateRange.from && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Badge
                  className="bg-blue-900/40 hover:bg-blue-800/50 text-blue-100 px-3 py-1.5 flex items-center gap-1 rounded-md border border-blue-700/40 shadow-sm"
                  variant="outline"
                >
                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                  <span className="font-medium text-blue-300 mr-1">Date:</span>
                  {format(activeFilters.dateRange.from, "MMM dd, yyyy")}
                  {activeFilters.dateRange.to &&
                    ` - ${format(activeFilters.dateRange.to, "MMM dd, yyyy")}`}
                  <X
                    className="h-3.5 w-3.5 ml-2 cursor-pointer text-blue-400 hover:text-blue-300"
                    onClick={() => {
                      setAdvancedDateRange(undefined);
                      applyFilters({
                        ...activeFilters,
                        dateRange: undefined,
                      });
                    }}
                  />
                </Badge>
              </motion.div>
            )}

            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 h-8 px-3 rounded-md"
                >
                  <X className="h-3.5 w-3.5 mr-1.5" /> Clear all filters
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
