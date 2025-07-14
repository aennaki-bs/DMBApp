import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";

interface VendorTableHeaderProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  sortBy: string;
  sortDirection: string;
  onSort: (field: string) => void;
}

export function VendorTableHeader({
  selectedCount,
  totalCount,
  onSelectAll,
  sortBy,
  sortDirection,
  onSort,
}: VendorTableHeaderProps) {
  // Helper function to render sort icons
  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  // Helper function for header classes
  const headerClass = (field: string) =>
    `cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800/30 text-blue-800 dark:text-blue-200 font-medium ${
      sortBy === field ? "bg-blue-50 dark:bg-blue-900/30" : ""
    }`;

  return (
    <TableHeader>
      <TableRow className="border-slate-200/50 dark:border-slate-700/50 hover:bg-transparent">
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
          className={`${headerClass("vendorCode")} w-[120px]`}
          onClick={() => onSort("vendorCode")}
        >
          <div className="flex items-center">
            Code {renderSortIcon("vendorCode")}
          </div>
        </TableHead>
        <TableHead
          className={`${headerClass("name")} w-[200px]`}
          onClick={() => onSort("name")}
        >
          <div className="flex items-center">
            Name {renderSortIcon("name")}
          </div>
        </TableHead>
        <TableHead
          className={`${headerClass("address")} w-[250px]`}
          onClick={() => onSort("address")}
        >
          <div className="flex items-center">
            Address {renderSortIcon("address")}
          </div>
        </TableHead>
        <TableHead
          className={`${headerClass("city")} w-[150px]`}
          onClick={() => onSort("city")}
        >
          <div className="flex items-center">
            City {renderSortIcon("city")}
          </div>
        </TableHead>
        <TableHead
          className={`${headerClass("country")} w-[150px]`}
          onClick={() => onSort("country")}
        >
          <div className="flex items-center">
            Country {renderSortIcon("country")}
          </div>
        </TableHead>
        <TableHead className="text-foreground font-medium w-[100px]">
          Actions
        </TableHead>
      </TableRow>
    </TableHeader>
  );
} 