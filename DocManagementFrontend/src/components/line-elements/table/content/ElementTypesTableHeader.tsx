import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ElementTypesTableHeaderProps {
    selectedCount: number;
    totalCount: number;
    onSelectAll: () => void;
    sortBy: string;
    sortDirection: string;
    onSort: (field: string) => void;
}

export function ElementTypesTableHeader({
    selectedCount,
    totalCount,
    onSelectAll,
    sortBy,
    sortDirection,
    onSort,
}: ElementTypesTableHeaderProps) {
    const getSortIcon = (field: string) => {
        if (sortBy !== field) {
            return <ArrowUpDown className="h-4 w-4 opacity-50" />;
        }
        return sortDirection === "asc" ? (
            <ArrowUp className="h-4 w-4 text-primary" />
        ) : (
            <ArrowDown className="h-4 w-4 text-primary" />
        );
    };

    const getSortButtonClass = (field: string) => {
        return cn(
            "flex items-center gap-2 font-medium text-left hover:text-primary transition-colors duration-200",
            sortBy === field ? "text-primary" : "text-muted-foreground"
        );
    };

    const isAllSelected = selectedCount === totalCount && totalCount > 0;
    const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

    return (
        <TableHeader>
            <TableRow className="border-b border-primary/10 hover:bg-primary/5">
                {/* Selection Column */}
                <TableHead className="w-12 px-4">
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={isAllSelected || isPartiallySelected}
                            onCheckedChange={onSelectAll}
                            className="border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            aria-label={`Select all element types on this page (${selectedCount}/${totalCount} selected)`}
                        />
                    </div>
                </TableHead>

                {/* Code Column */}
                <TableHead className="w-36 px-4">
                    <Button
                        variant="ghost"
                        onClick={() => onSort("code")}
                        className={getSortButtonClass("code")}
                    >
                        Code
                        {getSortIcon("code")}
                    </Button>
                </TableHead>

                {/* Type Column */}
                <TableHead className="w-44 px-4">
                    <Button
                        variant="ghost"
                        onClick={() => onSort("typeElement")}
                        className={getSortButtonClass("typeElement")}
                    >
                        Type
                        {getSortIcon("typeElement")}
                    </Button>
                </TableHead>

                {/* Description Column */}
                <TableHead className="flex-1 px-4">
                    <Button
                        variant="ghost"
                        onClick={() => onSort("description")}
                        className={getSortButtonClass("description")}
                    >
                        Description
                        {getSortIcon("description")}
                    </Button>
                </TableHead>

                {/* Table Name Column */}
                <TableHead className="w-40 px-4">
                    <Button
                        variant="ghost"
                        onClick={() => onSort("tableName")}
                        className={getSortButtonClass("tableName")}
                    >
                        Table
                        {getSortIcon("tableName")}
                    </Button>
                </TableHead>

                {/* Created Date Column */}
                <TableHead className="w-36 px-4">
                    <Button
                        variant="ghost"
                        onClick={() => onSort("createdAt")}
                        className={getSortButtonClass("createdAt")}
                    >
                        Created
                        {getSortIcon("createdAt")}
                    </Button>
                </TableHead>

                {/* Actions Column */}
                <TableHead className="w-24 px-4 text-center">
                    <span className="text-muted-foreground font-medium">Actions</span>
                </TableHead>
            </TableRow>
        </TableHeader>
    );
} 