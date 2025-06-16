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
  CalendarRange,
  Check,
  Tag,
  FileText,
  Clock,
  RefreshCw,
  User,
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
import {
  format,
  isToday,
  isYesterday,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import documentTypeService from "@/services/documentTypeService";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/hooks/useTranslation";

const DATE_PRESETS = [
  {
    label: "Today",
    value: "today",
    icon: <Clock className="h-3.5 w-3.5 mr-1.5" />,
  },
  {
    label: "Yesterday",
    value: "yesterday",
    icon: <Clock className="h-3.5 w-3.5 mr-1.5" />,
  },
  {
    label: "This Week",
    value: "thisWeek",
    icon: <CalendarRange className="h-3.5 w-3.5 mr-1.5" />,
  },
  {
    label: "Last Week",
    value: "lastWeek",
    icon: <CalendarRange className="h-3.5 w-3.5 mr-1.5" />,
  },
  {
    label: "This Month",
    value: "thisMonth",
    icon: <CalendarRange className="h-3.5 w-3.5 mr-1.5" />,
  },
  {
    label: "Last Month",
    value: "lastMonth",
    icon: <CalendarRange className="h-3.5 w-3.5 mr-1.5" />,
  },
  {
    label: "Custom Range",
    value: "custom",
    icon: <Calendar className="h-3.5 w-3.5 mr-1.5" />,
  },
];

export default function DocumentsFilterBar() {
  const { t } = useTranslation();
  const {
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
    activeFilters,
    applyFilters,
    resetFilters,
    isFilterActive,
    activeFilterCount,
  } = useDocumentsFilter();

  const [searchField, setSearchField] = useState(
    activeFilters.searchField || "all"
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("filters");
  const [selectedDatePreset, setSelectedDatePreset] =
    useState<string>("custom");

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

  // Update local state when activeFilters change
  useEffect(() => {
    setSearchField(activeFilters.searchField || "all");
    setStatusFilter(activeFilters.statusFilter || "any");
    setTypeFilter(activeFilters.typeFilter || "any");
    setAdvancedDateRange(activeFilters.dateRange);

    // Determine if a date preset is active
    if (activeFilters.dateRange) {
      const preset = getDatePresetFromRange(activeFilters.dateRange);
      setSelectedDatePreset(preset || "custom");
    } else {
      setSelectedDatePreset("custom");
    }
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

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setAdvancedDateRange(range);
    setDateRange(range);
    applyFilters({
      ...activeFilters,
      dateRange: range,
    });
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
    resetFilters();
    setFilterOpen(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+F to toggle filter panel
      if (e.altKey && e.key === "f") {
        e.preventDefault();
        setFilterOpen(!filterOpen);
      }

      // Alt+C to clear all filters
      if (e.altKey && e.key === "c") {
        e.preventDefault();
        clearAllFilters();
      }

      // Ctrl+F to focus search (if not already focused)
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[aria-label="Search documents"]'
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }

      // Escape to close filter panel
      if (e.key === "Escape" && filterOpen) {
        setFilterOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filterOpen]);

  const applyDatePreset = (preset: string) => {
    setSelectedDatePreset(preset);
    let range: DateRange | undefined;

    const today = new Date();
    const yesterday = subDays(today, 1);

    switch (preset) {
      case "today":
        range = { from: today, to: today };
        break;
      case "yesterday":
        range = { from: yesterday, to: yesterday };
        break;
      case "thisWeek":
        range = {
          from: startOfWeek(today, { weekStartsOn: 1 }),
          to: endOfWeek(today, { weekStartsOn: 1 }),
        };
        break;
      case "lastWeek":
        const lastWeekStart = startOfWeek(subDays(today, 7), {
          weekStartsOn: 1,
        });
        const lastWeekEnd = endOfWeek(subDays(today, 7), { weekStartsOn: 1 });
        range = { from: lastWeekStart, to: lastWeekEnd };
        break;
      case "thisMonth":
        range = { from: startOfMonth(today), to: endOfMonth(today) };
        break;
      case "lastMonth":
        const lastMonth = subDays(startOfMonth(today), 1);
        range = { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
        break;
      case "custom":
        // Don't change the range for custom
        return;
      default:
        range = undefined;
    }

    if (range) {
      setAdvancedDateRange(range);
      setDateRange(range);
      applyFilters({
        ...activeFilters,
        dateRange: range,
      });
    }
  };

  const getDatePresetFromRange = (range: DateRange): string | null => {
    if (!range?.from || !range?.to) return null;

    const today = new Date();
    const yesterday = subDays(today, 1);

    // Normalize dates to compare only date parts
    const normalizeDate = (date: Date) => {
      const normalized = new Date(date);
      normalized.setHours(0, 0, 0, 0);
      return normalized;
    };

    const rangeFrom = normalizeDate(range.from);
    const rangeTo = normalizeDate(range.to);
    const normalizedToday = normalizeDate(today);
    const normalizedYesterday = normalizeDate(yesterday);

    // Check for single day ranges
    if (rangeFrom.getTime() === rangeTo.getTime()) {
      if (rangeFrom.getTime() === normalizedToday.getTime()) return "today";
      if (rangeFrom.getTime() === normalizedYesterday.getTime())
        return "yesterday";
    }

    // Check for week ranges
    const thisWeekStart = normalizeDate(
      startOfWeek(today, { weekStartsOn: 1 })
    );
    const thisWeekEnd = normalizeDate(endOfWeek(today, { weekStartsOn: 1 }));
    if (
      rangeFrom.getTime() === thisWeekStart.getTime() &&
      rangeTo.getTime() === thisWeekEnd.getTime()
    ) {
      return "thisWeek";
    }

    const lastWeekStart = normalizeDate(
      startOfWeek(subDays(today, 7), { weekStartsOn: 1 })
    );
    const lastWeekEnd = normalizeDate(
      endOfWeek(subDays(today, 7), { weekStartsOn: 1 })
    );
    if (
      rangeFrom.getTime() === lastWeekStart.getTime() &&
      rangeTo.getTime() === lastWeekEnd.getTime()
    ) {
      return "lastWeek";
    }

    // Check for month ranges
    const thisMonthStart = normalizeDate(startOfMonth(today));
    const thisMonthEnd = normalizeDate(endOfMonth(today));
    if (
      rangeFrom.getTime() === thisMonthStart.getTime() &&
      rangeTo.getTime() === thisMonthEnd.getTime()
    ) {
      return "thisMonth";
    }

    const lastMonth = subDays(startOfMonth(today), 1);
    const lastMonthStart = normalizeDate(startOfMonth(lastMonth));
    const lastMonthEnd = normalizeDate(endOfMonth(lastMonth));
    if (
      rangeFrom.getTime() === lastMonthStart.getTime() &&
      rangeTo.getTime() === lastMonthEnd.getTime()
    ) {
      return "lastMonth";
    }

    return null;
  };

  const formatDateRangeDisplay = (range: DateRange | undefined): string => {
    if (!range?.from) return "Any date";

    const from = new Date(range.from);
    if (!range.to) return format(from, "MMM d, yyyy");

    const to = new Date(range.to);

    if (from.getTime() === to.getTime()) {
      if (isToday(from)) return "Today";
      if (isYesterday(from)) return "Yesterday";
      return format(from, "MMM d, yyyy");
    }

    return `${format(from, "MMM d")} - ${format(to, "MMM d, yyyy")}`;
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="w-full flex items-center justify-between gap-3">
        {/* Search bar */}
        <div className="flex-1 flex items-center gap-2 min-w-0 table-glass-search-container">
          <div className="relative flex-1">
            <Input
              placeholder={t("documents.searchDocuments")}
              value={searchQuery}
              onChange={handleSearchChange}
              className="table-glass-search-input"
              aria-label="Search documents"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
              <Search className="h-4 w-4 table-glass-search-icon" />
            </div>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  applyFilters({
                    ...activeFilters,
                    searchQuery: "",
                  });
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 table-glass-search-clear"
                aria-label="Clear search"
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
                "table-glass-filter-button",
                isFilterActive && "table-glass-filter-button-active"
              )}
              aria-label="Toggle filter panel"
            >
              <SlidersHorizontal
                className={cn(
                  "h-4 w-4",
                  isFilterActive
                    ? "table-glass-filter-icon-active"
                    : "table-glass-filter-icon"
                )}
              />
              <span className="flex-1 text-left">Filter</span>
              {isFilterActive ? (
                <Badge className="table-glass-filter-badge">
                  {activeFilterCount}
                </Badge>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 table-glass-filter-icon" />
                  <kbd className="sr-only md:not-sr-only table-glass-filter-kbd">
                    Alt+F
                  </kbd>
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="table-glass-filter-popover"
            align="end"
            sideOffset={5}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="table-glass-filter-header"
            >
              <h3 className="table-glass-filter-title">
                <Filter className="h-5 w-5 mr-2 table-glass-filter-icon" />
                Filter Documents
              </h3>
              <p className="table-glass-filter-subtitle">
                Refine your document list using the filters below
              </p>
            </motion.div>

            <Tabs
              defaultValue="filters"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="table-glass-filter-tabs">
                <TabsTrigger value="filters" className="table-glass-filter-tab">
                  <Tag className="h-4 w-4 mr-2" /> Filters
                </TabsTrigger>
                <TabsTrigger value="date" className="table-glass-filter-tab">
                  <CalendarRange className="h-4 w-4 mr-2" /> Date Range
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[350px] overflow-auto">
                <TabsContent value="filters" className="p-4 space-y-4 mt-0">
                  {/* Search field filter */}
                  <div>
                    <label className="table-glass-filter-label">
                      <Search className="h-4 w-4 mr-2 table-glass-filter-icon" />
                      Search In
                    </label>
                    <Select
                      value={searchField}
                      onValueChange={handleSearchFieldChange}
                    >
                      <SelectTrigger className="table-glass-filter-select">
                        <SelectValue>
                          {DEFAULT_DOCUMENT_SEARCH_FIELDS.find(
                            (opt) => opt.id === searchField
                          )?.label || "All fields"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="table-glass-filter-select-content">
                        {DEFAULT_DOCUMENT_SEARCH_FIELDS.map((opt) => (
                          <SelectItem
                            key={opt.id}
                            value={String(opt.id)}
                            className="table-glass-filter-select-item"
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status filter */}
                  <div>
                    <label className="table-glass-filter-label">
                      <Clock className="h-4 w-4 mr-2 table-glass-filter-icon" />
                      Status
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {DEFAULT_STATUS_FILTERS.map((status) => (
                        <Button
                          key={status.value}
                          type="button"
                          variant="outline"
                          size="sm"
                          className={cn(
                            "table-glass-filter-option",
                            statusFilter === status.value &&
                              "table-glass-filter-option-active"
                          )}
                          onClick={() => handleStatusChange(status.value)}
                        >
                          {statusFilter === status.value && (
                            <Check className="h-3.5 w-3.5 mr-1.5 table-glass-filter-icon" />
                          )}
                          {status.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Document Type filter */}
                  <div>
                    <label className="table-glass-filter-label">
                      <FileText className="h-4 w-4 mr-2 table-glass-filter-icon" />
                      Document Type
                    </label>
                    <Select value={typeFilter} onValueChange={handleTypeChange}>
                      <SelectTrigger className="table-glass-filter-select">
                        <SelectValue>
                          {typeFilterOptions.find(
                            (opt) => opt.value === typeFilter
                          )?.label || "Any Type"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="table-glass-filter-select-content max-h-[200px]">
                        {typeFilterOptions.map((type) => (
                          <SelectItem
                            key={type.value}
                            value={type.value}
                            className="table-glass-filter-select-item"
                          >
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="date" className="p-4 space-y-4 mt-0">
                  {/* Date range presets */}
                  <div>
                    <label className="table-glass-filter-label">
                      <Clock className="h-4 w-4 mr-2 table-glass-filter-icon" />
                      Quick Date Ranges
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {DATE_PRESETS.map((preset) => (
                        <Button
                          key={preset.value}
                          type="button"
                          variant="outline"
                          size="sm"
                          className={cn(
                            "table-glass-filter-option justify-start",
                            selectedDatePreset === preset.value &&
                              "table-glass-filter-option-active"
                          )}
                          onClick={() => applyDatePreset(preset.value)}
                        >
                          {preset.icon}
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Calendar date picker */}
                  {selectedDatePreset === "custom" && (
                    <div className="table-glass-filter-calendar">
                      <label className="table-glass-filter-label">
                        Select Custom Date Range
                      </label>
                      <div className="flex justify-center">
                        <CalendarComponent
                          mode="range"
                          selected={advancedDateRange}
                          onSelect={handleDateRangeChange}
                          className="table-glass-calendar"
                          classNames={{
                            day_selected: "bg-primary text-primary-foreground",
                            day_today: "bg-accent text-accent-foreground",
                          }}
                        />
                      </div>
                      <div className="mt-2 text-xs table-glass-filter-info">
                        {advancedDateRange?.from ? (
                          advancedDateRange.to ? (
                            <>
                              <span>
                                {format(advancedDateRange.from, "PPP")} -{" "}
                                {format(advancedDateRange.to, "PPP")}
                              </span>
                            </>
                          ) : (
                            <span>{format(advancedDateRange.from, "PPP")}</span>
                          )
                        ) : (
                          <span>Select a date range</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-2">
                    <div className="table-glass-filter-active-info">
                      <div className="flex items-center justify-between">
                        <span className="table-glass-filter-info-label">
                          Active Date Filter:
                        </span>
                        <span className="table-glass-filter-info-value">
                          {dateRange
                            ? formatDateRangeDisplay(dateRange)
                            : "Any date"}
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <div className="table-glass-filter-footer">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="table-glass-filter-reset"
              >
                <RefreshCw className="h-4 w-4 mr-1.5" />
                Reset All
                <kbd className="sr-only md:not-sr-only table-glass-filter-kbd">
                  Alt+C
                </kbd>
              </Button>
              <Button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="table-glass-filter-apply"
                size="sm"
              >
                Apply Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filters display */}
      <AnimatePresence>
        {isFilterActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 overflow-hidden"
          >
            {activeFilters.searchQuery && (
              <Badge
                variant="outline"
                className="table-glass-filter-active-badge"
              >
                <Search className="h-3 w-3 table-glass-filter-icon" />
                <span className="text-xs">{activeFilters.searchQuery}</span>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    applyFilters({
                      ...activeFilters,
                      searchQuery: "",
                    });
                  }}
                  className="ml-1 table-glass-filter-remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {activeFilters.statusFilter &&
              activeFilters.statusFilter !== "any" && (
                <Badge
                  variant="outline"
                  className="table-glass-filter-active-badge"
                >
                  <Clock className="h-3 w-3 table-glass-filter-icon" />
                  <span className="text-xs">
                    {DEFAULT_STATUS_FILTERS.find(
                      (s) => s.value === activeFilters.statusFilter
                    )?.label || "Status"}
                  </span>
                  <button
                    onClick={() => {
                      setStatusFilter("any");
                      applyFilters({
                        ...activeFilters,
                        statusFilter: "any",
                      });
                    }}
                    className="ml-1 table-glass-filter-remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

            {activeFilters.typeFilter && activeFilters.typeFilter !== "any" && (
              <Badge
                variant="outline"
                className="table-glass-filter-active-badge"
              >
                <FileText className="h-3 w-3 table-glass-filter-icon" />
                <span className="text-xs">
                  {typeFilterOptions.find(
                    (t) => t.value === activeFilters.typeFilter
                  )?.label || "Type"}
                </span>
                <button
                  onClick={() => {
                    setTypeFilter("any");
                    applyFilters({
                      ...activeFilters,
                      typeFilter: "any",
                    });
                  }}
                  className="ml-1 table-glass-filter-remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {activeFilters.dateRange && (
              <Badge
                variant="outline"
                className="table-glass-filter-active-badge"
              >
                <Calendar className="h-3 w-3 table-glass-filter-icon" />
                <span className="text-xs">
                  {formatDateRangeDisplay(activeFilters.dateRange)}
                </span>
                <button
                  onClick={() => {
                    setDateRange(undefined);
                    setAdvancedDateRange(undefined);
                    setSelectedDatePreset("custom");
                    applyFilters({
                      ...activeFilters,
                      dateRange: undefined,
                    });
                  }}
                  className="ml-1 table-glass-filter-remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="table-glass-filter-clear-all"
            >
              Clear all
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
