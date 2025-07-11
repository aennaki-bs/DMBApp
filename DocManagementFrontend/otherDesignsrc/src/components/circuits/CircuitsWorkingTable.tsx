import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Switch } from "@/components/ui/switch";
import {
  GitBranch,
  Search,
  Filter,
  X,
  RefreshCw,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Settings,
  CheckCircle,
  XCircle,
  Activity,
  AlertCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SmartPagination from "@/components/shared/SmartPagination";
import { BulkActionsBar } from "@/components/responsibility-centre/table/BulkActionsBar";
import { usePagination } from "@/hooks/usePagination";

interface CircuitsWorkingTableProps {
  circuits: Circuit[];
  selectedCircuits: number[];
  onSelectCircuit: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteCircuit: (id: number) => void;
  onEditCircuit: (circuit: Circuit) => void;
  onViewCircuit: (circuit: Circuit) => void;
  onViewStatuses: (circuit: Circuit) => void;
  onToggleActive: (circuit: Circuit) => void;
  canManageCircuits: boolean;
  isLoading: boolean;
  onRefresh?: () => void;
  loadingCircuits?: number[];
}

export function CircuitsWorkingTable({
  circuits = [],
  selectedCircuits,
  onSelectCircuit,
  onSelectAll,
  onDeleteCircuit,
  onEditCircuit,
  onViewCircuit,
  onViewStatuses,
  onToggleActive,
  canManageCircuits,
  isLoading,
  onRefresh,
  loadingCircuits = [],
}: CircuitsWorkingTableProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [statusFilter, setStatusFilter] = useState("any");
  const [sortBy, setSortBy] = useState("circuitKey");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search fields configuration
  const searchFields = [
    { id: "all", label: "All Fields" },
    { id: "circuitKey", label: "Circuit Code" },
    { id: "title", label: "Title" },
    { id: "descriptif", label: "Description" },
  ];

  // Status filter options
  const statusFilters = [
    { value: "any", label: "Any Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  // Filter and search logic
  const filteredCircuits = useMemo(() => {
    return circuits.filter((circuit) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchIn = {
          all: `${circuit.circuitKey} ${circuit.title} ${
            circuit.descriptif || ""
          }`.toLowerCase(),
          circuitKey: circuit.circuitKey.toLowerCase(),
          title: circuit.title.toLowerCase(),
          descriptif: (circuit.descriptif || "").toLowerCase(),
        };

        if (!searchIn[searchField as keyof typeof searchIn]?.includes(query)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter === "active" && !circuit.isActive) return false;
      if (statusFilter === "inactive" && circuit.isActive) return false;

      return true;
    });
  }, [circuits, searchQuery, searchField, statusFilter]);

  // Sorting logic
  const sortedCircuits = useMemo(() => {
    return [...filteredCircuits].sort((a, b) => {
      let aValue: any = a[sortBy as keyof Circuit];
      let bValue: any = b[sortBy as keyof Circuit];

      // Handle boolean values
      if (sortBy === "isActive") {
        aValue = a.isActive ? 1 : 0;
        bValue = b.isActive ? 1 : 0;
      }

      // Convert to strings for comparison
      aValue = String(aValue || "").toLowerCase();
      bValue = String(bValue || "").toLowerCase();

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [filteredCircuits, sortBy, sortDirection]);

  // Pagination
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedCircuits,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: sortedCircuits,
    initialPageSize: 15,
  });

  // Sorting handler
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  // Select all handler
  const handleSelectAll = () => {
    const currentPageIds = paginatedCircuits.map((circuit) => circuit.id);
    const allCurrentSelected = currentPageIds.every((id) =>
      selectedCircuits.includes(id)
    );
    onSelectAll(!allCurrentSelected);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setSearchField("all");
    setStatusFilter("any");
    setSortBy("circuitKey");
    setSortDirection("asc");
    setFilterOpen(false);
  };

  // Bulk delete handler
  const handleBulkDelete = () => {
    selectedCircuits.forEach((id) => onDeleteCircuit(id));
  };

  // Clear selection
  const handleClearSelection = () => {
    onSelectAll(false);
  };

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Status badge helper
  const getStatusBadge = (isActive: boolean, isSelected: boolean) => {
    if (isActive) {
      return (
        <Badge
          variant="secondary"
          className={`text-xs transition-all duration-200 ${
            isSelected
              ? "bg-green-500/30 text-green-400 border-green-500/40"
              : "bg-green-500/20 text-green-400 border-green-500/30"
          }`}
        >
          <Activity className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="secondary"
          className={`text-xs transition-all duration-200 ${
            isSelected
              ? "bg-red-500/30 text-red-400 border-red-500/40"
              : "bg-red-500/20 text-red-400 border-red-500/30"
          }`}
        >
          <XCircle className="h-3 w-3 mr-1" />
          Inactive
        </Badge>
      );
    }
  };

  const hasActiveFilters = searchQuery || statusFilter !== "any";
  const allCurrentSelected =
    paginatedCircuits.length > 0 &&
    paginatedCircuits.every((circuit) => selectedCircuits.includes(circuit.id));
  const someSelected = selectedCircuits.length > 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl bg-background/95 backdrop-blur-sm border border-border/50 shadow-xl">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading circuits...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (filteredCircuits.length === 0 && !hasActiveFilters) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl bg-background/95 backdrop-blur-sm border border-border/50 shadow-xl">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4 text-center max-w-md">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <GitBranch className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  No Circuits Found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {canManageCircuits
                    ? "Get started by creating your first circuit to manage document workflows."
                    : "No circuits are available for viewing at the moment."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Professional Search & Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-lg"
      >
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search circuits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200"
            />
          </div>

          {/* Search Field Selector */}
          <Select value={searchField} onValueChange={setSearchField}>
            <SelectTrigger className="w-[140px] h-10 bg-background/50 border-border/50">
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

          {/* Filter Popover */}
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-4 bg-background/50 border-border/50 hover:bg-background/80 transition-all duration-200"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {hasActiveFilters && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 w-5 p-0 bg-primary/20 text-primary text-xs rounded-full flex items-center justify-center"
                  >
                    1
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-6 px-2 text-xs"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Status
                    </label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusFilters.map((filter) => (
                          <SelectItem key={filter.value} value={filter.value}>
                            {filter.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-10 px-4 bg-background/50 border-border/50 hover:bg-background/80 transition-all duration-200"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Active Filters */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30"
            >
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {searchQuery && (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  Search: "{searchQuery}"
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setSearchQuery("")}
                  />
                </Badge>
              )}
              {statusFilter !== "any" && (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  Status:{" "}
                  {statusFilters.find((f) => f.value === statusFilter)?.label}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setStatusFilter("any")}
                  />
                </Badge>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Optimized Table with Single Scroll */}
      <div className="relative overflow-hidden rounded-2xl bg-background/95 backdrop-blur-sm border border-border/50 shadow-xl">
        {paginatedCircuits.length > 0 ? (
          <div
            className="overflow-auto max-h-[calc(100vh-320px)]"
            style={{ scrollbarWidth: "thin" }}
          >
            <Table>
              {/* Sticky Header */}
              <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="circuits-table-col-checkbox">
                    <Checkbox
                      enhanced={true}
                      size="sm"
                      checked={allCurrentSelected}
                      onCheckedChange={handleSelectAll}
                      className="border-muted-foreground/40"
                    />
                  </TableHead>
                  <TableHead
                    className="circuits-table-col-code cursor-pointer select-none hover:text-primary transition-colors"
                    onClick={() => handleSort("circuitKey")}
                  >
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Code
                      {sortBy === "circuitKey" && (
                        <span className="text-primary">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="circuits-table-col-title cursor-pointer select-none hover:text-primary transition-colors"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Title
                      {sortBy === "title" && (
                        <span className="text-primary">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="circuits-table-col-description">
                    Description
                  </TableHead>
                  <TableHead
                    className="circuits-table-col-status cursor-pointer select-none hover:text-primary transition-colors text-center"
                    onClick={() => handleSort("isActive")}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Activity className="h-4 w-4" />
                      Status
                      {sortBy === "isActive" && (
                        <span className="text-primary">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="circuits-table-col-actions text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody>
                {paginatedCircuits.map((circuit) => {
                  const isSelected = selectedCircuits.includes(circuit.id);
                  const isLoadingAction = loadingCircuits.includes(circuit.id);

                  return (
                    <TableRow
                      key={circuit.id}
                      className={`circuits-table-layout transition-all duration-200 cursor-pointer group ${
                        isSelected
                          ? "bg-primary/8 border-l-4 border-l-primary shadow-sm"
                          : "hover:bg-muted/40"
                      }`}
                      onClick={() => onSelectCircuit(circuit.id, !isSelected)}
                    >
                      {/* Selection Column */}
                      <TableCell
                        className="py-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          enhanced={true}
                          size="sm"
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            onSelectCircuit(circuit.id, Boolean(checked))
                          }
                          className="border-muted-foreground/40"
                        />
                      </TableCell>

                      {/* Circuit Code Column */}
                      <TableCell className="py-3">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="flex-shrink-0">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback
                                className={`text-xs font-medium bg-gradient-to-br transition-all duration-200 ${
                                  isSelected
                                    ? "from-primary/30 to-primary/20 text-primary-foreground"
                                    : "from-primary/20 to-primary/10 text-primary"
                                }`}
                              >
                                <GitBranch className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div
                              className={`text-sm font-medium truncate transition-colors duration-200 ${
                                isSelected ? "text-primary" : "text-foreground"
                              }`}
                            >
                              {circuit.circuitKey}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              ID: {circuit.id}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Title Column */}
                      <TableCell className="py-3">
                        <div className="min-w-0">
                          <div
                            className={`text-sm font-medium truncate transition-colors duration-200 ${
                              isSelected ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {circuit.title}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {circuit.hasOrderedFlow
                              ? "Ordered Flow"
                              : "Parallel Flow"}
                          </div>
                        </div>
                      </TableCell>

                      {/* Description Column */}
                      <TableCell className="py-3">
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {circuit.descriptif || "No description available"}
                        </div>
                      </TableCell>

                      {/* Status Column */}
                      <TableCell
                        className="py-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {isLoadingAction ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : (
                            canManageCircuits && (
                              <Switch
                                checked={circuit.isActive}
                                onCheckedChange={() => onToggleActive(circuit)}
                                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                              />
                            )
                          )}
                          {getStatusBadge(circuit.isActive, isSelected)}
                        </div>
                      </TableCell>

                      {/* Actions Column */}
                      <TableCell
                        className="py-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onViewCircuit(circuit)}
                              className="cursor-pointer"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onViewStatuses(circuit)}
                              className="cursor-pointer"
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              View Statuses
                            </DropdownMenuItem>
                            {canManageCircuits && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onEditCircuit(circuit)}
                                  className="cursor-pointer"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Circuit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => onDeleteCircuit(circuit.id)}
                                  className="cursor-pointer text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Circuit
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
        ) : (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4 text-center max-w-md">
              <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No Results</h3>
                <p className="text-muted-foreground mb-4">
                  No circuits match your current search and filter criteria.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="mx-auto"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-lg">
          <SmartPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            className="justify-center"
            pageSizeOptions={[10, 15, 25, 50]}
            showFirstLast={true}
            maxVisiblePages={5}
          />
        </div>
      )}

      {/* Bulk Actions Bar */}
      {someSelected && canManageCircuits && (
        <BulkActionsBar
          selectedCount={selectedCircuits.length}
          onClearSelection={handleClearSelection}
          onDelete={handleBulkDelete}
          entityName="circuit"
          entityNamePlural="circuits"
        />
      )}
    </div>
  );
}
