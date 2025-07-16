import { useState, useEffect } from "react";
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
import { Filter, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const SEARCH_FIELDS = [
    { id: "all", label: "All fields" },
    { id: "circuitKey", label: "Circuit Key" },
    { id: "title", label: "Title" },
    { id: "descriptif", label: "Description" },
];

const STATUS_OPTIONS = [
    { id: "any", label: "Any Status", value: "any" },
    { id: "active", label: "Active", value: "active" },
    { id: "inactive", label: "Inactive", value: "inactive" },
];

const TYPE_OPTIONS = [
    { id: "any", label: "Any Type", value: "any" },
    { id: "sales", label: "Sales", value: "sales" },
    { id: "purchase", label: "Purchase", value: "purchase" },
    { id: "invoice", label: "Invoice", value: "invoice" },
];

interface CircuitsTableProps {
    onCreateCircuit?: () => void;
    onView?: (circuit: Circuit) => void;
    onEdit?: (circuit: Circuit) => void;
    onDelete?: (circuit: Circuit) => void;
    onToggleStatus?: (circuit: Circuit) => void;
    onManageSteps?: (circuit: Circuit) => void;
}

export function CircuitsTable({
    onCreateCircuit,
    onView,
    onEdit,
    onDelete,
    onToggleStatus,
    onManageSteps
}: CircuitsTableProps) {
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
    const handleEditCircuit = (circuit: any) => {
        setEditingCircuit(circuit);
    };

    // Handle delete circuit
    const handleDeleteCircuit = (circuitId: number) => {
        // For now, just log the deletion
        console.log('Delete circuit:', circuitId);
    };

    // Handle bulk delete
    const handleBulkDelete = () => {
        setDeleteMultipleOpen(true);
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
        <div
            className="h-full flex flex-col gap-6 w-full"
            style={{ minHeight: "100%" }}
        >
            {/* Circuit-style Search + Filter Bar */}
            <div className={filterCardClass}>
                {/* Search and field select */}
                <div className="flex-1 flex items-center gap-4 min-w-0">
                    <div className="relative">
                        <Select value={searchField} onValueChange={setSearchField}>
                            <SelectTrigger className="w-[140px] h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg rounded-xl">
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

                    <div className="relative flex-1 group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                        <Input
                            placeholder="Search circuits..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="relative h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg group-hover:shadow-xl placeholder:text-muted-foreground/60"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/60 group-hover:text-primary transition-colors duration-300">
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
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
                                Filters
                                <span className="ml-2 px-2 py-0.5 rounded border border-blue-700 text-xs text-blue-300 bg-blue-900/40 font-mono">Alt+F</span>
                                {isFilterActive && (
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="end"
                            className="w-80 p-4 bg-background/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-2xl"
                        >
                            <div className="space-y-4">
                                <div className="mb-4 text-foreground font-bold text-lg flex items-center gap-2">
                                    <Filter className="h-5 w-5 text-primary" />
                                    Advanced Filters
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Status
                                        </label>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="bg-background/50 border-primary/20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {STATUS_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt.id} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Document Type
                                        </label>
                                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                                            <SelectTrigger className="bg-background/50 border-primary/20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {TYPE_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt.id} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Clear Filters Button */}
                                    {isFilterActive && (
                                        <div className="pt-4 border-t border-primary/10">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleClearAllFilters}
                                                className="w-full text-muted-foreground hover:text-foreground hover:bg-primary/10"
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Clear All Filters
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Circuit Table Content */}
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
                    onBulkEdit={() => { }}
                    onBulkDelete={handleBulkDelete}
                    onCreateCircuit={onCreateCircuit}
                    isLoading={isLoading}
                    isError={isError}
                />
            </div>
        </div>
    );
} 