import React from "react";
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
import { Badge } from "@/components/ui/badge";
import { Filter, X, Calendar, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

interface DocumentsTableHeaderProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    searchField: string;
    onSearchFieldChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    typeFilter: string;
    onTypeFilterChange: (value: string) => void;
    dateRange: DateRange | undefined;
    onDateRangeChange: (range: DateRange | undefined) => void;
    showAdvancedFilters: boolean;
    onShowAdvancedFiltersChange: (show: boolean) => void;
    onClearAllFilters: () => void;
    hasActiveFilters: boolean;
    searchFields: Array<{ value: string; label: string }>;
}

export function DocumentsTableHeader({
    searchQuery,
    onSearchChange,
    searchField,
    onSearchFieldChange,
    statusFilter,
    onStatusFilterChange,
    typeFilter,
    onTypeFilterChange,
    dateRange,
    onDateRangeChange,
    showAdvancedFilters,
    onShowAdvancedFiltersChange,
    onClearAllFilters,
    hasActiveFilters,
    searchFields,
}: DocumentsTableHeaderProps) {
    const filterBadges = [
        ...(searchQuery ? [{ id: "search", label: `Search: ${searchQuery}`, onRemove: () => onSearchChange("") }] : []),
        ...(statusFilter !== "any" ? [{ id: "status", label: `Status: ${statusFilter}`, onRemove: () => onStatusFilterChange("any") }] : []),
        ...(typeFilter !== "any" ? [{ id: "type", label: `Type: ${typeFilter}`, onRemove: () => onTypeFilterChange("any") }] : []),
        ...(dateRange ? [{ id: "date", label: "Date range", onRemove: () => onDateRangeChange(undefined) }] : []),
    ];

    return (
        <div className="p-6 border-b border-border/50">
            <div className="flex flex-col gap-4">
                {/* Search Bar */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search documents..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-10 bg-background/50 border-border/50"
                            />
                        </div>
                        <Select value={searchField} onValueChange={onSearchFieldChange}>
                            <SelectTrigger className="w-40 bg-background/50 border-border/50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {searchFields.map((field) => (
                                    <SelectItem key={field.value} value={field.value}>
                                        {field.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DateRangePicker
                        date={dateRange}
                        onDateChange={onDateRangeChange}
                        className="w-auto"
                        align="end"
                    >
                        <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                                "bg-background/50 border-border/50 hover:bg-primary/10 hover:border-primary/30",
                                dateRange && "bg-primary/10 border-primary/30 text-primary"
                            )}
                        >
                            <Calendar className="h-4 w-4" />
                        </Button>
                    </DateRangePicker>

                    <Popover open={showAdvancedFilters} onOpenChange={onShowAdvancedFiltersChange}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className={cn(
                                    "bg-background/50 border-border/50 hover:bg-primary/10 hover:border-primary/30",
                                    hasActiveFilters && "bg-primary/10 border-primary/30 text-primary"
                                )}
                            >
                                <Filter className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-background/95 backdrop-blur-sm border-border/50" align="end">
                            <div className="space-y-4">
                                <h4 className="font-medium text-foreground">Filter Documents</h4>

                                {/* Status Filter */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-muted-foreground">Status</label>
                                    <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                                        <SelectTrigger className="bg-background/50 border-border/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="any">Any Status</SelectItem>
                                            <SelectItem value="0">Draft</SelectItem>
                                            <SelectItem value="1">In Progress</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Type Filter */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-muted-foreground">Document Type</label>
                                    <Select value={typeFilter} onValueChange={onTypeFilterChange}>
                                        <SelectTrigger className="bg-background/50 border-border/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="any">Any Type</SelectItem>
                                            {/* TODO: Add document types dynamically */}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex justify-end pt-2">
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={onClearAllFilters}
                                            className="text-muted-foreground hover:text-foreground hover:bg-primary/10"
                                        >
                                            <X className="h-4 w-4 mr-2" /> Clear All
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Filter Badges */}
                {filterBadges.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {filterBadges.map((badge) => (
                            <Badge
                                key={badge.id}
                                variant="secondary"
                                className="flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                            >
                                {badge.label}
                                <X
                                    className="h-3 w-3 cursor-pointer hover:text-primary/70"
                                    onClick={badge.onRemove}
                                />
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 