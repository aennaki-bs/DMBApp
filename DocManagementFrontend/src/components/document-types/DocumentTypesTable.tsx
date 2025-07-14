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
import { Filter, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

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

interface DocumentTypesTableProps {
    onCreateType?: () => void;
}

export function DocumentTypesTable({ onCreateType }: DocumentTypesTableProps) {
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
        showAdvancedFilters,
        setShowAdvancedFilters,
        isLoading,
        isError,
        refetch,
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
        setSearchQuery("");
        setFilterOpen(false);
    };

    // Check if any filters are active
    const isFilterActive = searchQuery !== '' || tierTypeFilter !== 'any' || hasDocumentsFilter !== 'any';

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
    const handleEditType = (type: any) => {
        setEditingType(type);
    };

    // Handle delete type
    const handleDeleteType = (typeId: number) => {
        setDeletingType(typeId);
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
                Failed to load document types
            </div>
        );
    }

    return (
        <div
            className="h-full flex flex-col gap-6 w-full"
            style={{ minHeight: "100%" }}
        >
            {/* Document-style Search + Filter Bar */}
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
                            placeholder="Search document types..."
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
                        <PopoverContent className="w-80 bg-background/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl p-6">
                            <div className="mb-4 text-foreground font-bold text-lg flex items-center gap-2">
                                <Filter className="h-5 w-5 text-primary" />
                                Advanced Filters
                            </div>
                            <div className="flex flex-col gap-4">
                                {/* Tier Type Filter */}
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-popover-foreground">Tier Type</span>
                                    <Select value={tierTypeFilter} onValueChange={setTierTypeFilter}>
                                        <SelectTrigger className="h-10 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg rounded-lg">
                                            <SelectValue>
                                                {TIER_TYPE_OPTIONS.find((opt) => opt.value === tierTypeFilter)?.label || "Any Tier Type"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-xl shadow-2xl">
                                            {TIER_TYPE_OPTIONS.map((opt) => (
                                                <SelectItem
                                                    key={opt.id}
                                                    value={opt.value}
                                                    className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary rounded-lg"
                                                >
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Has Documents Filter */}
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-popover-foreground">Documents</span>
                                    <Select value={hasDocumentsFilter} onValueChange={setHasDocumentsFilter}>
                                        <SelectTrigger className="h-10 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg rounded-lg">
                                            <SelectValue>
                                                {HAS_DOCUMENTS_OPTIONS.find((opt) => opt.value === hasDocumentsFilter)?.label || "Any"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-xl shadow-2xl">
                                            {HAS_DOCUMENTS_OPTIONS.map((opt) => (
                                                <SelectItem
                                                    key={opt.id}
                                                    value={opt.value}
                                                    className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary rounded-lg"
                                                >
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Clear Filters Button */}
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
        </div>
    );
} 