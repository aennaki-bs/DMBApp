import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { MapPin, Search, Filter, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { usePagination } from "@/hooks/usePagination";
import SmartPagination from "@/components/shared/SmartPagination";
import { LocationsTableContent } from "./table/LocationsTableContent";
import { LocationsTableEmpty } from "./table/LocationsTableEmpty";
import locationService from "@/services/locationService";
import { LocationDto } from "@/models/location";

// Search field options
const SEARCH_FIELDS = [
  { id: "all", label: "All fields" },
  { id: "locationCode", label: "Location Code" },
  { id: "description", label: "Description" },
];

export const LocationsTable: React.FC = () => {
  // Data fetching
  const {
    data: locations = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["locations"],
    queryFn: () => locationService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [sortField, setSortField] = useState<keyof LocationDto>("locationCode");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "f") {
        e.preventDefault();
        setFilterOpen(!filterOpen);
      }
      if (e.key === "Escape" && filterOpen) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filterOpen]);

  // Data processing
  const filteredAndSortedLocations = useMemo(() => {
    let filtered = locations.filter((location) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      switch (searchField) {
        case "locationCode":
          return location.locationCode.toLowerCase().includes(query);
        case "description":
          return location.description.toLowerCase().includes(query);
        default:
          return (
            location.locationCode.toLowerCase().includes(query) ||
            location.description.toLowerCase().includes(query)
          );
      }
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "locationCode":
          aValue = a.locationCode;
          bValue = b.locationCode;
          break;
        case "description":
          aValue = a.description;
          bValue = b.description;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.locationCode;
          bValue = b.locationCode;
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [locations, searchQuery, searchField, sortField, sortDirection]);

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedLocations,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: filteredAndSortedLocations,
    initialPageSize: 25,
  });

  // Handlers
  const handleSort = (field: keyof LocationDto) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectLocation = (locationCode: string) => {
    setSelectedLocations((prev) =>
      prev.includes(locationCode)
        ? prev.filter((code) => code !== locationCode)
        : [...prev, locationCode]
    );
  };

  const handleSelectAll = () => {
    const currentPageCodes = paginatedLocations.map((location) => location.locationCode);
    const selectedOnCurrentPage = selectedLocations.filter((code) =>
      currentPageCodes.includes(code)
    );

    if (selectedOnCurrentPage.length === currentPageCodes.length) {
      setSelectedLocations((prev) =>
        prev.filter((code) => !currentPageCodes.includes(code))
      );
    } else {
      setSelectedLocations((prev) => [
        ...prev.filter((code) => !currentPageCodes.includes(code)),
        ...currentPageCodes,
      ]);
    }
  };

  const handleEditLocation = (location: LocationDto) => {
    // TODO: Implement edit functionality
    toast.info("Edit location functionality coming soon");
  };

  const handleDeleteLocation = (location: LocationDto) => {
    // TODO: Implement delete functionality
    toast.info("Delete location functionality coming soon");
  };

  const handleViewLocation = (location: LocationDto) => {
    // TODO: Implement view functionality
    toast.info("View location functionality coming soon");
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchField("all");
    setFilterOpen(false);
  };

  const clearSelection = () => {
    setSelectedLocations([]);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-primary font-medium">Loading locations...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-destructive/10 rounded-full p-4">
            <MapPin className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-destructive font-medium">Failed to load locations</p>
          <Button variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="w-full flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-background/50 to-primary/5 backdrop-blur-xl shadow-lg border border-primary/10">
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <Select value={searchField} onValueChange={setSearchField}>
            <SelectTrigger className="w-[140px] bg-background/60 border-primary/20 text-foreground shadow-sm">
              <SelectValue>
                {SEARCH_FIELDS.find((opt) => opt.id === searchField)?.label || "All fields"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-md border-primary/20">
              {SEARCH_FIELDS.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/60 border-primary/20 text-foreground shadow-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-background/60 border-primary/20 text-foreground hover:bg-primary/5 shadow-sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">Alt</span>F
                </kbd>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-background/95 backdrop-blur-md border-primary/20">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">Search Filters</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilterOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Search in: {SEARCH_FIELDS.find((opt) => opt.id === searchField)?.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {filteredAndSortedLocations.length} of {locations.length} locations
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSearch}
                    className="flex-1"
                  >
                    Clear filters
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setFilterOpen(false)}
                    className="flex-1"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {totalItems} locations
          </Badge>
          {searchQuery && (
            <Badge variant="outline" className="border-primary/20 text-muted-foreground">
              Filtered by: {searchQuery}
            </Badge>
          )}
        </div>
        {selectedLocations.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              {selectedLocations.length} selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="h-8 px-2 hover:bg-primary/10"
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      {filteredAndSortedLocations.length === 0 ? (
        <LocationsTableEmpty hasSearchQuery={!!searchQuery} onClearSearch={clearSearch} />
      ) : (
        <LocationsTableContent
          locations={paginatedLocations}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          selectedLocations={selectedLocations}
          onSelectLocation={handleSelectLocation}
          onSelectAll={handleSelectAll}
          onEditLocation={handleEditLocation}
          onDeleteLocation={handleDeleteLocation}
          onViewLocation={handleViewLocation}
        />
      )}

      {/* Pagination */}
      {filteredAndSortedLocations.length > 0 && (
        <SmartPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      )}

      {/* Bulk Actions Bar */}
      {createPortal(
        <AnimatePresence>
          {selectedLocations.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-6 right-16 transform -translate-x-1/2 z-[9999] w-[calc(100vw-4rem)] max-w-4xl mx-auto"
            >
              <div className="bg-gradient-to-r from-primary/95 to-primary/90 backdrop-blur-lg shadow-2xl rounded-2xl border border-primary/20 p-4 flex items-center justify-between">
                <div className="flex items-center text-primary-foreground font-medium">
                  <div className="bg-primary-foreground/20 p-2 rounded-xl mr-3">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span>
                    <span className="font-bold">{selectedLocations.length}</span> location
                    {selectedLocations.length !== 1 ? "s" : ""} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={clearSelection}
                    className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-none"
                  >
                    Clear selection
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled
                    className="bg-destructive/20 hover:bg-destructive/30 text-destructive-foreground border-none opacity-50"
                  >
                    Delete selected
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default LocationsTable; 