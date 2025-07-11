import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import customerService from "@/services/customerService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Customer, UpdateCustomerRequest } from "@/models/customer";
import { usePagination } from "@/hooks/usePagination";
import { CustomerSearchBar } from "./components/CustomerSearchBar";
import { CustomerTable } from "./components/CustomerTable";
import { CustomerPagination } from "./components/CustomerPagination";
import { CustomerEditDialog } from "./components/CustomerEditDialog";
import { CustomerBulkActions } from "./components/CustomerBulkActions";
import { CustomerDeleteDialog } from "./components/CustomerDeleteDialog";
import { useCustomerFilters } from "./hooks/useCustomerFilters";
import { useCustomerSelection } from "./hooks/useCustomerSelection";
import { AlertTriangle } from "lucide-react";

interface CustomerManagementContentProps {
  onRefetchReady?: (refetchFn: () => void) => void;
}

export default function CustomerManagementContent({
  onRefetchReady,
}: CustomerManagementContentProps) {
  const queryClient = useQueryClient();
  const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
  });

  const {
    data: customers = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: customerService.getAll,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      customerCode,
      data,
    }: {
      customerCode: string;
      data: UpdateCustomerRequest;
    }) => customerService.update(customerCode, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setIsEditDialogOpen(false);
      setEditingCustomer(null);
      resetEditFormData();
      toast.success("Customer updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update customer");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: customerService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete customer");
    },
  });

  // Custom hooks for customer management
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
    filteredCustomers,
    countries,
  } = useCustomerFilters(customers);

  const {
    selectedCustomers,
    setSelectedCustomers,
    handleSelectCustomer,
    handleSelectAll,
    getSelectionState,
    selectedPercentage,
  } = useCustomerSelection();

  // Sorting logic
  const [sortField, setSortField] = useState<keyof Customer>("code");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      const aValue = a[sortField] || "";
      const bValue = b[sortField] || "";
      const comparison = aValue.toString().localeCompare(bValue.toString());
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredCustomers, sortField, sortDirection]);

  // Pagination
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedCustomers,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: sortedCustomers,
    initialPageSize: 25,
  });

  // Calculate selection state for current page
  const { isAllSelected, isIndeterminate } =
    getSelectionState(paginatedCustomers);

  // Pass refetch function to parent component
  useEffect(() => {
    if (onRefetchReady && refetch) {
      onRefetchReady(refetch);
    }
  }, [onRefetchReady, refetch]);

  const resetEditFormData = () => {
    setEditFormData({ name: "", address: "", city: "", country: "" });
  };

  const handleSort = (field: keyof Customer) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditFormData({
      name: customer.name,
      address: customer.address || "",
      city: customer.city || "",
      country: customer.country || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingCustomer) return;
    updateMutation.mutate({
      customerCode: editingCustomer.code,
      data: editFormData,
    });
  };

  const handleDelete = async (customerCode: string) => {
    try {
      await deleteMutation.mutateAsync(customerCode);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDeleteMultiple = async () => {
    try {
      await Promise.all(
        selectedCustomers.map((code) => customerService.delete(code))
      );
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success(
        `${selectedCustomers.length} customers deleted successfully`
      );
      setSelectedCustomers([]);
      setDeleteMultipleOpen(false);
    } catch (error: any) {
      toast.error("Failed to delete some customers");
    }
  };

  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await refetch();
      toast.success("Customers refreshed successfully!", {
        duration: 2000,
      });
    } catch (error) {
      toast.error("Failed to refresh customers");
    } finally {
      setIsManualRefreshing(false);
    }
  };

  const hasCustomers = sortedCustomers && sortedCustomers.length > 0;

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
        Error loading customers
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col w-full" style={{ height: "100%" }}>
      {/* Search and Filter Bar */}
      <CustomerSearchBar
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
          <CustomerTable
            customers={paginatedCustomers}
            hasCustomers={hasCustomers}
            selectedCustomers={selectedCustomers}
            isAllSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onSelectCustomer={handleSelectCustomer}
            onSelectAll={() => handleSelectAll(paginatedCustomers)}
            onEdit={openEditDialog}
            onDelete={handleDelete}
            searchQuery={searchQuery}
            countryFilter={countryFilter}
            clearAllFilters={clearAllFilters}
          />
        </div>

        {/* Pagination */}
        <CustomerPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Bulk Actions Bar */}
      {selectedCustomers.length > 0 && (
        <CustomerBulkActions
          selectedCount={selectedCustomers.length}
          totalCount={sortedCustomers.length}
          onDelete={() => setDeleteMultipleOpen(true)}
          onClearSelection={() => setSelectedCustomers([])}
        />
      )}

      {/* Edit Dialog */}
      <CustomerEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        customer={editingCustomer}
        formData={editFormData}
        setFormData={setEditFormData}
        onUpdate={handleUpdate}
        isUpdating={updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <CustomerDeleteDialog
        isOpen={deleteMultipleOpen}
        onClose={() => setDeleteMultipleOpen(false)}
        selectedCount={selectedCustomers.length}
        onConfirm={handleDeleteMultiple}
      />
    </div>
  );
}
