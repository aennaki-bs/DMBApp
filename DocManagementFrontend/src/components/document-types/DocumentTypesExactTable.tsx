import { useState } from "react";
import { toast } from "sonner";
import { DocumentType } from "@/models/document";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Filter,
  X,
  Search,
  RefreshCw,
  FileText,
  Tag,
  Package,
  Hash,
  MoreHorizontal,
  Edit,
  Trash2,
  Building2,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";
import { BulkActionsBar } from "@/components/shared/BulkActionsBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

const DEFAULT_DOCUMENT_TYPE_SEARCH_FIELDS = [
  { id: "all", label: "All Fields" },
  { id: "typeName", label: "Type Name" },
  { id: "typeCode", label: "Type Code" },
  { id: "description", label: "Description" },
];

interface DocumentTypesExactTableProps {
  types: DocumentType[];
  selectedTypes: number[];
  onSelectType: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteType: (id: number) => void;
  onEditType: (type: DocumentType) => void;
  isLoading: boolean;
}

export function DocumentTypesExactTable({
  types,
  selectedTypes,
  onSelectType,
  onSelectAll,
  onDeleteType,
  onEditType,
  isLoading,
}: DocumentTypesExactTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [sortField, setSortField] = useState<string>("typeName");
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
    if (!sortField) return 0;

    let aValue: any = a[sortField as keyof DocumentType];
    let bValue: any = b[sortField as keyof DocumentType];

    if (sortField === "documentCounter") {
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
    data: sortedAndFilteredTypes,
    initialPageSize: 15,
  });

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterOpen(false);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
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

  // Handle select all for paginated data
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl table-glass-loading shadow-lg">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              <p className="table-glass-loading-text">
                Loading document types...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const eligibleTypes = paginatedTypes.filter(
    (type) => (type.documentCounter || 0) === 0
  );
  const selectedEligibleTypes = eligibleTypes.filter((type) =>
    selectedTypes.includes(type.id!)
  );

  const isAllSelected =
    eligibleTypes.length > 0 &&
    selectedEligibleTypes.length === eligibleTypes.length;
  const isIndeterminate =
    selectedEligibleTypes.length > 0 &&
    selectedEligibleTypes.length < eligibleTypes.length;

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

            {/* Filter Button */}
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-9 px-3 text-xs table-search-text hover:table-search-text-hover transition-all duration-200 ${
                    searchQuery ? "table-glass-badge" : ""
                  }`}
                >
                  <Filter className="h-3.5 w-3.5 mr-1.5" />
                  Filter
                  {searchQuery && (
                    <span className="ml-1 px-1.5 py-0.5 bg-primary/20 text-primary rounded text-xs">
                      1
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-72 p-4 table-search-select shadow-xl rounded-lg"
                align="end"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm table-search-text">
                      Active Filters
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-6 px-2 text-xs table-search-text hover:table-search-text-hover transition-colors duration-200"
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {searchQuery && (
                      <div className="flex items-center justify-between p-2 table-search-select rounded-lg">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium table-search-text">
                            Search Query
                          </span>
                          <span className="text-xs table-search-text/70 truncate max-w-[200px]">
                            "{searchQuery}"
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchQuery("")}
                          className="h-6 w-6 p-0 table-search-text hover:table-search-text-hover transition-colors duration-200"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

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

      {/* Modern Document Type Table - EXACT same style as Responsibility Centre */}
      <div className="flex-1 relative overflow-hidden rounded-2xl table-glass-container min-h-0 shadow-xl">
        {sortedAndFilteredTypes.length > 0 ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Fixed Header with Glass Effect */}
            <div className="flex-shrink-0 overflow-x-auto table-glass-header border-b border-border/20">
              <div className="min-w-[930px]">
                <Table className="table-fixed w-full">
                  <TableHeader className="sticky top-0 z-10">
                    <TableRow className="border-border/20 hover:bg-muted/30 transition-colors duration-200 document-type-table-layout">
                      {/* Checkbox Column */}
                      <TableHead className="py-3 table-cell-center">
                        <Checkbox
                          enhanced={true}
                          size="sm"
                          checked={isAllSelected}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all"
                          className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          ref={(el) => {
                            if (el && el.querySelector) {
                              const input = el.querySelector(
                                'input[type="checkbox"]'
                              ) as HTMLInputElement;
                              if (input) input.indeterminate = isIndeterminate;
                            }
                          }}
                        />
                      </TableHead>

                      {/* Type Code Column */}
                      <TableHead className="py-3 table-cell-start">
                        <button
                          className="h-8 px-2 -ml-2 text-xs font-medium hover:bg-accent/50 flex items-center gap-1 rounded-md transition-all duration-200 hover:shadow-sm"
                          onClick={() => handleSort("typeKey")}
                        >
                          <Tag className="h-3.5 w-3.5 mr-1" />
                          Type Code
                        </button>
                      </TableHead>

                      {/* Type Name Column */}
                      <TableHead className="py-3 table-cell-start">
                        <button
                          className="h-8 px-2 -ml-2 text-xs font-medium hover:bg-accent/50 flex items-center gap-1 rounded-md transition-all duration-200 hover:shadow-sm"
                          onClick={() => handleSort("typeName")}
                        >
                          <FileText className="h-3.5 w-3.5 mr-1" />
                          Type Name
                        </button>
                      </TableHead>

                      {/* Description Column */}
                      <TableHead className="py-3 table-cell-start max-md:hidden">
                        <button
                          className="h-8 px-2 -ml-2 text-xs font-medium hover:bg-accent/50 flex items-center gap-1 rounded-md transition-all duration-200 hover:shadow-sm"
                          onClick={() => handleSort("typeAttr")}
                        >
                          Description
                        </button>
                      </TableHead>

                      {/* Tier Type Column */}
                      <TableHead className="py-3 table-cell-center">
                        <button
                          className="h-8 px-2 -ml-2 text-xs font-medium hover:bg-accent/50 flex items-center gap-1 rounded-md transition-all duration-200 hover:shadow-sm"
                          onClick={() => handleSort("tierType")}
                        >
                          <Package className="h-3.5 w-3.5 mr-1" />
                          Tier Type
                        </button>
                      </TableHead>

                      {/* Documents Column */}
                      <TableHead className="py-3 table-cell-center max-md:hidden">
                        <button
                          className="h-8 px-2 -ml-2 text-xs font-medium hover:bg-accent/50 flex items-center gap-1 rounded-md transition-all duration-200 hover:shadow-sm"
                          onClick={() => handleSort("documentCounter")}
                        >
                          <Hash className="h-3.5 w-3.5 mr-1" />
                          Documents
                        </button>
                      </TableHead>

                      {/* Actions Column */}
                      <TableHead className="py-3 table-cell-center">
                        <span className="text-xs font-medium text-muted-foreground">
                          Actions
                        </span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
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
                    <TableBody>
                      {paginatedTypes.map((type) => {
                        const isSelected = type.id
                          ? selectedTypes.includes(type.id)
                          : false;
                        const canBeDeleted = (type.documentCounter || 0) === 0;

                        const handleRowClick = (event: React.MouseEvent) => {
                          // Don't trigger row selection if clicking on action buttons or links
                          const target = event.target as HTMLElement;
                          const isActionElement = target.closest(
                            'button, a, [role="button"], .dropdown-trigger'
                          );

                          if (!isActionElement && canBeDeleted && type.id) {
                            onSelectType(type.id, !isSelected);
                          }
                        };

                        const handleSelectChange = () => {
                          if (type.id && canBeDeleted) {
                            onSelectType(type.id, !isSelected);
                          }
                        };

                        const getTierTypeBadgeColor = (tierType: any) => {
                          const tierString = String(
                            tierType || ""
                          ).toLowerCase();
                          switch (tierString) {
                            case "primary":
                              return isSelected
                                ? "bg-blue-500/30 text-blue-400 border-blue-500/40"
                                : "bg-blue-500/20 text-blue-400 border-blue-500/30";
                            case "secondary":
                              return isSelected
                                ? "bg-green-500/30 text-green-400 border-green-500/40"
                                : "bg-green-500/20 text-green-400 border-green-500/30";
                            case "tertiary":
                              return isSelected
                                ? "bg-purple-500/30 text-purple-400 border-purple-500/40"
                                : "bg-purple-500/20 text-purple-400 border-purple-500/30";
                            default:
                              return isSelected
                                ? "bg-gray-500/30 text-gray-400 border-gray-500/40"
                                : "bg-gray-500/20 text-gray-400 border-gray-500/30";
                          }
                        };

                        return (
                          <TableRow
                            key={type.id}
                            className={`document-type-table-layout transition-all duration-200 cursor-pointer select-none ${
                              isSelected
                                ? "bg-primary/10 border-primary/30 shadow-sm"
                                : "hover:bg-muted/30"
                            } ${!canBeDeleted ? "opacity-60" : ""}`}
                            onClick={handleRowClick}
                          >
                            {/* Selection Column */}
                            <TableCell className="py-4 table-cell-center">
                              <Checkbox
                                enhanced={true}
                                size="sm"
                                checked={isSelected}
                                disabled={!canBeDeleted}
                                onCheckedChange={handleSelectChange}
                                className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
                              />
                            </TableCell>

                            {/* Type Code Column */}
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
                                    ID: {type.id || "N/A"}
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            {/* Type Name Column */}
                            <TableCell className="py-4 table-cell-start">
                              <div className="flex flex-col">
                                <span
                                  className={`font-medium text-foreground ${
                                    isSelected
                                      ? "text-primary"
                                      : "text-foreground"
                                  }`}
                                >
                                  {type.typeName || "Unnamed Type"}
                                </span>
                              </div>
                            </TableCell>

                            {/* Description Column */}
                            <TableCell className="py-4 table-cell-start max-md:hidden">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                                  {type.typeAttr || "No description"}
                                </span>
                              </div>
                            </TableCell>

                            {/* Tier Type Column */}
                            <TableCell className="py-4 table-cell-center">
                              {type.tierType ? (
                                <Badge
                                  variant="secondary"
                                  className={`text-xs px-2 py-1 transition-colors duration-200 ${getTierTypeBadgeColor(
                                    type.tierType
                                  )}`}
                                >
                                  <Package className="h-3 w-3 mr-1" />
                                  {String(type.tierType)}
                                </Badge>
                              ) : (
                                <div className="flex items-center gap-1.5 text-gray-400">
                                  <Package className="h-3.5 w-3.5" />
                                  <span className="text-xs">None</span>
                                </div>
                              )}
                            </TableCell>

                            {/* Documents Column */}
                            <TableCell className="py-4 table-cell-center max-md:hidden">
                              <Badge
                                variant="secondary"
                                className={`text-xs px-2 py-1 transition-colors duration-200 ${
                                  isSelected
                                    ? "bg-green-500/30 text-green-400 border-green-500/40"
                                    : "bg-green-500/20 text-green-400 border-green-500/30"
                                }`}
                              >
                                <Hash className="h-3 w-3 mr-1" />
                                {type.documentCounter || 0}
                              </Badge>
                            </TableCell>

                            {/* Actions Column */}
                            <TableCell className="py-4 table-cell-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-primary/10"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="bg-background/95 backdrop-blur-sm border-primary/20"
                                >
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditType(type);
                                    }}
                                    className="cursor-pointer hover:bg-primary/10"
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                  </DropdownMenuItem>

                                  {canBeDeleted ? (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        type.id && onDeleteType(type.id);
                                      }}
                                      className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      <span>Delete</span>
                                    </DropdownMenuItem>
                                  ) : (
                                    <div className="relative flex cursor-not-allowed items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors opacity-50">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      <span>Delete</span>
                                    </div>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
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
      {sortedAndFilteredTypes.length > 0 && (
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
