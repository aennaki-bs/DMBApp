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
  { id: "any", label: "Any", value: "any" },
  { id: "with", label: "With Documents", value: "yes" },
  { id: "without", label: "Without Documents", value: "no" },
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
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Local search state for controlled input
  const [localSearchQuery, setLocalSearchQuery] = useState(filters.searchQuery);

  // Sync local search with global state
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    // Debounced update to global state
    updateFilters({ searchQuery: value });
  };

  const handleSearchFieldChange = (value: string) => {
    updateFilters({
      searchField: value as DocumentTypeFilterState['searchField']
    });
  };

  const handleTierTypeChange = (value: string) => {
    updateFilters({
      tierType: value === "any" ? "any" : (Number(value) as TierType)
    });
  };

  const handleHasDocumentsChange = (value: string) => {
    updateFilters({
      hasDocuments: value as "any" | "yes" | "no"
    });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    updateFilters({
      createdDateRange: range
    });
  };

  const handleClearFilters = () => {
    resetFilters();
    setLocalSearchQuery("");
    setIsAdvancedOpen(false);
  };

  // Close advanced filters on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAdvancedOpen) {
        setIsAdvancedOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isAdvancedOpen]);

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Search Input with Field Selector */}
        <div className="flex-1 flex gap-2">
          <Select value={filters.searchField} onValueChange={handleSearchFieldChange}>
            <SelectTrigger className="w-32 bg-background/50 border-primary/20 focus:border-primary/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEARCH_FIELDS.map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search document types..."
              value={localSearchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-10 bg-background/50 border-primary/20 focus:border-primary/40 transition-all duration-300"
            />
            {localSearchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setLocalSearchQuery("");
                  updateFilters({ searchQuery: "" });
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filter Toggle and Status */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={cn(
              "bg-background/50 border-primary/20 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300",
              isAdvancedOpen && "bg-primary/10 border-primary/30",
              isFilterActive && "border-primary/40 bg-primary/5"
            )}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs bg-primary/20 text-primary">
                {activeFilterCount}
              </Badge>
            )}
            <ChevronDown className={cn(
              "h-4 w-4 ml-1 transition-transform duration-200",
              isAdvancedOpen && "rotate-180"
            )} />
          </Button>

          {isFilterActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {isAdvancedOpen && (
        <div className="p-4 rounded-lg bg-background/30 backdrop-blur-sm border border-primary/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              Advanced Filters
            </h3>
          </div>

          <Separator className="bg-primary/10" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tier Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-primary" />
                Tier Type
              </label>
              <Select
                value={filters.tierType === "any" ? "any" : filters.tierType?.toString() || "any"}
                onValueChange={handleTierTypeChange}
              >
                <SelectTrigger className="bg-background/50 border-primary/20 focus:border-primary/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIER_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.id} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Has Documents Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-primary" />
                Documents
              </label>
              <Select
                value={filters.hasDocuments || "any"}
                onValueChange={handleHasDocumentsChange}
              >
                <SelectTrigger className="bg-background/50 border-primary/20 focus:border-primary/40">
                  <SelectValue />
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

            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Date Range
              </label>
              <DateRangePicker
                date={filters.createdDateRange}
                onDateChange={handleDateRangeChange}
                className="bg-background/50 border-primary/20 focus:border-primary/40"
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {isFilterActive && (
            <div className="pt-3 border-t border-primary/10">
              <div className="flex flex-wrap gap-2">
                {filters.tierType && filters.tierType !== "any" && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    <Tag className="h-3 w-3 mr-1" />
                    Tier: {TIER_TYPE_OPTIONS.find(t => t.value.toString() === filters.tierType?.toString())?.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-4 w-4 p-0 hover:bg-primary/20"
                      onClick={() => updateFilters({ tierType: "any" })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {filters.hasDocuments && filters.hasDocuments !== "any" && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    <FileText className="h-3 w-3 mr-1" />
                    {filters.hasDocuments === "yes" ? "With Documents" : "Without Documents"}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-4 w-4 p-0 hover:bg-primary/20"
                      onClick={() => updateFilters({ hasDocuments: "any" })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {filters.createdDateRange && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    <Calendar className="h-3 w-3 mr-1" />
                    Date Range
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-4 w-4 p-0 hover:bg-primary/20"
                      onClick={() => updateFilters({ createdDateRange: undefined })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAdvancedOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Close
            </Button>
            {isFilterActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="text-muted-foreground hover:text-destructive hover:border-destructive/30"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 