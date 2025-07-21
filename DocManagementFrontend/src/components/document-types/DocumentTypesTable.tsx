import { useState, useEffect } from "react";
import { DocumentTypeTableContent } from "./DocumentTypeTableContent";
import { useDocumentTypeManagement } from "@/hooks/useDocumentTypeManagement";
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
import { Filter, X, AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ERP_TYPE_MAPPINGS } from "@/utils/erpTypeUtils";
import documentService from "@/services/documentService";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { DocumentType } from "@/models/document";
import { Badge } from "@/components/ui/badge";

const SEARCH_FIELDS = [
    { id: "all", label: "All fields" },
    { id: "typeName", label: "Type Name" },
    { id: "typeAttr", label: "Description" },
];

const TIER_TYPE_OPTIONS = [
    { id: "any", label: "Any Tier Type", value: "any" },
    { id: "none", label: "None", value: "none" },
    { id: "1", label: "Customer", value: "1" },
    { id: "2", label: "Vendor", value: "2" },
];

const HAS_DOCUMENTS_OPTIONS = [
    { id: "any", label: "Any", value: "any" },
    { id: "yes", label: "With Documents", value: "yes" },
    { id: "no", label: "Without Documents", value: "no" },
];

const ERP_TYPE_OPTIONS = [
    { id: "any", label: "Any ERP Type", value: "any" },
    ...Object.entries(ERP_TYPE_MAPPINGS).map(([typeNumber, typeName]) => ({
        id: typeNumber,
        label: typeName,
        value: typeName,
    })),
];



interface DocumentTypesTableProps {
    onCreateType?: () => void;
    onEditType?: (type: DocumentType) => void;
}

export function DocumentTypesTable({ onCreateType, onEditType }: DocumentTypesTableProps) {
    const {
        selectedTypes,
        bulkSelection,
        pagination,
        types: filteredTypes,
        paginatedTypes,
        editingType,
        deletingType,
        deleteMultipleOpen,
        searchQuery,
        setSearchQuery,
        searchField,
        setSearchField,
        tierTypeFilter,
        setTierTypeFilter,
        hasDocumentsFilter,
        setHasDocumentsFilter,
        erpTypeFilter,
        setErpTypeFilter,
        showAdvancedFilters,
        setShowAdvancedFilters,
        isLoading,
        isError,
        refetch,
        isFetching,
        setEditingType,
        setDeletingType,
        setDeleteMultipleOpen,
        handleSort,
        sortBy,
        sortDirection,
        handleTypeEdited,
        handleTypeDeleted,
        handleMultipleDeleted,
    } = useDocumentTypeManagement();

    // Filter popover state
    const [filterOpen, setFilterOpen] = useState(false);

    // Professional filter/search bar styling
    const filterCardClass =
        "w-full flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-background/50 to-primary/5 backdrop-blur-xl shadow-lg border border-primary/10";

    // Clear all filters
    const clearAllFilters = () => {
        setTierTypeFilter("any");
        setHasDocumentsFilter("any");
        setErpTypeFilter("any");
        setSearchQuery("");
        setFilterOpen(false);
    };

    // Check if any filters are active
    const isFilterActive = searchQuery !== '' || tierTypeFilter !== 'any' || hasDocumentsFilter !== 'any' || erpTypeFilter !== 'any';

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

    // Handle edit type
    const handleEditType = (type: DocumentType) => {
        if (onEditType) {
            onEditType(type);
        } else {
            setEditingType(type);
        }
    };

    // Handle delete type
    const handleDeleteType = (typeId: number) => {
        setDeletingType(typeId);
    };

    // Handle single type deletion confirmation
    const confirmDeleteType = async () => {
        if (!deletingType) return;

        try {
            const typeToDelete = filteredTypes.find((type) => type.id === deletingType);
            await documentService.deleteDocumentType(deletingType);
            toast.success(
                `Document type "${typeToDelete?.typeName || 'Unknown'}" deleted successfully`
            );
            handleTypeDeleted();
        } catch (error: any) {
            console.error("Error deleting document type:", error);
            
            // Extract specific error message if available
            let errorMessage = "Failed to delete document type";
            
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
            
            toast.error(errorMessage);
        }
    };

    // Handle bulk delete - use the prop if provided, otherwise use internal logic
    const handleBulkDelete = () => {
        console.log("handleBulkDelete called");
        console.log("selectedTypes:", selectedTypes);
        console.log("selectedTypes length:", selectedTypes.length);
        
        if (selectedTypes.length === 0) {
            toast.error("No document types selected");
            return;
        }

        // Note: Association checking has been disabled - allow all bulk deletions
        console.log("Association checking disabled - allowing all bulk deletions");
        setDeleteMultipleOpen(true);
    };

    // Handle bulk delete confirmation
    const confirmBulkDelete = async () => {
        console.log("confirmBulkDelete called");
        console.log("selectedTypes for deletion:", selectedTypes);
        
        try {
            await documentService.deleteMultipleDocumentTypes(selectedTypes);
            toast.success(
                `${selectedTypes.length} document types deleted successfully`
            );
            handleMultipleDeleted();
        } catch (error: any) {
            console.error("Error deleting document types:", error);
            
            // Extract specific error message if available
            let errorMessage = "Failed to delete document types";
            
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
            
            toast.error(errorMessage);
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
                Failed to load document types
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Professional Filter Bar */}
            <div className={filterCardClass}>
                {/* Search Input */}
                <div className="flex-1 flex items-center gap-3 min-w-0">
                    <Input
                        placeholder="Search document types..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg rounded-lg"
                    />



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
                                            tierTypeFilter !== 'any',
                                            hasDocumentsFilter !== 'any',
                                            erpTypeFilter !== 'any'
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

                                {/* Tier Type Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Tier Type</label>
                                    <Select value={tierTypeFilter} onValueChange={setTierTypeFilter}>
                                        <SelectTrigger className="h-9 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-md rounded-lg">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-lg shadow-xl">
                                            {TIER_TYPE_OPTIONS.map((option) => (
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

                                {/* Has Documents Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Has Documents</label>
                                    <Select value={hasDocumentsFilter} onValueChange={setHasDocumentsFilter}>
                                        <SelectTrigger className="h-9 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-md rounded-lg">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-lg shadow-xl">
                                            {HAS_DOCUMENTS_OPTIONS.map((option) => (
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

                                {/* ERP Type Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">ERP Type</label>
                                    <Select value={erpTypeFilter} onValueChange={setErpTypeFilter}>
                                        <SelectTrigger className="h-9 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-md rounded-lg">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-lg shadow-xl">
                                            {ERP_TYPE_OPTIONS.map((option) => (
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
                                        onClick={clearAllFilters}
                                        className="mt-2 h-10 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 shadow-lg rounded-lg transition-all duration-300"
                                    >
                                        Clear All Filters
                                    </Button>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 min-h-0">
                <DocumentTypeTableContent
                    types={paginatedTypes}
                    allTypes={filteredTypes}
                    selectedTypes={selectedTypes}
                    bulkSelection={bulkSelection}
                    pagination={pagination}
                    onEditType={handleEditType}
                    onDeleteType={handleDeleteType}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onClearFilters={clearAllFilters}
                    onBulkDelete={handleBulkDelete}
                    onCreateType={onCreateType}
                    isLoading={isLoading}
                    isError={isError}
                />
            </div>

            {/* Delete single type dialog */}
            <DeleteConfirmDialog
                open={!!deletingType}
                onOpenChange={(open) => !open && setDeletingType(null)}
                onConfirm={confirmDeleteType}
                title="Delete Document Type"
                description={
                    deletingType
                        ? `Are you sure you want to delete this document type? This action cannot be undone.`
                        : ""
                }
            />

            {/* Bulk delete dialog */}
            <AlertDialog open={deleteMultipleOpen} onOpenChange={setDeleteMultipleOpen}>
                <AlertDialogContent className="bg-background/95 backdrop-blur-xl border-destructive/20">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            Delete Document Types
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedTypes.length} document
                            types? This action cannot be undone.
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