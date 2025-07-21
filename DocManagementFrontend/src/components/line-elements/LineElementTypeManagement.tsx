import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {

  Search,
  Edit,
  Trash2,
  Eye,

  Filter,
  X,
  Loader2,
  Database,
} from "lucide-react";
import { toast } from "sonner";
import { usePagination } from "@/hooks/usePagination";
import SmartPagination from "@/components/shared/SmartPagination";

// Import services and types
import lineElementsService from "@/services/lineElementsService";
import {
  LignesElementType,
  Item,
  GeneralAccounts,
} from "@/models/lineElements";
import CreateElementTypeWizard from "./CreateElementTypeWizard";

interface LineElementTypeManagementProps {
  isCreateWizardOpen: boolean;
  setIsCreateWizardOpen: (open: boolean) => void;
}

const LineElementTypeManagement = ({
  isCreateWizardOpen,
  setIsCreateWizardOpen
}: LineElementTypeManagementProps) => {
  // Data states
  const [elementTypes, setElementTypes] = useState<LignesElementType[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [generalAccounts, setGeneralAccounts] = useState<GeneralAccounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedElementTypes, setSelectedElementTypes] = useState<number[]>([]);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("any");
  const [filterOpen, setFilterOpen] = useState(false);

  // Search field options
  const searchFields = [
    { id: "all", label: "All Fields" },
    { id: "code", label: "Code" },
    { id: "type", label: "Type" },
    { id: "description", label: "Description" },
  ];

  // Type filter options
  const typeOptions = [
    { id: "any", label: "Any Type", value: "any" },
    { id: "item", label: "Item", value: "Item" },
    { id: "general_account", label: "General Account", value: "GeneralAccounts" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "f") {
        e.preventDefault();
        setFilterOpen(!filterOpen);
      }
      if (e.key === "Escape" && filterOpen) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filterOpen]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [elementTypesData, itemsData, generalAccountsData] = await Promise.all([
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

  // Filter element types based on search and filters
  const filteredElementTypes = elementTypes.filter(et => {
    const matchesSearch = searchQuery === "" || (
      searchField === "all" ? (
        et.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        et.typeElement.toLowerCase().includes(searchQuery.toLowerCase()) ||
        et.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) :
        searchField === "code" ? et.code.toLowerCase().includes(searchQuery.toLowerCase()) :
          searchField === "type" ? et.typeElement.toLowerCase().includes(searchQuery.toLowerCase()) :
            searchField === "description" ? et.description.toLowerCase().includes(searchQuery.toLowerCase()) :
              true
    );

    const matchesType = selectedType === "any" || et.typeElement === selectedType;

    return matchesSearch && matchesType;
  });

  // Use pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedElementTypes,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: filteredElementTypes,
    initialPageSize: 15,
  });

  // Handle select all for current page
  const handleSelectAll = () => {
    const currentPageIds = paginatedElementTypes.map((et) => et.id);
    const allCurrentSelected = currentPageIds.every((id) =>
      selectedElementTypes.includes(id)
    );

    if (allCurrentSelected) {
      setSelectedElementTypes(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      const newSelected = [...selectedElementTypes];
      currentPageIds.forEach((id) => {
        if (!selectedElementTypes.includes(id)) {
          newSelected.push(id);
        }
      });
      setSelectedElementTypes(newSelected);
    }
  };

  // Handle individual selection
  const handleSelectItem = (id: number) => {
    if (selectedElementTypes.includes(id)) {
      setSelectedElementTypes(prev => prev.filter(itemId => itemId !== id));
    } else {
      setSelectedElementTypes(prev => [...prev, id]);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setSearchField("all");
    setSelectedType("any");
  };

  // Display code exactly as stored without any formatting
  const getDisplayCodeName = (code?: string) => {
    if (!code || code.trim() === '') {
      return "N/A";
    }
    // Return code exactly as stored without any formatting
    return code;
  };

  // Professional filter/search bar styling matching UserTable
  const filterCardClass =
    "w-full flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-background/50 to-primary/5 backdrop-blur-xl shadow-lg border border-primary/10";

  return (
    <div className="h-full flex flex-col gap-6 w-full" style={{ minHeight: "100%" }}>
      {/* Document-style Search + Filter Bar matching UserManagement */}
      <div className={filterCardClass}>
        {/* Search and field select */}
        <div className="flex-1 flex items-center gap-4 min-w-0">
          <div className="relative">
            <Select value={searchField} onValueChange={setSearchField}>
              <SelectTrigger className="w-[140px] h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg rounded-xl">
                <SelectValue>
                  {searchFields.find((opt) => opt.id === searchField)?.label || "All Fields"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-xl shadow-2xl">
                {searchFields.map((opt) => (
                  <SelectItem
                    key={opt.id}
                    value={opt.id}
                    className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary rounded-lg"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            <Input
              placeholder="Search element types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg group-hover:shadow-xl placeholder:text-muted-foreground/60"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/60 group-hover:text-primary transition-colors duration-300">
              <Search className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Filter popover */}
        <div className="flex items-center gap-3">
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-12 px-6 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 shadow-lg rounded-xl flex items-center gap-3 transition-all duration-300 hover:shadow-xl"
              >
                <Filter className="h-5 w-5" />
                Filter
                <span className="ml-2 px-2 py-0.5 rounded border border-blue-700 text-xs text-blue-300 bg-blue-900/40 font-mono">Alt+F</span>
                {selectedType !== "any" && (
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-background/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl p-6">
              <div className="mb-4 text-foreground font-bold text-lg flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Advanced Filters
              </div>
              <div className="flex flex-col gap-4">
                {/* Type Filter */}
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-popover-foreground">Element Type</span>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-full bg-background/50 backdrop-blur-sm text-foreground border border-border focus:ring-primary focus:border-primary transition-colors duration-200 hover:bg-background/70 shadow-sm rounded-md">
                      <SelectValue>
                        {typeOptions.find((opt) => opt.value === selectedType)?.label}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-popover/95 backdrop-blur-lg text-popover-foreground border border-border">
                      {typeOptions.map((opt) => (
                        <SelectItem
                          key={opt.id}
                          value={opt.value}
                          className="hover:bg-accent hover:text-accent-foreground"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                {selectedType !== "any" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg transition-all duration-200 flex items-center gap-2"
                    onClick={clearAllFilters}
                  >
                    <X className="h-4 w-4" /> Clear All
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Table Container matching UserManagement */}
      <div className="flex-1 relative overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-lg min-h-0">
        {/* Subtle animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/2 via-transparent to-primary/2 animate-pulse"></div>

        {loading ? (
          <div className="relative h-full flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading element types...</p>
            </div>
          </div>
        ) : paginatedElementTypes.length > 0 ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Fixed Header - Never Scrolls */}
            <div className="flex-shrink-0 overflow-x-auto border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
              <div className="min-w-[800px]">
                <Table className="table-fixed w-full table-compact">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="w-12 text-foreground font-semibold">
                        <Checkbox
                          checked={
                            selectedElementTypes.filter((id) =>
                              paginatedElementTypes.some((et) => et.id === id)
                            ).length === paginatedElementTypes.length && paginatedElementTypes.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                          className="border-primary/30"
                        />
                      </TableHead>
                      <TableHead className="w-[200px] text-foreground font-semibold">Code</TableHead>
                      <TableHead className="w-[150px] text-foreground font-semibold">Type</TableHead>
                      <TableHead className="flex-1 text-foreground font-semibold">Description</TableHead>
                      <TableHead className="w-[120px] text-right text-foreground font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
              </div>
            </div>

            {/* Scrollable Body - Only Content Scrolls */}
            <div className="flex-1 overflow-hidden" style={{ maxHeight: "calc(100vh - 300px)" }}>
              <ScrollArea className="h-full w-full">
                <div className="min-w-[800px] pb-4">
                  <Table className="table-fixed w-full table-compact">
                    <TableBody>
                      {paginatedElementTypes.map((elementType) => (
                        <TableRow
                          key={elementType.id}
                          className="border-none hover:bg-primary/5 transition-all duration-200 group"
                        >
                          <TableCell className="w-12">
                            <Checkbox
                              checked={selectedElementTypes.includes(elementType.id)}
                              onCheckedChange={() => handleSelectItem(elementType.id)}
                              className="border-primary/30"
                            />
                          </TableCell>
                          <TableCell className="w-[200px] font-medium font-mono text-sm">
                            {getDisplayCodeName(elementType.code)}
                          </TableCell>
                          <TableCell className="w-[150px]">
                            <Badge
                              className={
                                elementType.typeElement.toLowerCase() === 'item'
                                  ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                                  : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20"
                              }
                            >
                              {elementType.typeElement}
                            </Badge>
                          </TableCell>
                          <TableCell className="flex-1 text-muted-foreground">
                            {elementType.description}
                          </TableCell>
                          <TableCell className="w-[120px] text-right">
                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                                disabled
                                title="View (disabled)"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                                disabled
                                title="Edit (disabled)"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                                disabled
                                title="Delete (disabled)"
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
            </div>
          </div>
        ) : (
          <div className="relative h-full flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center">
                <Database className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No element types found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || selectedType !== "any"
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "Get started by creating your first element type."
                  }
                </p>
                {(searchQuery || selectedType !== "any") && (
                  <Button variant="outline" onClick={clearAllFilters} className="mt-4">
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Smart Pagination */}
      {paginatedElementTypes.length > 0 && (
        <SmartPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[10, 15, 25, 50, 100]}
        />
      )}

      {/* Create Element Type Wizard */}
      <CreateElementTypeWizard
        open={isCreateWizardOpen}
        onOpenChange={setIsCreateWizardOpen}
        onSuccess={() => {
          fetchData();
          setIsCreateWizardOpen(false);
        }}
        availableItems={items}
        availableGeneralAccounts={generalAccounts}
      />
    </div>
  );
};

export default LineElementTypeManagement;
