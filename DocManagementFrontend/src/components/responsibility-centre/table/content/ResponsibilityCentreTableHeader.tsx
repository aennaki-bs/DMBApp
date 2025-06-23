import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building2,
  Users,
  FileText,
} from "lucide-react";
import { ResponsibilityCentre } from "@/models/responsibilityCentre";

interface ResponsibilityCentreTableHeaderProps {
  centres: ResponsibilityCentre[];
  selectedCentres: number[];
  onSelectAll: () => void;
  sortBy: string;
  sortDirection: string;
  onSort: (field: string) => void;
}

export function ResponsibilityCentreTableHeader({
  centres,
  selectedCentres,
  onSelectAll,
  sortBy,
  sortDirection,
  onSort,
}: ResponsibilityCentreTableHeaderProps) {
  const isAllSelected =
    centres.length > 0 && selectedCentres.length === centres.length;
  const isIndeterminate =
    selectedCentres.length > 0 && selectedCentres.length < centres.length;

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 text-primary" />
    );
  };

  const getSortButton = (
    field: string,
    label: string,
    icon?: React.ReactNode
  ) => (
    <button
      className="h-8 px-2 -ml-2 text-xs font-medium hover:bg-accent/50 flex items-center gap-1 rounded-md transition-all duration-200 hover:shadow-sm"
      onClick={() => onSort(field)}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {label}
      {renderSortIcon(field)}
    </button>
  );

  return (
    <TableHeader className="sticky top-0 z-10">
      <TableRow className="border-border/20 hover:bg-muted/30 transition-colors duration-200 responsibility-centre-table-layout">
        {/* Checkbox Column */}
        <TableHead className="py-3 table-cell-center">
          <Checkbox
            enhanced={true}
            size="sm"
            checked={isAllSelected}
            onCheckedChange={onSelectAll}
            aria-label="Select all"
            className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            ref={(el) => {
              if (el && el.querySelector) {
                const input = el.querySelector(
                  'input[type="checkbox"]'
                ) as HTMLInputElement;
                if (input) input.indeterminate = isIndeterminate;
              }
            }}
          />
        </TableHead>

        {/* Centre Code Column */}
        <TableHead className="py-3 table-cell-start">
          {getSortButton(
            "code",
            "Centre Code",
            <Building2 className="h-3.5 w-3.5" />
          )}
        </TableHead>

        {/* Description Column */}
        <TableHead className="py-3 table-cell-start max-md:hidden">
          {getSortButton("descr", "Description")}
        </TableHead>

        {/* Users Column */}
        <TableHead className="py-3 table-cell-center">
          {getSortButton(
            "usersCount",
            "Users",
            <Users className="h-3.5 w-3.5" />
          )}
        </TableHead>

        {/* Documents Column */}
        <TableHead className="py-3 table-cell-center max-md:hidden">
          {getSortButton(
            "documentsCount",
            "Documents",
            <FileText className="h-3.5 w-3.5" />
          )}
        </TableHead>

        {/* Actions Column */}
        <TableHead className="py-3 table-cell-center">
          <span className="text-xs font-medium text-muted-foreground">
            Actions
          </span>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
