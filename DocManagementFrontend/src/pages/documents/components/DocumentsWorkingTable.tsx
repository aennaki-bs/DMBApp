import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Document } from "@/models/document";
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Search,
  Filter,
  X,
  RefreshCw,
  MoreHorizontal,
  Edit,
  Trash2,
  GitBranch,
  CheckCircle,
  ExternalLink,
  Tag,
  AlertCircle,
  CalendarDays,
  User,
  Clock,
  Eye,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import SmartPagination from "@/components/shared/SmartPagination";
import { BulkActionsBar } from "@/components/responsibility-centre/table/BulkActionsBar";
import { usePagination } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";

interface DocumentsWorkingTableProps {
  documents: Document[];
  selectedDocuments: number[];
  onSelectDocument: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteDocument: (id: number) => void;
  onBulkDelete?: () => void;
  onEditDocument: (document: Document) => void;
  onAssignCircuit: (document: Document) => void;
  canManageDocuments: boolean;
  isLoading: boolean;
  onRefresh?: () => void;
}

export function DocumentsWorkingTable({
  documents = [],
  selectedDocuments,
  onSelectDocument,
  onSelectAll,
  onDeleteDocument,
  onBulkDelete,
  onEditDocument,
  onAssignCircuit,
  canManageDocuments,
  isLoading,
  onRefresh,
}: DocumentsWorkingTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [statusFilter, setStatusFilter] = useState("any");
  const [typeFilter, setTypeFilter] = useState("any");
  const [sortBy, setSortBy] = useState("documentKey");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search fields configuration
  const searchFields = [
    { id: "all", label: "All Fields" },
    { id: "documentKey", label: "Document Code" },
    { id: "title", label: "Title" },
    { id: "documentType", label: "Type" },
    { id: "createdBy", label: "Created By" },
  ];

  // Status filter options
  const statusFilters = [
    { value: "any", label: "Any Status" },
    { value: "0", label: "Draft" },
    { value: "1", label: "In Progress" },
    { value: "2", label: "Completed" },
    { value: "3", label: "Archived" },
  ];

  // Type filter options (dynamic based on documents)
  const typeFilters = useMemo(() => {
    const types = new Set(
      documents.map((doc) => doc.documentType?.typeName || "Unknown")
    );
    return [
      { value: "any", label: "Any Type" },
      ...Array.from(types).map((type) => ({ value: type, label: type })),
    ];
  }, [documents]);

  // Filter and search logic
  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      if (!document) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const docType = document.documentType?.typeName || "";
        const creator =
          typeof document.createdBy === "string"
            ? document.createdBy
            : document.createdBy?.username || "";

        const searchIn = {
          all: `${document.documentKey} ${document.title} ${docType} ${creator}`.toLowerCase(),
          documentKey: document.documentKey?.toLowerCase() || "",
          title: document.title?.toLowerCase() || "",
          documentType: docType.toLowerCase(),
          createdBy: creator.toLowerCase(),
        };

        if (!searchIn[searchField as keyof typeof searchIn]?.includes(query)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "any" && String(document.status) !== statusFilter) {
        return false;
      }

      // Type filter
      const docType = document.documentType?.typeName || "";
      if (typeFilter !== "any" && docType !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [documents, searchQuery, searchField, statusFilter, typeFilter]);

  // Sorting logic
  const sortedDocuments = useMemo(() => {
    return [...filteredDocuments].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Handle nested properties
      if (sortBy === "documentType") {
        aValue = a.documentType?.typeName || "";
        bValue = b.documentType?.typeName || "";
      } else if (sortBy === "createdBy") {
        aValue =
          typeof a.createdBy === "string"
            ? a.createdBy
            : a.createdBy?.username || "";
        bValue =
          typeof b.createdBy === "string"
            ? b.createdBy
            : b.createdBy?.username || "";
      } else if (sortBy === "docDate") {
        aValue = new Date(a.docDate);
        bValue = new Date(b.docDate);
      } else {
        aValue = a[sortBy as keyof Document];
        bValue = b[sortBy as keyof Document];
      }

      // Convert to strings for comparison (except dates)
      if (!(aValue instanceof Date)) {
        aValue = String(aValue || "").toLowerCase();
        bValue = String(bValue || "").toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [filteredDocuments, sortBy, sortDirection]);

  // Pagination
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedDocuments,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({ data: sortedDocuments, initialPageSize: 10 });

  // Handle sort
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    const allSelected = selectedDocuments.length === sortedDocuments.length;
    onSelectAll(!allSelected);
  };

  // Handle individual document selection
  const handleSelectDocument = useCallback(
    (documentId: number) => {
      const isSelected = selectedDocuments.includes(documentId);
      onSelectDocument(documentId, !isSelected);
    },
    [selectedDocuments, onSelectDocument]
  );

  // Handle row click
  const handleRowClick = useCallback(
    (documentId: number) => {
      if (canManageDocuments) {
        handleSelectDocument(documentId);
      }
    },
    [canManageDocuments, handleSelectDocument]
  );

  // Selection state
  const isAllSelected =
    sortedDocuments.length > 0 &&
    selectedDocuments.length === sortedDocuments.length;
  const isIndeterminate =
    selectedDocuments.length > 0 &&
    selectedDocuments.length < sortedDocuments.length;

  // Active filters
  const hasActiveFilters =
    searchQuery !== "" || statusFilter !== "any" || typeFilter !== "any";
  const hasDocuments = sortedDocuments.length > 0;

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setSearchField("all");
    setStatusFilter("any");
    setTypeFilter("any");
    setFilterOpen(false);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    onBulkDelete?.();
  };

  // Handle clear selection
  const handleClearSelection = () => {
    onSelectAll(false);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: number) => {
    const statusMap = {
      0: { label: "Draft", variant: "secondary" as const },
      1: { label: "In Progress", variant: "default" as const },
      2: { label: "Completed", variant: "default" as const },
      3: { label: "Archived", variant: "outline" as const },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: "Unknown",
      variant: "outline" as const,
    };

    return (
      <Badge variant={statusInfo.variant} className="text-xs font-medium">
        {statusInfo.label}
      </Badge>
    );
  };

  // Sync horizontal scroll between header and body
  useEffect(() => {
    // No longer needed - single scroll container handles everything
    return () => {};
  }, []);

  return (
    <div className="w-full h-full bg-background">
      <div className="flex flex-col h-full">
        {/* Search & Filter Section */}
        <div className="flex-shrink-0 p-6 space-y-4">
          {/* Search Bar and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 flex gap-2">
              <div className="flex-1 flex gap-2">
                <Select value={searchField} onValueChange={setSearchField}>
                  <SelectTrigger className="w-32 h-10 bg-background/95 border-border/40 hover:border-border/60 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {searchFields.map((field) => (
                      <SelectItem key={field.id} value={field.id}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 bg-background/95 border-border/40 hover:border-border/60 focus:border-border transition-colors"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-accent/50"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-10 gap-2 transition-all duration-200",
                      hasActiveFilters
                        ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                        : "bg-background/95 border-border/40 hover:border-border/60"
                    )}
                  >
                    <Filter className="h-4 w-4" />
                    Filter
                    {hasActiveFilters && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded">
                        {[
                          statusFilter !== "any" ? 1 : 0,
                          typeFilter !== "any" ? 1 : 0,
                        ].reduce((a, b) => a + b, 0)}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Filters</h4>
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFilters}
                          className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Clear all
                        </Button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">
                          Status
                        </label>
                        <Select
                          value={statusFilter}
                          onValueChange={setStatusFilter}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusFilters.map((status) => (
                              <SelectItem
                                key={status.value}
                                value={status.value}
                              >
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">
                          Document Type
                        </label>
                        <Select
                          value={typeFilter}
                          onValueChange={setTypeFilter}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {typeFilters.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-10 gap-2 bg-background/95 border-border/40 hover:border-border/60 transition-colors"
              >
                <RefreshCw
                  className={cn("h-4 w-4", isRefreshing && "animate-spin")}
                />
                Refresh
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2"
            >
              {statusFilter !== "any" && (
                <Badge
                  variant="secondary"
                  className="gap-1 bg-primary/10 text-primary border-primary/20"
                >
                  Status:{" "}
                  {statusFilters.find((s) => s.value === statusFilter)?.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter("any")}
                    className="h-auto w-auto p-0 ml-1 hover:bg-primary/20"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {typeFilter !== "any" && (
                <Badge
                  variant="secondary"
                  className="gap-1 bg-primary/10 text-primary border-primary/20"
                >
                  Type: {typeFilters.find((t) => t.value === typeFilter)?.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTypeFilter("any")}
                    className="h-auto w-auto p-0 ml-1 hover:bg-primary/20"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </motion.div>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {selectedDocuments.length > 0 && (
          <div className="flex-shrink-0 px-6">
            <BulkActionsBar
              selectedCount={selectedDocuments.length}
              onDelete={handleBulkDelete}
              onClearSelection={handleClearSelection}
              totalCount={sortedDocuments.length}
              itemName="document"
              icon={<FileText className="w-4 h-4 text-white" />}
            />
          </div>
        )}

        {/* Table Section */}
        <div className="flex-1 min-h-0 px-6 pb-6">
          {isLoading ? (
            <div className="h-full flex items-center justify-center rounded-2xl table-glass-container shadow-lg backdrop-blur-md">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">
                  Loading documents...
                </p>
              </div>
            </div>
          ) : !hasDocuments ? (
            <div className="h-full flex items-center justify-center rounded-2xl table-glass-container shadow-lg backdrop-blur-md">
              <div className="text-center space-y-4 max-w-md">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
                >
                  <FileText className="h-12 w-12 text-primary" />
                </motion.div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {hasActiveFilters
                      ? "No documents match your filters"
                      : "No documents found"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {hasActiveFilters
                      ? "Try adjusting your search criteria or clearing filters to see more results."
                      : "Get started by creating your first document."}
                  </p>
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear all filters
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col gap-4">
              {/* Professional Fixed Header Table with Single Horizontal Scroll */}
              <div className="flex-1 min-h-0 rounded-2xl table-glass-container shadow-lg backdrop-blur-md overflow-hidden flex flex-col">
                {/* Main horizontal scroll wrapper - This creates the ONLY horizontal scroll bar */}
                <div className="documents-table-main-scroll overflow-x-auto overflow-y-hidden">
                  <div
                    className="documents-table-content"
                    style={{ minWidth: "800px" }}
                  >
                    {/* Fixed Header - No scroll, positioned absolutely within scroll area */}
                    <div className="documents-table-header-container sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/20">
                      <Table className="table-fixed w-full">
                        <TableHeader>
                          <TableRow className="border-border/20 hover:bg-muted/30 transition-colors duration-200 documents-table-layout">
                            {/* Checkbox Column */}
                            <TableHead className="py-3 table-cell-center">
                              {canManageDocuments ? (
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
                                      if (input)
                                        input.indeterminate = isIndeterminate;
                                    }
                                  }}
                                />
                              ) : (
                                <span className="text-xs font-medium text-muted-foreground">
                                  #
                                </span>
                              )}
                            </TableHead>

                            {/* Document Code Column */}
                            <TableHead className="py-3 table-cell-start">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSort("documentKey")}
                                className="h-auto p-0 font-medium hover:bg-accent/50 flex items-center gap-1 rounded-md transition-all duration-200"
                              >
                                <Tag className="h-3.5 w-3.5" />
                                Code
                                {sortBy === "documentKey" && (
                                  <span className="ml-1">
                                    {sortDirection === "asc" ? "↑" : "↓"}
                                  </span>
                                )}
                              </Button>
                            </TableHead>

                            {/* Title Column */}
                            <TableHead className="py-3 table-cell-start">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSort("title")}
                                className="h-auto p-0 font-medium hover:bg-accent/50 flex items-center gap-1 rounded-md transition-all duration-200"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                Title
                                {sortBy === "title" && (
                                  <span className="ml-1">
                                    {sortDirection === "asc" ? "↑" : "↓"}
                                  </span>
                                )}
                              </Button>
                            </TableHead>

                            {/* Status Column */}
                            <TableHead className="py-3 table-cell-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSort("status")}
                                className="h-auto p-0 font-medium hover:bg-accent/50 flex items-center gap-1 rounded-md transition-all duration-200"
                              >
                                <AlertCircle className="h-3.5 w-3.5" />
                                Status
                                {sortBy === "status" && (
                                  <span className="ml-1">
                                    {sortDirection === "asc" ? "↑" : "↓"}
                                  </span>
                                )}
                              </Button>
                            </TableHead>

                            {/* Type Column */}
                            <TableHead className="py-3 table-cell-start max-md:hidden">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSort("documentType")}
                                className="h-auto p-0 font-medium hover:bg-accent/50 flex items-center gap-1 rounded-md transition-all duration-200"
                              >
                                <Filter className="h-3.5 w-3.5" />
                                Type
                                {sortBy === "documentType" && (
                                  <span className="ml-1">
                                    {sortDirection === "asc" ? "↑" : "↓"}
                                  </span>
                                )}
                              </Button>
                            </TableHead>

                            {/* Date Column */}
                            <TableHead className="py-3 table-cell-center max-md:hidden">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSort("docDate")}
                                className="h-auto p-0 font-medium hover:bg-accent/50 flex items-center gap-1 rounded-md transition-all duration-200"
                              >
                                <CalendarDays className="h-3.5 w-3.5" />
                                Date
                                {sortBy === "docDate" && (
                                  <span className="ml-1">
                                    {sortDirection === "asc" ? "↑" : "↓"}
                                  </span>
                                )}
                              </Button>
                            </TableHead>

                            {/* Created By Column */}
                            <TableHead className="py-3 table-cell-start max-lg:hidden">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSort("createdBy")}
                                className="h-auto p-0 font-medium hover:bg-accent/50 flex items-center gap-1 rounded-md transition-all duration-200"
                              >
                                <User className="h-3.5 w-3.5" />
                                Creator
                                {sortBy === "createdBy" && (
                                  <span className="ml-1">
                                    {sortDirection === "asc" ? "↑" : "↓"}
                                  </span>
                                )}
                              </Button>
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

                    {/* Scrollable Body - Only vertical scroll, inherits horizontal position from parent */}
                    <div className="documents-table-body-container flex-1 overflow-y-auto overflow-x-hidden">
                      <Table className="table-fixed w-full">
                        <TableBody>
                          {paginatedDocuments.map((document, index) => {
                            const isSelected = selectedDocuments.includes(
                              document.id
                            );
                            const isEven = index % 2 === 0;

                            return (
                              <TableRow
                                key={document.id}
                                className={cn(
                                  "border-border/20 transition-all duration-200 documents-table-layout cursor-pointer",
                                  isSelected
                                    ? "bg-primary/5 border-l-4 border-l-primary shadow-sm"
                                    : "hover:bg-muted/30 border-l-4 border-l-transparent",
                                  isEven ? "bg-muted/5" : "bg-background"
                                )}
                                onClick={() => {
                                  if (canManageDocuments) {
                                    onSelectDocument(document.id, !isSelected);
                                  }
                                }}
                              >
                                {/* Checkbox Column */}
                                <TableCell className="py-3 table-cell-center">
                                  {canManageDocuments ? (
                                    <Checkbox
                                      enhanced={true}
                                      size="sm"
                                      checked={isSelected}
                                      onCheckedChange={(checked: boolean) => {
                                        onSelectDocument(document.id, checked);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      aria-label={`Select document ${document.documentKey}`}
                                      className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                  ) : (
                                    <span className="text-xs text-muted-foreground font-mono">
                                      {(currentPage - 1) * pageSize + index + 1}
                                    </span>
                                  )}
                                </TableCell>

                                {/* Document Code Column */}
                                <TableCell className="py-3 table-cell-start">
                                  <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                      <FileText className="h-3 w-3 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="font-medium text-sm text-foreground truncate">
                                        {document.documentKey}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>

                                {/* Title Column */}
                                <TableCell className="py-3 table-cell-start">
                                  <div className="min-w-0">
                                    <div
                                      className="font-medium text-sm text-foreground truncate"
                                      title={document.title}
                                    >
                                      {document.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      ID: {document.id}
                                    </div>
                                  </div>
                                </TableCell>

                                {/* Status Column */}
                                <TableCell className="py-3 table-cell-center">
                                  {getStatusBadge(document.status)}
                                </TableCell>

                                {/* Type Column */}
                                <TableCell className="py-3 table-cell-start max-md:hidden">
                                  <div className="text-sm text-foreground truncate">
                                    {document.documentType?.typeName ||
                                      "Unknown"}
                                  </div>
                                </TableCell>

                                {/* Date Column */}
                                <TableCell className="py-3 table-cell-center max-md:hidden">
                                  <div className="text-sm text-foreground">
                                    {new Date(
                                      document.docDate
                                    ).toLocaleDateString()}
                                  </div>
                                </TableCell>

                                {/* Created By Column */}
                                <TableCell className="py-3 table-cell-start max-lg:hidden">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6 flex-shrink-0">
                                      <AvatarImage
                                        src=""
                                        alt={
                                          document.createdBy?.username || "User"
                                        }
                                      />
                                      <AvatarFallback className="text-xs bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                                        {document.createdBy?.firstName &&
                                        document.createdBy?.lastName
                                          ? `${document.createdBy.firstName[0]}${document.createdBy.lastName[0]}`
                                          : document.createdBy?.username
                                              ?.substring(0, 2)
                                              .toUpperCase() || "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                      <div className="text-sm text-foreground truncate">
                                        {document.createdBy?.username ||
                                          "Unknown"}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>

                                {/* Actions Column */}
                                <TableCell className="py-3 table-cell-center">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-accent/50 transition-colors duration-200"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">
                                          Open menu
                                        </span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-48"
                                    >
                                      <DropdownMenuItem
                                        onClick={() =>
                                          window.open(
                                            `/documents/${document.id}`,
                                            "_blank"
                                          )
                                        }
                                      >
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                      </DropdownMenuItem>
                                      {canManageDocuments && (
                                        <>
                                          <DropdownMenuItem
                                            onClick={() =>
                                              onEditDocument(document)
                                            }
                                          >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Document
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() =>
                                              onAssignCircuit(document)
                                            }
                                          >
                                            <GitBranch className="mr-2 h-4 w-4" />
                                            Assign Circuit
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            onClick={() =>
                                              onDeleteDocument(document.id)
                                            }
                                            className="text-destructive focus:text-destructive"
                                          >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                          </DropdownMenuItem>
                                        </>
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
                  </div>
                </div>
              </div>

              {/* Enhanced Pagination - Outside table container for proper scroll bar placement */}
              <div className="flex-shrink-0 rounded-2xl table-glass-container shadow-lg backdrop-blur-md p-4">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
