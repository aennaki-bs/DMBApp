import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";

interface VendorsTableHeaderProps {
    selectedCount: number;
    totalCount: number;
    onSelectAll: () => void;
    sortBy: string;
    sortDirection: string;
    onSort: (field: string) => void;
}

export function VendorsTableHeader({
    selectedCount,
    totalCount,
    onSelectAll,
    sortBy,
    sortDirection,
    onSort,
}: VendorsTableHeaderProps) {
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
                {/* Selection Column */}
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

                {/* Icon Column */}
                <TableHead className="w-[48px] text-center"></TableHead>

                {/* Vendor Code Column */}
                <TableHead
                    className={`${headerClass("vendorCode")} w-[120px]`}
                    onClick={() => onSort("vendorCode")}
                >
                    <div className="flex items-center">
                        Code {renderSortIcon("vendorCode")}
                    </div>
                </TableHead>

                {/* Name Column */}
                <TableHead
                    className={`${headerClass("name")} w-[200px]`}
                    onClick={() => onSort("name")}
                >
                    <div className="flex items-center">
                        Name {renderSortIcon("name")}
                    </div>
                </TableHead>

                {/* Address Column */}
                <TableHead
                    className={`${headerClass("address")} w-[250px]`}
                    onClick={() => onSort("address")}
                >
                    <div className="flex items-center">
                        Address {renderSortIcon("address")}
                    </div>
                </TableHead>

                {/* City Column */}
                <TableHead
                    className={`${headerClass("city")} w-[150px]`}
                    onClick={() => onSort("city")}
                >
                    <div className="flex items-center">
                        City {renderSortIcon("city")}
                    </div>
                </TableHead>

                {/* Country Column */}
                <TableHead
                    className={`${headerClass("country")} w-[120px]`}
                    onClick={() => onSort("country")}
                >
                    <div className="flex items-center">
                        Country {renderSortIcon("country")}
                    </div>
                </TableHead>

                {/* Actions Column */}
                <TableHead className="text-foreground font-medium w-[100px] text-center">
                    Actions
                </TableHead>
            </TableRow>
        </TableHeader>
    );
}

export default VendorsTableHeader; 