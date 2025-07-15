import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";

interface CircuitTableHeaderProps {
    selectedCount: number;
    totalCount: number;
    onSelectAll: () => void;
    sortBy: string;
    sortDirection: string;
    onSort: (field: string) => void;
}

export function CircuitTableHeader({
    selectedCount,
    totalCount,
    onSelectAll,
    sortBy,
    sortDirection,
    onSort,
}: CircuitTableHeaderProps) {
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
                <TableHead className="w-[48px] text-center"></TableHead>
                <TableHead
                    className={`${headerClass("title")} w-[300px]`}
                    onClick={() => onSort("title")}
                >
                    <div className="flex items-center">
                        Title {renderSortIcon("title")}
                    </div>
                </TableHead>
                <TableHead
                    className={`${headerClass("type")} w-[180px] text-center`}
                    onClick={() => onSort("type")}
                >
                    <div className="flex items-center justify-center">
                        Type {renderSortIcon("type")}
                    </div>
                </TableHead>
                <TableHead
                    className={`${headerClass("isActive")} w-[120px] text-center`}
                    onClick={() => onSort("isActive")}
                >
                    <div className="flex items-center justify-center">
                        Status {renderSortIcon("isActive")}
                    </div>
                </TableHead>
                <TableHead
                    className={`${headerClass("isBlocked")} w-[100px] text-center`}
                    onClick={() => onSort("isBlocked")}
                >
                    <div className="flex items-center justify-center">
                        Block {renderSortIcon("isBlocked")}
                    </div>
                </TableHead>
                <TableHead className="text-foreground font-medium w-[100px] text-center">
                    Actions
                </TableHead>
            </TableRow>
        </TableHeader>
    );
} 