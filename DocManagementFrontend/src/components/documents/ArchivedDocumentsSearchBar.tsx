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
import { useArchivedDocumentsFilter } from "@/hooks/documents/useArchivedDocumentsFilter";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import ArchivedDocumentsFilterBar from "./ArchivedDocumentsFilterBar";

interface ArchivedDocumentsSearchBarProps {
  hasActiveFilters?: boolean;
  className?: string;
}

export const ArchivedDocumentsSearchBar = ({
  hasActiveFilters = false,
  className = "",
}: ArchivedDocumentsSearchBarProps) => {
  const { t, tWithParams } = useTranslation();
  const { searchQuery, setSearchQuery, activeFilters, applyFilters, resetFilters } = useArchivedDocumentsFilter();

  const [searchField, setSearchField] = useState(activeFilters.searchField || "all");
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [filterOpen, setFilterOpen] = useState(false);

  // Field options for search - includes ERP code for archived documents
  const fieldOptions = [
    { id: "all", label: t('documents.allFields') },
    { id: "title", label: t('documents.documentTitle') },
    { id: "documentKey", label: t('documents.documentCode') },
    // { id: "documentType", label: "Document Type" },
    { id: "createdBy", label: t('documents.createdBy') },
    { id: "erpDocumentCode", label: t('documents.erpCode') },
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
  const fieldLabel = selectedField?.label?.toLowerCase() || t('documents.allFields').toLowerCase();

  // Count active filters (excluding search query)
  const activeFilterCount = Object.entries(activeFilters).filter(([key, value]) => {
    if (key === 'searchQuery' || key === 'searchField') return false;
    if (key === 'dateRange') return value !== undefined;
    return value !== 'any' && value !== '' && value !== undefined;
  }).length;

  // Professional filter/search bar styling matching User Management
  const filterCardClass =
    "w-full flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-background/50 to-primary/5 backdrop-blur-xl shadow-lg border border-primary/10";

  // Keyboard shortcuts
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
    <div className={cn("w-full", className)}>
      {/* Search and filter toolbar - matches user management style */}
      <div className={filterCardClass}>
        {/* Search and field select */}
        <div className="flex-1 flex items-center gap-4 min-w-0">
          <div className="relative">
            <Select value={searchField} onValueChange={handleSearchFieldChange}>
              <SelectTrigger className="w-[140px] h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg rounded-xl">
                <SelectValue>
                  {selectedField?.label || "All Fields"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-xl shadow-2xl">
                {fieldOptions.map((option) => (
                  <SelectItem
                    key={option.id}
                    value={option.id}
                    className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary rounded-lg"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            <Input
              placeholder={tWithParams('documents.searchArchivedDocuments', { field: fieldLabel })}
              value={localSearchQuery}
              onChange={handleSearchChange}
              className="relative h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 pl-12 pr-10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg group-hover:shadow-xl placeholder:text-muted-foreground/60"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/60 group-hover:text-primary transition-colors duration-300">
              <Search className="h-5 w-5" />
            </div>
            {localSearchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary/60 hover:text-primary transition-colors duration-150"
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
                className="h-12 px-6 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 shadow-lg rounded-xl flex items-center gap-3 transition-all duration-300 hover:shadow-xl"
              >
                <SlidersHorizontal className="h-5 w-5" />
                {t('documents.filterDocuments')}
                <span className="ml-2 px-2 py-0.5 rounded border border-primary/30 text-xs text-primary/70 bg-primary/10 font-mono">Alt+F</span>
                {hasActiveFilters && activeFilterCount > 0 && (
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0"
              align="end"
              sideOffset={5}
            >
              <ArchivedDocumentsFilterBar onClose={() => setFilterOpen(false)} />
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
              className="h-12 px-4 text-primary/60 hover:text-primary hover:bg-primary/10 transition-all duration-300 rounded-xl"
              title={t('documents.resetAllFilters')}
            >
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}; 