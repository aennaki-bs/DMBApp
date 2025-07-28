import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";
import { SousLigne } from "@/models/document";
import { useBulkSelection } from "@/hooks/useBulkSelection";

interface SubLinesTableHeaderProps {
    bulkSelection: ReturnType<typeof useBulkSelection<SousLigne>>;
    sortBy: keyof SousLigne | null;
    sortDirection: "asc" | "desc" | null;
    onSort: (field: keyof SousLigne) => void;
}

export function SubLinesTableHeader({
    bulkSelection,
    sortBy,
    sortDirection,
    onSort,
}: SubLinesTableHeaderProps) {
    const renderSortIcon = (field: keyof SousLigne) => {
        if (sortBy !== field) return null;
        return sortDirection === "asc" ? (
            <ArrowUp className="ml-1 h-3.5 w-3.5 text-primary" />
        ) : (
            <ArrowDown className="ml-1 h-3.5 w-3.5 text-primary" />
        );
    };

    const headerClass = (field: keyof SousLigne) => `
    text-foreground font-medium cursor-pointer select-none
    hover:text-primary transition-colors duration-150
    ${sortBy === field ? "text-primary" : ""}
  `;

    return (
        <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
            <TableRow className="border-slate-200/50 dark:border-slate-700/50 hover:bg-transparent">
                <TableHead className="w-[48px]">
                    <div className="flex items-center justify-center">
                        <ProfessionalCheckbox
                            checked={bulkSelection.isCurrentPageFullySelected}
                            indeterminate={bulkSelection.isPartialSelection}
                            onCheckedChange={bulkSelection.toggleSelectCurrentPage}
                            size="md"
                            variant="header"
                            className="shadow-lg"
                        />
                    </div>
                </TableHead>

                <TableHead className={`${headerClass("title")} w-[200px]`} onClick={() => onSort("title")}>
                    <div className="flex items-center">
                        Title
                        {renderSortIcon("title")}
                    </div>
                </TableHead>

                <TableHead className={`${headerClass("attribute")} flex-1`} onClick={() => onSort("attribute")}>
                    <div className="flex items-center">
                        Attribute
                        {renderSortIcon("attribute")}
                    </div>
                </TableHead>

                <TableHead className={`${headerClass("createdAt")} w-[150px]`} onClick={() => onSort("createdAt")}>
                    <div className="flex items-center">
                        Created Date
                        {renderSortIcon("createdAt")}
                    </div>
                </TableHead>

                <TableHead className="text-foreground font-medium w-[100px] text-center">
                    Actions
                </TableHead>
            </TableRow>
        </TableHeader>
    );
} 