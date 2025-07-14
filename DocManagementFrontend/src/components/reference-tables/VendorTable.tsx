import { useState, useEffect } from "react";
import { toast } from "sonner";
import vendorService from "@/services/vendorService";
import { VendorTableContent } from "./table/VendorTableContent";
import { Vendor } from "@/models/vendor";
import { AlertTriangle, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePagination } from "@/hooks/usePagination";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function VendorTable() {
  const queryClient = useQueryClient();
  
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [countryFilter, setCountryFilter] = useState("any");
  const [sortBy, setSortBy] = useState("vendorCode");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Editing state
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
  });

  // Fetch vendors with React Query
  const {
    data: vendors = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vendors"],
    queryFn: vendorService.getAll,
  });

  // Update vendor mutation
  const updateMutation = useMutation({
    mutationFn: ({ vendorCode, data }: { vendorCode: string; data: any }) =>
      vendorService.update(vendorCode, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      setEditingVendor(null);
      setIsEditDialogOpen(false);
      resetEditFormData();
      toast.success("Vendor updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update vendor");
    },
  });

  // Delete vendor mutation
  const deleteMutation = useMutation({
    mutationFn: vendorService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete vendor");
    },
  });

  // Search fields - matching UserTable pattern
  const DEFAULT_VENDOR_SEARCH_FIELDS = [
    { id: "all", label: "All Fields" },
    { id: "vendorCode", label: "Vendor Code" },
    { id: "name", label: "Name" },
    { id: "address", label: "Address" },
    { id: "city", label: "City" },
    { id: "country", label: "Country" },
  ];

  // Filter and search logic
  const filteredVendors = vendors.filter((vendor) => {
    // Country filter
    if (countryFilter !== "any" && vendor.country !== countryFilter) {
      return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const searchInField = (field: string) =>
        field?.toLowerCase().includes(query) || false;

      if (searchField === "all") {
        return (
          searchInField(vendor.vendorCode) ||
          searchInField(vendor.name) ||
          searchInField(vendor.address) ||
          searchInField(vendor.city) ||
          searchInField(vendor.country)
        );
      } else {
        const fieldValue = vendor[searchField as keyof Vendor] as string;
        return searchInField(fieldValue);
      }
    }

    return true;
  });

  // Sorting logic
  const sortedVendors = [...filteredVendors].sort((a, b) => {
    const aValue = a[sortBy as keyof Vendor] as string;
    const bValue = b[sortBy as keyof Vendor] as string;
    
    if (sortDirection === "asc") {
      return (aValue || "").localeCompare(bValue || "");
    } else {
      return (bValue || "").localeCompare(aValue || "");
    }
  });

  // Pagination hook
  const pagination = usePagination({
    data: sortedVendors,
    initialPageSize: 25,
  });

  // Bulk selection hook
  const bulkSelection = useBulkSelection({
    data: sortedVendors,
    paginatedData: pagination.paginatedData,
    keyField: "vendorCode" as keyof Vendor,
    currentPage: pagination.currentPage,
    pageSize: pagination.pageSize,
  });

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  // Handle vendor edit
  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setEditFormData({
      name: vendor.name || "",
      address: vendor.address || "",
      city: vendor.city || "",
      country: vendor.country || "",
    });
    setIsEditDialogOpen(true);
  };

  // Handle vendor delete
  const handleDeleteVendor = async (vendorCode: string) => {
    try {
      await deleteMutation.mutateAsync(vendorCode);
    } catch (error) {
      console.error("Failed to delete vendor:", error);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      const selectedCodes = bulkSelection.selectedItems;
      await Promise.all(
        selectedCodes.map((code) => deleteMutation.mutateAsync(code))
      );
      bulkSelection.deselectAll();
      toast.success(`${selectedCodes.length} vendors deleted successfully`);
    } catch (error) {
      toast.error("Failed to delete some vendors");
    }
  };

  // Reset edit form
  const resetEditFormData = () => {
    setEditFormData({
      name: "",
      address: "",
      city: "",
      country: "",
    });
  };

  // Handle update
  const handleUpdate = async () => {
    if (!editingVendor) return;
    
    try {
      await updateMutation.mutateAsync({
        vendorCode: editingVendor.vendorCode,
        data: editFormData,
      });
    } catch (error) {
      console.error("Failed to update vendor:", error);
    }
  };

  // Get unique countries for filter
  const countries = [
    { id: "any", label: "Any Country", value: "any" },
    ...Array.from(new Set(vendors.map((v) => v.country).filter(Boolean)))
      .sort()
      .map((country) => ({
        id: country,
        label: country,
        value: country,
      })),
  ];

  // Clear all filters
  const clearAllFilters = () => {
    setCountryFilter("any");
    setSearchQuery("");
    setFilterOpen(false);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "f") {
        e.preventDefault();
        setFilterOpen(true);
      }
      if (e.key === "Escape" && filterOpen) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filterOpen]);

  // Professional filter/search bar styling - matching UserTable
  const filterCardClass =
    "w-full flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-background/50 to-primary/5 backdrop-blur-xl shadow-lg border border-primary/10";

  if (isError) {
    return (
      <div className="text-destructive py-10 text-center">
        <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
        Error loading vendors
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col gap-6 w-full"
      style={{ minHeight: "100%" }}
    >
      {/* Professional Search + Filter Bar - matching UserTable exactly */}
      <div className={filterCardClass}>
        {/* Search and field select */}
        <div className="flex-1 flex items-center gap-4 min-w-0">
          <div className="relative">
            <Select value={searchField} onValueChange={setSearchField}>
              <SelectTrigger className="w-[140px] h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg rounded-xl">
                <SelectValue>
                  {DEFAULT_VENDOR_SEARCH_FIELDS.find(
                    (opt) => opt.id === searchField
                  )?.label || "All Fields"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-xl shadow-2xl">
                {DEFAULT_VENDOR_SEARCH_FIELDS.map((opt) => (
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

          <div className="flex-1 relative min-w-0">
            <Input
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-4 pr-10 bg-background/60 backdrop-blur-md text-foreground placeholder:text-muted-foreground border border-primary/20 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg rounded-xl"
            />
          </div>
        </div>

        {/* Filter Button */}
        <div className="flex items-center gap-2">
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  "h-12 px-4 bg-background/60 backdrop-blur-md border border-primary/20 hover:border-primary/40 hover:bg-primary/10 text-foreground shadow-lg rounded-xl transition-all duration-300",
                  (countryFilter !== "any") &&
                    "bg-primary/10 border-primary/40 text-primary shadow-xl"
                )}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {(countryFilter !== "any") && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-primary/20 text-primary border-primary/30"
                  >
                    1
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-xl shadow-2xl"
              align="end"
            >
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Filter Options</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="country-filter" className="text-sm font-medium text-foreground">
                    Country
                  </Label>
                  <Select value={countryFilter} onValueChange={setCountryFilter}>
                    <SelectTrigger className="bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 rounded-lg">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-xl shadow-2xl">
                      {countries.map((option) => (
                        <SelectItem
                          key={option.id}
                          value={option.value}
                          className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary rounded-lg"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end mt-6">
                  {countryFilter !== "any" && (
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
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <VendorTableContent
          vendors={pagination.paginatedData}
          allVendors={filteredVendors}
          selectedVendors={bulkSelection.selectedItems}
          bulkSelection={bulkSelection}
          pagination={pagination}
          onEdit={handleEditVendor}
          onDelete={handleDeleteVendor}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          onClearFilters={clearAllFilters}
          onBulkDelete={handleBulkDelete}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border border-primary/20">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                className="bg-background/60 backdrop-blur-md border border-primary/20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={editFormData.address}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, address: e.target.value })
                }
                className="bg-background/60 backdrop-blur-md border border-primary/20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={editFormData.city}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, city: e.target.value })
                }
                className="bg-background/60 backdrop-blur-md border border-primary/20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={editFormData.country}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, country: e.target.value })
                }
                className="bg-background/60 backdrop-blur-md border border-primary/20"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="bg-background/50 backdrop-blur-sm border-border/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              {updateMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
