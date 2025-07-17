import { useState, useEffect } from "react";
import { Search, X, SlidersHorizontal, FilterX } from "lucide-react";
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
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useDocumentsFilter } from "@/hooks/documents/useDocumentsFilter";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import DocumentsFilterBar from "./DocumentsFilterBar";

interface DocumentsSearchBarProps {
  hasActiveFilters?: boolean;
  className?: string;
}

export const DocumentsSearchBar = ({
  hasActiveFilters = false,
  className = "",
}: DocumentsSearchBarProps) => {
  const { t } = useTranslation();
  const { searchQuery, setSearchQuery, activeFilters, applyFilters, resetFilters } = useDocumentsFilter();
  
  const [searchField, setSearchField] = useState(activeFilters.searchField || "all");
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [filterOpen, setFilterOpen] = useState(false);

  // Field options for search
  const fieldOptions = [
    { id: "all", label: t("documents.allFields") },
    { id: "title", label: t("documents.documentTitle") },
    { id: "documentKey", label: t("documents.documentCode") },
    // { id: "documentType", label: t("documents.documentType") },
    { id: "responsibilityCentre", label: "Responsibility Center" },
  ];

  // Sync local state with filter state
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setSearchField(activeFilters.searchField || "all");
  }, [activeFilters.searchField]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalSearchQuery(newValue);
    setSearchQuery(newValue);
    
    // Apply filters with the new search query
    applyFilters({
      ...activeFilters,
      searchQuery: newValue,
      searchField,
    });
  };

  const handleSearchFieldChange = (field: string) => {
    setSearchField(field);
    
    // Apply filters with the new search field
    applyFilters({
      ...activeFilters,
      searchQuery: localSearchQuery,
      searchField: field,
    });
  };

  const clearSearch = () => {
    setLocalSearchQuery("");
    setSearchQuery("");
    
    // Apply filters with cleared search
    applyFilters({
      ...activeFilters,
      searchQuery: "",
      searchField,
    });
  };

  const selectedField = fieldOptions.find(f => f.id === searchField);
  const fieldLabel = selectedField?.label?.toLowerCase() || t("documents.allFields").toLowerCase();

  // Count active filters (excluding search query)
  const activeFilterCount = Object.entries(activeFilters).filter(([key, value]) => {
    if (key === 'searchQuery' || key === 'searchField') return false;
    if (key === 'dateRange') return value !== undefined;
    return value !== 'any' && value !== '' && value !== undefined;
  }).length;

  return (
    <div className={cn("w-full", className)}>
      {/* Search and filter toolbar - matches user management style */}
      <div className="p-5 border-b border-blue-900/30 bg-blue-900/20 backdrop-blur-sm rounded-lg border border-blue-900/30">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 flex items-center gap-3 min-w-0">
            {/* Field Selector */}
            <Select value={searchField} onValueChange={handleSearchFieldChange}>
              <SelectTrigger className="w-[140px] bg-[#22306e]/80 text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-blue-800/50 shadow-sm rounded-lg backdrop-blur-sm">
                <SelectValue>
                  {selectedField?.label || t("documents.allFields")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40 backdrop-blur-md">
                {fieldOptions.map((option) => (
                  <SelectItem
                    key={option.id}
                    value={option.id}
                    className="hover:bg-blue-800/40 focus:bg-blue-800/40"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search Input */}
            <div className="relative flex-1">
              <Input
                placeholder={`${t("documents.searchDocuments")} ${fieldLabel}...`}
                value={localSearchQuery}
                onChange={handleSearchChange}
                className="bg-[#22306e]/80 text-blue-100 border border-blue-900/40 pl-11 pr-10 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-blue-800/50 shadow-sm backdrop-blur-sm h-11"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
              {localSearchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors duration-150"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Toggle Button with Popover */}
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-[#22306e]/80 text-blue-100 border border-blue-900/40 hover:bg-blue-800/50 shadow-sm rounded-lg flex items-center gap-2 h-11 px-4 backdrop-blur-sm transition-all duration-200"
                >
                  <SlidersHorizontal className="h-4 w-4 text-blue-400" />
                  {t("documents.filterDocuments")}
                  {hasActiveFilters && activeFilterCount > 0 && (
                    <Badge className="ml-1 bg-blue-600 text-white shadow-sm">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0"
                align="end"
                sideOffset={5}
              >
                <DocumentsFilterBar onClose={() => setFilterOpen(false)} />
              </PopoverContent>
            </Popover>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={() => {
                  resetFilters();
                  setFilterOpen(false);
                }}
                className="h-11 px-4 text-blue-400 hover:text-blue-300 hover:bg-blue-900/40 transition-all duration-150 rounded-lg"
                title="Reset all filters"
              >
                <FilterX className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 