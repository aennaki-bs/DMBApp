import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreVertical, Edit2, Trash2, Settings, FileText, ArrowRight, UserCheck, Users, User } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";
import { Step } from "@/models/step";

// Enhanced step type with approval display information
interface EnhancedStep extends Step {
    approvalName?: string;
    approvalType?: 'individual' | 'group' | '';
}

const SEARCH_FIELDS = [
    { id: "all", label: "All fields" },
    { id: "title", label: "Title" },
    { id: "description", label: "Description" },
    { id: "stepKey", label: "Step Key" },
];

interface Circuit {
    id: number;
    title: string;
    circuitKey: string;
    isActive: boolean;
}

interface CircuitStepsTableViewProps {
    steps: EnhancedStep[];
    selectedSteps: number[];
    onSelectStep: (id: number, checked: boolean) => void;
    onSelectAll: (checked: boolean) => void;
    onEdit: (step: EnhancedStep) => void;
    onDelete: (step: EnhancedStep) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    isCircuitActive?: boolean;
    isSimpleUser?: boolean;
    circuit?: Circuit;
}

export function CircuitStepsTableView({
    steps,
    selectedSteps,
    onSelectStep,
    onSelectAll,
    onEdit,
    onDelete,
    searchQuery,
    onSearchChange,
    isCircuitActive = false,
    isSimpleUser = false,
    circuit,
}: CircuitStepsTableViewProps) {
    const [searchField, setSearchField] = useState("all");
    const [sortBy, setSortBy] = useState("title");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Filter steps based on search
    const filteredSteps = steps.filter((step) => {
        if (!searchQuery) return true;

        const query = searchQuery.toLowerCase();
        const searchableFields = {
            all: [step.title, step.descriptif, step.stepKey].filter(Boolean).join(' ').toLowerCase(),
            title: step.title.toLowerCase(),
            description: (step.descriptif || '').toLowerCase(),
            stepKey: (step.stepKey || '').toLowerCase(),
        };

        const fieldToSearch = searchableFields[searchField as keyof typeof searchableFields] || searchableFields.all;
        return fieldToSearch.includes(query);
    });

    // Sort steps
    const sortedSteps = [...filteredSteps].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortBy) {
            case 'title':
                aValue = a.title;
                bValue = b.title;
                break;
            case 'currentStatus':
                aValue = a.currentStatusTitle || '';
                bValue = b.currentStatusTitle || '';
                break;
            case 'nextStatus':
                aValue = a.nextStatusTitle || '';
                bValue = b.nextStatusTitle || '';
                break;
            case 'orderIndex':
                aValue = a.orderIndex || 0;
                bValue = b.orderIndex || 0;
                break;
            default:
                aValue = a.title;
                bValue = b.title;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination
    const pagination = usePagination({
        data: sortedSteps,
        initialPageSize: 25,
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

    // Check if all current page steps are selected
    const currentPageSteps = pagination.paginatedData;
    const currentPageSelectedCount = currentPageSteps.filter(step => selectedSteps.includes(step.id)).length;
    const isAllCurrentPageSelected = currentPageSteps.length > 0 && currentPageSelectedCount === currentPageSteps.length;
    const isIndeterminate = currentPageSelectedCount > 0 && currentPageSelectedCount < currentPageSteps.length;

    const handleSelectAllCurrentPage = () => {
        const allSelected = isAllCurrentPageSelected;
        currentPageSteps.forEach(step => {
            onSelectStep(step.id, !allSelected);
        });
    };

    if (steps.length === 0) {
        return (
            <div className="h-full flex flex-col gap-4">
                <div className="h-[400px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
                            <Settings className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-lg font-medium text-foreground mb-2">No steps found</p>
                        <p className="text-sm text-muted-foreground">
                            No steps have been created for this circuit yet.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col gap-4">
            {/* Search Section - Matching Statuses Page */}
            <div className="flex gap-3 items-center bg-slate-800/90 backdrop-blur-sm border border-slate-600/70 rounded-xl p-4 shadow-lg">
                <div className="flex-1 flex gap-3 items-center">
                    <Select
                        value={searchField}
                        onValueChange={setSearchField}
                    >
                        <SelectTrigger className="w-[140px] bg-slate-700/50 border-slate-600/50 text-slate-200">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {SEARCH_FIELDS.map((field) => (
                                <SelectItem key={field.id} value={field.id}>
                                    {field.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex-1 relative">
                        <Input
                            placeholder="Search steps..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder:text-slate-400"
                        />
                    </div>
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
                                                    checked={!isCircuitActive && !isSimpleUser && isAllCurrentPageSelected}
                                                    indeterminate={!isCircuitActive && !isSimpleUser && isIndeterminate}
                                                    onCheckedChange={handleSelectAllCurrentPage}
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
                                        {currentPageSteps.map((step) => {
                                            const isSelected = selectedSteps.includes(step.id);
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
                                                                        onSelectStep(step.id, !!checked);
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
                                                            <div className="flex items-center">
                                                                {step.approvalType === 'group' ? (
                                                                    <>
                                                                        <Users className="h-4 w-4 mr-2 text-blue-400" />
                                                                        <span className="text-sm text-blue-100 font-semibold truncate" title={step.approvalName}>
                                                                            {step.approvalName || 'Approval Group'}
                                                                        </span>
                                                                    </>
                                                                ) : step.approvalType === 'individual' ? (
                                                                    <>
                                                                        <User className="h-4 w-4 mr-2 text-green-400" />
                                                                        <span className="text-sm text-green-100 font-semibold truncate" title={step.approvalName}>
                                                                            {step.approvalName || 'Individual Approver'}
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <UserCheck className="h-4 w-4 mr-2 text-blue-400" />
                                                                        <span className="text-sm text-blue-100 font-semibold truncate">
                                                                            Requires Approval
                                                                        </span>
                                                                    </>
                                                                )}
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

            {/* Pagination */}
            {sortedSteps.length > 0 && (
                <SmartPagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    pageSize={pagination.pageSize}
                    totalItems={pagination.totalItems}
                    onPageChange={pagination.handlePageChange}
                    onPageSizeChange={pagination.handlePageSizeChange}
                />
            )}
        </div>
    );
} 