import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Filter,
  Download,
  Upload,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Loader2,
  MoreHorizontal,
  X,
  Users,
  Eye,
  Calendar,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";

// Import services and types
import lineElementsService from "@/services/lineElementsService";
import {
  Item,
  UniteCode,
  LignesElementType,
  CreateItemRequest,
  UpdateItemRequest,
} from "@/models/lineElements";
import CreateItemWizard from "./CreateItemWizard";

// Form validation schema for edit form
const itemSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(50, "Code must be 50 characters or less"),
  description: z
    .string()
    .max(255, "Description must be 255 characters or less")
    .optional(),
  unite: z.string().min(1, "Unit code is required"),
});

type ItemFormData = z.infer<typeof itemSchema>;

// Search field options
const ITEM_SEARCH_FIELDS = [
  { id: "all", label: "All fields" },
  { id: "code", label: "Code" },
  { id: "description", label: "Description" },
  { id: "unite", label: "Unit Code" },
];

interface ItemsManagementProps {
  searchTerm: string;
  elementType?: LignesElementType;
}

const ItemsManagement = ({ searchTerm, elementType }: ItemsManagementProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [uniteCodes, setUniteCodes] = useState<UniteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof Item>("code");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [uniteFilter, setUniteFilter] = useState("any");
  const [filterOpen, setFilterOpen] = useState(false);

  // Edit form state
  const editForm = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      code: "",
      description: "",
      unite: "",
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsData, uniteCodesData] = await Promise.all([
        lineElementsService.items.getAll(),
        lineElementsService.uniteCodes.getAll(),
      ]);
      setItems(itemsData);
      setUniteCodes(uniteCodesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load items data");
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter((item) => {
      // Search filter
      const searchValue = searchQuery.toLowerCase();
      let matchesSearch = true;

      if (searchValue) {
        switch (searchField) {
          case "code":
            matchesSearch = item.code.toLowerCase().includes(searchValue);
            break;
          case "description":
            matchesSearch = item.description
              .toLowerCase()
              .includes(searchValue);
            break;
          case "unite":
            matchesSearch =
              item.unite?.toLowerCase().includes(searchValue) || false;
            break;
          default: // 'all'
            matchesSearch =
              item.code.toLowerCase().includes(searchValue) ||
              item.description.toLowerCase().includes(searchValue) ||
              item.unite?.toLowerCase().includes(searchValue) ||
              false;
        }
      }

      // Global search term from parent
      if (searchTerm && !searchValue) {
        matchesSearch =
          item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.unite?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          false;
      }

      // Unite filter
      const matchesUnite =
        uniteFilter === "any" ||
        (uniteFilter === "no-unit" && !item.unite) ||
        item.unite === uniteFilter;

      return matchesSearch && matchesUnite;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "code":
          aValue = a.code;
          bValue = b.code;
          break;
        case "description":
          aValue = a.description;
          bValue = b.description;
          break;
        case "unite":
          aValue = a.unite || "";
          bValue = b.unite || "";
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.code;
          bValue = b.code;
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [
    items,
    searchQuery,
    searchField,
    searchTerm,
    uniteFilter,
    sortField,
    sortDirection,
  ]);

  // Use pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedItems,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: filteredAndSortedItems,
    initialPageSize: 25,
  });

  const handleSort = (field: keyof Item) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field: keyof Item) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
    );
  };

  const headerClass = (field: keyof Item) => `
    text-blue-800 dark:text-blue-200 font-medium cursor-pointer select-none
    hover:text-blue-900 dark:hover:text-blue-100 transition-colors duration-150
    ${sortField === field ? "text-blue-900 dark:text-blue-100" : ""}
  `;

  const handleSelectAll = () => {
    const currentPageCodes = paginatedItems.map((item) => item.code);
    const selectedOnCurrentPage = selectedItems.filter((code) =>
      currentPageCodes.includes(code)
    );

    if (selectedOnCurrentPage.length === currentPageCodes.length) {
      // Deselect all on current page
      setSelectedItems((prev) =>
        prev.filter((code) => !currentPageCodes.includes(code))
      );
    } else {
      // Select all on current page
      setSelectedItems((prev) => [
        ...prev.filter((code) => !currentPageCodes.includes(code)),
        ...currentPageCodes,
      ]);
    }
  };

  const handleSelectItem = (itemCode: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemCode)
        ? prev.filter((code) => code !== itemCode)
        : [...prev, itemCode]
    );
  };

  const handleEditItem = async (data: ItemFormData) => {
    if (!selectedItem) return;

    try {
      const updateRequest: UpdateItemRequest = {
        description: data.description?.trim() || "",
        unite: data.unite,
      };

      await lineElementsService.items.update(selectedItem.code, updateRequest);
      toast.success("Item updated successfully");
      setIsEditDialogOpen(false);
      setSelectedItem(null);
      editForm.reset();
      fetchData();
    } catch (error) {
      console.error("Failed to update item:", error);
      toast.error("Failed to update item");
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    try {
      await lineElementsService.items.delete(selectedItem.code);
      toast.success("Item deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchData();
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error("Failed to delete item");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedItems.map((code) => lineElementsService.items.delete(code))
      );
      toast.success(`${selectedItems.length} items deleted successfully`);
      setSelectedItems([]);
      setIsBulkDeleteDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Failed to delete items:", error);
      toast.error("Failed to delete items");
    }
  };

  const openEditDialog = (item: Item) => {
    setSelectedItem(item);
    editForm.reset({
      code: item.code,
      description: item.description,
      unite: item.unite || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (item: Item) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (item: Item) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const clearAllFilters = () => {
    setUniteFilter("any");
    setSearchQuery("");
    setFilterOpen(false);
  };

  // Professional filter/search bar styling (copied from User Management)
  const filterCardClass =
    "w-full flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-background/50 to-primary/5 backdrop-blur-xl shadow-lg border border-primary/10";

  // Unite filter options
  const uniteOptions = [
    { id: "any", label: "Any Unit", value: "any" },
    { id: "no-unit", label: "No Unit", value: "no-unit" },
    ...uniteCodes.map((unite) => ({
      id: unite.code,
      label: unite.code,
      value: unite.code,
    })),
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-blue-700 dark:text-blue-300 font-medium">
            Loading items...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar - Updated to match User Management */}
      <div className={filterCardClass}>
        {/* Search and field select */}
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <Select value={searchField} onValueChange={setSearchField}>
            <SelectTrigger className="w-[140px] h-10 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg rounded-xl">
              <SelectValue>
                {ITEM_SEARCH_FIELDS.find((opt) => opt.id === searchField)
                  ?.label || "All fields"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-xl">
              {ITEM_SEARCH_FIELDS.map((opt) => (
                <SelectItem
                  key={opt.id}
                  value={opt.id}
                  className="hover:bg-primary/10 focus:bg-primary/10"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 pl-10 pr-8 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg placeholder:text-muted-foreground/70"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Advanced Filters Popover */}
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-10 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:bg-background/80 shadow-lg rounded-xl transition-all duration-300 flex items-center gap-2 px-4"
              >
                <Filter className="h-4 w-4" />
                Filter
                <kbd className="ml-1 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-70">
                  Alt+F
                </kbd>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-xl p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">Advanced Filters</h4>
                  {uniteFilter !== "any" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Unit Code</label>
                  <Select value={uniteFilter} onValueChange={setUniteFilter}>
                    <SelectTrigger className="h-9 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 rounded-lg">
                      <SelectValue>
                        {
                          uniteOptions.find((opt) => opt.value === uniteFilter)
                            ?.label
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-xl max-h-60">
                      {uniteOptions.map((opt) => (
                        <SelectItem
                          key={opt.id}
                          value={opt.value}
                          className="hover:bg-primary/10 focus:bg-primary/10"
                        >
                          {opt.label}
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

      {/* Table - Updated to match User Management */}
      <div className="bg-background/60 backdrop-blur-md border border-primary/20 rounded-xl overflow-hidden shadow-xl">
        {filteredAndSortedItems.length > 0 ? (
          <>
            {/* Fixed Header */}
            <div className="border-b border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/20 hover:bg-transparent">
                    <TableHead className="w-[50px] text-center">
                      <Checkbox
                        checked={
                          paginatedItems.length > 0 &&
                          paginatedItems.every((item) =>
                            selectedItems.includes(item.code)
                          )
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                        className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </TableHead>
                    <TableHead
                      className={`${headerClass("code")} cursor-pointer hover:bg-primary/5 transition-colors`}
                      onClick={() => handleSort("code")}
                    >
                      <div className="flex items-center gap-2">
                        Code {renderSortIcon("code")}
                      </div>
                    </TableHead>
                    <TableHead
                      className={`${headerClass("description")} cursor-pointer hover:bg-primary/5 transition-colors`}
                      onClick={() => handleSort("description")}
                    >
                      <div className="flex items-center gap-2">
                        Description {renderSortIcon("description")}
                      </div>
                    </TableHead>
                    <TableHead
                      className={`${headerClass("unite")} cursor-pointer hover:bg-primary/5 transition-colors`}
                      onClick={() => handleSort("unite")}
                    >
                      <div className="flex items-center gap-2">
                        Unit Code {renderSortIcon("unite")}
                      </div>
                    </TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </div>

            {/* Scrollable Body */}
            <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
              <Table>
                <TableBody>
                  {paginatedItems.map((item) => (
                    <TableRow
                      key={item.code}
                      className="border-b border-primary/10 hover:bg-primary/5 transition-all duration-200"
                    >
                      <TableCell className="w-[50px] text-center">
                        <Checkbox
                          checked={selectedItems.includes(item.code)}
                          onCheckedChange={() => handleSelectItem(item.code)}
                          aria-label={`Select ${item.code}`}
                          className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-foreground">
                        {item.code}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="truncate max-w-[300px]">{item.description}</div>
                      </TableCell>
                      <TableCell>
                        {item.unite ? (
                          <Badge
                            variant="secondary"
                            className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                          >
                            {item.unite}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground/60 text-sm">
                            No unit
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewDialog(item)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200"
                            title="View item details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(item)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200"
                            title="Edit item"
                            disabled
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(item)}
                            className="h-8 w-8 p-0 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                            title="Delete item"
                            disabled
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Package className="h-8 w-8 text-primary/60" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No items found</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              {searchQuery || uniteFilter !== "any"
                ? "No items match your current filters. Try adjusting your search criteria."
                : "Get started by creating your first item."}
            </p>
            {(searchQuery || uniteFilter !== "any") && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="mt-2"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Smart Pagination */}
      {filteredAndSortedItems.length > 0 && (
        <SmartPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[10, 15, 25, 50, 100, "all"]}
        />
      )}

      {/* Bulk Actions Bar - rendered via portal to document body */}
      {createPortal(
        <AnimatePresence>
          {selectedItems.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-6 right-16 transform -translate-x-1/2 z-[9999] w-[calc(100vw-4rem)] max-w-4xl mx-auto"
            >
              <div className="bg-gradient-to-r from-blue-200 dark:from-[#1a2c6b]/95 to-blue-100 dark:to-[#0a1033]/95 backdrop-blur-lg shadow-[0_8px_32px_rgba(59,130,246,0.3)] dark:shadow-[0_8px_32px_rgba(59,130,246,0.7)] rounded-2xl border border-blue-300 dark:border-blue-400/60 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 ring-2 ring-blue-300 dark:ring-blue-400/40">
                <div className="flex items-center text-blue-800 dark:text-blue-200 font-medium">
                  <div className="bg-blue-500/30 p-1.5 rounded-xl mr-3 flex-shrink-0">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <span className="text-sm sm:text-base text-center sm:text-left">
                    <span className="font-bold text-blue-900 dark:text-blue-100">
                      {selectedItems.length}
                    </span>{" "}
                    item{selectedItems.length !== 1 ? "s" : ""} selected
                  </span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-200 hover:text-red-800 dark:hover:text-red-100 hover:bg-red-200 dark:hover:bg-red-900/60 hover:border-red-400 dark:hover:border-red-400/60 transition-all duration-200 shadow-lg min-w-[80px] font-medium"
                    onClick={() => setIsBulkDeleteDialogOpen(true)}
                    disabled
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Create Item Wizard */}
      <CreateItemWizard
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          fetchData();
          setIsCreateDialogOpen(false);
        }}
        availableUniteCodes={uniteCodes}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white dark:bg-gradient-to-b dark:from-[#1a2c6b] dark:to-[#0a1033] border-blue-300 dark:border-blue-500/30 text-blue-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-900 dark:text-blue-100">
              Edit Item
            </DialogTitle>
            <DialogDescription className="text-blue-700 dark:text-blue-300">
              Update item information
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditItem)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-800 dark:text-blue-200">
                      Code
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        className="bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800/30 text-blue-700 dark:text-blue-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-800 dark:text-blue-200">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-white dark:bg-blue-950/30 border-blue-300 dark:border-blue-800/30 text-blue-900 dark:text-blue-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="unite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-800 dark:text-blue-200">
                      Unit Code
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-blue-950/30 border-blue-300 dark:border-blue-800/30 text-blue-900 dark:text-blue-100">
                          <SelectValue placeholder="Select unit code" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#22306e] text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-900/40">
                        {uniteCodes.map((unite) => (
                          <SelectItem
                            key={unite.code}
                            value={unite.code}
                            className="hover:bg-blue-100 dark:hover:bg-blue-800/40"
                          >
                            {unite.code} - {unite.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="bg-transparent border-blue-300 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/20"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Update Item
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-white dark:bg-gradient-to-b dark:from-[#1a2c6b] dark:to-[#0a1033] border-blue-300 dark:border-blue-500/30 text-blue-900 dark:text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Item Details
            </DialogTitle>
            <DialogDescription className="text-blue-700 dark:text-blue-300">
              Complete information about the selected item
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Code
                  </Label>
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-800/30 rounded-md p-3">
                    <span className="font-mono text-blue-700 dark:text-blue-300">
                      {selectedItem.code}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Description
                  </Label>
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-800/30 rounded-md p-3">
                    <span className="text-blue-900 dark:text-blue-100">
                      {selectedItem.description}
                    </span>
                  </div>
                </div>
              </div>

              {/* Unit Information */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Unit Code
                </Label>
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-800/30 rounded-md p-3">
                  {selectedItem.unite ? (
                    <div className="flex items-center gap-2">
                      <Badge
                        className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30"
                      >
                        {selectedItem.unite}
                      </Badge>
                      {selectedItem.uniteCodeNavigation && (
                        <span className="text-blue-700 dark:text-blue-200 text-sm">
                          - {selectedItem.uniteCodeNavigation.description}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-600 dark:text-blue-400/60">
                      No unit
                    </span>
                  )}
                </div>
              </div>

              {/* Element Types Association */}
              {selectedItem.elementTypesCount > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <Label className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      Element Types Association
                    </Label>
                  </div>
                  <div className="text-sm text-amber-700 dark:text-amber-200">
                    This item is associated with{" "}
                    <span className="font-bold text-amber-800 dark:text-amber-100">
                      {selectedItem.elementTypesCount}
                    </span>{" "}
                    element type
                    {selectedItem.elementTypesCount !== 1 ? "s" : ""}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-500/30 rounded-lg p-4">
                <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Metadata
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <Label className="text-xs text-blue-600 dark:text-blue-400">
                      Created At
                    </Label>
                    <div className="text-blue-800 dark:text-blue-200">
                      {new Date(selectedItem.createdAt).toLocaleDateString(
                        "fr-FR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-blue-600 dark:text-blue-400">
                      Updated At
                    </Label>
                    <div className="text-blue-800 dark:text-blue-200">
                      {new Date(selectedItem.updatedAt).toLocaleDateString(
                        "fr-FR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              onClick={() => setIsViewDialogOpen(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-white dark:bg-gradient-to-b dark:from-[#1a2c6b] dark:to-[#0a1033] border-blue-300 dark:border-blue-500/30 text-blue-900 dark:text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-blue-900 dark:text-blue-100">
              Delete Item
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-700 dark:text-blue-300">
              Are you sure you want to delete item "{selectedItem?.code}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-blue-300 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-white dark:bg-gradient-to-b dark:from-[#1a2c6b] dark:to-[#0a1033] border-blue-300 dark:border-blue-500/30 text-blue-900 dark:text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-blue-900 dark:text-blue-100">
              Delete Items
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-700 dark:text-blue-300">
              Are you sure you want to delete {selectedItems.length} items? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-blue-300 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ItemsManagement;
