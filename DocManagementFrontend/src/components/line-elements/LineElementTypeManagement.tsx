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
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

// Import services and types
import lineElementsService from "@/services/lineElementsService";
import {
  LignesElementType,
  Item,
  GeneralAccounts,
} from "@/models/lineElements";
import CreateElementTypeWizard from "./CreateElementTypeWizard";

const LineElementTypeManagement = () => {
  // Data states
  const [elementTypes, setElementTypes] = useState<LignesElementType[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [generalAccounts, setGeneralAccounts] = useState<GeneralAccounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedElementTypes, setSelectedElementTypes] = useState<number[]>([]);
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<string>("code");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Pagination state
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

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
      searchField === "code" ? et.code.toLowerCase().includes(searchQuery.toLowerCase()) :
      searchField === "type" ? et.typeElement.toLowerCase().includes(searchQuery.toLowerCase()) :
      searchField === "description" ? et.description.toLowerCase().includes(searchQuery.toLowerCase()) :
      true
    );

    const matchesType = selectedType === "all" || et.typeElement.toLowerCase() === selectedType.toLowerCase();

    return matchesSearch && matchesType;
  });

  // Calculate pagination
  const paginatedElementTypes = filteredElementTypes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="flex-1">
      {/* Search Bar and Actions */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2 flex-1">
          <Select
            value={searchField}
            onValueChange={setSearchField}
          >
            <SelectTrigger className="w-[100px] bg-[#1e2a4a] border-0 rounded-md">
              <div className="flex items-center justify-between w-full">
                <span>Code</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="code">Code</SelectItem>
              <SelectItem value="type">Type</SelectItem>
              <SelectItem value="description">Description</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#1e2a4a] border-0 rounded-md w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={selectedType}
            onValueChange={setSelectedType}
          >
            <SelectTrigger className="w-[120px] bg-[#1e2a4a] border-0 rounded-md">
              <div className="flex items-center justify-between w-full">
                <span>All Types</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="item">Item</SelectItem>
              <SelectItem value="general_account">General Account</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            className="text-blue-400 hover:text-blue-300 hover:bg-[#1e2a4a]"
            onClick={() => {
              setSearchQuery("");
              setSearchField("code");
              setSelectedType("all");
            }}
          >
            Reset
          </Button>

          <Button
            onClick={() => setIsCreateWizardOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 ml-2"
          >
            <Plus className="h-4 w-4 mr-2" /> New Element Type
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-blue-900/30 hover:bg-transparent">
              <TableHead className="w-[40px] py-3">
                <Checkbox
                  checked={selectedElementTypes.length === paginatedElementTypes.length}
                  onCheckedChange={(checked: boolean) => {
                    setSelectedElementTypes(checked ? paginatedElementTypes.map(et => et.id) : []);
                  }}
                />
              </TableHead>
              <TableHead className="py-3">Code</TableHead>
              <TableHead className="py-3">Type</TableHead>
              <TableHead className="py-3">Description</TableHead>
              <TableHead className="text-right py-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading element types...
                </TableCell>
              </TableRow>
            ) : paginatedElementTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No element types found
                </TableCell>
              </TableRow>
            ) : (
              paginatedElementTypes.map((elementType) => (
                <TableRow 
                  key={elementType.id} 
                  className="border-b border-blue-900/30 hover:bg-[#1e2a4a]/50"
                >
                  <TableCell className="py-3">
                    <Checkbox
                      checked={selectedElementTypes.includes(elementType.id)}
                      onCheckedChange={(checked) => {
                        setSelectedElementTypes(prev =>
                          checked
                            ? [...prev, elementType.id]
                            : prev.filter(id => id !== elementType.id)
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell className="py-3 font-medium">
                    {elementType.code}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      className={
                        elementType.typeElement.toLowerCase() === "item"
                          ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                          : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                      }
                    >
                      {elementType.typeElement}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">{elementType.description}</TableCell>
                  <TableCell className="text-right py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>Show</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            <SelectTrigger className="w-[65px] h-8 bg-[#1e2a4a] border-0">
              <SelectValue>{pageSize}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="40">40</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span>entries</span>
        </div>
        <div className="text-muted-foreground">
          Showing {(currentPage - 1) * pageSize + 1} to {" "}
          {Math.min(currentPage * pageSize, filteredElementTypes.length)} of {" "}
          {filteredElementTypes.length} entries
        </div>
      </div>

      {/* Create Dialog */}
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
