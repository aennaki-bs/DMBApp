import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import vendorService from "@/services/vendorService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Vendor, UpdateVendorRequest } from "@/models/vendor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Filter,
  X,
  Search,
  RefreshCw,
  Trash2,
  Truck,
  Edit,
  MoreHorizontal,
  MapPin,
  Building,
  Globe,
  ChevronUp,
  ChevronDown,
  Loader2,
  Copy,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";
import { BulkActionsBar } from "@/components/responsibility-centre/table/BulkActionsBar";

const DEFAULT_VENDOR_SEARCH_FIELDS = [
  { id: "all", label: "All Fields" },
  { id: "vendorCode", label: "Vendor Code" },
  { id: "name", label: "Name" },
  { id: "city", label: "City" },
  { id: "country", label: "Country" },
  { id: "address", label: "Address" },
];

interface VendorManagementProps {
  onRefetchReady?: (refetchFn: () => void) => void;
}

export default function VendorManagement({
  onRefetchReady,
}: VendorManagementProps) {
  const queryClient = useQueryClient();
  const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [countryFilter, setCountryFilter] = useState("any");
  const [sortField, setSortField] = useState<keyof Vendor>("vendorCode");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
  });

  const {
    data: vendors = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["vendors"],
    queryFn: vendorService.getAll,
  });

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
      setIsEditDialogOpen(false);
      setEditingVendor(null);
      resetEditFormData();
      toast.success("Vendor updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update vendor");
    },
  });

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
          all: `${vendor.vendorCode} ${vendor.name} ${vendor.city || ""} ${
            vendor.country || ""
          } ${vendor.address || ""}`.toLowerCase(),
          vendorCode: vendor.vendorCode.toLowerCase(),
          name: vendor.name.toLowerCase(),
          city: (vendor.city || "").toLowerCase(),
          country: (vendor.country || "").toLowerCase(),
          address: (vendor.address || "").toLowerCase(),
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
      const aValue = a[sortField] || "";
      const bValue = b[sortField] || "";
      const comparison = aValue.toString().localeCompare(bValue.toString());
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredVendors, sortField, sortDirection]);

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
    initialPageSize: 15,
  });

  // Pass refetch function to parent component
  useEffect(() => {
    if (onRefetchReady && refetch) {
      onRefetchReady(refetch);
    }
  }, [onRefetchReady, refetch]);

  const resetEditFormData = () => {
    setEditFormData({ name: "", address: "", city: "", country: "" });
  };

  const handleSort = (field: keyof Vendor) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field: keyof Vendor) => {
    if (sortField !== field)
      return <ChevronUp className="h-4 w-4 opacity-30" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 text-primary" />
    ) : (
      <ChevronDown className="h-4 w-4 text-primary" />
    );
  };

  const getSortButton = (
    field: keyof Vendor,
    label: string,
    icon?: React.ReactNode
  ) => (
    <button
      className="flex items-center gap-1 hover:text-primary transition-colors"
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
      setSelectedVendors(
        selectedVendors.filter((code) => !currentPageVendorCodes.includes(code))
      );
    } else {
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

  const handleDelete = async (vendorCode: string) => {
    try {
      await deleteMutation.mutateAsync(vendorCode);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDeleteMultiple = async () => {
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

  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await refetch();
      toast.success("Vendors refreshed successfully!", {
        duration: 2000,
      });
    } catch (error) {
      toast.error("Failed to refresh vendors");
    } finally {
      setIsManualRefreshing(false);
    }
  };

  const getCountryBadgeColor = (country: string) => {
    const colors: { [key: string]: string } = {
      US: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      CA: "bg-red-500/10 text-red-500 border-red-500/20",
      UK: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      FR: "bg-green-500/10 text-green-500 border-green-500/20",
      DE: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    };
    return colors[country] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
  };

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

  const selectedPercentage =
    sortedVendors.length > 0
      ? Math.round((selectedVendors.length / sortedVendors.length) * 100)
      : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-destructive py-10 text-center">
        <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
        Error loading vendors
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col w-full" style={{ height: "100%" }}>
      {/* Modern Search + Filter Bar - EXACT COPY FROM CIRCUITS */}
      <div className="flex-shrink-0 p-3 rounded-xl table-glass-container shadow-lg mb-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          {/* Auto-refresh indicator */}
          {isFetching && !isLoading && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-md text-xs text-primary">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Auto-refreshing...</span>
            </div>
          )}

          {/* Search and field select */}
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 min-w-0">
            <div className="relative w-full sm:w-auto">
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger className="w-full sm:w-[130px] h-9 text-sm table-search-select hover:table-search-select focus:ring-1 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all duration-200 shadow-sm rounded-md flex-shrink-0">
                  <SelectValue>
                    {DEFAULT_VENDOR_SEARCH_FIELDS.find(
                      (opt) => opt.id === searchField
                    )?.label || "All Fields"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="table-search-select rounded-lg shadow-xl">
                  {DEFAULT_VENDOR_SEARCH_FIELDS.map((opt) => (
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
              onClick={handleManualRefresh}
              disabled={isManualRefreshing}
              className="h-9 px-3 text-xs table-search-text hover:table-search-text-hover transition-all duration-200"
              title="Refresh vendors"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 mr-1.5 ${
                  isManualRefreshing ? "animate-spin" : ""
                }`}
              />
              {isManualRefreshing ? "Refreshing..." : "Refresh"}
            </Button>

            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 text-xs table-search-text hover:table-search-text-hover transition-all duration-200"
                >
                  <Filter className="h-3.5 w-3.5 mr-1.5" />
                  Filter
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
                </div>
              </PopoverContent>
            </Popover>

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

      {/* Table Content - EXACT COPY FROM CIRCUITS */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 relative overflow-hidden rounded-2xl table-glass-container shadow-xl min-h-0 mb-3">
          {hasVendors ? (
            <div className="relative h-full flex flex-col z-10">
              {/* Fixed Header with Glass Effect */}
              <div className="flex-shrink-0 overflow-x-auto table-glass-header border-b border-border/20 sticky top-0 z-20 bg-background/95 backdrop-blur-sm">
                <div className="min-w-[930px]">
                  <Table className="table-fixed w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={isAllSelected}
                            ref={(el) => {
                              if (el && el.querySelector) {
                                const input = el.querySelector(
                                  'input[type="checkbox"]'
                                ) as HTMLInputElement;
                                if (input)
                                  input.indeterminate = isIndeterminate;
                              }
                            }}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="w-[140px]">
                          {getSortButton(
                            "vendorCode",
                            "Vendor",
                            <Building className="h-3.5 w-3.5" />
                          )}
                        </TableHead>
                        <TableHead className="w-[200px]">
                          {getSortButton("name", "Name")}
                        </TableHead>
                        <TableHead className="w-[120px]">
                          {getSortButton(
                            "country",
                            "Country",
                            <Globe className="h-3.5 w-3.5" />
                          )}
                        </TableHead>
                        <TableHead className="w-[150px]">
                          {getSortButton(
                            "city",
                            "Location",
                            <MapPin className="h-3.5 w-3.5" />
                          )}
                        </TableHead>
                        <TableHead className="w-16 text-center">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>
                </div>
              </div>

              {/* Scrollable Body with Better Height Management */}
              <div
                className="flex-1 overflow-hidden"
                style={{ height: "calc(100% - 60px)" }}
              >
                <ScrollArea className="h-full w-full">
                  <div className="min-w-[930px]">
                    <Table className="table-fixed w-full">
                      <TableBody>
                        {paginatedVendors.map((vendor) => {
                          const isSelected = selectedVendors.includes(
                            vendor.vendorCode
                          );
                          return (
                            <TableRow
                              key={vendor.vendorCode}
                              className={`transition-all duration-200 cursor-pointer select-none border-l-4 ${
                                isSelected
                                  ? "bg-primary/10 border-primary/30 shadow-sm border-l-primary"
                                  : "hover:bg-muted/30 border-l-transparent"
                              }`}
                              onClick={() =>
                                handleSelectVendor(
                                  vendor.vendorCode,
                                  !isSelected
                                )
                              }
                            >
                              <TableCell className="w-12">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) =>
                                    handleSelectVendor(
                                      vendor.vendorCode,
                                      !!checked
                                    )
                                  }
                                  className="pointer-events-none"
                                />
                              </TableCell>
                              <TableCell className="w-[140px]">
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                                      {vendor.vendorCode
                                        .slice(0, 2)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                      {vendor.vendorCode}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      ID: {vendor.vendorCode}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="w-[200px]">
                                <div className="flex items-center space-x-2">
                                  <Truck className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium truncate">
                                    {vendor.name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="w-[120px]">
                                <Badge
                                  variant="secondary"
                                  className={`text-xs px-2 py-1 transition-colors duration-200 ${getCountryBadgeColor(
                                    vendor.country || ""
                                  )}`}
                                >
                                  {vendor.country || "N/A"}
                                </Badge>
                              </TableCell>
                              <TableCell className="w-[150px]">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {vendor.city || "N/A"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="w-16">
                                <div className="flex justify-center">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        className="h-8 w-8 p-0 hover:bg-accent/50 transition-colors duration-200"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <span className="sr-only">
                                          Open menu
                                        </span>
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-[160px]"
                                    >
                                      <DropdownMenuLabel>
                                        Actions
                                      </DropdownMenuLabel>
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
                                          navigator.clipboard.writeText(
                                            vendor.vendorCode
                                          );
                                          toast.success(
                                            "Vendor code copied to clipboard"
                                          );
                                        }}
                                        className="cursor-pointer"
                                      >
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy Code
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(vendor.vendorCode);
                                        }}
                                        className="cursor-pointer text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
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

        {/* Enhanced Pagination - Clean and Always Visible */}
        <div className="flex-shrink-0 table-glass-pagination p-3 rounded-2xl shadow-lg backdrop-blur-md border border-primary/20 bg-background/95">
          <SmartPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            className="justify-center"
            pageSizeOptions={[10, 15, 25, 50, 100]}
            showFirstLast={true}
            maxVisiblePages={5}
          />
        </div>
      </div>

      {/* Bulk Actions Bar - EXACT COPY FROM CIRCUITS */}
      {selectedVendors.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedVendors.length}
          totalCount={sortedVendors.length}
          onDelete={() => setDeleteMultipleOpen(true)}
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
              onClick={handleDeleteMultiple}
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
