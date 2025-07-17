import { useState, useEffect } from "react";
import { toast } from "sonner";
import { StepTableContent } from "./table/StepTableContent";
import { Step } from "@/models/step";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useStepManagement } from "@/hooks/useStepManagement";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { DEFAULT_STEP_SEARCH_FIELDS } from "@/components/table/constants/filters";

interface Circuit {
    id: number;
    title: string;
    circuitKey: string;
    isActive: boolean;
}

interface StepManagementTableProps {
    onCreateStep?: () => void;
    onEdit: (step: Step) => void;
    onDelete: (step: Step) => void;
    onBulkDelete?: () => void;
    circuitId?: string;
    circuit?: Circuit;
    isCircuitActive?: boolean;
    isSimpleUser?: boolean;
}

export function StepManagementTable({
    onCreateStep,
    onEdit,
    onDelete,
    onBulkDelete,
    circuitId,
    circuit,
    isCircuitActive = false,
    isSimpleUser = false,
}: StepManagementTableProps) {
    const {
        steps,
        pagination,
        bulkSelection,
        sortBy,
        sortDirection,
        isLoading,
        isError,
        handleSort,
        clearAllFilters,
        searchQuery,
        setSearchQuery,
        searchField,
        setSearchField,
    } = useStepManagement(circuitId);

    // Handle search changes
    const handleSearchFieldChange = (field: string) => {
        setSearchField(field);
    };

    const handleSearchQueryChange = (query: string) => {
        setSearchQuery(query);
    };

    // Handle bulk actions
    const handleBulkEdit = () => {
        toast.info("Bulk edit functionality will be implemented soon");
    };

    const handleBulkDeleteSteps = () => {
        if (onBulkDelete) {
            onBulkDelete();
        } else {
            toast.info("Bulk delete functionality will be implemented soon");
        }
    };

    const handleClearFilters = () => {
        clearAllFilters();
    };

    return (
        <div className="h-full flex flex-col gap-4">
            {/* Search Section */}
            <div className="flex gap-3 items-center bg-slate-800/90 backdrop-blur-sm border border-slate-600/70 rounded-xl p-4 shadow-lg">
                <div className="flex-1 flex gap-3 items-center">
                    <Select
                        value={searchField}
                        onValueChange={handleSearchFieldChange}
                    >
                        <SelectTrigger className="w-[140px] bg-slate-700/50 border-slate-600/50 text-slate-200">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {DEFAULT_STEP_SEARCH_FIELDS.map((field) => (
                                <SelectItem key={field.id} value={field.id}>
                                    {field.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex-1 relative">
                        <Input
                            placeholder="Search steps... Use quotes for exact phrases"
                            value={searchQuery}
                            onChange={(e) => handleSearchQueryChange(e.target.value)}
                            className="bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </div>

            {/* Error Warning */}
            {isError && (
                <div className={cn(
                    "flex items-center gap-2 p-3 rounded-lg",
                    "bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50",
                    "text-amber-800 dark:text-amber-200"
                )}>
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">
                        Failed to load steps data. Some features may not work correctly.
                    </span>
                </div>
            )}

            {/* Table Content */}
            <div className="flex-1 min-h-0">
                <StepTableContent
                    steps={pagination.paginatedData}
                    selectedSteps={bulkSelection.selectedItems}
                    bulkSelection={bulkSelection}
                    pagination={pagination}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onClearFilters={handleClearFilters}
                    onBulkEdit={handleBulkEdit}
                    onBulkDelete={handleBulkDeleteSteps}
                    isLoading={isLoading}
                    isError={isError}
                    isCircuitActive={isCircuitActive}
                    isSimpleUser={isSimpleUser}
                    circuit={circuit}
                />
            </div>
        </div>
    );
} 