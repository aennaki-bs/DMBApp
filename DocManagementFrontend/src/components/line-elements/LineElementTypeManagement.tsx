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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [elementTypesInUse, setElementTypesInUse] = useState<Set<number>>(
    new Set()
  );

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

      // Check which element types are in use
      const inUseSet = new Set<number>();
      await Promise.all(
        elementTypesData.map(async (elementType) => {
          try {
            const isInUse = await lineElementsService.elementTypes.isInUse(
              elementType.id
            );
            if (isInUse) {
              inUseSet.add(elementType.id);
            }
          } catch (error) {
            console.error(
              `Failed to check if element type ${elementType.id} is in use:`,
              error
            );
          }
        })
      );
      setElementTypesInUse(inUseSet);
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
      const updateData: UpdateLignesElementTypeRequest = {
        id: selectedElementType.id,
        code: data.code,
        typeElement: data.typeElement,
        description: data.description,
        tableName: data.tableName,
        itemId: data.itemCode
          ? items.find((item) => item.code === data.itemCode)?.id
          : undefined,
        generalAccountsId: data.accountCode
          ? generalAccounts.find((acc) => acc.code === data.accountCode)?.id
          : undefined,
      };

      await lineElementsService.elementTypes.update(updateData);
      toast.success("Element type updated successfully");
      setIsEditDialogOpen(false);
      editForm.reset();
      setSelectedElementType(null);
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
      setIsBulkDeleteDialogOpen(false);
      setSelectedElementTypes([]);
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
      itemCode: elementType.item?.code || "",
      accountCode: elementType.generalAccount?.code || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (elementType: LignesElementType) => {
    setSelectedElementType(elementType);
    setIsDeleteDialogOpen(true);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSearchField("all");
    setTypeFilter("any");
  };

  const getTypeIcon = (typeElement: string) => {
    const type = typeElement.toLowerCase();
    if (type.includes("account") || type.includes("budget"))
      return <Calculator className="h-4 w-4" />;
    if (type.includes("item") || type.includes("product"))
      return <Package className="h-4 w-4" />;
    if (type.includes("database") || type.includes("data"))
      return <Database className="h-4 w-4" />;
    return <Tag className="h-4 w-4" />;
  };

  const getTypeBadgeColor = (typeElement: string) => {
    const type = typeElement.toLowerCase();
    if (type.includes("account") || type.includes("budget"))
      return "bg-green-500/20 text-green-300 border-green-500/30";
    if (type.includes("item") || type.includes("product"))
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    if (type.includes("database") || type.includes("data"))
      return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  // Get unique types for filter dropdown
  const availableTypes = useMemo(() => {
    const types = [...new Set(elementTypes.map((et) => et.typeElement))];
    return types.sort();
  }, [elementTypes]);

  // BulkActionsBar component
  const BulkActionsBar = () => {
    if (selectedElementTypes.length === 0) return null;

    const selectedInUse = selectedElementTypes.some((id) => {
      const elementType = elementTypes.find((et) => et.id === id);
      return (
        elementTypesInUse.has(id) ||
        (elementType && (elementType.item || elementType.generalAccount))
      );
    });

    return createPortal(
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
      >
        <Card className="bg-blue-900/90 backdrop-blur-sm border-blue-700/50 shadow-xl">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex items-center gap-2 text-blue-100">
              <span className="font-medium">{selectedElementTypes.length}</span>
              <span>selected</span>
            </div>

            <div className="h-4 w-px bg-blue-700/50" />

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedElementTypes([])}
                className="bg-transparent border-blue-600/50 text-blue-200 hover:bg-blue-800/50"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>

              <AlertDialog
                open={isBulkDeleteDialogOpen}
                onOpenChange={setIsBulkDeleteDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={selectedInUse}
                    className="bg-red-600/20 border border-red-500/30 text-red-300 hover:bg-red-600/30"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedElementTypes.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-900/95 backdrop-blur-sm border-red-500/20">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-400">
                      Delete Element Types
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                      Are you sure you want to delete{" "}
                      {selectedElementTypes.length} element types? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600">
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

            {selectedInUse && (
              <div className="flex items-center gap-1 text-amber-400 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Some items are in use</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>,
      document.body
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Element Types</h2>
          <p className="text-gray-400">
            Manage line element types, items, and general accounts
          </p>
        </div>

        <CreateElementTypeWizard
          onSuccess={fetchData}
          trigger={
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Element Type
            </Button>
          }
        />
      </div>

      {/* Search and Filters */}
      <Card className="bg-gray-900/50 border-gray-700/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search element types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-600/50 text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger className="w-40 bg-gray-800/50 border-gray-600/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {ELEMENT_TYPE_SEARCH_FIELDS.map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-gray-800/50 border-gray-600/50 text-white hover:bg-gray-700/50"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {typeFilter !== "any" && (
                      <Badge className="ml-2 bg-blue-500/20 text-blue-300 text-xs">
                        1
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-64 bg-gray-800 border-gray-600"
                  align="end"
                >
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-200">
                        Type Element
                      </Label>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="mt-1 bg-gray-700/50 border-gray-600/50 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="any">Any Type</SelectItem>
                          {availableTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-600/50"
                      >
                        Clear All
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setFilterOpen(false)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div>
          Showing {filteredAndSortedElementTypes.length} of{" "}
          {elementTypes.length} element types
          {(searchQuery || typeFilter !== "any") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="ml-2 h-auto p-1 text-blue-400 hover:text-blue-300"
            >
              Clear filters
            </Button>
          )}
        </div>
        {selectedElementTypes.length > 0 && (
          <div className="text-blue-400">
            {selectedElementTypes.length} selected
          </div>
        )}
      </div>

      {/* Element Types Table */}
      <Card className="bg-gray-900/50 border-gray-700/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : filteredAndSortedElementTypes.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No element types found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || typeFilter !== "any"
                  ? "No element types match your current filters."
                  : "Get started by creating your first element type."}
              </p>
              {!(searchQuery || typeFilter !== "any") && (
                <CreateElementTypeWizard
                  onSuccess={fetchData}
                  trigger={
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Element Type
                    </Button>
                  }
                />
              )}
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 bg-gray-800/80 backdrop-blur-sm z-10">
                  <TableRow className="border-gray-700/50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedElementTypes.length ===
                          filteredAndSortedElementTypes.length
                        }
                        onCheckedChange={handleSelectAll}
                        className="border-gray-500"
                      />
                    </TableHead>
                    <TableHead
                      className={headerClass("code")}
                      onClick={() => handleSort("code")}
                    >
                      <div className="flex items-center gap-2">
                        Code
                        {renderSortIcon("code")}
                      </div>
                    </TableHead>
                    <TableHead
                      className={headerClass("typeElement")}
                      onClick={() => handleSort("typeElement")}
                    >
                      <div className="flex items-center gap-2">
                        Type Element
                        {renderSortIcon("typeElement")}
                      </div>
                    </TableHead>
                    <TableHead
                      className={headerClass("description")}
                      onClick={() => handleSort("description")}
                    >
                      <div className="flex items-center gap-2">
                        Description
                        {renderSortIcon("description")}
                      </div>
                    </TableHead>
                    <TableHead
                      className={headerClass("tableName")}
                      onClick={() => handleSort("tableName")}
                    >
                      <div className="flex items-center gap-2">
                        Table Name
                        {renderSortIcon("tableName")}
                      </div>
                    </TableHead>
                    <TableHead className="text-gray-300 w-20">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedElementTypes.map((elementType) => {
                    const isInUse = elementTypesInUse.has(elementType.id);
                    const hasAssignedItemOrAccount =
                      elementType.item || elementType.generalAccount;
                    const shouldDisable = isInUse || hasAssignedItemOrAccount;

                    return (
                      <TableRow
                        key={elementType.id}
                        className="border-gray-700/50 hover:bg-gray-800/30"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedElementTypes.includes(
                              elementType.id
                            )}
                            onCheckedChange={() =>
                              handleSelectElementType(elementType.id)
                            }
                            className="border-gray-500"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-blue-300">
                            {elementType.code}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(elementType.typeElement)}
                            <Badge
                              className={getTypeBadgeColor(
                                elementType.typeElement
                              )}
                            >
                              {elementType.typeElement}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-200 max-w-xs truncate">
                            {elementType.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-gray-300">
                            {elementType.tableName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(elementType)}
                              disabled={shouldDisable}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                              title={
                                shouldDisable
                                  ? "Cannot edit: Element type is in use or has assigned items/accounts"
                                  : "Edit element type"
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <AlertDialog
                              open={
                                isDeleteDialogOpen &&
                                selectedElementType?.id === elementType.id
                              }
                              onOpenChange={(open) => {
                                if (!open) {
                                  setIsDeleteDialogOpen(false);
                                  setSelectedElementType(null);
                                }
                              }}
                            >
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDeleteDialog(elementType)}
                                  disabled={shouldDisable}
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title={
                                    shouldDisable
                                      ? "Cannot delete: Element type is in use or has assigned items/accounts"
                                      : "Delete element type"
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-gray-900/95 backdrop-blur-sm border-red-500/20">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-red-400">
                                    Delete Element Type
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-300">
                                    Are you sure you want to delete the element
                                    type "{elementType.code}"? This action
                                    cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600">
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

                            {shouldDisable && (
                              <div className="ml-1">
                                <AlertTriangle className="h-4 w-4 text-amber-400" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-sm border-gray-700/50 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Element Type</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update the element type details below.
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
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-gray-800/50 border-gray-600/50 text-white"
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
                      <FormLabel>Type Element</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-gray-800/50 border-gray-600/50 text-white"
                        />
                      </FormControl>
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-gray-800/50 border-gray-600/50 text-white"
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
                    <FormLabel>Table Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-gray-800/50 border-gray-600/50 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="itemCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Code (Optional)</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-white">
                            <SelectValue placeholder="Select item..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="">None</SelectItem>
                          {items.map((item) => (
                            <SelectItem key={item.id} value={item.code}>
                              {item.code} - {item.designation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="accountCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Code (Optional)</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-white">
                            <SelectValue placeholder="Select account..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="">None</SelectItem>
                          {generalAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.code}>
                              {account.code} - {account.designation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Update Element Type
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        <BulkActionsBar />
      </AnimatePresence>
    </div>
  );
};

export default LineElementTypeManagement;
