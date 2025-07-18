import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreVertical, Edit2, Trash2, Settings, FileText, ArrowRight, UserCheck, Users, User, Search, X, GitBranch } from "lucide-react";
import { StepsTableEmpty } from "./StepsTableEmpty";
import { motion } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";
import PaginationWithBulkActions, { BulkAction } from "@/components/shared/PaginationWithBulkActions";
import { usePagination } from "@/hooks/usePagination";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { Step } from "@/models/step";
import stepService from "@/services/stepService";
import { toast } from "sonner";

// Enhanced step type with approval display information
interface EnhancedStep extends Step {
    approvalName?: string;
    approvalType?: 'individual' | 'group' | '';
}

const SEARCH_FIELDS = [
    { id: "all", label: "All fields" },
    { id: "title", label: "Title" },
    { id: "currentStatus", label: "Current Status" },
    { id: "nextStatus", label: "Next Status" },
];

interface Circuit {
    id: number;
    title: string;
    circuitKey: string;
    isActive: boolean;
}

interface CircuitStepsTableViewProps {
    steps: Step[];
    onEdit: (step: Step) => void;
    onDelete: (step: Step) => void;
    searchQuery: string;
    searchField?: string;
    onSearchChange: (query: string) => void;
    onSearchFieldChange?: (field: string) => void;
    isCircuitActive?: boolean;
    isSimpleUser?: boolean;
    circuit?: Circuit;
    searchStats?: { totalResults: number; searchTime: number };
    onRefetch: () => void;
}

export function CircuitStepsTableView({
    steps,
    onEdit,
    onDelete,
    searchQuery,
    searchField = "all",
    onSearchChange,
    onSearchFieldChange,
    isCircuitActive = false,
    isSimpleUser = false,
    circuit,
    searchStats,
    onRefetch,
}: CircuitStepsTableViewProps) {
    const [sortBy, setSortBy] = useState("title");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Professional search result highlighting
    const highlightSearchTerm = (text: string, searchQuery: string) => {
        if (!searchQuery.trim() || !text) return text;

        const terms = searchQuery.toLowerCase().trim().split(' ').filter(term => term.length > 0);
        let highlightedText = text;

        terms.forEach(term => {
            const regex = new RegExp(`(${term})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>');
        });

        return highlightedText;
    };

    // Sort steps (filtering is now handled by the hook)
    const sortedSteps = [...steps].sort((a, b) => {
        const aValue = sortBy === "orderIndex" ? a.orderIndex : a.title;
        const bValue = sortBy === "orderIndex" ? b.orderIndex : b.title;

        if (sortDirection === "asc") {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Use pagination hook
    const {
        currentPage,
        pageSize,
        totalPages,
        totalItems,
        paginatedData: paginatedSteps,
        handlePageChange,
        handlePageSizeChange,
    } = usePagination({
        data: sortedSteps,
        initialPageSize: 25,
    });

    // Use bulk selection hook
    const bulkSelection = useBulkSelection<Step>({
        data: sortedSteps,
        paginatedData: paginatedSteps,
        currentPage,
        pageSize,
        keyField: "id",
    });

    // Debug logging to help identify selection issues
    console.log("CircuitStepsTableView - Selection Debug:", {
        selectedCount: bulkSelection.selectedCount,
        currentPageSelectedCount: bulkSelection.currentPageSelectedCount,
        isCurrentPageFullySelected: bulkSelection.isCurrentPageFullySelected,
        isIndeterminate: bulkSelection.isIndeterminate,
        paginatedStepsLength: paginatedSteps.length,
        selectedItems: bulkSelection.selectedItems,
    });

    // Handle sorting
    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    const headerClass = (field: string) =>
        `cursor-pointer select-none transition-colors hover:text-blue-300 ${sortBy === field ? "text-blue-200" : "text-blue-300/80"
        }`;

    const renderSortIcon = (field: string) => {
        if (sortBy !== field) {
            return <ArrowUpDown className="h-3.5 w-3.5 ml-1.5 opacity-50" />;
        }
        return sortDirection === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5 ml-1.5 text-blue-300" />
        ) : (
            <ArrowDown className="h-3.5 w-3.5 ml-1.5 text-blue-300" />
        );
    };

    // Check if there are filtered results vs no steps at all
    const hasSteps = steps.length > 0;
    const isFiltered = searchQuery.trim() !== '';

    // Professional filter/search bar styling - exact match to Circuit Statuses
    const filterCardClass =
        "w-full flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-background/50 to-primary/5 backdrop-blur-xl shadow-lg border border-primary/10";

    if (steps.length === 0 && !isFiltered) {
        return (
            <div className="h-full flex flex-col gap-6 w-full" style={{ minHeight: "100%" }}>
                {/* Professional Search Bar - matching Circuit Statuses page exactly */}
                <div className={filterCardClass}>
                    {/* Search and field select */}
                    <div className="flex-1 flex items-center gap-4 min-w-0">
                        <div className="relative">
                            <Select value={searchField} onValueChange={onSearchFieldChange}>
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

                        <div className="flex-1 relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                            <Input
                                placeholder="Search steps... Use quotes for exact phrases"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="relative h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg group-hover:shadow-xl placeholder:text-muted-foreground/60"
                            />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/60 group-hover:text-primary transition-colors duration-300">
                                <Search className="h-5 w-5" />
                            </div>
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-background/80 rounded-lg"
                                    onClick={() => onSearchChange("")}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {/* Professional Search Results Indicator */}
                        {searchQuery && searchStats && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="px-3 py-1 bg-background/80 backdrop-blur rounded-lg border border-primary/10">
                                    <span className="font-medium text-primary">{searchStats.totalResults}</span> results
                                </div>
                                {searchStats.searchTime > 0 && (
                                    <div className="px-2 py-1 text-xs text-muted-foreground/70">
                                        {searchStats.searchTime.toFixed(1)}ms
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Empty State */}
                <StepsTableEmpty
                    searchQuery=""
                    searchField={searchField}
                    onClearFilters={() => onSearchChange("")}
                    searchFields={SEARCH_FIELDS}
                />
            </div>
        );
    }

    if (sortedSteps.length === 0 && isFiltered) {
        return (
            <div className="h-full flex flex-col gap-6 w-full" style={{ minHeight: "100%" }}>
                {/* Professional Search Bar - matching Circuit Statuses page exactly */}
                <div className={filterCardClass}>
                    {/* Search and field select */}
                    <div className="flex-1 flex items-center gap-4 min-w-0">
                        <div className="relative">
                            <Select value={searchField} onValueChange={onSearchFieldChange}>
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

                        <div className="flex-1 relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                            <Input
                                placeholder="Search steps... Use quotes for exact phrases"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="relative h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg group-hover:shadow-xl placeholder:text-muted-foreground/60"
                            />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/60 group-hover:text-primary transition-colors duration-300">
                                <Search className="h-5 w-5" />
                            </div>
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-background/80 rounded-lg"
                                    onClick={() => onSearchChange("")}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {/* Professional Search Results Indicator */}
                        {searchQuery && searchStats && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="px-3 py-1 bg-background/80 backdrop-blur rounded-lg border border-primary/10">
                                    <span className="font-medium text-primary">{searchStats.totalResults}</span> results
                                </div>
                                {searchStats.searchTime > 0 && (
                                    <div className="px-2 py-1 text-xs text-muted-foreground/70">
                                        {searchStats.searchTime.toFixed(1)}ms
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Professional No Results State */}
                <StepsTableEmpty
                    searchQuery={searchQuery}
                    searchField={searchField}
                    onClearFilters={() => onSearchChange("")}
                    searchFields={SEARCH_FIELDS}
                />
            </div>
        );
    }

    // Handle bulk delete
    const handleBulkDelete = async () => {
        if (isCircuitActive) {
            toast.error("Cannot delete steps from an active circuit");
            return;
        }

        try {
            const selectedObjects = bulkSelection.getSelectedObjects();
            const selectedCount = selectedObjects.length;
            const selectedStepIds = selectedObjects.map(step => step.id);
            
            await stepService.deleteMultipleSteps(selectedStepIds);
            bulkSelection.clearSelection();
            onRefetch();
            toast.success(`${selectedCount} steps deleted successfully`);
        } catch (error) {
            console.error("Failed to delete steps:", error);
            toast.error("Failed to delete selected steps");
        }
    };

    // Define bulk actions - hide completely when circuit is active or user is SimpleUser
    const bulkActions: BulkAction[] = (isCircuitActive || isSimpleUser) ? [] : [
        {
            id: 'delete',
            label: 'Delete Steps',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive',
            onClick: handleBulkDelete,
            requiresConfirmation: true,
            shortcut: 'Del',
        },
    ];

    return (
        <div className="h-full flex flex-col gap-6 w-full" style={{ minHeight: "100%" }}>
            {/* Professional Search Bar - matching Circuit Statuses page exactly */}
            <div className={filterCardClass}>
                {/* Search and field select */}
                <div className="flex-1 flex items-center gap-4 min-w-0">
                    <div className="relative">
                        <Select value={searchField} onValueChange={onSearchFieldChange}>
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

                    <div className="relative min-w-[300px] flex-1 group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                        <Input
                            placeholder="Search steps..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="relative h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg group-hover:shadow-xl placeholder:text-muted-foreground/60"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/60 group-hover:text-primary transition-colors duration-300">
                            <Search className="h-5 w-5" />
                        </div>
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-background/80 rounded-lg"
                                onClick={() => onSearchChange("")}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Professional Search Results Indicator */}
                    {searchQuery && searchStats && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="px-3 py-1 bg-background/80 backdrop-blur rounded-lg border border-primary/10">
                                <span className="font-medium text-primary">{searchStats.totalResults}</span> results
                            </div>
                            {searchStats.searchTime > 0 && (
                                <div className="px-2 py-1 text-xs text-muted-foreground/70">
                                    {searchStats.searchTime.toFixed(1)}ms
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Table - Matching Statuses Page Structure */}
            <div className="flex-1 relative overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-lg min-h-0">
                {/* Subtle animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/2 via-transparent to-primary/2 animate-pulse"></div>

                <div className="relative h-full flex flex-col z-10">
                    {/* Fixed Header - Never Scrolls */}
                    <div className="flex-shrink-0 overflow-x-auto border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
                        <div className="min-w-[1000px]">
                            <Table className="table-fixed w-full">
                                <TableHeader>
                                    <TableRow className="border-slate-200/50 dark:border-slate-700/50 hover:bg-transparent">
                                        <TableHead className="w-[48px] text-center">
                                            <div className="flex items-center justify-center">
                                                <ProfessionalCheckbox
                                                    checked={!isCircuitActive && !isSimpleUser && bulkSelection.isCurrentPageFullySelected}
                                                    indeterminate={!isCircuitActive && !isSimpleUser && bulkSelection.isIndeterminate}
                                                    onCheckedChange={bulkSelection.toggleSelectCurrentPage}
                                                    size="md"
                                                    variant="header"
                                                    className="shadow-lg"
                                                    disabled={isCircuitActive || isSimpleUser}
                                                />
                                            </div>
                                        </TableHead>
                                        <TableHead className="w-[60px] text-center"></TableHead>
                                        <TableHead
                                            className={`${headerClass("title")} w-[200px]`}
                                            onClick={() => handleSort("title")}
                                        >
                                            <div className="flex items-center">
                                                Title {renderSortIcon("title")}
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className={`${headerClass("currentStatus")} w-[160px]`}
                                            onClick={() => handleSort("currentStatus")}
                                        >
                                            <div className="flex items-center">
                                                Current Status {renderSortIcon("currentStatus")}
                                            </div>
                                        </TableHead>
                                        <TableHead className="w-[50px] text-center">
                                            <ArrowRight className="h-4 w-4 mx-auto text-blue-500/50" />
                                        </TableHead>
                                        <TableHead
                                            className={`${headerClass("nextStatus")} w-[160px]`}
                                            onClick={() => handleSort("nextStatus")}
                                        >
                                            <div className="flex items-center">
                                                Next Status {renderSortIcon("nextStatus")}
                                            </div>
                                        </TableHead>
                                        <TableHead className="w-[150px] text-blue-300/80">
                                            <div className="flex items-center">
                                                <UserCheck className="h-4 w-4 mr-1.5" />
                                                Approval
                                            </div>
                                        </TableHead>
                                        <TableHead className="w-[90px] text-center">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                            </Table>
                        </div>
                    </div>

                    {/* Scrollable Body - Only Content Scrolls */}
                    <div
                        className="flex-1 overflow-hidden"
                        style={{ maxHeight: "calc(100vh - 320px)" }}
                    >
                        <ScrollArea className="table-scroll-area h-full w-full">
                            <div className="min-w-[1000px] pb-4">
                                <Table className="table-fixed w-full">
                                    <TableBody>
                                        {paginatedSteps.map((step) => {
                                            const isSelected = bulkSelection.isSelected(step);
                                            return (
                                                <TableRow
                                                    key={step.id}
                                                    className={`border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-200 ${isSelected ? "bg-blue-50/70 dark:bg-blue-950/20 border-blue-200/70 dark:border-blue-800/50" : ""
                                                        }`}
                                                >
                                                    <TableCell className="w-[48px] text-center">
                                                        <div className="flex items-center justify-center py-2">
                                                            <ProfessionalCheckbox
                                                                checked={isSelected}
                                                                onCheckedChange={(checked) => {
                                                                    if (!isCircuitActive && !isSimpleUser) {
                                                                        bulkSelection.toggleItem(step);
                                                                    }
                                                                }}
                                                                size="md"
                                                                variant="row"
                                                                className="shadow-sm"
                                                                disabled={isCircuitActive || isSimpleUser}
                                                            />
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="w-[60px]">
                                                        <div className="flex items-center justify-center py-2">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white border border-blue-300 dark:border-blue-900/50 flex items-center justify-center">
                                                                <Settings className="h-3.5 w-3.5" />
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="w-[200px] px-3 py-3">
                                                        <div className="flex flex-col">
                                                            <div className="font-medium text-blue-900 dark:text-blue-100 truncate">
                                                                {step.title || step.stepKey || "Untitled Step"}
                                                            </div>
                                                            {step.descriptif && (
                                                                <span className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                                                    {step.descriptif}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="w-[160px] px-3 py-3">
                                                        {step.currentStatusTitle ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="bg-blue-900/20 text-blue-300 border-blue-700/50 py-1.5 px-3 font-medium"
                                                            >
                                                                {step.currentStatusTitle}
                                                            </Badge>
                                                        ) : (
                                                            <Badge
                                                                variant="outline"
                                                                className="py-1.5 px-3 font-medium border opacity-70 text-gray-400 border-gray-700"
                                                            >
                                                                Not Set
                                                            </Badge>
                                                        )}
                                                    </TableCell>

                                                    <TableCell className="w-[50px] text-center">
                                                        <ArrowRight className="h-4 w-4 text-blue-500/70" />
                                                    </TableCell>

                                                    <TableCell className="w-[160px] px-3 py-3">
                                                        {step.nextStatusTitle ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="bg-blue-900/15 text-blue-200 border-blue-700/50 py-1.5 px-3 font-medium"
                                                            >
                                                                {step.nextStatusTitle}
                                                            </Badge>
                                                        ) : (
                                                            <Badge
                                                                variant="outline"
                                                                className="py-1.5 px-3 font-medium border opacity-70 text-gray-400 border-gray-700"
                                                            >
                                                                Not Set
                                                            </Badge>
                                                        )}
                                                    </TableCell>

                                                    <TableCell className="w-[150px] px-3 py-3">
                                                        {step.requiresApproval ? (
                                                            <div className="flex items-center gap-2">
                                                                <Users className="h-3.5 w-3.5 text-green-300" />
                                                                <div className="text-xs">
                                                                    <div className="text-green-300 font-medium">
                                                                        {(step as any).approvalType === "group" ? "Group" : "Individual"}
                                                                    </div>
                                                                    <div className="text-green-200/80">
                                                                        {(step as any).approvalName || "Not assigned"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <Badge
                                                                variant="outline"
                                                                className="bg-gray-800/50 text-gray-400 border-gray-700"
                                                            >
                                                                No approval required
                                                            </Badge>
                                                        )}
                                                    </TableCell>

                                                    <TableCell className="w-[90px] px-2 py-3">
                                                        <div className="flex items-center justify-center">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                                        disabled={isCircuitActive && !isSimpleUser}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                        }}
                                                                    >
                                                                        <span className="sr-only">Open menu</span>
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-[140px]">
                                                                    {!isCircuitActive && !isSimpleUser && (
                                                                        <>
                                                                            <DropdownMenuItem
                                                                                onClick={() => onEdit(step)}
                                                                                className="cursor-pointer"
                                                                            >
                                                                                <Edit2 className="mr-2 h-4 w-4" />
                                                                                Edit
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                onClick={() => onDelete(step)}
                                                                                className="cursor-pointer text-destructive focus:text-destructive"
                                                                            >
                                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                                Delete
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}
                                                                    {(isCircuitActive || isSimpleUser) && (
                                                                        <DropdownMenuItem disabled>
                                                                            <FileText className="mr-2 h-4 w-4" />
                                                                            View Only
                                                                        </DropdownMenuItem>
                                                                    )}
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
            </div>

            {/* Pagination with Bulk Actions */}
            {sortedSteps.length > 0 && (
                <PaginationWithBulkActions
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    bulkSelection={bulkSelection}
                    bulkActions={bulkActions}
                />
            )}
        </div>
    );
} 