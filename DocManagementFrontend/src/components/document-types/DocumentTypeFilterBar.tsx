import { useState, useEffect } from "react";
import {
  Filter,
  Search,
  X,
  Calendar,
  ChevronDown,
  Tag,
  FileText,
  Hash,
  Info,
  Users,
  Clock,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { TierType } from "@/models/document";
import { DocumentTypeFilterState } from "@/hooks/document-types/useDocumentTypeSmartFilter";
import { Separator } from "@/components/ui/separator";

const SEARCH_FIELDS = [
  { id: "all", label: "All fields" },
  { id: "typeName", label: "Type Name" },
  { id: "typeAttr", label: "Description" },
];

const TIER_TYPE_OPTIONS = [
  { id: "any", label: "Any Tier Type", value: "any" },
  { id: "none", label: "None", value: TierType.None },
  { id: "customer", label: "Customer", value: TierType.Customer },
  { id: "vendor", label: "Vendor", value: TierType.Vendor },
];

const HAS_DOCUMENTS_OPTIONS = [
  { id: "any", label: "Any Document Status", value: "any" },
  { id: "yes", label: "Has Documents", value: "yes" },
  { id: "no", label: "No Documents", value: "no" },
];

interface DocumentTypeFilterBarProps {
  filters: DocumentTypeFilterState;
  updateFilters: (filters: Partial<DocumentTypeFilterState>) => void;
  resetFilters: () => void;
  isFilterActive: boolean;
  activeFilterCount: number;
}

export default function DocumentTypeFilterBar({
  filters,
  updateFilters,
  resetFilters,
  isFilterActive,
  activeFilterCount,
}: DocumentTypeFilterBarProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchField, setSearchField] = useState(filters.searchField || "all");
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || "");

  // Handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    updateFilters({
      searchQuery: query,
    });
  };

  // Handle search field change
  const handleSearchFieldChange = (value: string) => {
    setSearchField(value);
    updateFilters({
      searchField: value,
    });
  };

  // Handle tier type change
  const handleTierTypeChange = (value: string) => {
    updateFilters({
      tierType: value === "any" ? "any" : Number(value) as TierType,
    });
  };

  // Handle has documents change
  const handleHasDocumentsChange = (value: string) => {
    updateFilters({
      hasDocuments: value as "any" | "yes" | "no",
    });
  };

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    updateFilters({
      createdDateRange: range,
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setSearchField("all");
    resetFilters();
    setFilterOpen(false);
  };

  // Professional filter/search bar styling
  const filterCardClass =
    "w-full flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#1a2c6b]/50 via-[#0a1033]/50 to-[#1a2c6b]/50 backdrop-blur-xl shadow-lg border border-blue-900/30";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "f") {
        e.preventDefault();
        setFilterOpen(true);
      }
      if (e.key === "Escape" && filterOpen) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filterOpen]);

  return (
    <div className={filterCardClass}>
      {/* Search and field select */}
      <div className="flex-1 flex items-center gap-4 min-w-0">
        <div className="relative">
          <Select value={searchField} onValueChange={handleSearchFieldChange}>
            <SelectTrigger className="w-[130px] bg-blue-900/20 border-blue-800/30 text-white">
              <SelectValue placeholder="Search in..." />
            </SelectTrigger>
            <SelectContent>
              {SEARCH_FIELDS.map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
          <Input
            placeholder="Search document types..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9 pr-4 py-2 h-10 bg-blue-900/20 border-blue-800/30 text-white"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                updateFilters({ searchQuery: "" });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter button and badges */}
      <div className="flex items-center gap-2 ml-auto">
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "border-blue-500/50 bg-blue-900/20 hover:bg-blue-800/30 text-blue-300 hover:text-blue-100",
                isFilterActive &&
                  "bg-blue-600/50 border-blue-400/50 text-blue-100"
              )}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              <span className="ml-2 px-2 py-0.5 rounded border border-blue-700 text-xs text-blue-300 bg-blue-900/40 font-mono">Alt+F</span>
              {activeFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-blue-600 text-white"
                >
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown className="h-3.5 w-3.5 ml-2 opacity-70" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-[300px] p-4 bg-[#0a1033] border border-blue-900/30"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-blue-100">Filters</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-8 px-2 text-xs text-blue-400"
                >
                  Clear all
                </Button>
              </div>

              <Separator className="bg-blue-900/30" />

              <div className="space-y-2">
                <label className="text-xs text-blue-300 block">
                  Document Status
                </label>
                <Select
                  value={filters.hasDocuments}
                  onValueChange={handleHasDocumentsChange}
                >
                  <SelectTrigger className="bg-blue-900/20 border-blue-800/30 text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {HAS_DOCUMENTS_OPTIONS.map((option) => (
                      <SelectItem key={option.id} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-blue-300 block">Tier Type</label>
                <Select
                  value={
                    filters.tierType === "any"
                      ? "any"
                      : filters.tierType.toString()
                  }
                  onValueChange={handleTierTypeChange}
                >
                  <SelectTrigger className="bg-blue-900/20 border-blue-800/30 text-white">
                    <SelectValue placeholder="Select tier type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIER_TYPE_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.id}
                        value={option.value.toString()}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-blue-300 block">
                  Created Date
                </label>
                <DateRangePicker
                  date={filters.createdDateRange}
                  onDateChange={handleDateRangeChange}
                  className="w-full"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => setFilterOpen(false)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
} 