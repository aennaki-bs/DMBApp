import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";
import { Ligne } from "@/models/document";

interface LignesTableHeaderProps {
    selectedCount: number;
    totalCount: number;
    onSelectAll: () => void;
    sortBy: keyof Ligne | null;
    sortDirection: "asc" | "desc" | null;
    onSort: (field: keyof Ligne) => void;
}

export function LignesTableHeader({
    selectedCount,
    totalCount,
    onSelectAll,
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

    const headerClass = (field: keyof Ligne) => `
    text-foreground font-medium cursor-pointer select-none
    hover:text-primary transition-colors duration-150
    ${sortBy === field ? "text-primary" : ""}
  `;

    return (
        <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
            <TableRow>
                <TableHead className="w-[48px]">
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
                    className={`${headerClass("ligneKey")} w-[120px]`}
                    onClick={() => onSort("ligneKey")}
                >
                    <div className="flex items-center">
                        Line Key {renderSortIcon("ligneKey")}
                    </div>
                </TableHead>
                <TableHead
                    className={`${headerClass("title")} w-[200px]`}
                    onClick={() => onSort("title")}
                >
                    <div className="flex items-center">
                        Title {renderSortIcon("title")}
                    </div>
                </TableHead>
                <TableHead
                    className={`${headerClass("article")} w-[200px]`}
                    onClick={() => onSort("article")}
                >
                    <div className="flex items-center">
                        Article {renderSortIcon("article")}
                    </div>
                </TableHead>
                <TableHead
                    className={`${headerClass("quantity")} w-[100px] text-right`}
                    onClick={() => onSort("quantity")}
                >
                    <div className="flex items-center justify-end">
                        Quantity {renderSortIcon("quantity")}
                    </div>
                </TableHead>
                <TableHead
                    className={`${headerClass("priceHT")} w-[120px] text-right`}
                    onClick={() => onSort("priceHT")}
                >
                    <div className="flex items-center justify-end">
                        Price HT {renderSortIcon("priceHT")}
                    </div>
                </TableHead>
                <TableHead
                    className={`${headerClass("amountHT")} w-[120px] text-right`}
                    onClick={() => onSort("amountHT")}
                >
                    <div className="flex items-center justify-end">
                        Amount HT {renderSortIcon("amountHT")}
                    </div>
                </TableHead>
                <TableHead
                    className={`${headerClass("amountTTC")} w-[120px] text-right`}
                    onClick={() => onSort("amountTTC")}
                >
                    <div className="flex items-center justify-end">
                        Amount TTC {renderSortIcon("amountTTC")}
                    </div>
                </TableHead>

                <TableHead className="text-foreground font-medium w-[120px] text-center">
                    Actions
                </TableHead>
            </TableRow>
        </TableHeader>
    );
} 