import { useState, useEffect } from "react";
import { Search, Calendar, X, CheckCircle2, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SubTypeFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeOnly: boolean;
  setActiveOnly: (active: boolean) => void;
  startDateFilter: Date | null;
  setStartDateFilter: (date: Date | null) => void;
  endDateFilter: Date | null;
  setEndDateFilter: (date: Date | null) => void;
  applyFilters: () => void;
  resetFilters: () => void;
}

const DEFAULT_SEARCH_FIELDS = [
  { id: "all", label: "All fields" },
  { id: "code", label: "Series Code" },
  { id: "description", label: "Description" },
];

const STATUS_OPTIONS = [
  { id: "any", label: "Any Status", value: "any" },
  { id: "active", label: "Active Only", value: "active" },
  { id: "inactive", label: "Inactive Only", value: "inactive" },
];

export function SubTypeFilterBar({
  searchQuery,
  setSearchQuery,
  activeOnly,
  setActiveOnly,
  startDateFilter,
  setStartDateFilter,
  endDateFilter,
  setEndDateFilter,
  applyFilters,
  resetFilters,
}: SubTypeFilterBarProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [searchField, setSearchField] = useState("all");
  const [statusFilter, setStatusFilter] = useState("any");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Update status filter when activeOnly changes
  useEffect(() => {
    if (activeOnly) {
      setStatusFilter("active");
    } else {
      setStatusFilter("any");
    }
  }, [activeOnly]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    setSearchQuery(value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    if (value === "active") {
      setActiveOnly(true);
    } else if (value === "inactive") {
      setActiveOnly(false);
    } else {
      setActiveOnly(false);
    }
  };

  // Check if any filters are active
  const isFilterActive = searchQuery || activeOnly || startDateFilter || endDateFilter;
  const activeFilterCount = [searchQuery, activeOnly, startDateFilter, endDateFilter].filter(Boolean).length;

  // Clear all filters
  const clearAllFilters = () => {
    setLocalSearchQuery("");
    setSearchQuery("");
    setActiveOnly(false);
    setStatusFilter("any");
    setStartDateFilter(null);
    setEndDateFilter(null);
    setShowAdvancedFilters(false);
    resetFilters();
  };

  // Active filter badges
  const filterBadges = [
    ...(searchQuery ? [{ id: "search", label: `Search: ${searchQuery}`, onRemove: () => { setLocalSearchQuery(""); setSearchQuery(""); } }] : []),
    ...(activeOnly ? [{ id: "status", label: "Active Only", onRemove: () => { setActiveOnly(false); setStatusFilter("any"); } }] : []),
    ...(startDateFilter ? [{ id: "startDate", label: `Start: ${format(startDateFilter, "MMM dd, yyyy")}`, onRemove: () => setStartDateFilter(null) }] : []),
    ...(endDateFilter ? [{ id: "endDate", label: `End: ${format(endDateFilter, "MMM dd, yyyy")}`, onRemove: () => setEndDateFilter(null) }] : []),
  ];

  // Professional filter/search bar styling - EXACT match with UserTable
  const filterCardClass = "w-full flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-background/50 to-primary/5 backdrop-blur-xl shadow-lg border border-primary/10";

  // Close advanced filters on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showAdvancedFilters) {
        setShowAdvancedFilters(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showAdvancedFilters]);

  return (
    <div className="space-y-4">
      {/* Main Filter Bar - EXACT UserTable style */}
      <div className={filterCardClass}>
        {/* Search and field select */}
        <div className="flex-1 flex items-center gap-4 min-w-0">
          <div className="relative">
            <Select value={searchField} onValueChange={setSearchField}>
              <SelectTrigger className="w-[140px] h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg rounded-xl">
                <SelectValue>
                  {DEFAULT_SEARCH_FIELDS.find((opt) => opt.id === searchField)?.label || "All fields"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-xl shadow-2xl">
                {DEFAULT_SEARCH_FIELDS.map((opt) => (
                  <SelectItem
                    key={opt.id}
                    value={opt.id}
                    className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary rounded-lg"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 relative min-w-0">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-colors group-focus-within:text-primary" />
              <Input
                placeholder="Search series..."
                value={localSearchQuery}
                onChange={handleSearchChange}
                className="h-12 pl-12 pr-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg rounded-xl placeholder:text-muted-foreground/70"
              />
              {localSearchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground transition-colors hover:bg-background/80 rounded-lg"
                  onClick={() => {
                    setLocalSearchQuery("");
                    setSearchQuery("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Status Filter and Advanced Filters */}
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[140px] h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg rounded-xl">
              <SelectValue>
                {STATUS_OPTIONS.find((opt) => opt.id === statusFilter)?.label || "Any Status"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-xl shadow-2xl">
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.id}
                  value={opt.id}
                  className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary rounded-lg"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Advanced Filters Toggle */}
          <Popover open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
            <PopoverTrigger asChild>
              <Button
                variant={isFilterActive ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-12 px-4 transition-all duration-300 shadow-lg rounded-xl",
                  isFilterActive
                    ? "bg-primary text-primary-foreground border-primary shadow-lg hover:bg-primary/90"
                    : "bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:border-primary/40 hover:bg-background/80"
                )}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 px-1.5 text-xs bg-background/80 text-foreground border border-primary/20 rounded-md"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 bg-background/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-2xl p-6"
              align="end"
            >
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date Range Filters
                  </h4>

                  <div className="space-y-4">
                    {/* Start Date Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Start Date From</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-background/50 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-200"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {startDateFilter ? format(startDateFilter, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-background/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-2xl">
                          <CalendarComponent
                            mode="single"
                            selected={startDateFilter || undefined}
                            onSelect={(date) => setStartDateFilter(date || null)}
                            initialFocus
                            className="rounded-xl"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* End Date Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">End Date Until</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-background/50 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-200"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {endDateFilter ? format(endDateFilter, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-background/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-2xl">
                          <CalendarComponent
                            mode="single"
                            selected={endDateFilter || undefined}
                            onSelect={(date) => setEndDateFilter(date || null)}
                            initialFocus
                            className="rounded-xl"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex justify-end">
                  {isFilterActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg transition-all duration-200 flex items-center gap-2"
                      onClick={clearAllFilters}
                    >
                      <X className="h-4 w-4" />
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filter Badges - Same as UserTable */}
      {filterBadges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
          {filterBadges.map((badge) => (
            <Badge
              key={badge.id}
              variant="secondary"
              className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all duration-200 group rounded-lg"
            >
              {badge.label}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-4 w-4 p-0 text-primary hover:text-primary/80 group-hover:bg-primary/20 rounded-sm"
                onClick={badge.onRemove}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="ml-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
