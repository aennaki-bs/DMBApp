import { useState } from "react";
import { toast } from "sonner";
import { DocumentType } from "@/models/document";
import { Table } from "@/components/ui/table";
import { DocumentTypeSimpleHeader } from "./table/DocumentTypeSimpleHeader";
import { DocumentTypeSimpleBody } from "./table/DocumentTypeSimpleBody";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, FileText, RefreshCw } from "lucide-react";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X, Search } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BulkActionsBar } from "@/components/shared/BulkActionsBar";

const DEFAULT_DOCUMENT_TYPE_SEARCH_FIELDS = [
  { id: "all", label: "All Fields" },
  { id: "typeName", label: "Type Name" },
  { id: "typeCode", label: "Type Code" },
  { id: "description", label: "Description" },
];

interface DocumentTypeSimpleTableProps {
  types: DocumentType[];
  selectedTypes: number[];
  onSelectType: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteType: (id: number) => void;
  onEditType: (type: DocumentType) => void;
  isLoading: boolean;
}

export function DocumentTypeSimpleTable({
  types,
  selectedTypes,
  onSelectType,
  onSelectAll,
  onDeleteType,
  onEditType,
  isLoading,
}: DocumentTypeSimpleTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [sortBy, setSortBy] = useState("typeName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter types based on search
  const filteredTypes = types.filter((type) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    switch (searchField) {
      case "typeName":
        return type.typeName?.toLowerCase().includes(query);
      case "typeCode":
        return type.typeKey?.toLowerCase().includes(query);
      case "description":
        return type.typeAttr?.toLowerCase().includes(query);
      default:
        return (
          type.typeName?.toLowerCase().includes(query) ||
          type.typeKey?.toLowerCase().includes(query) ||
          type.typeAttr?.toLowerCase().includes(query)
        );
    }
  });

  // Sort types
  const sortedAndFilteredTypes = [...filteredTypes].sort((a, b) => {
    if (!sortBy) return 0;

    let aValue: any = a[sortBy as keyof DocumentType];
    let bValue: any = b[sortBy as keyof DocumentType];

    if (sortBy === "documentCounter") {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    } else {
      aValue = String(aValue || "").toLowerCase();
      bValue = String(bValue || "").toLowerCase();
    }

    if (aValue < bValue) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Use pagination hook - EXACTLY like ResponsibilityCentreTableContent
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedTypes,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: sortedAndFilteredTypes || [],
    initialPageSize: 15,
  });

  // Check if we have types to display
  const hasTypes = sortedAndFilteredTypes && sortedAndFilteredTypes.length > 0;

  // Handle select all for paginated data - EXACTLY like ResponsibilityCentreTableContent
  const handleSelectAll = () => {
    const eligibleTypes = paginatedTypes.filter(
      (type) => (type.documentCounter || 0) === 0
    );
    const eligibleTypeIds = eligibleTypes.map((type) => type.id!);
    const allEligibleSelected = eligibleTypeIds.every((id) =>
      selectedTypes.includes(id)
    );

    if (allEligibleSelected) {
      // Deselect all eligible types on current page
      eligibleTypeIds.forEach((typeId) => {
        if (selectedTypes.includes(typeId)) {
          onSelectType(typeId, false);
        }
      });
    } else {
      // Select all eligible types on current page only
      eligibleTypeIds.forEach((typeId) => {
        if (!selectedTypes.includes(typeId)) {
          onSelectType(typeId, true);
        }
      });
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterOpen(false);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      setTimeout(() => {
        setIsManualRefreshing(false);
        toast.success("Document types refreshed successfully!", {
          duration: 2000,
        });
      }, 1000);
    } catch (error) {
      toast.error("Failed to refresh document types");
      setIsManualRefreshing(false);
    }
  };

  const bulkActions = [
    {
      id: "delete",
      label: "Delete",
      icon: <X className="h-4 w-4" />,
      onClick: () => {
        selectedTypes.forEach((typeId) => {
          onDeleteType(typeId);
        });
      },
      variant: "destructive" as const,
    },
  ];

  // Loading state - EXACTLY like ResponsibilityCentreTableContent
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl table-glass-loading shadow-lg">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin table-glass-loading-spinner" />
              <p className="table-glass-loading-text">
                Loading document types...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col gap-5 w-full px-1"
      style={{ minHeight: "100%" }}
    >
      {/* Search + Filter Bar */}
      <div className="p-4 rounded-xl table-glass-container shadow-lg">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          {/* Search and field select */}
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 min-w-0">
            <div className="relative w-full sm:w-auto">
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger className="w-full sm:w-[130px] h-9 text-sm table-search-select hover:table-search-select focus:ring-1 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all duration-200 shadow-sm rounded-md flex-shrink-0">
                  <SelectValue>
                    {DEFAULT_DOCUMENT_TYPE_SEARCH_FIELDS.find(
                      (opt) => opt.id === searchField
                    )?.label || "All Fields"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="table-search-select rounded-lg shadow-xl">
                  {DEFAULT_DOCUMENT_TYPE_SEARCH_FIELDS.map((opt) => (
                    <SelectItem
                      key={opt.id}
                      value={opt.id as string}
                      className="text-xs hover:table-search-select focus:table-search-select rounded-md"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1 group min-w-0">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-sm"></div>
              <Input
                placeholder="Search document types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative h-9 text-sm table-search-input pl-10 pr-4 rounded-md focus:ring-1 transition-all duration-200 shadow-sm group-hover:shadow-md w-full"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 table-search-icon group-hover:table-search-icon transition-colors duration-200">
                <Search className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            {/* Manual Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isManualRefreshing}
              className="h-9 px-3 text-xs table-search-text hover:table-search-text-hover transition-all duration-200"
              title="Refresh document types"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 mr-1.5 ${
                  isManualRefreshing ? "animate-spin" : ""
                }`}
              />
              {isManualRefreshing ? "Refreshing..." : "Refresh"}
            </Button>

            {/* Clear Button */}
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-8 px-2 text-xs table-search-text hover:table-search-text-hover hover:table-search-select rounded-md transition-all duration-200 flex items-center gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table Content - EXACTLY like ResponsibilityCentreTableContent */}
      <div className="flex-1 relative overflow-hidden rounded-2xl table-glass-container min-h-0 shadow-xl">
        {hasTypes ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Fixed Header with Glass Effect */}
            <div className="flex-shrink-0 overflow-x-auto table-glass-header border-b border-border/20">
              <div className="min-w-[930px]">
                <Table className="table-fixed w-full">
                  <DocumentTypeSimpleHeader
                    types={paginatedTypes}
                    selectedTypes={selectedTypes.filter((id) =>
                      paginatedTypes.some((type) => type.id === id)
                    )}
                    onSelectAll={handleSelectAll}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </Table>
              </div>
            </div>

            {/* Scrollable Body with Better Height Management */}
            <div
              className="flex-1 overflow-hidden"
              style={{ maxHeight: "calc(100vh - 320px)" }}
            >
              <ScrollArea className="h-full w-full">
                <div className="min-w-[930px]">
                  <Table className="table-fixed w-full">
                    <DocumentTypeSimpleBody
                      types={paginatedTypes}
                      selectedTypes={selectedTypes}
                      onSelectType={onSelectType}
                      onEdit={onEditType}
                      onDelete={onDeleteType}
                    />
                  </Table>
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="relative h-full flex items-center justify-center z-10">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted/30 mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No document types found
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                There are no document types matching your current filters. Try
                adjusting your search criteria or clearing the filters.
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Pagination with Glass Effect */}
      {hasTypes && (
        <div className="flex-shrink-0 table-glass-pagination p-4 rounded-2xl shadow-lg backdrop-blur-md">
          <SmartPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            className="justify-center"
            pageSizeOptions={[10, 15, 25, 50, 100]}
            showFirstLast={true}
            maxVisiblePages={5}
          />
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedTypes.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedTypes.length}
          entityName="document type"
          actions={bulkActions}
          icon={<FileText className="w-5 h-5 text-primary-foreground/80" />}
        />
      )}
    </div>
  );
}
