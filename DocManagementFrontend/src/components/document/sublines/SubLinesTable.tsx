import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { Search, Filter, X, Plus } from "lucide-react";
import { SousLigne } from "@/models/document";
import { SubLinesTableContent } from "./SubLinesTableContent";

interface SubLinesTableProps {
    subLines: SousLigne[];
    isLoading: boolean;
    error: string | null;
    selectedSubLines: number[];
    onSelectSubLine: (subLineId: number) => void;
    onSelectAll: () => void;
    sortBy: keyof SousLigne | null;
    sortDirection: "asc" | "desc" | null;
    onSort: (column: keyof SousLigne) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onEdit: (subLine: SousLigne) => void;
    onDelete: (subLine: SousLigne) => void;
    canManageDocuments: boolean;
    onCreateNew: () => void;
}

const searchFields = [
    { id: "all", label: "All Fields" },
    { id: "title", label: "Title" },
    { id: "attribute", label: "Attribute" },
];

export function SubLinesTable({
    subLines,
    isLoading,
    error,
    selectedSubLines,
    onSelectSubLine,
    onSelectAll,
    sortBy,
    sortDirection,
    onSort,
    searchQuery,
    onSearchChange,
    onEdit,
    onDelete,
    canManageDocuments,
    onCreateNew,
}: SubLinesTableProps) {
    const [searchField, setSearchField] = useState("all");
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const hasActiveFilters = searchQuery !== "" || searchField !== "all";

    const clearAllFilters = () => {
        onSearchChange("");
        setSearchField("all");
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            {/* <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background/30 backdrop-blur-xl border border-primary/20 shadow-lg rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/15 backdrop-blur-sm border border-primary/30">
                            <Plus className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                                Sub-Lines Management
                            </h2>
                            <p className="text-muted-foreground mt-1">
                                Manage and organize sub-lines for this line
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {canManageDocuments && (
                            <Button
                                onClick={onCreateNew}
                                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg border border-primary/30"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Sub-Line
                            </Button>
                        )}
                    </div>
                </div>
            </div> */}

            {/* Search and Filter Bar */}
            <div className="bg-background/50 backdrop-blur-sm border-border/50 rounded-xl border p-4 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Search Section */}
                    <div className="flex-1 flex items-center gap-2">
                        <Select value={searchField} onValueChange={setSearchField}>
                            <SelectTrigger className="w-36 bg-background/80 border-border/70">
                                <SelectValue placeholder="Search by..." />
                            </SelectTrigger>
                            <SelectContent>
                                {searchFields.map((field) => (
                                    <SelectItem key={field.id} value={field.id}>
                                        {field.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="relative flex-1 max-w-md">
                            <Input
                                type="text"
                                placeholder={`Search ${searchField === "all"
                                        ? "sub-lines"
                                        : searchFields.find(f => f.id === searchField)?.label.toLowerCase()
                                    }...`}
                                className="pl-10 bg-background/80 border-border/70"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    <div className="flex items-center gap-2">
                        <Popover open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`bg-background/80 border-border/70 ${hasActiveFilters ? "border-primary/50 text-primary" : ""
                                        }`}
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filters
                                    {hasActiveFilters && (
                                        <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                            {(searchQuery ? 1 : 0) + (searchField !== "all" ? 1 : 0)}
                                        </Badge>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 bg-background/95 backdrop-blur-xl border-border/50" align="end">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-foreground">Advanced Filters</h4>
                                        {hasActiveFilters && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={clearAllFilters}
                                                className="text-muted-foreground hover:text-foreground"
                                            >
                                                <X className="h-4 w-4 mr-1" /> Clear All
                                            </Button>
                                        )}
                                    </div>

                                    {/* Filter Badges */}
                                    {hasActiveFilters && (
                                        <div className="flex flex-wrap gap-2">
                                            {searchQuery && (
                                                <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                                                    Search: "{searchQuery}"
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onSearchChange("")}
                                                        className="ml-1 h-4 w-4 p-0 hover:bg-primary/20"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </Badge>
                                            )}
                                            {searchField !== "all" && (
                                                <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                                                    Field: {searchFields.find(f => f.id === searchField)?.label}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSearchField("all")}
                                                        className="ml-1 h-4 w-4 p-0 hover:bg-primary/20"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>

            {/* Table Content */}
            <SubLinesTableContent
                subLines={subLines}
                isLoading={isLoading}
                error={error}
                selectedSubLines={selectedSubLines}
                onSelectSubLine={onSelectSubLine}
                onSelectAll={onSelectAll}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={onSort}
                onEdit={onEdit}
                onDelete={onDelete}
                canManageDocuments={canManageDocuments}
                onCreateNew={onCreateNew}
            />
        </div>
    );
} 