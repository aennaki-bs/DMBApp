import { useState, useMemo } from "react";
import { DocumentType } from "@/models/document";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Search,
  Filter,
  RefreshCw,
  X,
  FileText,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
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
import { BulkActionsBar } from "@/components/shared/BulkActionsBar";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";

interface DocumentTypeDirectTableProps {
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

export function DocumentTypeDirectTable({
  types = [],
  selectedTypes,
  onSelectType,
  onSelectAll,
  onDeleteType,
  onEditType,
  isLoading,
}: DocumentTypeDirectTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [sortBy, setSortBy] = useState("typeName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filter types based on search
  const filteredTypes = useMemo(() => {
    if (!searchQuery.trim()) return types;

    const query = searchQuery.toLowerCase();
    return types.filter((type) => {
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
  }, [types, searchQuery, searchField]);

  // Sort types
  const sortedTypes = useMemo(() => {
    return [...filteredTypes].sort((a, b) => {
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
  }, [filteredTypes, sortBy, sortDirection]);

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

  const getSortIcon = (field: string) => {
    if (sortBy === field) {
      return sortDirection === "asc" ? (
        <ArrowUp className="ml-1 h-3 w-3" />
      ) : (
        <ArrowDown className="ml-1 h-3 w-3" />
      );
    }
    return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
  };

  const handleSelectAll = () => {
    const eligibleTypes = paginatedTypes.filter(
      (type) => (type.documentCounter || 0) === 0
    );
    const eligibleTypeIds = eligibleTypes.map((type) => type.id!);
    const allEligibleSelected = eligibleTypeIds.every((id) =>
      selectedTypes.includes(id)
    );

    if (allEligibleSelected) {
      eligibleTypeIds.forEach((typeId) => {
        if (selectedTypes.includes(typeId)) {
          onSelectType(typeId, false);
        }
      });
    } else {
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

  const eligibleTypes = paginatedTypes.filter(
    (type) => (type.documentCounter || 0) === 0
  );
  const isAllEligibleSelected =
    eligibleTypes.length > 0 &&
    eligibleTypes.every((type) => selectedTypes.includes(type.id!));
  const isIndeterminate = selectedTypes.length > 0 && !isAllEligibleSelected;

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl table-glass-loading shadow-lg">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="h-8 w-8 animate-spin table-glass-loading-spinner" />
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

      {/* Table */}
      <div className="flex-1 relative overflow-hidden rounded-2xl table-glass-container min-h-0 shadow-xl">
        {hasTypes ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Header */}
            <div className="flex-shrink-0 overflow-x-auto table-glass-header border-b border-border/20">
              <div className="min-w-[930px]">
                <Table className="table-fixed w-full">
                  <TableHeader className="sticky top-0 z-20">
                    <TableRow className="table-glass-header-row hover:table-glass-header-row border-b border-border/10">
                      <TableHead className="w-[60px] text-center">
                        <Checkbox
                          checked={isAllEligibleSelected}
                          ref={(el) => {
                            if (el) {
                              (el as any).indeterminate = isIndeterminate;
                            }
                          }}
                          onCheckedChange={handleSelectAll}
                          disabled={eligibleTypes.length === 0}
                        />
                      </TableHead>
                      <TableHead className="w-[120px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("typeKey")}
                          className="h-auto p-0 font-medium"
                        >
                          Type Code {getSortIcon("typeKey")}
                        </Button>
                      </TableHead>
                      <TableHead className="w-[200px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("typeName")}
                          className="h-auto p-0 font-medium"
                        >
                          Type Name {getSortIcon("typeName")}
                        </Button>
                      </TableHead>
                      <TableHead className="w-[300px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("typeAttr")}
                          className="h-auto p-0 font-medium"
                        >
                          Description {getSortIcon("typeAttr")}
                        </Button>
                      </TableHead>
                      <TableHead className="w-[120px] text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("tierType")}
                          className="h-auto p-0 font-medium"
                        >
                          Tier Type {getSortIcon("tierType")}
                        </Button>
                      </TableHead>
                      <TableHead className="w-[100px] text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("documentCounter")}
                          className="h-auto p-0 font-medium"
                        >
                          Documents {getSortIcon("documentCounter")}
                        </Button>
                      </TableHead>
                      <TableHead className="w-[80px] text-center">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
              </div>
            </div>

            {/* Body */}
            <div
              className="flex-1 overflow-hidden"
              style={{ maxHeight: "calc(100vh - 320px)" }}
            >
              <ScrollArea className="h-full w-full">
                <div className="min-w-[930px]">
                  <Table className="table-fixed w-full">
                    <TableBody>
                      {paginatedTypes.map((type, index) => {
                        const isSelected = selectedTypes.includes(type.id!);
                        const canSelect = (type.documentCounter || 0) === 0;
                        const isEvenRow = index % 2 === 0;

                        return (
                          <TableRow
                            key={type.id || index}
                            className={`
                              cursor-pointer table-glass-row hover:table-glass-row-hover
                              ${isSelected ? "table-glass-row-selected" : ""}
                              ${
                                isEvenRow
                                  ? "table-glass-row-even"
                                  : "table-glass-row-odd"
                              }
                              transition-all duration-150 border-b border-border/5
                            `}
                            onClick={() => {
                              if (canSelect) {
                                onSelectType(type.id!, !isSelected);
                              }
                            }}
                          >
                            <TableCell className="w-[60px] text-center">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked: boolean) => {
                                  if (canSelect) {
                                    onSelectType(type.id!, checked);
                                  }
                                }}
                                disabled={!canSelect}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </TableCell>

                            <TableCell className="w-[120px]">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg table-glass-avatar flex items-center justify-center shadow-sm">
                                  <FileText className="h-4 w-4 table-glass-avatar-icon" />
                                </div>
                                <p className="font-medium text-sm table-glass-text truncate">
                                  {type.typeKey || "N/A"}
                                </p>
                              </div>
                            </TableCell>

                            <TableCell className="w-[200px]">
                              <div className="font-medium text-sm table-glass-text truncate">
                                {type.typeName || "Unnamed Type"}
                              </div>
                            </TableCell>

                            <TableCell className="w-[300px]">
                              <div className="text-sm table-glass-text-muted truncate">
                                {type.typeAttr || "No description"}
                              </div>
                            </TableCell>

                            <TableCell className="w-[120px] text-center">
                              <Badge
                                variant="outline"
                                className={`text-xs font-medium capitalize ${getTierTypeColor(
                                  type.tierType
                                )}`}
                              >
                                {type.tierType || "Unknown"}
                              </Badge>
                            </TableCell>

                            <TableCell className="w-[100px] text-center">
                              <Badge
                                variant="outline"
                                className="text-xs font-medium bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20"
                              >
                                {type.documentCounter || 0}
                              </Badge>
                            </TableCell>

                            <TableCell
                              className="w-[80px] text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => onEditType(type)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Type
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {}}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  {canSelect && (
                                    <DropdownMenuItem
                                      onClick={() => onDeleteType(type.id!)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Type
                                    </DropdownMenuItem>
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
                There are no document types matching your current filters.
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={clearAllFilters}>
                  <RefreshCw className="h-4 w-4 mr-2" />
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

      {/* Bulk Actions */}
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
