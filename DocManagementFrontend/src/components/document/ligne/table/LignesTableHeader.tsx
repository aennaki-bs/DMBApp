import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";
import { Ligne } from "@/models/document";
import { useBulkSelection } from "@/hooks/useBulkSelection";

interface LignesTableHeaderProps {
    bulkSelection: ReturnType<typeof useBulkSelection<Ligne>>;
    sortBy: keyof Ligne | null;
    sortDirection: "asc" | "desc" | null;
    onSort: (field: keyof Ligne) => void;
}

export function LignesTableHeader({
    bulkSelection,
    sortBy,
    sortDirection,
    onSort,
}: LignesTableHeaderProps) {
    const renderSortIcon = (field: keyof Ligne) => {
        if (sortBy !== field) return null;
        return sortDirection === "asc" ? (
            <ArrowUp className="ml-1 h-3.5 w-3.5 text-primary" />
        ) : (
            <ArrowDown className="ml-1 h-3.5 w-3.5 text-primary" />
        );
    };

    return (
        <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
            <TableRow className="border-slate-200/50 dark:border-slate-700/50 hover:bg-transparent">
                <TableHead className="w-[50px]">
                    <ProfessionalCheckbox
                        checked={bulkSelection.isCurrentPageFullySelected}
                        indeterminate={bulkSelection.isPartialSelection}
                        onCheckedChange={bulkSelection.toggleSelectCurrentPage}
                        size="md"
                        variant="header"
                    />
                </TableHead>
                <TableHead 
                    className="w-[200px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => onSort('title')}
                >
                    <div className="flex items-center gap-2">
                        Title
                        {sortBy === 'title' && (
                            <span className="text-xs">
                                {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                        )}
                    </div>
                </TableHead>
                <TableHead 
                    className="w-[200px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => onSort('article')}
                >
                    <div className="flex items-center gap-2">
                        Items
                        {sortBy === 'article' && (
                            <span className="text-xs">
                                {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                        )}
                    </div>
                </TableHead>
                <TableHead
                    className="w-[100px] text-right cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => onSort("quantity")}
                >
                    <div className="flex items-center justify-end gap-2">
                        Quantity
                        {sortBy === 'quantity' && (
                            <span className="text-xs">
                                {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                        )}
                    </div>
                </TableHead>
                <TableHead
                    className="w-[120px] text-right cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => onSort("priceHT")}
                >
                    <div className="flex items-center justify-end gap-2">
                        Price HT
                        {sortBy === 'priceHT' && (
                            <span className="text-xs">
                                {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                        )}
                    </div>
                </TableHead>
                <TableHead
                    className="w-[120px] text-right cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => onSort("amountHT")}
                >
                    <div className="flex items-center justify-end gap-2">
                        Amount HT
                        {sortBy === 'amountHT' && (
                            <span className="text-xs">
                                {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                        )}
                    </div>
                </TableHead>
                <TableHead
                    className="w-[120px] text-right cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => onSort("amountTTC")}
                >
                    <div className="flex items-center justify-end gap-2">
                        Amount TTC
                        {sortBy === 'amountTTC' && (
                            <span className="text-xs">
                                {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                        )}
                    </div>
                </TableHead>
                <TableHead className="w-[100px] text-center">
                    <span className="text-foreground font-medium">Actions</span>
                </TableHead>
            </TableRow>
        </TableHeader>
    );
} 