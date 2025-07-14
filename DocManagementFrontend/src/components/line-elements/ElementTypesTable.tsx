import { useState, useEffect } from "react";
import { toast } from "sonner";
import lineElementsService from "@/services/lineElementsService";
import { ElementTypesTableContent } from "./table/ElementTypesTableContent";
import { DeleteConfirmDialog } from "../shared/DeleteConfirmDialog";
import { Trash2, Edit, Eye, Settings, Database, AlertTriangle, Filter, X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useElementTypeManagement } from "@/hooks/useElementTypeManagement";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ElementTypeFormDialog } from "./dialogs/ElementTypeFormDialog";
import { BulkDeleteDialog } from "./dialogs/BulkDeleteDialog";
import { ViewElementTypeDialog } from "./dialogs/ViewElementTypeDialog";

interface ElementTypesTableProps {
    isCreateWizardOpen: boolean;
    setIsCreateWizardOpen: (open: boolean) => void;
}

export function ElementTypesTable({ isCreateWizardOpen, setIsCreateWizardOpen }: ElementTypesTableProps) {
    const [editFormOpen, setEditFormOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);

    const {
        selectedElementTypes,
        bulkSelection,
        pagination,
        elementTypes: filteredElementTypes,
        paginatedElementTypes,
        editingElementType,
        viewingElementType,
        deletingElementType,
        deleteMultipleOpen,
        searchQuery,
        setSearchQuery,
        searchField,
        setSearchField,
        typeFilter,
        setTypeFilter,
        showAdvancedFilters,
        setShowAdvancedFilters,
        isLoading,
        isError,
        refetch,
        setEditingElementType,
        setViewingElementType,
        setDeletingElementType,
        setDeleteMultipleOpen,
        handleSort,
        sortBy,
        sortDirection,
        handleSelectElementType,
        handleSelectAll,
        handleElementTypeEdited,
        handleElementTypeDeleted,
        handleMultipleDeleted,
    } = useElementTypeManagement();

    // Clear bulk actions when component unmounts
    useEffect(() => {
        return () => {
            // Component cleanup - no longer needed
        };
    }, []);

    const handleDeleteElementType = async (id: number) => {
        try {
            await lineElementsService.elementTypes.delete(id);
            toast.success("Element type deleted successfully");
            setDeletingElementType(null);
            refetch();
        } catch (error) {
            toast.error("Failed to delete element type");
            console.error(error);
        }
    };

    const handleDeleteMultiple = async () => {
        try {
            const deletePromises = selectedElementTypes.map((id) =>
                lineElementsService.elementTypes.delete(id)
            );

            await Promise.all(deletePromises);
            toast.success(`Successfully deleted ${selectedElementTypes.length} element types`);
            handleMultipleDeleted();
        } catch (error) {
            toast.error("Failed to delete element types");
            console.error(error);
        }
    };

    // Handle element type edit using the form dialog
    const handleEditElementType = async (id: number, data: any) => {
        try {
            await lineElementsService.elementTypes.update(id, data);
            refetch();
            return Promise.resolve();
        } catch (error) {
            console.error(`Failed to update element type ${id}:`, error);
            return Promise.reject(error);
        }
    };

    // Professional filter/search bar styling - EXACT match with UserTable
    const filterCardClass =
        "w-full flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-background/50 to-primary/5 backdrop-blur-xl shadow-lg border border-primary/10";

    // Filter popover state
    const [filterOpen, setFilterOpen] = useState(false);

    // Filter options - matching UserTable pattern
    const typeOptions = [
        { id: "any", label: "Any Type", value: "any" },
        { id: "item", label: "Item", value: "Item" },
        { id: "general_account", label: "General Account", value: "GeneralAccounts" },
    ];

    // Search field options - matching UserTable pattern
    const searchFields = [
        { id: "all", label: "All Fields" },
        { id: "code", label: "Code" },
        { id: "type", label: "Type" },
        { id: "description", label: "Description" },
    ];

    // Apply filters immediately when changed - EXACT match with UserTable
    const handleTypeChange = (value: string) => {
        setTypeFilter(value);
    };

    // Clear all filters - EXACT match with UserTable
    const clearAllFilters = () => {
        setTypeFilter("any");
        setSearchQuery("");
        setSearchField("all");
        setFilterOpen(false); // Close popover after clearing
    };

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

    // Loading state - EXACT match with UserTable
    if (isLoading) {
        return (
            <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Error state - EXACT match with UserTable
    if (isError) {
        return (
            <div className="text-destructive py-10 text-center">
                <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
                Error loading element types
            </div>
        );
    }

    return (
        <div
            className="h-full flex flex-col gap-6 w-full"
            style={{ minHeight: "100%" }}
        >
            {/* Document-style Search + Filter Bar - EXACT match with UserTable */}
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
                        {/* EXACT search icon from UserTable */}
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
                {/* Filter popover - EXACT match with UserTable */}
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
                                {(typeFilter !== "any") && (
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
                                    <span className="text-sm text-popover-foreground">
                                        Type
                                    </span>
                                    <Select
                                        value={typeFilter}
                                        onValueChange={handleTypeChange}
                                    >
                                        <SelectTrigger className="w-full bg-background/50 backdrop-blur-sm text-foreground border border-border focus:ring-primary focus:border-primary transition-colors duration-200 hover:bg-background/70 shadow-sm rounded-md">
                                            <SelectValue>
                                                {
                                                    typeOptions.find(
                                                        (opt) => opt.value === typeFilter
                                                    )?.label
                                                }
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
                                {(typeFilter !== "any") && (
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

            {/* Main content - EXACT match with UserTable layout */}
            <div className="flex-1 min-h-0">
                <ElementTypesTableContent
                    elementTypes={paginatedElementTypes}
                    allElementTypes={filteredElementTypes}
                    selectedElementTypes={selectedElementTypes}
                    bulkSelection={bulkSelection}
                    pagination={pagination}
                    onEdit={(elementType) => {
                        console.log("Editing element type:", elementType);
                        setEditingElementType(elementType);
                        setEditFormOpen(true);
                    }}
                    onView={(elementType) => {
                        console.log("Viewing element type:", elementType);
                        setViewingElementType(elementType);
                        setViewDialogOpen(true);
                    }}
                    onDelete={(id) => {
                        console.log("Setting deleting element type:", id);
                        setDeletingElementType(id);
                    }}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onClearFilters={clearAllFilters}
                    onBulkDelete={() => setDeleteMultipleOpen(true)}
                    isLoading={isLoading}
                    isError={isError}
                />
            </div>

            {/* Edit Dialog */}
            {editingElementType && (
                <ElementTypeFormDialog
                    open={editFormOpen}
                    onOpenChange={() => {
                        setEditFormOpen(false);
                        setEditingElementType(null);
                    }}
                    elementType={editingElementType}
                    onSuccess={() => {
                        handleElementTypeEdited();
                        setEditFormOpen(false);
                    }}
                />
            )}

            {/* View Dialog */}
            {viewingElementType && (
                <ViewElementTypeDialog
                    open={viewDialogOpen}
                    onOpenChange={(open) => {
                        if (!open) {
                            setViewDialogOpen(false);
                            setViewingElementType(null);
                        }
                    }}
                    elementType={viewingElementType}
                />
            )}

            {/* Delete Confirmation - EXACT match with UserTable */}
            {deletingElementType !== null && (
                <DeleteConfirmDialog
                    title="Delete Element Type"
                    description="Are you sure you want to delete this element type? This action cannot be undone."
                    open={deletingElementType !== null}
                    onOpenChange={(open) => {
                        console.log("Delete dialog open change:", open, "deletingElementType:", deletingElementType);
                        if (!open) setDeletingElementType(null);
                    }}
                    onConfirm={() => {
                        console.log("Delete confirmed for element type:", deletingElementType);
                        if (deletingElementType) {
                            handleDeleteElementType(deletingElementType);
                        }
                    }}
                />
            )}

            {/* Bulk Delete Dialog */}
            {deleteMultipleOpen && (
                <BulkDeleteDialog
                    open={deleteMultipleOpen}
                    onOpenChange={setDeleteMultipleOpen}
                    onConfirm={handleDeleteMultiple}
                    count={selectedElementTypes.length}
                    itemName="element types"
                />
            )}
        </div>
    );
} 