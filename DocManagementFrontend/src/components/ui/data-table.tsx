import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FilterX,
  MoreVertical,
  ChevronDown,
  ListFilter,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface Column<T> {
  id: string;
  header: string;
  accessorKey: keyof T;
  cell?: (item: T) => React.ReactNode;
  enableSorting?: boolean;
  sortingFn?: (a: T, b: T) => number;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onRowSelect?: (keys: (string | number)[]) => void;
  onBulkAction?: (action: string, selectedRows: T[]) => void;
  bulkActions?: { label: string; value: string; color?: string }[];
  emptyStateMessage?: string;
  emptyStateIcon?: React.ReactNode;
  emptySearchMessage?: string;
  enableSelection?: boolean;
  hideSearchBar?: boolean;
  showRowActions?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  keyField,
  isLoading = false,
  searchPlaceholder = "Search...",
  searchQuery = "",
  onSearchChange,
  onRowSelect,
  onBulkAction,
  bulkActions = [],
  emptyStateMessage = "No items found",
  emptyStateIcon,
  emptySearchMessage = "No results found",
  enableSelection = true,
  hideSearchBar = false,
  showRowActions = true,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [filteredData, setFilteredData] = useState<T[]>(data);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Update filtered data when data changes
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  // Update local search when external search changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Toggle all rows selection
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      const allIds = filteredData.map(
        (item) => item[keyField] as string | number
      );
      setSelectedRows(allIds);
    }
    setSelectAll(!selectAll);
  };

  // Toggle a single row selection
  const handleRowSelect = (id: string | number) => {
    let newSelected: (string | number)[];

    if (selectedRows.includes(id)) {
      newSelected = selectedRows.filter((item) => item !== id);
    } else {
      newSelected = [...selectedRows, id];
    }

    setSelectedRows(newSelected);
    setSelectAll(newSelected.length === filteredData.length);

    if (onRowSelect) {
      onRowSelect(newSelected);
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    if (onBulkAction) {
      const selectedItems = filteredData.filter((item) =>
        selectedRows.includes(item[keyField] as string | number)
      );
      onBulkAction(action, selectedItems);
    }
  };

  // Handle search input changes
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocalSearchQuery(query);

    if (onSearchChange) {
      onSearchChange(query);
    }
  };

  // Clear search
  const clearSearch = () => {
    setLocalSearchQuery("");
    if (onSearchChange) {
      onSearchChange("");
    }
  };

  return (
    <div className="space-y-2">
      {/* Search and actions row */}
      {!hideSearchBar && (
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
            <Input
              placeholder={searchPlaceholder}
              value={localSearchQuery}
              onChange={handleSearchInputChange}
              className="bg-[#0d1541]/70 text-blue-100 pl-10 border-blue-900/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {localSearchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                onClick={clearSearch}
              >
                <FilterX className="h-4 w-4" />
              </Button>
            )}
          </div>

          {enableSelection && selectedRows.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600 text-white px-2">
                {selectedRows.length} selected
              </Badge>

              {bulkActions.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[#0d1541]/70 text-blue-100 border-blue-900/40"
                    >
                      Actions <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#0d1541] border-blue-900/50 text-blue-100">
                    {bulkActions.map((action) => (
                      <DropdownMenuItem
                        key={action.value}
                        onClick={() => handleBulkAction(action.value)}
                        className={cn(
                          "hover:bg-blue-800/30 cursor-pointer",
                          action.color && `text-${action.color}-400`
                        )}
                      >
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedRows([]);
                  setSelectAll(false);
                  if (onRowSelect) onRowSelect([]);
                }}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
              >
                Clear selection
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border border-blue-900/30 overflow-hidden bg-[#0a1033]">
        <Table>
          <TableHeader className="bg-[#0d1541]">
            <TableRow className="hover:bg-blue-900/20 border-b border-blue-900/20">
              {enableSelection && (
                <TableHead className="w-[40px] px-4">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                </TableHead>
              )}

              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    "text-blue-300 font-medium text-sm",
                    column.enableSorting && "cursor-pointer hover:text-blue-200"
                  )}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.enableSorting && (
                      <ChevronsUpDown className="h-3 w-3 text-blue-400" />
                    )}
                  </div>
                </TableHead>
              ))}

              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              // Loading state
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <TableRow
                    key={`loading-${index}`}
                    className="hover:bg-blue-900/10 border-b border-blue-900/10"
                  >
                    {enableSelection && (
                      <TableCell>
                        <Skeleton className="h-4 w-4 bg-blue-950/40" />
                      </TableCell>
                    )}

                    {columns.map((column) => (
                      <TableCell key={`loading-col-${column.id}-${index}`}>
                        <Skeleton className="h-6 w-full bg-blue-950/40" />
                      </TableCell>
                    ))}

                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-md bg-blue-950/40" />
                    </TableCell>
                  </TableRow>
                ))
            ) : filteredData.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell
                  colSpan={columns.length + (enableSelection ? 2 : 1)}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-blue-300/70 py-6">
                    {localSearchQuery ? (
                      <>
                        <Search className="h-10 w-10 mb-3 text-blue-400/50" />
                        <p className="text-lg mb-1">
                          {emptySearchMessage}: "{localSearchQuery}"
                        </p>
                        <Button
                          variant="link"
                          onClick={clearSearch}
                          className="mt-2 text-blue-400"
                        >
                          Clear search
                        </Button>
                      </>
                    ) : (
                      <>
                        {emptyStateIcon || (
                          <ListFilter className="h-10 w-10 mb-3 text-blue-400/50" />
                        )}
                        <p className="text-lg mb-1">{emptyStateMessage}</p>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              filteredData.map((row) => {
                const rowId = row[keyField] as string | number;
                const isSelected = selectedRows.includes(rowId);

                return (
                  <TableRow
                    key={rowId.toString()}
                    className={cn(
                      "hover:bg-blue-900/10 border-b border-blue-900/10",
                      isSelected && "bg-blue-900/20"
                    )}
                  >
                    {enableSelection && (
                      <TableCell className="px-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleRowSelect(rowId)}
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                      </TableCell>
                    )}

                    {columns.map((column) => (
                      <TableCell key={`${rowId}-${column.id}`}>
                        {column.cell
                          ? column.cell(row)
                          : (row[column.accessorKey] as React.ReactNode)}
                      </TableCell>
                    ))}

                    <TableCell>
                      {showRowActions && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-[#0d1541] border-blue-900/50 text-blue-100"
                          >
                            {/* Add row-specific action items here if needed */}
                            <DropdownMenuItem className="hover:bg-blue-800/30 cursor-pointer">
                              <Check className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Selected rows summary (only show when there are selected rows) */}
      {enableSelection && selectedRows.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0a1033]/90 backdrop-blur-sm py-3 px-6 border-t border-blue-900/40 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-600 text-white px-3 py-1 text-sm">
              {selectedRows.length} selected
            </Badge>
            <span className="text-blue-200">
              {selectedRows.length === 1
                ? "1 item selected"
                : `${selectedRows.length} items selected`}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedRows([]);
                setSelectAll(false);
                if (onRowSelect) onRowSelect([]);
              }}
              className="border-blue-500/30 text-blue-300 hover:bg-blue-900/20"
            >
              Cancel
            </Button>

            {bulkActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Actions <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#0d1541] border-blue-900/50 text-blue-100">
                  {bulkActions.map((action) => (
                    <DropdownMenuItem
                      key={action.value}
                      onClick={() => handleBulkAction(action.value)}
                      className={cn(
                        "hover:bg-blue-800/30 cursor-pointer",
                        action.color && `text-${action.color}-400`
                      )}
                    >
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
