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

const DEFAULT_DOCUMENT_TYPE_SEARCH_FIELDS = [
  { id: "all", label: "All Fields" },
  { id: "typeName", label: "Type Name" },
  { id: "typeCode", label: "Type Code" },
  { id: "description", label: "Description" },
];

interface DocumentTypesCustomTableProps {
  types: DocumentType[];
  selectedTypes: number[];
  onSelectType: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteType: (id: number) => void;
  onEditType: (type: DocumentType) => void;
  isLoading: boolean;
}

export function DocumentTypesCustomTable({
  types,
  selectedTypes,
  onSelectType,
  onSelectAll,
  onDeleteType,
  onEditType,
  isLoading,
}: DocumentTypesCustomTableProps) {
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
    setTimeout(() => {
      setIsManualRefreshing(false);
      toast.success("Document types refreshed!");
    }, 1000);
  };

  const getTierTypeBadgeColor = (tierType: any) => {
    const tierString = String(tierType || "").toLowerCase();
    switch (tierString) {
      case "primary":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "secondary":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "tertiary":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
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
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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

      {/* Table */}
      <div className="flex-1 relative overflow-hidden rounded-2xl table-glass-container min-h-0 shadow-xl">
        {sortedAndFilteredTypes.length > 0 ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Header */}
            <div className="flex-shrink-0 table-glass-header border-b border-border/20 p-4">
              <div className="grid grid-cols-7 gap-4 items-center font-medium text-sm">
                <div className="text-center">
                  <Checkbox
                    checked={
                      selectedTypes.length ===
                        paginatedTypes.filter(
                          (t) => (t.documentCounter || 0) === 0
                        ).length &&
                      paginatedTypes.filter(
                        (t) => (t.documentCounter || 0) === 0
                      ).length > 0
                    }
                    onCheckedChange={(checked) => onSelectAll(!!checked)}
                  />
                </div>
                <div
                  className="cursor-pointer flex items-center gap-2"
                  onClick={() => handleSort("typeKey")}
                >
                  <Tag className="h-4 w-4" />
                  Type Code
                </div>
                <div
                  className="cursor-pointer flex items-center gap-2"
                  onClick={() => handleSort("typeName")}
                >
                  <FileText className="h-4 w-4" />
                  Type Name
                </div>
                <div
                  className="cursor-pointer"
                  onClick={() => handleSort("typeAttr")}
                >
                  Description
                </div>
                <div
                  className="text-center cursor-pointer flex items-center gap-2 justify-center"
                  onClick={() => handleSort("tierType")}
                >
                  <Package className="h-4 w-4" />
                  Tier Type
                </div>
                <div
                  className="text-center cursor-pointer flex items-center gap-2 justify-center"
                  onClick={() => handleSort("documentCounter")}
                >
                  <Hash className="h-4 w-4" />
                  Documents
                </div>
                <div className="text-center">Actions</div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-2">
                {paginatedTypes.map((type) => {
                  const isSelected = type.id
                    ? selectedTypes.includes(type.id)
                    : false;
                  const canBeDeleted = (type.documentCounter || 0) === 0;

                  return (
                    <div
                      key={type.id}
                      className={`grid grid-cols-7 gap-4 items-center p-4 rounded-lg border transition-all duration-200 ${
                        isSelected
                          ? "bg-primary/10 border-primary/30 shadow-sm"
                          : "bg-muted/20 border-border/20 hover:bg-muted/30"
                      } ${!canBeDeleted ? "opacity-60" : ""}`}
                    >
                      <div className="text-center">
                        <Checkbox
                          checked={isSelected}
                          disabled={!canBeDeleted}
                          onCheckedChange={(checked) =>
                            type.id && onSelectType(type.id, !!checked)
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange/20 to-orange/10 border border-orange/20 flex items-center justify-center">
                          <Tag className="h-4 w-4 text-orange" />
                        </div>
                        <span className="font-mono text-sm">
                          {type.typeKey || "N/A"}
                        </span>
                      </div>
                      <div className="font-medium">
                        {type.typeName || "N/A"}
                      </div>
                      <div className="text-muted-foreground text-sm truncate">
                        {type.typeAttr || "No description"}
                      </div>
                      <div className="text-center">
                        {type.tierType ? (
                          <Badge
                            variant="secondary"
                            className={`text-xs px-2 py-1 ${getTierTypeBadgeColor(
                              type.tierType
                            )}`}
                          >
                            <Package className="h-3 w-3 mr-1" />
                            {String(type.tierType)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </div>
                      <div className="text-center">
                        <Badge
                          variant="secondary"
                          className="bg-blue-500/20 text-blue-400 border-blue-500/30"
                        >
                          <Hash className="h-3 w-3 mr-1" />
                          {type.documentCounter || 0}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditType(type)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => type.id && onDeleteType(type.id)}
                              disabled={!canBeDeleted}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative h-full flex items-center justify-center z-10">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No document types found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
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
