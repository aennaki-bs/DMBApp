import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";

interface StatusTableHeaderProps {
    selectedCount: number;
    totalCount: number;
    onSelectAll: () => void;
    sortBy: string;
    sortDirection: string;
    onSort: (field: string) => void;
    isCircuitActive?: boolean;
}

export function StatusTableHeader({
    selectedCount,
    totalCount,
    onSelectAll,
    sortBy,
    sortDirection,
    onSort,
    isCircuitActive = false,
}: StatusTableHeaderProps) {
    const renderSortIcon = (field: string) => {
        if (sortBy !== field) return null;
        return sortDirection === "asc" ? (
            <ChevronUp className="ml-1 h-3.5 w-3.5 text-primary" />
        ) : (
            <ChevronDown className="ml-1 h-3.5 w-3.5 text-primary" />
        );
    };

    const headerClass = (field: string) => `
    text-foreground font-medium cursor-pointer select-none
    hover:text-primary transition-colors duration-150
    ${sortBy === field ? "text-primary" : ""}
  `;

    return (
        <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
            <TableRow className="border-slate-200/50 dark:border-slate-700/50 hover:bg-transparent">
                <TableHead className="w-[48px] text-center">
                    <div className="flex items-center justify-center">
                        <ProfessionalCheckbox
                            checked={!isCircuitActive && selectedCount === totalCount && totalCount > 0}
                            indeterminate={!isCircuitActive && selectedCount > 0 && selectedCount < totalCount}
                            onCheckedChange={() => {
                                if (!isCircuitActive) {
                                    onSelectAll();
                                }
                            }}
                            size="md"
                            variant="header"
                            className="shadow-lg"
                            disabled={isCircuitActive}
                        />
                    </div>
                </TableHead>
                <TableHead className="w-[60px] text-center"></TableHead>
                <TableHead
                    className={`${headerClass("title")} w-[280px]`}
                    onClick={() => onSort("title")}
                >
                    <div className="flex items-center">
                        Title {renderSortIcon("title")}
                    </div>
                </TableHead>
                <TableHead
                    className={`${headerClass("description")} flex-1 min-w-[200px]`}
                    onClick={() => onSort("description")}
                >
                    <div className="flex items-center">
                        Description {renderSortIcon("description")}
                    </div>
                </TableHead>
                <TableHead
                    className={`${headerClass("statusType")} w-[120px] text-center`}
                    onClick={() => onSort("statusType")}
                >
                    <div className="flex items-center justify-center">
                        Type {renderSortIcon("statusType")}
                    </div>
                </TableHead>
                <TableHead className="w-[90px] text-center">
                    Actions
                </TableHead>
            </TableRow>
        </TableHeader>
    );
} 