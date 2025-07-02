import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { DocumentsWorkingTable } from "../../pages/documents/components/DocumentsWorkingTable";
import { BulkActionsBar } from "@/components/shared/BulkActionsBar";
import {
  AlertTriangle,
  Filter,
  X,
  Search,
  RefreshCw,
  FileText,
  GitBranch,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePagination } from "@/hooks/usePagination";
import SmartPagination from "@/components/shared/SmartPagination";
import { useTheme } from "@/context/ThemeContext";

const DEFAULT_DOCUMENT_SEARCH_FIELDS = [
  { id: "all", label: "All Fields" },
  { id: "documentKey", label: "Document Code" },
  { id: "title", label: "Title" },
  { id: "content", label: "Content" },
];

const STATUS_OPTIONS = [
  { id: "any", value: "any", label: "Any Status" },
  { id: "draft", value: "0", label: "Draft" },
  { id: "progress", value: "1", label: "In Progress" },
  { id: "completed", value: "2", label: "Completed" },
];

interface DocumentTableProps {
  documents: any[];
  selectedDocuments: number[];
  onSelectDocument: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteDocument: (id: number) => void;
  onBulkDelete?: () => void;
  onEditDocument: (document: any) => void;
  onAssignCircuit: (document: any) => void;
  canManageDocuments: boolean;
  isLoading: boolean;
  onRefresh?: () => void;
}

export function DocumentTable({
  documents,
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
}: DocumentTableProps) {
  const { user } = useAuth();
  const isSimpleUser = user?.role === "SimpleUser";
  const { theme } = useTheme();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [statusFilter, setStatusFilter] = useState("any");

  // Filter popover state
  const [filterOpen, setFilterOpen] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // Filter documents based on search and status
  const filteredDocuments = documents.filter((document) => {
    // Status filter
    if (statusFilter !== "any" && document.status.toString() !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      switch (searchField) {
        case "documentKey":
          return document.documentKey?.toLowerCase().includes(query);
        case "title":
          return document.title?.toLowerCase().includes(query);
        case "content":
          return document.content?.toLowerCase().includes(query);
        case "all":
        default:
          return (
            document.documentKey?.toLowerCase().includes(query) ||
            document.title?.toLowerCase().includes(query) ||
            document.content?.toLowerCase().includes(query) ||
            document.createdBy?.firstName?.toLowerCase().includes(query) ||
            document.createdBy?.lastName?.toLowerCase().includes(query)
          );
      }
    }

    return true;
  });

  // Use pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    paginatedData: paginatedDocuments,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: filteredDocuments || [],
    initialPageSize: 15,
  });

  // Enhanced manual refresh with visual feedback
  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await onRefresh?.();
      toast.success("Documents refreshed successfully!", {
        duration: 2000,
      });
    } catch (error) {
      toast.error("Failed to refresh documents");
    } finally {
      setIsManualRefreshing(false);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setSearchField("all");
    setStatusFilter("any");
    setFilterOpen(false);
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  // Clear selected documents
  const clearSelectedDocuments = () => {
    onSelectAll(false);
  };

  // Get selected count
  const getSelectedCount = () => selectedDocuments.length;

  // Get theme-specific colors for bulk actions
  const getThemeColors = () => {
    const themeVariant = theme.variant || "ocean-blue";
    const isDark = theme.mode === "dark";

    switch (themeVariant) {
      case "ocean-blue":
        return {
          gradient: isDark
            ? "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 50%, rgba(51, 65, 85, 0.95) 100%)"
            : "linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.98) 50%, rgba(226, 232, 240, 0.95) 100%)",
          border: isDark
            ? "rgba(59, 130, 246, 0.3)"
            : "rgba(59, 130, 246, 0.2)",
          text: isDark ? "rgb(226, 232, 240)" : "rgb(51, 65, 85)",
          textAccent: isDark ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)",
          buttonBg: isDark
            ? "rgba(59, 130, 246, 0.15)"
            : "rgba(59, 130, 246, 0.08)",
          buttonBgHover: isDark
            ? "rgba(59, 130, 246, 0.25)"
            : "rgba(59, 130, 246, 0.15)",
          buttonBorder: isDark
            ? "rgba(59, 130, 246, 0.4)"
            : "rgba(59, 130, 246, 0.3)",
          buttonBorderHover: isDark
            ? "rgba(96, 165, 250, 0.6)"
            : "rgba(96, 165, 250, 0.5)",
          buttonText: isDark ? "rgb(196, 210, 255)" : "rgb(59, 130, 246)",
          iconGradient: isDark
            ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
            : "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
        };
      default:
        return {
          gradient: isDark
            ? "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 50%, rgba(51, 65, 85, 0.95) 100%)"
            : "linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.98) 50%, rgba(226, 232, 240, 0.95) 100%)",
          border: isDark
            ? "rgba(59, 130, 246, 0.3)"
            : "rgba(59, 130, 246, 0.2)",
          text: isDark ? "rgb(226, 232, 240)" : "rgb(51, 65, 85)",
          textAccent: isDark ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)",
          buttonBg: isDark
            ? "rgba(59, 130, 246, 0.15)"
            : "rgba(59, 130, 246, 0.08)",
          buttonBgHover: isDark
            ? "rgba(59, 130, 246, 0.25)"
            : "rgba(59, 130, 246, 0.15)",
          buttonBorder: isDark
            ? "rgba(59, 130, 246, 0.4)"
            : "rgba(59, 130, 246, 0.3)",
          buttonBorderHover: isDark
            ? "rgba(96, 165, 250, 0.6)"
            : "rgba(96, 165, 250, 0.5)",
          buttonText: isDark ? "rgb(196, 210, 255)" : "rgb(59, 130, 246)",
          iconGradient: isDark
            ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
            : "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
        };
    }
  };

  const colors = getThemeColors();
  const hasDocuments = documents && documents.length > 0;

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasDocuments) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-xl border border-border/40 shadow-lg">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="p-4 rounded-full bg-muted/50">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No documents found</h3>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== "any"
              ? "Try adjusting your search or filters to find what you're looking for."
              : "Get started by creating your first document."}
          </p>
          <div className="flex gap-4 mt-4">
            {(searchQuery || statusFilter !== "any") && (
              <Button variant="outline" onClick={clearAllFilters}>
                Clear Filters
              </Button>
            )}
            {canManageDocuments && <Button>Create Document</Button>}
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
      {/* Modern Search + Filter Bar */}
      <div className="p-4 rounded-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border border-border/40 shadow-lg">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          {/* Search and field select */}
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 min-w-0">
            <div className="relative w-full sm:w-auto">
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger className="w-full sm:w-[130px] h-9 text-sm bg-background/80 border-border/40 hover:border-primary/30 focus:border-primary/50 transition-all duration-200 shadow-sm rounded-md flex-shrink-0">
                  <SelectValue>
                    {DEFAULT_DOCUMENT_SEARCH_FIELDS.find(
                      (opt) => opt.id === searchField
                    )?.label || "All Fields"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-border/40 rounded-lg shadow-xl">
                  {DEFAULT_DOCUMENT_SEARCH_FIELDS.map((opt) => (
                    <SelectItem
                      key={opt.id}
                      value={opt.id as string}
                      className="text-xs hover:bg-accent focus:bg-accent rounded-md"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1 group min-w-0">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-sm"></div>
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative h-9 text-sm bg-background/80 border-border/40 pl-10 pr-4 rounded-md focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200 shadow-sm group-hover:shadow-md w-full"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-hover:text-primary/70 transition-colors duration-200">
                <Search className="h-4 w-4" />
              </div>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-full transition-all duration-200"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
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
              className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground border-border/40 hover:border-primary/30 transition-all duration-200"
              title="Refresh documents"
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
                  className={`h-9 px-3 text-xs text-muted-foreground hover:text-foreground border-border/40 hover:border-primary/30 transition-all duration-200 ${
                    statusFilter !== "any" || searchQuery
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : ""
                  }`}
                >
                  <Filter className="h-3.5 w-3.5 mr-1.5" />
                  Filter
                  {(statusFilter !== "any" || searchQuery) && (
                    <span className="ml-1 px-1.5 py-0.5 bg-primary/20 text-primary rounded text-xs">
                      {
                        [statusFilter !== "any", searchQuery].filter(Boolean)
                          .length
                      }
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-72 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-border/40 shadow-xl rounded-lg"
                align="end"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Active Filters</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear All
                    </Button>
                  </div>

                  {/* Filter badges */}
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 bg-background/80 border-border/40 text-foreground px-2 py-1 text-xs"
                      >
                        Search: {searchQuery}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSearchQuery("")}
                          className="h-4 w-4 p-0 ml-1 hover:bg-accent/50 rounded-full"
                        >
                          <X className="h-2.5 w-2.5" />
                        </Button>
                      </Badge>
                    )}
                    {statusFilter !== "any" && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 bg-background/80 border-border/40 text-foreground px-2 py-1 text-xs"
                      >
                        Status:{" "}
                        {
                          STATUS_OPTIONS.find(
                            (opt) => opt.value === statusFilter
                          )?.label
                        }
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setStatusFilter("any")}
                          className="h-4 w-4 p-0 ml-1 hover:bg-accent/50 rounded-full"
                        >
                          <X className="h-2.5 w-2.5" />
                        </Button>
                      </Badge>
                    )}
                  </div>

                  {/* Status filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Status</label>
                    <Select
                      value={statusFilter}
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger className="w-full h-8 text-xs bg-background/80 border-border/40">
                        <SelectValue>
                          {
                            STATUS_OPTIONS.find(
                              (opt) => opt.value === statusFilter
                            )?.label
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-border/40">
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.id}
                            value={option.value}
                            className="text-xs"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 relative overflow-hidden rounded-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border border-border/40 shadow-lg min-h-0">
        <div className="relative h-full flex flex-col z-10">
          {/* Table with ScrollArea */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <DocumentsWorkingTable
                documents={paginatedDocuments}
                selectedDocuments={selectedDocuments}
                onSelectDocument={onSelectDocument}
                onSelectAll={onSelectAll}
                onDeleteDocument={onDeleteDocument}
                onEditDocument={onEditDocument}
                onAssignCircuit={onAssignCircuit}
                canManageDocuments={canManageDocuments}
              />
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Pagination and Bulk Actions */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-xl border border-border/40 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Pagination */}
          <div className="flex-1">
            <SmartPagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[10, 15, 25, 50, 100]}
            />
          </div>

          {/* Right: Bulk Actions (only when documents are selected) */}
          {selectedDocuments.length > 0 && (
            <div className="flex items-center gap-4">
              {/* Selection Info */}
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div
                    className="p-2.5 rounded-xl shadow-lg backdrop-blur-sm border border-opacity-30"
                    style={{
                      background: colors.iconGradient,
                      borderColor: colors.border,
                      boxShadow: `0 8px 25px -5px ${colors.border}40, 0 4px 6px -2px ${colors.border}20`,
                    }}
                  >
                    <FileText className="w-4 h-4 text-white drop-shadow-sm" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="font-bold text-base"
                    style={{ color: colors.textAccent }}
                  >
                    {selectedDocuments.length}
                  </span>
                  <span
                    className="font-medium text-sm"
                    style={{ color: colors.text }}
                  >
                    Document{selectedDocuments.length !== 1 ? "s" : ""} Selected
                  </span>
                </div>
              </div>

              {/* Enhanced Separator */}
              <div
                className="w-px h-8 rounded-full"
                style={{
                  background: `linear-gradient(to bottom, transparent, ${colors.border}, transparent)`,
                }}
              ></div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Clear Selection Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 transition-all duration-300 text-xs font-semibold backdrop-blur-md border rounded-lg shadow-sm hover:shadow-md"
                  style={{
                    backgroundColor: colors.buttonBg,
                    borderColor: colors.buttonBorder,
                    color: colors.buttonText,
                  }}
                  onClick={clearSelectedDocuments}
                >
                  <X className="w-3 h-3 mr-1.5" />
                  <span>Clear</span>
                </Button>

                {/* Assign Circuit Button (only when one document is selected) */}
                {selectedDocuments.length === 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 transition-all duration-300 text-xs font-semibold backdrop-blur-md border rounded-lg shadow-sm hover:shadow-md"
                    style={{
                      backgroundColor: colors.buttonBg,
                      borderColor: colors.buttonBorder,
                      color: colors.buttonText,
                    }}
                    onClick={() => {
                      const doc = documents.find(
                        (d) => d.id === selectedDocuments[0]
                      );
                      if (doc) onAssignCircuit(doc);
                    }}
                  >
                    <GitBranch className="w-3 h-3 mr-1.5" />
                    <span>Assign Circuit</span>
                  </Button>
                )}

                {/* Delete Button */}
                {onBulkDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 transition-all duration-300 text-xs font-semibold backdrop-blur-md border rounded-lg shadow-sm hover:shadow-md"
                    style={{
                      backgroundColor:
                        theme.mode === "dark"
                          ? "rgba(239, 68, 68, 0.15)"
                          : "rgba(239, 68, 68, 0.08)",
                      borderColor:
                        theme.mode === "dark"
                          ? "rgba(239, 68, 68, 0.4)"
                          : "rgba(239, 68, 68, 0.3)",
                      color:
                        theme.mode === "dark"
                          ? "rgb(252, 165, 165)"
                          : "rgb(239, 68, 68)",
                    }}
                    onClick={onBulkDelete}
                  >
                    <Trash2 className="w-3 h-3 mr-1.5" />
                    <span>Delete</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
