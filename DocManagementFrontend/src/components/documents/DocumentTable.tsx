import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { DocumentsWorkingTable } from "../../pages/documents/components/DocumentsWorkingTable";
import { BulkActionsBar } from "@/components/responsibility-centre/table/BulkActionsBar";
import { AlertTriangle, Filter, X, Search, RefreshCw } from "lucide-react";
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

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [statusFilter, setStatusFilter] = useState("any");

  // Filter popover state
  const [filterOpen, setFilterOpen] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

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

  // Clear selected documents
  const clearSelectedDocuments = () => {
    onSelectAll(false);
  };

  // Get selected count
  const getSelectedCount = () => selectedDocuments.length;

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
      {/* Modern Search + Filter Bar */}
      <div className="p-4 rounded-xl table-glass-container shadow-lg">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          {/* Search and field select */}
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 min-w-0">
            <div className="relative w-full sm:w-auto">
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger className="w-full sm:w-[130px] h-9 text-sm table-search-select hover:table-search-select focus:ring-1 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all duration-200 shadow-sm rounded-md flex-shrink-0">
                  <SelectValue>
                    {DEFAULT_DOCUMENT_SEARCH_FIELDS.find(
                      (opt) => opt.id === searchField
                    )?.label || "All Fields"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="table-search-select rounded-lg shadow-xl">
                  {DEFAULT_DOCUMENT_SEARCH_FIELDS.map((opt) => (
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
                placeholder="Search documents..."
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
                  className={`h-9 px-3 text-xs table-search-text hover:table-search-text-hover transition-all duration-200 ${
                    statusFilter !== "any" || searchQuery
                      ? "table-glass-badge"
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

                  <div className="space-y-3">
                    {/* Status Filter */}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs table-search-text font-medium">
                        Status
                      </span>
                      <Select
                        value={statusFilter}
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger className="w-full h-8 text-xs table-search-select focus:ring-1 transition-colors duration-200 shadow-sm rounded-md">
                          <SelectValue>
                            {
                              STATUS_OPTIONS.find(
                                (opt) => opt.value === statusFilter
                              )?.label
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="table-search-select">
                          {STATUS_OPTIONS.map((opt) => (
                            <SelectItem
                              key={opt.id}
                              value={opt.value}
                              className="text-xs hover:table-search-select"
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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

            {/* Active Filter Badges */}
            {searchQuery && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-1 cursor-pointer transition-all duration-200 hover:bg-primary/20 hover:text-primary-foreground table-glass-badge"
                  onClick={clearAllFilters}
                >
                  Search: {searchQuery}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              </div>
            )}

            {/* Clear Button */}
            {(statusFilter !== "any" || searchQuery) && (
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

      {/* Table Content */}
      <div className="flex-1 min-h-0">
        <DocumentsWorkingTable
          documents={filteredDocuments || []}
          selectedDocuments={selectedDocuments}
          onSelectDocument={onSelectDocument}
          onSelectAll={onSelectAll}
          onDeleteDocument={onDeleteDocument}
          onEditDocument={onEditDocument}
          onAssignCircuit={onAssignCircuit}
          canManageDocuments={canManageDocuments}
          isLoading={isLoading}
          onRefresh={onRefresh}
        />
      </div>

      {/* Bulk Actions Bar - positioned at bottom of screen */}
      {getSelectedCount() > 0 && !isSimpleUser && (
        <BulkActionsBar
          selectedCount={getSelectedCount()}
          totalCount={filteredDocuments?.length || 0}
          onDelete={() => onBulkDelete?.()}
          onClearSelection={clearSelectedDocuments}
        />
      )}
    </div>
  );
}
