import { useState } from "react";
import { DocumentType } from "@/models/document";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  FileText,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";
import { BulkActionsBar } from "../responsibility-centre/table/BulkActionsBar";

interface DocumentTypeWorkingTableProps {
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

export function DocumentTypeWorkingTable({
  types = [],
  selectedTypes,
  onSelectType,
  onSelectAll,
  onDeleteType,
  onEditType,
  isLoading,
}: DocumentTypeWorkingTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [sortBy, setSortBy] = useState("typeName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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

  // Pagination
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedTypes,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: sortedTypes,
    initialPageSize: 15,
  });

  const hasTypes = sortedTypes.length > 0;

  // Calculate eligible types and selection state based on the full dataset
  const eligibleTypes = sortedTypes.filter(
    (type) => (type.documentCounter || 0) === 0
  );
  const eligibleTypeIds = eligibleTypes.map((type) => type.id!);
  const selectedEligibleTypes = eligibleTypeIds.filter((id) =>
    selectedTypes.includes(id)
  );
  const isAllEligibleSelected =
    eligibleTypes.length > 0 &&
    selectedEligibleTypes.length === eligibleTypes.length;

  const getTierTypeColor = (tierType: string | undefined) => {
    switch (String(tierType || "").toLowerCase()) {
      case "primary":
        return "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20";
      case "secondary":
        return "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20";
      case "tertiary":
        return "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20 border-gray-500/20";
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

  const handleSelectAll = () => {
    // Work with all eligible types from the full dataset, not just current page
    const eligibleTypes = sortedTypes.filter(
      (type) => (type.documentCounter || 0) === 0
    );
    const eligibleTypeIds = eligibleTypes.map((type) => type.id!);
    const allEligibleSelected = eligibleTypeIds.every((id) =>
      selectedTypes.includes(id)
    );

    if (allEligibleSelected) {
      // Deselect all eligible types
      eligibleTypeIds.forEach((typeId) => {
        if (selectedTypes.includes(typeId)) {
          onSelectType(typeId, false);
        }
      });
    } else {
      // Select all eligible types
      eligibleTypeIds.forEach((typeId) => {
        if (!selectedTypes.includes(typeId)) {
          onSelectType(typeId, true);
        }
      });
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
  };

  const handleBulkDelete = () => {
    selectedTypes.forEach((typeId) => onDeleteType(typeId));
  };

  const handleClearSelection = () => {
    selectedTypes.forEach((typeId) => onSelectType(typeId, false));
  };

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

      {/* Results Summary */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <FileText className="h-4 w-4" />
        <span className="text-sm">
          Showing {paginatedTypes.length} of {sortedTypes.length} document types
          {types.length !== sortedTypes.length && ` (${types.length} total)`}
          {selectedTypes.length > 0 && (
            <span className="ml-2 text-primary font-medium">
              • {selectedTypes.length} selected
            </span>
          )}
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 relative overflow-hidden rounded-2xl table-glass-container min-h-0 shadow-xl">
        {hasTypes ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Single Scroll Container - Header and Body Together */}
            <div className="flex-1 overflow-auto">
              <div className="min-w-[800px]">
                <Table className="table-fixed w-full">
                  {/* Sticky Header */}
                  <TableHeader className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm">
                    <TableRow className="table-glass-header-row hover:table-glass-header-row border-b border-border/10 document-types-table-layout">
                      <TableHead className="py-3 table-cell-center">
                        <Checkbox
                          enhanced={true}
                          size="sm"
                          checked={isAllEligibleSelected}
                          onCheckedChange={handleSelectAll}
                          disabled={eligibleTypes.length === 0}
                          aria-label="Select all"
                          className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          ref={(el) => {
                            if (el && el.querySelector) {
                              const input = el.querySelector(
                                'input[type="checkbox"]'
                              ) as HTMLInputElement;
                              if (input) {
                                input.indeterminate =
                                  selectedTypes.length > 0 &&
                                  selectedTypes.length < eligibleTypes.length;
                              }
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead className="py-3 table-cell-start">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("typeKey")}
                          className="h-auto p-0 font-medium"
                        >
                          Type Code
                        </Button>
                      </TableHead>
                      <TableHead className="py-3 table-cell-start">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("typeName")}
                          className="h-auto p-0 font-medium"
                        >
                          Type Name
                        </Button>
                      </TableHead>
                      <TableHead className="py-3 table-cell-start max-md:hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("typeAttr")}
                          className="h-auto p-0 font-medium"
                        >
                          Description
                        </Button>
                      </TableHead>
                      <TableHead className="py-3 table-cell-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("tierType")}
                          className="h-auto p-0 font-medium"
                        >
                          Tier Type
                        </Button>
                      </TableHead>
                      <TableHead className="py-3 table-cell-center max-md:hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("documentCounter")}
                          className="h-auto p-0 font-medium"
                        >
                          Documents
                        </Button>
                      </TableHead>
                      <TableHead className="py-3 table-cell-center">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  {/* Table Body */}
                  <TableBody>
                    {paginatedTypes.map((type, index) => {
                      if (!type) return null;

                      const isSelected = selectedTypes.includes(type.id!);
                      const canSelect = (type.documentCounter || 0) === 0;
                      const isEvenRow = index % 2 === 0;

                      return (
                        <TableRow
                          key={type.id || index}
                          className={`
                            cursor-pointer table-glass-row hover:table-glass-row-hover relative
                            ${
                              isSelected
                                ? "bg-primary/10 border-primary/30 shadow-sm"
                                : "hover:bg-muted/30"
                            }
                            ${
                              isEvenRow
                                ? "table-glass-row-even"
                                : "table-glass-row-odd"
                            }
                            transition-all duration-200 border-b border-border/5 document-types-table-layout
                            ${!canSelect ? "opacity-60" : ""}
                          `}
                          onClick={() => {
                            if (canSelect) {
                              onSelectType(type.id!, !isSelected);
                            }
                          }}
                          style={
                            isSelected
                              ? {
                                  borderLeft: "4px solid hsl(var(--primary))",
                                  background:
                                    "linear-gradient(90deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.05) 100%)",
                                }
                              : {}
                          }
                        >
                          <TableCell className="py-4 table-cell-center">
                            <Checkbox
                              enhanced={true}
                              size="sm"
                              checked={isSelected}
                              onCheckedChange={(checked: boolean) => {
                                if (canSelect) {
                                  onSelectType(type.id!, checked);
                                }
                              }}
                              disabled={!canSelect}
                              onClick={(e) => e.stopPropagation()}
                              className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          </TableCell>

                          <TableCell className="py-4 table-cell-start">
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className="flex-shrink-0">
                                <div
                                  className={`h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center transition-all duration-200 ${
                                    isSelected
                                      ? "from-primary/30 to-primary/20 border-primary/40 shadow-sm"
                                      : ""
                                  }`}
                                >
                                  <FileText className="h-5 w-5 text-primary" />
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div
                                  className={`text-sm font-medium truncate transition-colors duration-200 ${
                                    isSelected
                                      ? "text-primary"
                                      : "text-foreground"
                                  }`}
                                >
                                  {type.typeKey || "N/A"}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  ID: {type.id}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="py-4 table-cell-start">
                            <span className="text-sm truncate max-w-[180px] block">
                              {type.typeName || "Unnamed Type"}
                            </span>
                          </TableCell>

                          <TableCell className="py-4 table-cell-start max-md:hidden">
                            {type.typeAttr ? (
                              <span className="text-sm truncate max-w-[250px] block">
                                {type.typeAttr}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground italic">
                                No description
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="py-4 table-cell-center">
                            <Badge
                              variant="secondary"
                              className={`text-xs px-2 py-1 transition-colors duration-200 capitalize ${
                                isSelected
                                  ? getTierTypeColor(
                                      String(type.tierType || "")
                                    )
                                  : getTierTypeColor(
                                      String(type.tierType || "")
                                    )
                                      .replace("/30", "/20")
                                      .replace("/40", "/30")
                              }`}
                            >
                              {type.tierType || "Unknown"}
                            </Badge>
                          </TableCell>

                          <TableCell className="py-4 table-cell-center max-md:hidden">
                            <Badge
                              variant="secondary"
                              className={`text-xs px-2 py-1 transition-colors duration-200 ${
                                isSelected
                                  ? "bg-green-500/30 text-green-400 border-green-500/40"
                                  : "bg-green-500/20 text-green-400 border-green-500/30"
                              }`}
                            >
                              {type.documentCounter || 0}
                            </Badge>
                          </TableCell>

                          <TableCell className="py-4 table-cell-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditType(type);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteType(type.id!);
                                  }}
                                  disabled={!canSelect}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
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
                There are no document types matching your current filters.
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={clearAllFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
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

      {/* Bulk Actions - using the exact same pattern as ResponsibilityCentreTable */}
      {selectedTypes.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedTypes.length}
          totalCount={sortedTypes.length}
          onDelete={handleBulkDelete}
          onClearSelection={handleClearSelection}
        />
      )}
    </div>
  );
}
