import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import vendorService from "@/services/vendorService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Vendor, UpdateVendorRequest } from "@/models/vendor";
import { usePagination } from "@/hooks/usePagination";
import { VendorSearchBar } from "./components/VendorSearchBar";
import { VendorTable } from "./components/VendorTable";
import { VendorPagination } from "./components/VendorPagination";
import { VendorEditDialog } from "./components/VendorEditDialog";
import { VendorBulkActions } from "./components/VendorBulkActions";
import { VendorDeleteDialog } from "./components/VendorDeleteDialog";
import { useVendorFilters } from "./hooks/useVendorFilters";
import { useVendorSelection } from "./hooks/useVendorSelection";
import { AlertTriangle } from "lucide-react";

interface VendorManagementContentProps {
  onRefetchReady?: (refetchFn: () => void) => void;
}

export default function VendorManagementContent({
  onRefetchReady,
}: VendorManagementContentProps) {
  const queryClient = useQueryClient();
  const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
  });

  const {
    data: vendors,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["vendors"],
    queryFn: vendorService.getAll,
  });

  // Safely handle vendors data
  const safeVendors = vendors || [];

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

  // Custom hooks for vendor management
  const {
    searchQuery,
    setSearchQuery,
    searchField,
    setSearchField,
    countryFilter,
    setCountryFilter,
    filterOpen,
    setFilterOpen,
    clearAllFilters,
    filteredVendors,
    countries,
  } = useVendorFilters(safeVendors);

  const {
    selectedVendors,
    setSelectedVendors,
    handleSelectVendor,
    handleSelectAll,
    getSelectionState,
    selectedPercentage,
  } = useVendorSelection();

  // Sorting logic
  const [sortField, setSortField] = useState<keyof Vendor>("vendorCode");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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

  // Calculate selection state for current page
  const { isAllSelected, isIndeterminate } =
    getSelectionState(paginatedVendors);

  // Pass refetch function to parent component with error handling
  useEffect(() => {
    if (onRefetchReady && refetch && !isLoading) {
      const safeRefetch = async () => {
        try {
          const result = await refetch();
          return result;
        } catch (error) {
          console.error("Error during vendor refetch:", error);
          // Don't re-throw to prevent component crashes
          return null;
        }
      };
      onRefetchReady(safeRefetch);
    }
  }, [onRefetchReady, refetch, isLoading]);

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

  const hasVendors = sortedVendors && sortedVendors.length > 0;

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
      {/* Search and Filter Bar */}
      <VendorSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchField={searchField}
        setSearchField={setSearchField}
        countryFilter={countryFilter}
        setCountryFilter={setCountryFilter}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
        countries={countries}
        clearAllFilters={clearAllFilters}
        handleManualRefresh={handleManualRefresh}
        isManualRefreshing={isManualRefreshing}
        isFetching={isFetching}
        isLoading={isLoading}
      />

      {/* Table Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 relative overflow-hidden rounded-2xl table-glass-container shadow-xl min-h-0 mb-3">
          <VendorTable
            vendors={paginatedVendors}
            hasVendors={hasVendors}
            selectedVendors={selectedVendors}
            isAllSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onSelectVendor={handleSelectVendor}
            onSelectAll={() => handleSelectAll(paginatedVendors)}
            onEdit={openEditDialog}
            onDelete={handleDelete}
            searchQuery={searchQuery}
            countryFilter={countryFilter}
            clearAllFilters={clearAllFilters}
          />
        </div>

        {/* Pagination */}
        <VendorPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Bulk Actions Bar */}
      {selectedVendors.length > 0 && (
        <VendorBulkActions
          selectedCount={selectedVendors.length}
          totalCount={sortedVendors.length}
          onDelete={() => setDeleteMultipleOpen(true)}
          onClearSelection={() => setSelectedVendors([])}
        />
      )}

      {/* Edit Dialog */}
      <VendorEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        vendor={editingVendor}
        formData={editFormData}
        setFormData={setEditFormData}
        onUpdate={handleUpdate}
        isUpdating={updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <VendorDeleteDialog
        isOpen={deleteMultipleOpen}
        onClose={() => setDeleteMultipleOpen(false)}
        selectedCount={selectedVendors.length}
        onConfirm={handleDeleteMultiple}
      />
    </div>
  );
}
