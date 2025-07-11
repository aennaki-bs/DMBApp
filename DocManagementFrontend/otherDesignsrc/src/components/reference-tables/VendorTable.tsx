import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import vendorService from "@/services/vendorService";
import { Vendor, UpdateVendorRequest } from "@/models/vendor";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Truck,
  Search,
  Filter,
  X,
  RefreshCw,
  MoreHorizontal,
  Edit,
  Trash2,
  MapPin,
  Building,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SmartPagination from "@/components/shared/SmartPagination";
import { BulkActionsBar } from "@/components/responsibility-centre/table/BulkActionsBar";
import { usePagination } from "@/hooks/usePagination";

export default function VendorTable() {
  const queryClient = useQueryClient();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [countryFilter, setCountryFilter] = useState("any");
  const [sortBy, setSortBy] = useState<keyof Vendor>("vendorCode");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);
  const [deleteSingleOpen, setDeleteSingleOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form state for editing
  const [editFormData, setEditFormData] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
  });

  // Search fields configuration
  const searchFields = [
    { id: "all", label: "All Fields" },
    { id: "vendorCode", label: "Vendor Code" },
    { id: "name", label: "Name" },
    { id: "city", label: "City" },
    { id: "country", label: "Country" },
    { id: "address", label: "Address" },
  ];

  // Fetch vendors
  const {
    data: vendors = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vendors"],
    queryFn: vendorService.getAll,
  });

  // Update vendor mutation
  const updateMutation = useMutation({
    mutationFn: ({
      vendorCode,
      data,
    }: {
      vendorCode: string;
      data: UpdateVendorRequest;
    }) => vendorService.update(vendorCode, data),
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
      setSelectedVendors([]);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete vendor");
    },
  });

  // Get unique countries for filter
  const countries = useMemo(() => {
    const uniqueCountries = [
      ...new Set(vendors.map((v) => v.country).filter(Boolean)),
    ].sort();
    return [
      { id: "any", label: "Any Country", value: "any" },
      ...uniqueCountries.map((country) => ({
        id: country,
        label: country,
        value: country,
      })),
    ];
  }, [vendors]);

  // Filter and search logic
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchIn = {
          all: `${vendor.vendorCode} ${vendor.name} ${vendor.city} ${vendor.country} ${vendor.address}`.toLowerCase(),
          vendorCode: vendor.vendorCode.toLowerCase(),
          name: vendor.name.toLowerCase(),
          city: vendor.city?.toLowerCase() || "",
          country: vendor.country?.toLowerCase() || "",
          address: vendor.address?.toLowerCase() || "",
        };

        if (!searchIn[searchField as keyof typeof searchIn]?.includes(query)) {
          return false;
        }
      }

      // Country filter
      if (countryFilter !== "any" && vendor.country !== countryFilter) {
        return false;
      }

      return true;
    });
  }, [vendors, searchQuery, searchField, countryFilter]);

  // Sorting logic
  const sortedVendors = useMemo(() => {
    return [...filteredVendors].sort((a, b) => {
      const aValue = a[sortBy] || "";
      const bValue = b[sortBy] || "";
      const comparison = aValue.toString().localeCompare(bValue.toString());
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredVendors, sortBy, sortDirection]);

  // Pagination
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedVendors,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: sortedVendors,
    initialPageSize: 25,
  });

  // Helper functions
  const resetEditFormData = () => {
    setEditFormData({
      name: "",
      address: "",
      city: "",
      country: "",
    });
  };

  const handleSort = (field: keyof Vendor) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field: keyof Vendor) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 text-primary" />
    );
  };

  const getSortButton = (
    field: keyof Vendor,
    label: string,
    icon?: React.ReactNode
  ) => (
    <button
      className="h-8 px-2 -ml-2 text-xs font-medium hover:bg-accent/50 flex items-center gap-1 rounded-md transition-all duration-200 hover:shadow-sm"
      onClick={() => handleSort(field)}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {label}
      {renderSortIcon(field)}
    </button>
  );

  const handleSelectVendor = (vendorCode: string, checked: boolean) => {
    if (checked) {
      setSelectedVendors([...selectedVendors, vendorCode]);
    } else {
      setSelectedVendors(selectedVendors.filter((code) => code !== vendorCode));
    }
  };

  const handleSelectAll = () => {
    const currentPageVendorCodes = paginatedVendors.map(
      (vendor) => vendor.vendorCode
    );
    const allCurrentSelected = currentPageVendorCodes.every((code) =>
      selectedVendors.includes(code)
    );

    if (allCurrentSelected) {
      // Deselect all vendors on current page
      setSelectedVendors(
        selectedVendors.filter((code) => !currentPageVendorCodes.includes(code))
      );
    } else {
      // Select all vendors on current page
      const newSelected = [...selectedVendors];
      currentPageVendorCodes.forEach((code) => {
        if (!newSelected.includes(code)) {
          newSelected.push(code);
        }
      });
      setSelectedVendors(newSelected);
    }
  };

  const openEditDialog = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setEditFormData({
      name: vendor.name,
      address: vendor.address || "",
      city: vendor.city || "",
      country: vendor.country || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingVendor) return;
    updateMutation.mutate({
      vendorCode: editingVendor.vendorCode,
      data: editFormData,
    });
  };

  const handleDeleteSingle = (vendorCode: string) => {
    setVendorToDelete(vendorCode);
    setDeleteSingleOpen(true);
  };

  const confirmDeleteSingle = () => {
    if (vendorToDelete) {
      deleteMutation.mutate(vendorToDelete);
      setDeleteSingleOpen(false);
      setVendorToDelete(null);
    }
  };

  const handleBulkDelete = () => {
    setDeleteMultipleOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(
        selectedVendors.map((code) => vendorService.delete(code))
      );
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success(`${selectedVendors.length} vendors deleted successfully`);
      setSelectedVendors([]);
      setDeleteMultipleOpen(false);
    } catch (error: any) {
      toast.error("Failed to delete some vendors");
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSearchField("all");
    setCountryFilter("any");
    setFilterOpen(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Vendors refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh vendors");
    } finally {
      setIsRefreshing(false);
    }
  };

  const getCountryBadgeColor = (country: string) => {
    const colors = {
      US: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      CA: "bg-red-500/20 text-red-400 border-red-500/30",
      UK: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      FR: "bg-green-500/20 text-green-400 border-green-500/30",
      DE: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    };
    return (
      colors[country as keyof typeof colors] ||
      "bg-gray-500/20 text-gray-400 border-gray-500/30"
    );
  };

  // Check if we have vendors to display
  const hasVendors = sortedVendors && sortedVendors.length > 0;
  const isAllSelected =
    paginatedVendors.length > 0 &&
    paginatedVendors.every((vendor) =>
      selectedVendors.includes(vendor.vendorCode)
    );
  const isIndeterminate =
    selectedVendors.length > 0 &&
    !isAllSelected &&
    paginatedVendors.some((vendor) =>
      selectedVendors.includes(vendor.vendorCode)
    );

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive py-10 text-center">
        <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
        Error loading vendors
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
                    {searchFields.find((opt) => opt.id === searchField)
                      ?.label || "All Fields"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="table-search-select rounded-lg shadow-xl">
                  {searchFields.map((opt) => (
                    <SelectItem
                      key={opt.id}
                      value={opt.id}
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
                placeholder="Search vendors..."
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
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-9 px-3 text-xs table-search-text hover:table-search-text-hover transition-all duration-200"
              title="Refresh vendors"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 mr-1.5 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>

            {/* Filter Button */}
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-9 px-3 text-xs table-search-text hover:table-search-text-hover transition-all duration-200 ${
                    countryFilter !== "any" || searchQuery
                      ? "table-glass-badge"
                      : ""
                  }`}
                >
                  <Filter className="h-3.5 w-3.5 mr-1.5" />
                  Filter
                  {(countryFilter !== "any" || searchQuery) && (
                    <span className="ml-1 px-1.5 py-0.5 bg-primary/20 text-primary rounded text-xs">
                      {
                        [countryFilter !== "any", searchQuery].filter(Boolean)
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
                    {/* Country Filter */}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs table-search-text font-medium">
                        Country
                      </span>
                      <Select
                        value={countryFilter}
                        onValueChange={setCountryFilter}
                      >
                        <SelectTrigger className="w-full h-8 text-xs table-search-select focus:ring-1 transition-colors duration-200 shadow-sm rounded-md">
                          <SelectValue>
                            {
                              countries.find(
                                (opt) => opt.value === countryFilter
                              )?.label
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="table-search-select">
                          {countries.map((opt) => (
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
            {(countryFilter !== "any" || searchQuery) && (
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

      {/* Results Summary */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <TrendingUp className="h-4 w-4" />
        <span className="text-sm">
          Showing {paginatedVendors.length} of {sortedVendors.length} vendors
          {vendors.length !== sortedVendors.length &&
            ` (${vendors.length} total)`}
        </span>
      </div>

      {/* Table Content */}
      <div className="flex-1 min-h-0">
        <div className="flex-1 relative overflow-hidden rounded-2xl table-glass-container min-h-0 shadow-xl">
          {hasVendors ? (
            <div className="relative h-full flex flex-col z-10">
              {/* Fixed Header with Glass Effect */}
              <div className="flex-shrink-0 table-glass-header border-b border-border/20 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
                <div className="vendor-table-layout px-4 py-3">
                  {/* Checkbox Column */}
                  <div className="flex justify-center">
                    <Checkbox
                      enhanced={true}
                      size="sm"
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                      className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      ref={(el) => {
                        if (el && el.querySelector) {
                          const input = el.querySelector(
                            'input[type="checkbox"]'
                          ) as HTMLInputElement;
                          if (input) input.indeterminate = isIndeterminate;
                        }
                      }}
                    />
                  </div>

                  {/* Code Column */}
                  <div className="flex items-center">
                    {getSortButton(
                      "vendorCode",
                      "Code",
                      <Truck className="h-3.5 w-3.5" />
                    )}
                  </div>

                  {/* Name Column */}
                  <div className="flex items-center">
                    {getSortButton(
                      "name",
                      "Name",
                      <Building className="h-3.5 w-3.5" />
                    )}
                  </div>

                  {/* City Column */}
                  <div className="flex items-center max-md:hidden">
                    {getSortButton(
                      "city",
                      "City",
                      <MapPin className="h-3.5 w-3.5" />
                    )}
                  </div>

                  {/* Country Column */}
                  <div className="flex items-center justify-center">
                    {getSortButton("country", "Country")}
                  </div>

                  {/* Address Column */}
                  <div className="flex items-center max-lg:hidden">
                    {getSortButton("address", "Address")}
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      Actions
                    </span>
                  </div>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-auto">
                <div className="min-h-0">
                  {paginatedVendors.map((vendor) => {
                    const isSelected = selectedVendors.includes(
                      vendor.vendorCode
                    );
                    return (
                      <div
                        key={vendor.vendorCode}
                        className={`vendor-table-layout px-4 py-3 transition-all duration-200 cursor-pointer select-none border-l-4 ${
                          isSelected
                            ? "bg-primary/10 border-primary/30 shadow-sm border-l-primary"
                            : "hover:bg-muted/30 border-l-transparent"
                        }`}
                        onClick={() =>
                          handleSelectVendor(vendor.vendorCode, !isSelected)
                        }
                      >
                        {/* Selection Column */}
                        <div className="flex justify-center">
                          <Checkbox
                            enhanced={true}
                            size="sm"
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleSelectVendor(vendor.vendorCode, !!checked)
                            }
                            className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
                          />
                        </div>

                        {/* Code Column */}
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                              {vendor.vendorCode.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span
                              className={`text-sm font-medium transition-colors duration-200 ${
                                isSelected ? "text-primary" : "text-foreground"
                              }`}
                            >
                              {vendor.vendorCode}
                            </span>
                          </div>
                        </div>

                        {/* Name Column */}
                        <div className="flex items-center">
                          <span className="text-sm truncate">
                            {vendor.name}
                          </span>
                        </div>

                        {/* City Column */}
                        <div className="flex items-center gap-1 max-md:hidden">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {vendor.city || "N/A"}
                          </span>
                        </div>

                        {/* Country Column */}
                        <div className="flex justify-center">
                          <Badge
                            variant="secondary"
                            className={`text-xs px-2 py-1 transition-colors duration-200 ${
                              isSelected
                                ? getCountryBadgeColor(vendor.country || "")
                                    .replace("/20", "/30")
                                    .replace("/30", "/40")
                                : getCountryBadgeColor(vendor.country || "")
                            }`}
                          >
                            {vendor.country || "N/A"}
                          </Badge>
                        </div>

                        {/* Address Column */}
                        <div className="flex items-center max-lg:hidden">
                          <span className="text-sm text-muted-foreground truncate">
                            {vendor.address || "No address"}
                          </span>
                        </div>

                        {/* Actions Column */}
                        <div className="flex justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-accent/50 transition-colors duration-200"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-[160px]"
                            >
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(vendor);
                                }}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSingle(vendor.vendorCode);
                                }}
                                className="cursor-pointer text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative h-full flex items-center justify-center z-10 py-20">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">No vendors found</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {searchQuery || countryFilter !== "any"
                      ? "No vendors match your current filters. Try adjusting your search criteria."
                      : "Get started by adding your first vendor to the system."}
                  </p>
                </div>
                {(searchQuery || countryFilter !== "any") && (
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="mt-4"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Pagination */}
        {hasVendors && (
          <div className="flex-shrink-0 table-glass-pagination p-4 rounded-2xl shadow-lg backdrop-blur-md mt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Page {currentPage} of {totalPages} • {totalItems} total
                  vendors
                </span>
              </div>
              <SmartPagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                className="justify-center"
                pageSizeOptions={[10, 25, 50, 100]}
                showFirstLast={true}
                maxVisiblePages={5}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedVendors.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedVendors.length}
          totalCount={sortedVendors.length}
          onDelete={handleBulkDelete}
          onClearSelection={() => setSelectedVendors([])}
        />
      )}

      {/* Edit Vendor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">
                City
              </Label>
              <Input
                id="city"
                value={editFormData.city}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, city: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="country" className="text-right">
                Country
              </Label>
              <Input
                id="country"
                value={editFormData.country}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, country: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Textarea
                id="address"
                value={editFormData.address}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, address: e.target.value })
                }
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Vendor
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Single Delete Confirmation Dialog */}
      <AlertDialog open={deleteSingleOpen} onOpenChange={setDeleteSingleOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vendor? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSingle}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteMultipleOpen}
        onOpenChange={setDeleteMultipleOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Vendors</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedVendors.length} selected
              vendor
              {selectedVendors.length === 1 ? "" : "s"}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedVendors.length} Vendor
              {selectedVendors.length === 1 ? "" : "s"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
