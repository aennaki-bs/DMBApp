import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CircuitTableContent } from "./table/CircuitTableContent";
import { useCircuitManagement } from "@/hooks/useCircuitManagement";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Filter, X, AlertTriangle, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import circuitService from "@/services/circuitService";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { useAuth } from "@/context/AuthContext";

const SEARCH_FIELDS = [
    { id: "all", label: "All fields" },
    { id: "title", label: "Circuit Title" },
    { id: "descriptif", label: "Description" },
];

const STATUS_OPTIONS = [
    { id: "any", label: "Any Status", value: "any" },
    { id: "active", label: "Active", value: "active" },
    { id: "inactive", label: "Inactive", value: "inactive" },
];

const TYPE_OPTIONS = [
    { id: "any", label: "Any Type", value: "any" },
    // Add more type options as needed
];

interface CircuitsTableProps {
    onCreateCircuit?: () => void;
    onView?: (circuit: Circuit) => void;
    onEdit?: (circuit: Circuit) => void;
    onToggleStatus?: (circuit: Circuit) => void;
    onManageSteps?: (circuit: Circuit) => void;
}

export function CircuitsTable({
    onCreateCircuit,
    onView,
    onEdit,
    onToggleStatus,
    onManageSteps
}: CircuitsTableProps) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const isSimpleUser = user?.role === "SimpleUser";

    const {
        selectedItems,
        bulkSelection,
        pagination,
        circuits: filteredCircuits,
        paginatedCircuits,
        editingCircuit,
        deletingCircuit,
        deleteMultipleOpen,
        searchQuery,
        setSearchQuery,
        searchField,
        setSearchField,
        statusFilter,
        setStatusFilter,
        typeFilter,
        setTypeFilter,
        showAdvancedFilters,
        setShowAdvancedFilters,
        isLoading,
        isError,
        refetch,
        setEditingCircuit,
        setDeletingCircuit,
        setDeleteMultipleOpen,
        handleSort,
        sortBy,
        sortDirection,
        handleCircuitEdited,
        handleCircuitDeleted,
        handleMultipleDeleted,
        clearAllFilters,
    } = useCircuitManagement();

    // Filter popover state
    const [filterOpen, setFilterOpen] = useState(false);

    // Professional filter/search bar styling
    const filterCardClass =
        "w-full flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-background/50 to-primary/5 backdrop-blur-xl shadow-lg border border-primary/10";

    // Clear all filters
    const handleClearAllFilters = () => {
        setStatusFilter("any");
        setTypeFilter("any");
        setSearchQuery("");
        setFilterOpen(false);
    };

    // Check if any filters are active
    const isFilterActive = searchQuery !== '' || statusFilter !== 'any' || typeFilter !== 'any';

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

    // Handle edit circuit
    const handleEditCircuit = (circuit: Circuit) => {
        if (onEdit) {
            onEdit(circuit);
        } else {
            setEditingCircuit(circuit);
        }
    };

    // Handle delete circuit
    const handleDeleteCircuit = (circuitId: number) => {
        setDeletingCircuit(circuitId);
    };

    // Handle single circuit deletion confirmation
    const confirmDeleteCircuit = async () => {
        if (!deletingCircuit) return;

        try {
            const circuitToDelete = filteredCircuits.find((circuit) => circuit.id === deletingCircuit);
            await circuitService.deleteCircuit(deletingCircuit);

            // Use React Query cache invalidation for consistent behavior
            await queryClient.invalidateQueries({
                queryKey: ['circuits'],
                exact: false
            });

            // Also refetch for immediate UI update
            await queryClient.refetchQueries({
                queryKey: ['circuits'],
                exact: false
            });

            toast.success(
                `Circuit "${circuitToDelete?.title || 'Unknown'}" deleted successfully`,
                {
                    description: "The circuit list has been updated automatically.",
                    duration: 3000,
                }
            );
            handleCircuitDeleted();
        } catch (error: any) {
            console.error("Error deleting circuit:", error);

            // Extract specific error message if available
            let errorMessage = "Failed to delete circuit";

            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage, {
                description: "Please try again or contact support if the problem persists.",
            });
        }
    };

    // Handle bulk delete
    const handleBulkDelete = () => {
        console.log("handleBulkDelete called");
        console.log("selectedItems:", selectedItems);
        console.log("selectedItems length:", selectedItems.length);

        if (selectedItems.length === 0) {
            toast.error("No circuits selected");
            return;
        }

        // Check if any selected circuit is active
        const activeCircuits = filteredCircuits
            .filter((circuit) => selectedItems.includes(circuit.id))
            .filter((circuit) => circuit.isActive);

        console.log("activeCircuits:", activeCircuits);

        if (activeCircuits.length > 0) {
            toast.error(`Cannot delete ${activeCircuits.length} active circuit(s). Please deactivate them first.`);
            return;
        }

        setDeleteMultipleOpen(true);
    };

    // Handle bulk delete confirmation
    const confirmBulkDelete = async () => {
        console.log("confirmBulkDelete called");
        console.log("selectedItems for deletion:", selectedItems);

        try {
            // For now, delete circuits one by one
            // TODO: Implement bulk delete API when available
            await Promise.all(selectedItems.map(id => circuitService.deleteCircuit(id)));

            // Use React Query cache invalidation for consistent behavior
            await queryClient.invalidateQueries({
                queryKey: ['circuits'],
                exact: false
            });

            // Also refetch for immediate UI update
            await queryClient.refetchQueries({
                queryKey: ['circuits'],
                exact: false
            });

            toast.success(`${selectedItems.length} circuits deleted successfully`, {
                description: "The circuit list has been updated automatically.",
                duration: 3000,
            });
            handleMultipleDeleted();
        } catch (error: any) {
            console.error("Error deleting circuits:", error);

            // Extract specific error message if available
            let errorMessage = "Failed to delete circuits";

            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage, {
                description: "Please try again or contact support if the problem persists.",
            });
        }
    };

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
                Failed to load circuits
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col gap-2">
            {/* Professional Filter Bar */}
            <div className={filterCardClass}>
                {/* Search and field select */}
                <div className="flex-1 flex items-center gap-3 min-w-0">
                    {/* Search Field Selector */}
                    <div className="relative">
                        <Select value={searchField} onValueChange={setSearchField}>
                            <SelectTrigger className="w-[140px] h-10 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg rounded-lg">
                                <SelectValue>
                                    {SEARCH_FIELDS.find((opt) => opt.id === searchField)?.label || "All fields"}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-xl shadow-2xl">
                                {SEARCH_FIELDS.map((opt) => (
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

                    {/* Search Input */}
                    <div className="relative min-w-[300px] flex-1 group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                        <Input
                            placeholder="Search circuits..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="relative h-10 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 pl-10 pr-4 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg group-hover:shadow-xl placeholder:text-muted-foreground/60"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/60 group-hover:text-primary transition-colors duration-300">
                            <Search className="h-4 w-4" />
                        </div>
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-background/80 rounded-md"
                                onClick={() => setSearchQuery("")}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Advanced Filters Popover */}
                <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-10 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 shadow-lg rounded-lg transition-all duration-300"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                            {isFilterActive && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                                    {[
                                        searchQuery !== '',
                                        statusFilter !== 'any',
                                        typeFilter !== 'any'
                                    ].filter(Boolean).length}
                                </span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-80 p-4 bg-background/95 backdrop-blur-xl border border-primary/20 shadow-xl rounded-xl"
                        align="end"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-foreground">Advanced Filters</h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFilterOpen(false)}
                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Search Field Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Search In</label>
                                <Select value={searchField} onValueChange={setSearchField}>
                                    <SelectTrigger className="h-9 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-md rounded-lg">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-lg shadow-xl">
                                        {SEARCH_FIELDS.map((field) => (
                                            <SelectItem
                                                key={field.id}
                                                value={field.id}
                                                className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary rounded-md"
                                            >
                                                {field.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Status</label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="h-9 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-md rounded-lg">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-lg shadow-xl">
                                        {STATUS_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option.id}
                                                value={option.value}
                                                className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary rounded-md"
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Type Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Type</label>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="h-9 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-md rounded-lg">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-lg shadow-xl">
                                        {TYPE_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option.id}
                                                value={option.value}
                                                className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary rounded-md"
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {isFilterActive && (
                                <Button
                                    variant="outline"
                                    onClick={handleClearAllFilters}
                                    className="mt-2 h-10 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 shadow-lg rounded-lg transition-all duration-300"
                                >
                                    Clear All Filters
                                </Button>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Table Content */}
            <div className="flex-1 min-h-0">
                <CircuitTableContent
                    circuits={paginatedCircuits}
                    allCircuits={filteredCircuits}
                    selectedItems={selectedItems}
                    bulkSelection={bulkSelection}
                    pagination={pagination}
                    onEdit={handleEditCircuit}
                    onDelete={handleDeleteCircuit}
                    onView={onView || (() => { })}
                    onToggleStatus={onToggleStatus || (() => { })}
                    onManageSteps={onManageSteps || (() => { })}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onClearFilters={handleClearAllFilters}
                    onBulkDelete={handleBulkDelete}
                    onCreateCircuit={onCreateCircuit}
                    isLoading={isLoading}
                    isError={isError}
                    isSimpleUser={isSimpleUser}
                />
            </div>

            {/* Delete single circuit dialog */}
            <DeleteConfirmDialog
                open={!!deletingCircuit}
                onOpenChange={(open) => !open && setDeletingCircuit(null)}
                onConfirm={confirmDeleteCircuit}
                title="Delete Circuit"
                description={
                    deletingCircuit
                        ? `Are you sure you want to delete this circuit? This action cannot be undone.`
                        : ""
                }
                confirmText="Delete"
                destructive={true}
            />

            {/* Bulk delete dialog */}
            <AlertDialog open={deleteMultipleOpen} onOpenChange={setDeleteMultipleOpen}>
                <AlertDialogContent className="bg-background/95 backdrop-blur-xl border-destructive/20">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            Delete Circuits
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedItems.length} circuit(s)? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-background/50 border-border hover:bg-muted">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmBulkDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 