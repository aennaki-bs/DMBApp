import { Card, CardContent } from "@/components/ui/card";
import { DocumentType } from "@/models/document";
import DocumentTypeTable from "@/components/document-types/DocumentTypeTable";
import DocumentTypeGrid from "@/components/document-types/DocumentTypeGrid";
import LoadingState from "@/components/document-types/LoadingState";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Search, Filter, X, Grid3X3, List, FileText, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";

interface DocumentTypesContentProps {
  isLoading: boolean;
  types: DocumentType[];
  viewMode: "table" | "grid";
  selectedTypes: number[];
  onDeleteType: (id: number) => void;
  onEditType: (type: DocumentType) => void;
  onSelectType: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortField: string | null;
  sortDirection: "asc" | "desc";
  handleSort: (field: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  filteredAndSortedTypes: DocumentType[];
  setViewMode: (mode: "table" | "grid") => void;
  onAddType: () => void;
}

const DocumentTypesContent = ({
  isLoading,
  types,
  viewMode,
  selectedTypes,
  onDeleteType,
  onEditType,
  onSelectType,
  onSelectAll,
  searchQuery,
  setSearchQuery,
  sortField,
  sortDirection,
  handleSort,
  currentPage,
  setCurrentPage,
  totalPages,
  filteredAndSortedTypes,
  setViewMode,
  onAddType,
}: DocumentTypesContentProps) => {
  const [searchField, setSearchField] = useState("typeName");
  const [hasDocumentsFilter, setHasDocumentsFilter] = useState("any");
  const [tierFilter, setTierFilter] = useState("any");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Apply additional filters on top of the parent's filtered data
  const getFilteredTypes = useMemo(() => {
    let filtered = types;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((type) => {
        const searchValue = searchQuery.toLowerCase();
        switch (searchField) {
          case "typeName":
            return type.typeName?.toLowerCase().includes(searchValue);
          case "typeCode":
            return type.typeKey?.toLowerCase().includes(searchValue);
          case "description":
            return type.typeAttr?.toLowerCase().includes(searchValue);
          default:
            return (
              type.typeName?.toLowerCase().includes(searchValue) ||
              type.typeKey?.toLowerCase().includes(searchValue) ||
              type.typeAttr?.toLowerCase().includes(searchValue)
            );
        }
      });
    }

    // Apply has documents filter
    if (hasDocumentsFilter !== "any") {
      filtered = filtered.filter((type) => {
        const hasDocuments = (type.documentCounter || 0) > 0;
        return hasDocumentsFilter === "yes" ? hasDocuments : !hasDocuments;
      });
    }

    // Apply tier filter
    if (tierFilter !== "any") {
      filtered = filtered.filter((type) => {
        if (tierFilter === "Customer") {
          return type.tierType === 1; // TierType.Customer
        } else if (tierFilter === "Vendor") {
          return type.tierType === 2; // TierType.Vendor
        }
        return true;
      });
    }

    return filtered;
  }, [types, searchQuery, searchField, hasDocumentsFilter, tierFilter]);

  // Use pagination hook for filtered types
  const {
    currentPage: paginationCurrentPage,
    pageSize,
    totalPages: paginationTotalPages,
    totalItems,
    paginatedData: paginatedTypes,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: getFilteredTypes,
    initialPageSize: 15,
  });

  const activeFiltersCount = [
    hasDocumentsFilter !== "any",
    tierFilter !== "any",
    searchQuery.trim() !== "",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearchQuery("");
    setHasDocumentsFilter("any");
    setTierFilter("any");
    setSearchField("typeName");
    setShowAdvancedFilters(false);
  };

  // Handle select all for paginated data - only select eligible types
  const handleSelectAllPaginated = (checked: boolean) => {
    // Only get eligible types (those without documents that can be deleted)
    const eligibleTypeIds = paginatedTypes
      .filter((type) => (type.documentCounter || 0) === 0)
      .map((type) => type.id!);

    if (checked) {
      // Select all eligible types on current page
      eligibleTypeIds.forEach((typeId) => {
        if (!selectedTypes.includes(typeId)) {
          onSelectType(typeId, true);
        }
      });
    } else {
      // Deselect all eligible types on current page
      eligibleTypeIds.forEach((typeId) => {
        if (selectedTypes.includes(typeId)) {
          onSelectType(typeId, false);
        }
      });
    }
  };

  // Check if all eligible types on current page are selected
  const eligibleTypesOnPage = paginatedTypes.filter(
    (type) => (type.documentCounter || 0) === 0
  );
  const selectedEligibleTypesOnPage = eligibleTypesOnPage.filter((type) =>
    selectedTypes.includes(type.id!)
  );
  const areAllEligibleSelected =
    eligibleTypesOnPage.length > 0 &&
    selectedEligibleTypesOnPage.length === eligibleTypesOnPage.length;
  const hasEligibleTypes = eligibleTypesOnPage.length > 0;

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="h-full flex flex-col gap-4" style={{ minHeight: "100%" }}>
      {/* Modern Search and Filter Bar */}
      <Card className="border-primary/10 bg-gradient-to-r from-background/95 to-primary/5 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Section */}
            <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={`Search by ${
                    searchField === "typeName"
                      ? "name"
                      : searchField === "typeCode"
                      ? "code"
                      : "description"
                  }...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-background/80 border-primary/20 focus:border-primary/40 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger className="w-full sm:w-36 h-10 bg-background/80 border-primary/20 focus:border-primary/40 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="typeName">Name</SelectItem>
                  <SelectItem value="typeCode">Code</SelectItem>
                  <SelectItem value="description">Description</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter and View Controls */}
            <div className="flex items-center gap-3">
              <Popover
                open={showAdvancedFilters}
                onOpenChange={setShowAdvancedFilters}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-10 bg-background/80 border-primary/20 hover:bg-primary/10 transition-all duration-200",
                      activeFiltersCount > 0 &&
                        "border-primary/40 bg-primary/10 text-primary"
                    )}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 h-5 w-5 p-0 text-xs bg-primary/20 text-primary border-primary/30"
                      >
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4 bg-background/95 backdrop-blur-sm border-primary/20 shadow-xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">
                        Advanced Filters
                      </h4>
                      {activeFiltersCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFilters}
                          className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-primary/10"
                        >
                          Clear all
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block text-foreground">
                          Document Status
                        </label>
                        <Select
                          value={hasDocumentsFilter}
                          onValueChange={setHasDocumentsFilter}
                        >
                          <SelectTrigger className="bg-background/80 border-primary/20 focus:border-primary/40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any Status</SelectItem>
                            <SelectItem value="yes">Has Documents</SelectItem>
                            <SelectItem value="no">No Documents</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block text-foreground">
                          Tier Type
                        </label>
                        <Select
                          value={tierFilter}
                          onValueChange={setTierFilter}
                        >
                          <SelectTrigger className="bg-background/80 border-primary/20 focus:border-primary/40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any Tier</SelectItem>
                            <SelectItem value="Customer">Customer</SelectItem>
                            <SelectItem value="Vendor">Vendor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-primary/20 rounded-lg bg-background/80 overflow-hidden">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className={cn(
                    "h-10 px-3 rounded-none border-r border-primary/20",
                    viewMode === "table"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-primary/10"
                  )}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "h-10 px-3 rounded-none",
                    viewMode === "grid"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-primary/10"
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-primary/10">
              {searchQuery.trim() && (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors"
                >
                  Search: "{searchQuery}"
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-2 hover:bg-primary/20 rounded-full"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {hasDocumentsFilter !== "any" && (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors"
                >
                  {hasDocumentsFilter === "yes"
                    ? "Has Documents"
                    : "No Documents"}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-2 hover:bg-primary/20 rounded-full"
                    onClick={() => setHasDocumentsFilter("any")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {tierFilter !== "any" && (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors"
                >
                  Tier: {tierFilter}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-2 hover:bg-primary/20 rounded-full"
                    onClick={() => setTierFilter("any")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        {types.length === 0 ? (
          // Empty database state
          <Card className="border-primary/10 bg-gradient-to-b from-background/95 to-primary/5 backdrop-blur-sm">
            <CardContent className="p-16 text-center">
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-inner">
                  <FileText className="h-10 w-10 text-primary/60" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">
                  No document types found
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
                  Document types help categorize your documents. Start by
                  creating your first document type to organize your document
                  management system.
                </p>
                <Button
                  onClick={onAddType}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Document Type
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : getFilteredTypes.length === 0 ? (
          // No search results state
          <Card className="border-primary/10 bg-gradient-to-b from-background/95 to-primary/5 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <Search className="h-12 w-12 text-primary/40 mb-4" />
                <p className="text-lg font-medium mb-2">
                  No document types found
                </p>
                <p className="text-sm mb-6">
                  No document types match your current search and filter
                  criteria.
                </p>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="border-primary/20 hover:bg-primary/10"
                  >
                    <X className="mr-2 h-3 w-3" />
                    Clear all filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : viewMode === "table" ? (
          <DocumentTypeTable
            types={paginatedTypes}
            selectedTypes={selectedTypes}
            onSelectType={onSelectType}
            onSelectAll={handleSelectAllPaginated}
            onDeleteType={onDeleteType}
            onEditType={onEditType}
            onSort={handleSort}
            sortField={sortField}
            sortDirection={sortDirection}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        ) : (
          <DocumentTypeGrid
            types={paginatedTypes}
            onDeleteType={onDeleteType}
            onEditType={onEditType}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}
      </div>

      {/* Smart Pagination */}
      {getFilteredTypes.length > 0 && (
        <Card className="border-primary/10 bg-gradient-to-r from-background/95 to-primary/5 backdrop-blur-sm">
          <CardContent className="p-4">
            <SmartPagination
              currentPage={paginationCurrentPage}
              totalPages={paginationTotalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[10, 15, 25, 50, 100]}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentTypesContent;
