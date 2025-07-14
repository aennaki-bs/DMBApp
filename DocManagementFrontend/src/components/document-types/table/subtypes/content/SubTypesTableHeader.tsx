import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Lock } from "lucide-react";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SubTypesTableHeaderProps {
    selectedCount: number;
    totalCount: number;
    onSelectAll: () => void;
    sortBy: string;
    sortDirection: string;
    onSort: (field: string) => void;
}

export function SubTypesTableHeader({
    selectedCount,
    totalCount,
    onSelectAll,
    sortBy,
    sortDirection,
    onSort,
}: SubTypesTableHeaderProps) {
    const headerClass = (field: string) =>
        cn(
            "text-foreground font-medium cursor-pointer transition-colors hover:text-primary",
            "select-none group"
        );

    const renderSortIcon = (field: string) => {
        if (sortBy !== field) {
            return (
                <div className="opacity-0 group-hover:opacity-50 transition-opacity ml-1">
                    <ChevronUp className="h-3.5 w-3.5" />
                </div>
            );
        }
        return sortDirection === "asc" ? (
            <ChevronUp className="h-3.5 w-3.5 ml-1 text-primary" />
        ) : (
            <ChevronDown className="h-3.5 w-3.5 ml-1 text-primary" />
        );
    };

    return (
        <TableHeader>
            <TableRow className="border-slate-200/50 dark:border-slate-700/50 hover:bg-transparent">
                <TableHead className="w-[48px] text-center">
                    <div className="flex items-center justify-center">
                        <ProfessionalCheckbox
                            checked={selectedCount === totalCount && totalCount > 0}
                            indeterminate={selectedCount > 0 && selectedCount < totalCount}
                            onCheckedChange={onSelectAll}
                            size="md"
                            variant="header"
                            className="shadow-lg"
                        />
                    </div>
                </TableHead>
                <TableHead
                    className={`${headerClass("subTypeKey")} w-[200px]`}
                    onClick={() => onSort("subTypeKey")}
                >
                    <div className="flex items-center">
                        Code {renderSortIcon("subTypeKey")}
                    </div>
                </TableHead>
                <TableHead
                    className={`${headerClass("startDate")} w-[200px] text-center`}
                    onClick={() => onSort("startDate")}
                >
                    <div className="flex items-center justify-center">
                        Start Date {renderSortIcon("startDate")}
                    </div>
                </TableHead>
                <TableHead
                    className={`${headerClass("endDate")} w-[200px] text-center`}
                    onClick={() => onSort("endDate")}
                >
                    <div className="flex items-center justify-center">
                        End Date {renderSortIcon("endDate")}
                    </div>
                </TableHead>
                <TableHead
                    className={`${headerClass("isActive")} w-[150px] text-center`}
                    onClick={() => onSort("isActive")}
                >
                    <div className="flex items-center justify-center">
                        Status {renderSortIcon("isActive")}
                    </div>
                </TableHead>
                <TableHead className="text-foreground font-medium w-[100px] text-center">
                    Actions
                </TableHead>
            </TableRow>
        </TableHeader>
    );
} 