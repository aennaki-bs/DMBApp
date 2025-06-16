import { ArrowUpDown, Tag, FileText, Info, Hash, Users } from "lucide-react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface DocumentTypeTableHeaderProps {
  onSelectAll: (checked: boolean) => void;
  areAllEligibleSelected: boolean;
  hasEligibleTypes: boolean;
  onSort: (field: string) => void;
  sortField: string | null;
  sortDirection: "asc" | "desc";
}

export const DocumentTypeTableHeader = ({
  onSelectAll,
  areAllEligibleSelected,
  hasEligibleTypes,
  onSort,
  sortField,
  sortDirection,
}: DocumentTypeTableHeaderProps) => {
  const renderSortableHeader = (
    label: string,
    field: string,
    icon: React.ReactNode,
    className?: string
  ) => (
    <div
      className={cn(
        "flex items-center gap-1 cursor-pointer select-none hover:text-foreground transition-colors text-muted-foreground",
        className
      )}
      onClick={() => onSort(field)}
    >
      {icon}
      {label}
      <ArrowUpDown
        className={cn("ml-1 h-3.5 w-3.5", {
          "text-primary": sortField === field,
          "opacity-50": sortField !== field,
        })}
      />
    </div>
  );

  return (
    <TableHeader className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm">
      <TableRow className="border-primary/20 hover:bg-transparent">
        <TableHead className="w-[50px]">
          <Checkbox
            checked={areAllEligibleSelected && hasEligibleTypes}
            onCheckedChange={onSelectAll}
            disabled={!hasEligibleTypes}
            aria-label="Select all types"
            className="translate-y-[2px]"
          />
        </TableHead>
        <TableHead className="w-[140px]">
          {renderSortableHeader(
            "Type Code",
            "typeKey",
            <Tag className="h-4 w-4 mr-1 text-primary/70" />
          )}
        </TableHead>
        <TableHead className="w-[200px]">
          {renderSortableHeader(
            "Type Name",
            "typeName",
            <FileText className="h-4 w-4 mr-1 text-primary/70" />
          )}
        </TableHead>
        <TableHead className="w-[250px]">
          {renderSortableHeader(
            "Description",
            "typeAttr",
            <Info className="h-4 w-4 mr-1 text-primary/70" />
          )}
        </TableHead>
        <TableHead className="w-[140px]">
          {renderSortableHeader(
            "Tier Type",
            "tierType",
            <Users className="h-4 w-4 mr-1 text-primary/70" />
          )}
        </TableHead>
        <TableHead className="w-[120px] pl-6">
          {renderSortableHeader(
            "Documents",
            "documentCounter",
            <Hash className="h-4 w-4 mr-1 text-primary/70" />
          )}
        </TableHead>
        <TableHead className="text-right w-[140px] text-muted-foreground">
          Actions
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};
