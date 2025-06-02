import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogTrigger,
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
  AlertDialogTrigger,
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
  Database,
  Tag,
  Calendar,
  MoreHorizontal,
  Filter,
  Download,
  Upload,
  SortAsc,
  SortDesc,
  AlertTriangle,
  Loader2,
  Package,
  Calculator,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

// Import services and types
import lineElementsService from "@/services/lineElementsService";
import {
  LignesElementType,
  Item,
  GeneralAccounts,
  CreateLignesElementTypeRequest,
  UpdateLignesElementTypeRequest,
} from "@/models/lineElements";
import CreateElementTypeWizard from "./CreateElementTypeWizard";

// Form validation schema
const elementTypeSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(50, "Code must be 50 characters or less"),
  typeElement: z.string().min(1, "Type element is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(255, "Description must be 255 characters or less"),
  tableName: z.string().min(1, "Table name is required"),
  itemCode: z.string().optional(),
  accountCode: z.string().optional(),
});

type ElementTypeFormData = z.infer<typeof elementTypeSchema>;

// Search field options
const ELEMENT_TYPE_SEARCH_FIELDS = [
  { id: "all", label: "All fields" },
  { id: "code", label: "Code" },
  { id: "typeElement", label: "Type Element" },
  { id: "description", label: "Description" },
  { id: "tableName", label: "Table Name" },
];

interface LineElementTypeManagementProps {
  searchTerm: string;
}

const LineElementTypeManagement = ({
  searchTerm,
}: LineElementTypeManagementProps) => {
  const [elementTypes, setElementTypes] = useState<LignesElementType[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [generalAccounts, setGeneralAccounts] = useState<GeneralAccounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof LignesElementType>("code");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedElementTypes, setSelectedElementTypes] = useState<number[]>(
    []
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [selectedElementType, setSelectedElementType] =
    useState<LignesElementType | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [typeFilter, setTypeFilter] = useState("any");
  const [filterOpen, setFilterOpen] = useState(false);

  // Form state
  const editForm = useForm<ElementTypeFormData>({
    resolver: zodResolver(elementTypeSchema),
    defaultValues: {
      code: "",
      typeElement: "",
      description: "",
      tableName: "",
      itemCode: "",
      accountCode: "",
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [elementTypesData, itemsData, generalAccountsData] =
        await Promise.all([
          lineElementsService.elementTypes.getAll(),
          lineElementsService.items.getAll(),
          lineElementsService.generalAccounts.getAll(),
        ]);
      setElementTypes(elementTypesData);
      setItems(itemsData);
      setGeneralAccounts(generalAccountsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load element types data");
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedElementTypes = useMemo(() => {
    let filtered = elementTypes.filter((elementType) => {
      // Search filter
      const searchValue = searchQuery.toLowerCase();
      let matchesSearch = true;

      if (searchValue) {
        switch (searchField) {
          case "code":
            matchesSearch = elementType.code
              .toLowerCase()
              .includes(searchValue);
            break;
          case "typeElement":
            matchesSearch = elementType.typeElement
              .toLowerCase()
              .includes(searchValue);
            break;
          case "description":
            matchesSearch = elementType.description
              .toLowerCase()
              .includes(searchValue);
            break;
          case "tableName":
            matchesSearch = elementType.tableName
              .toLowerCase()
              .includes(searchValue);
            break;
          default: // 'all'
            matchesSearch =
              elementType.code.toLowerCase().includes(searchValue) ||
              elementType.typeElement.toLowerCase().includes(searchValue) ||
              elementType.description.toLowerCase().includes(searchValue) ||
              elementType.tableName.toLowerCase().includes(searchValue);
        }
      }

      // Global search term from parent
      if (searchTerm && !searchValue) {
        matchesSearch =
          elementType.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          elementType.typeElement
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          elementType.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          elementType.tableName
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
      }

      // Type filter
      const matchesType =
        typeFilter === "any" || elementType.typeElement === typeFilter;

      return matchesSearch && matchesType;
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
        case "typeElement":
          aValue = a.typeElement;
          bValue = b.typeElement;
          break;
        case "description":
          aValue = a.description;
          bValue = b.description;
          break;
        case "tableName":
          aValue = a.tableName;
          bValue = b.tableName;
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
    elementTypes,
    searchQuery,
    searchField,
    searchTerm,
    typeFilter,
    sortField,
    sortDirection,
  ]);

  const handleSort = (field: keyof LignesElementType) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field: keyof LignesElementType) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-blue-400" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-blue-400" />
    );
  };

  const headerClass = (field: keyof LignesElementType) => `
    text-blue-200 font-medium cursor-pointer select-none
    hover:text-blue-100 transition-colors duration-150
    ${sortField === field ? "text-blue-100" : ""}
  `;

  const handleSelectAll = () => {
    if (selectedElementTypes.length === filteredAndSortedElementTypes.length) {
      setSelectedElementTypes([]);
    } else {
      setSelectedElementTypes(filteredAndSortedElementTypes.map((et) => et.id));
    }
  };

  const handleSelectElementType = (id: number) => {
    setSelectedElementTypes((prev) =>
      prev.includes(id) ? prev.filter((etId) => etId !== id) : [...prev, id]
    );
  };

  const handleEditElementType = async (data: ElementTypeFormData) => {
    if (!selectedElementType) return;

    try {
      const cleanItemCode = data.itemCode?.trim() || undefined;
      const cleanAccountCode = data.accountCode?.trim() || undefined;

      const updateRequest: UpdateLignesElementTypeRequest = {
        code: data.code.trim(),
        typeElement: data.typeElement,
        description: data.description.trim(),
        tableName: data.tableName.trim(),
        itemCode: data.typeElement === "Item" ? cleanItemCode : undefined,
        accountCode:
          data.typeElement === "General Accounts"
            ? cleanAccountCode
            : undefined,
      };

      await lineElementsService.elementTypes.update(
        selectedElementType.id,
        updateRequest
      );
      toast.success("Element type updated successfully");
      setIsEditDialogOpen(false);
      setSelectedElementType(null);
      editForm.reset();
      fetchData();
    } catch (error) {
      console.error("Failed to update element type:", error);
      toast.error("Failed to update element type");
    }
  };

  const handleDeleteElementType = async () => {
    if (!selectedElementType) return;

    try {
      await lineElementsService.elementTypes.delete(selectedElementType.id);
      toast.success("Element type deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedElementType(null);
      fetchData();
    } catch (error) {
      console.error("Failed to delete element type:", error);
      toast.error("Failed to delete element type");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedElementTypes.map((id) =>
          lineElementsService.elementTypes.delete(id)
        )
      );
      toast.success(
        `${selectedElementTypes.length} element types deleted successfully`
      );
      setSelectedElementTypes([]);
      setIsBulkDeleteDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Failed to delete element types:", error);
      toast.error("Failed to delete element types");
    }
  };

  const openEditDialog = (elementType: LignesElementType) => {
    setSelectedElementType(elementType);
    editForm.reset({
      code: elementType.code,
      typeElement: elementType.typeElement,
      description: elementType.description,
      tableName: elementType.tableName,
      itemCode: elementType.itemCode || "",
      accountCode: elementType.accountCode || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (elementType: LignesElementType) => {
    setSelectedElementType(elementType);
    setIsDeleteDialogOpen(true);
  };

  const clearAllFilters = () => {
    setTypeFilter("any");
    setSearchQuery("");
    setFilterOpen(false);
  };

  const getTypeIcon = (typeElement: string) => {
    switch (typeElement) {
      case "Item":
        return <Package className="h-4 w-4" />;
      case "General Accounts":
        return <Calculator className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (typeElement: string) => {
    switch (typeElement) {
      case "Item":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "General Accounts":
        return "bg-violet-500/10 text-violet-400 border-violet-500/30";
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    }
  };

  // Filter card class
  const filterCardClass =
    "w-full flex flex-col md:flex-row items-center gap-2 p-4 mb-4 rounded-xl bg-[#1e2a4a] shadow-lg border border-blue-900/40";

  // Type filter options
  const typeOptions = [
    { id: "any", label: "Any Type", value: "any" },
    { id: "Item", label: "Item", value: "Item" },
    {
      id: "General Accounts",
      label: "General Accounts",
      value: "General Accounts",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-blue-300 font-medium">Loading element types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className={filterCardClass}>
        {/* Search and field select */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <Select value={searchField} onValueChange={setSearchField}>
            <SelectTrigger className="w-[120px] bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-800/40 shadow-sm rounded-md">
              <SelectValue>
                {ELEMENT_TYPE_SEARCH_FIELDS.find(
                  (opt) => opt.id === searchField
                )?.label || "All fields"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
              {ELEMENT_TYPE_SEARCH_FIELDS.map((opt) => (
                <SelectItem
                  key={opt.id}
                  value={opt.id}
                  className="hover:bg-blue-800/40"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Input
              placeholder="Search element types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#22306e] text-blue-100 border border-blue-900/40 pl-10 pr-8 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-800/40 shadow-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Filter popover */}
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="bg-[#22306e] text-blue-100 border border-blue-900/40 hover:bg-blue-800/40 shadow-sm rounded-md flex items-center gap-2"
              >
                <Filter className="h-4 w-4 text-blue-400" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-[#1e2a4a] border border-blue-900/40 rounded-xl shadow-lg p-4">
              <div className="mb-2 text-blue-200 font-semibold">
                Advanced Filters
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-blue-200">Element Type</span>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full bg-[#22306e] text-blue-100 border border-blue-900/40">
                      <SelectValue>
                        {
                          typeOptions.find((opt) => opt.value === typeFilter)
                            ?.label
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
                      {typeOptions.map((opt) => (
                        <SelectItem
                          key={opt.id}
                          value={opt.value}
                          className="hover:bg-blue-800/40"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                {typeFilter !== "any" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-300 hover:text-white flex items-center gap-1"
                    onClick={clearAllFilters}
                  >
                    <X className="h-3 w-3" /> Clear All
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Create button */}
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Element Type
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-blue-900/30 overflow-hidden bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
        {filteredAndSortedElementTypes.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-400px)] min-h-[400px]">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader className="bg-gradient-to-r from-[#1a2c6b] to-[#0a1033] sticky top-0 z-10">
                  <TableRow className="border-blue-900/30 hover:bg-transparent">
                    <TableHead className="w-12">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={
                            selectedElementTypes.length > 0 &&
                            selectedElementTypes.length ===
                              filteredAndSortedElementTypes.length
                          }
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all"
                          className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-500"
                        />
                      </div>
                    </TableHead>
                    <TableHead
                      className={headerClass("code")}
                      onClick={() => handleSort("code")}
                    >
                      <div className="flex items-center">
                        Code {renderSortIcon("code")}
                      </div>
                    </TableHead>
                    <TableHead
                      className={headerClass("typeElement")}
                      onClick={() => handleSort("typeElement")}
                    >
                      <div className="flex items-center">
                        Type Element {renderSortIcon("typeElement")}
                      </div>
                    </TableHead>
                    <TableHead
                      className={headerClass("description")}
                      onClick={() => handleSort("description")}
                    >
                      <div className="flex items-center">
                        Description {renderSortIcon("description")}
                      </div>
                    </TableHead>
                    <TableHead className="text-blue-200 font-medium">
                      Association
                    </TableHead>
                    <TableHead
                      className={headerClass("tableName")}
                      onClick={() => handleSort("tableName")}
                    >
                      <div className="flex items-center">
                        Table Name {renderSortIcon("tableName")}
                      </div>
                    </TableHead>
                    <TableHead className="w-16 text-blue-200 font-medium text-right pr-4">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedElementTypes.map((elementType) => (
                    <TableRow
                      key={elementType.id}
                      className="border-blue-900/30 hover:bg-blue-800/20 transition-colors duration-150"
                    >
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={selectedElementTypes.includes(
                              elementType.id
                            )}
                            onCheckedChange={() =>
                              handleSelectElementType(elementType.id)
                            }
                            aria-label={`Select ${elementType.code}`}
                            className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-500"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-blue-100 font-semibold">
                        {elementType.code}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getTypeBadgeColor(elementType.typeElement)}
                        >
                          <div className="flex items-center gap-1">
                            {getTypeIcon(elementType.typeElement)}
                            {elementType.typeElement}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-blue-200 max-w-xs truncate">
                        {elementType.description}
                      </TableCell>
                      <TableCell>
                        {elementType.itemCode ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          >
                            Item: {elementType.itemCode}
                          </Badge>
                        ) : elementType.accountCode ? (
                          <Badge
                            variant="outline"
                            className="bg-violet-500/10 text-violet-400 border-violet-500/30"
                          >
                            Account: {elementType.accountCode}
                          </Badge>
                        ) : (
                          <span className="text-blue-400/60">
                            No association
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-blue-300 font-mono">
                        {elementType.tableName}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(elementType)}
                            className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-800/30"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(elementType)}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-blue-300">
            <Tag className="h-12 w-12 mb-4 text-blue-400/50" />
            <h3 className="text-lg font-semibold mb-2">
              No element types found
            </h3>
            <p className="text-sm text-blue-400/70 text-center">
              {searchQuery || typeFilter !== "any"
                ? "Try adjusting your filters or search terms."
                : "Get started by creating your first element type."}
            </p>
            {(searchQuery || typeFilter !== "any") && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 text-blue-300 border-blue-500/30 hover:bg-blue-800/30"
                onClick={clearAllFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Bulk Actions Bar - rendered via portal to document body */}
      {createPortal(
        <AnimatePresence>
          {selectedElementTypes.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-6 right-16 transform -translate-x-1/2 z-[9999] w-[calc(100vw-4rem)] max-w-4xl mx-auto"
            >
              <div className="bg-gradient-to-r from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-lg shadow-[0_8px_32px_rgba(59,130,246,0.7)] rounded-2xl border border-blue-400/60 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 ring-2 ring-blue-400/40">
                <div className="flex items-center text-blue-200 font-medium">
                  <div className="bg-blue-500/30 p-1.5 rounded-xl mr-3 flex-shrink-0">
                    <Tag className="w-5 h-5 text-blue-300" />
                  </div>
                  <span className="text-sm sm:text-base text-center sm:text-left">
                    <span className="font-bold text-blue-100">
                      {selectedElementTypes.length}
                    </span>{" "}
                    element type{selectedElementTypes.length !== 1 ? "s" : ""}{" "}
                    selected
                  </span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-red-900/40 border-red-500/40 text-red-200 hover:text-red-100 hover:bg-red-900/60 hover:border-red-400/60 transition-all duration-200 shadow-lg min-w-[80px] font-medium"
                    onClick={() => setIsBulkDeleteDialogOpen(true)}
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

      {/* Create Element Type Wizard */}
      <CreateElementTypeWizard
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          fetchData();
          setIsCreateDialogOpen(false);
        }}
        availableItems={items}
        availableGeneralAccounts={generalAccounts}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-100">
              Edit Element Type
            </DialogTitle>
            <DialogDescription className="text-blue-300">
              Update element type information
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditElementType)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-200">Code</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled
                          className="bg-blue-950/30 border-blue-800/30 text-blue-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="typeElement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-200">
                        Type Element
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-blue-950/30 border-blue-800/30 text-blue-100">
                            <SelectValue placeholder="Select type element" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
                          <SelectItem
                            value="Item"
                            className="hover:bg-blue-800/40"
                          >
                            Item
                          </SelectItem>
                          <SelectItem
                            value="General Accounts"
                            className="hover:bg-blue-800/40"
                          >
                            General Accounts
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-200">Description</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-blue-950/30 border-blue-800/30 text-blue-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="tableName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-200">Table Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-blue-950/30 border-blue-800/30 text-blue-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="bg-transparent border-blue-800/40 text-blue-300 hover:bg-blue-800/20"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Update Element Type
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-blue-100">
              Delete Element Type
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-300">
              Are you sure you want to delete element type "
              {selectedElementType?.code}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-blue-800/40 text-blue-300 hover:bg-blue-800/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteElementType}
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
        <AlertDialogContent className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-blue-100">
              Delete Element Types
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-300">
              Are you sure you want to delete {selectedElementTypes.length}{" "}
              element types? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-blue-800/40 text-blue-300 hover:bg-blue-800/20">
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

export default LineElementTypeManagement;
