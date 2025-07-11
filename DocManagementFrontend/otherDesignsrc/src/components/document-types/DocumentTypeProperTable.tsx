import { useState } from "react";
import { DocumentType } from "@/models/document";
import { Table } from "@/components/ui/table";
import { DocumentTypeTableHeader } from "./table/DocumentTypeTableHeader";
import { DocumentTypeTableBody } from "./table/DocumentTypeTableBody";
import { DocumentTypeTableEmpty } from "./table/DocumentTypeTableEmpty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BulkActionsBar } from "@/components/shared/BulkActionsBar";

interface DocumentTypeProperTableProps {
  types: DocumentType[];
  selectedTypes: number[];
  onSelectType: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteType: (id: number) => void;
  onEditType: (type: DocumentType) => void;
  isLoading: boolean;
}

const DEFAULT_SEARCH_FIELDS = [
  { id: "all", label: "All Fields" },
  { id: "typeName", label: "Type Name" },
  { id: "typeCode", label: "Type Code" },
  { id: "description", label: "Description" },
];

export function DocumentTypeProperTable({
  types,
  selectedTypes,
  onSelectType,
  onSelectAll,
  onDeleteType,
  onEditType,
  isLoading = false,
}: DocumentTypeProperTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [sortBy, setSortBy] = useState("typeName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filter types based on search - EXACTLY like ResponsibilityCentreTableContent
  const filteredTypes =
    types?.filter((type) => {
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
    }) || [];

  // Sort types
  const sortedTypes = [...filteredTypes].sort((a, b) => {
    let aValue: any = a[sortBy as keyof DocumentType];
    let bValue: any = b[sortBy as keyof DocumentType];

    if (sortBy === "documentCounter") {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    } else {
      aValue = String(aValue || "").toLowerCase();
      bValue = String(bValue || "").toLowerCase();
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
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
    data: sortedTypes || [],
    initialPageSize: 15,
  });

  // Check if we have types to display
  const hasTypes = sortedTypes && sortedTypes.length > 0;

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

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
  };

  const bulkActions = [
    {
      id: "delete",
      label: "Delete",
      icon: <X className="h-4 w-4" />,
      onClick: () => {
        selectedTypes.forEach((typeId) => onDeleteType(typeId));
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
      className={`h-full flex flex-col gap-4 w-full px-1`}
      style={{ minHeight: "100%" }}
    >
      {/* Search Bar */}
      <div className="p-4 rounded-xl table-glass-container shadow-lg">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 min-w-0">
            <div className="relative w-full sm:w-auto">
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger className="w-full sm:w-[130px] h-9 text-sm table-search-select">
                  <SelectValue>
                    {DEFAULT_SEARCH_FIELDS.find((opt) => opt.id === searchField)
                      ?.label || "All Fields"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="table-search-select rounded-lg shadow-xl">
                  {DEFAULT_SEARCH_FIELDS.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1 group min-w-0">
              <Input
                placeholder="Search document types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative h-9 text-sm table-search-input pl-10 pr-4 rounded-md w-full"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 table-search-icon">
                <Search className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-8 px-2 text-xs"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modern Document Types Table - EXACTLY like ResponsibilityCentreTableContent */}
      <div className="flex-1 relative overflow-hidden rounded-2xl table-glass-container min-h-0 shadow-xl">
        {hasTypes ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Fixed Header with Glass Effect */}
            <div className="flex-shrink-0 overflow-x-auto table-glass-header border-b border-border/20">
              <div className="min-w-[930px]">
                <Table className="table-fixed w-full">
                  <DocumentTypeTableHeader
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
                    <DocumentTypeTableBody
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
            <DocumentTypeTableEmpty onClearFilters={clearAllFilters} />
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
