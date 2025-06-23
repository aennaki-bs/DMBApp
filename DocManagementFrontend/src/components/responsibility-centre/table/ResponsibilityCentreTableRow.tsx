import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { ResponsibilityCentre } from "@/models/responsibilityCentre";
import { ResponsibilityCentreActionsDropdown } from "./row/ResponsibilityCentreActionsDropdown";
import { Building2, Users, FileText } from "lucide-react";

interface ResponsibilityCentreTableRowProps {
  centre: ResponsibilityCentre;
  isSelected: boolean;
  onSelect: (centreId: number) => void;
  onEdit: (centre: ResponsibilityCentre) => void;
  onDelete: (centre: ResponsibilityCentre) => void;
  onAssociateUsers: (centre: ResponsibilityCentre) => void;
  onViewDetails: (centre: ResponsibilityCentre) => void;
}

export function ResponsibilityCentreTableRow({
  centre,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onAssociateUsers,
  onViewDetails,
}: ResponsibilityCentreTableRowProps) {
  const handleRowClick = (event: React.MouseEvent) => {
    // Don't trigger row selection if clicking on action buttons or links
    const target = event.target as HTMLElement;
    const isActionElement = target.closest(
      'button, a, [role="button"], .dropdown-trigger'
    );

    if (!isActionElement) {
      onSelect(centre.id);
    }
  };

  const handleSelectChange = (checked: boolean) => {
    onSelect(centre.id);
  };

  return (
    <TableRow
      className={`responsibility-centre-table-layout transition-all duration-200 cursor-pointer select-none ${
        isSelected
          ? "bg-primary/10 border-primary/30 shadow-sm"
          : "hover:bg-muted/30"
      }`}
      onClick={handleRowClick}
    >
      {/* Selection Column */}
      <TableCell className="py-4 table-cell-center">
        <Checkbox
          enhanced={true}
          size="sm"
          checked={isSelected}
          onCheckedChange={handleSelectChange}
          className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
        />
      </TableCell>

      {/* Centre Code Column */}
      <TableCell className="py-4 table-cell-start">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="flex-shrink-0">
            <div
              className={`h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center transition-all duration-200 ${
                isSelected
                  ? "from-primary/30 to-primary/20 border-primary/40 shadow-sm"
                  : ""
              }`}
            >
              <Building2 className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div
              className={`text-sm font-medium truncate transition-colors duration-200 ${
                isSelected ? "text-primary" : "text-foreground"
              }`}
            >
              {centre.code}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              ID: {centre.id}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Description Column */}
      <TableCell className="py-4 table-cell-start max-md:hidden">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          {centre.descr ? (
            <span className="text-sm truncate max-w-[200px]">
              {centre.descr}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground italic">
              No description
            </span>
          )}
        </div>
      </TableCell>

      {/* Users Column */}
      <TableCell className="py-4 table-cell-center">
        <Badge
          variant="secondary"
          className={`text-xs px-2 py-1 transition-colors duration-200 ${
            isSelected
              ? "bg-blue-500/30 text-blue-400 border-blue-500/40"
              : "bg-blue-500/20 text-blue-400 border-blue-500/30"
          }`}
        >
          <Users className="h-3 w-3 mr-1" />
          {Math.max(0, centre.usersCount || 0)}
        </Badge>
      </TableCell>

      {/* Documents Column */}
      <TableCell className="py-4 table-cell-center max-md:hidden">
        <Badge
          variant="secondary"
          className={`text-xs px-2 py-1 transition-colors duration-200 ${
            isSelected
              ? "bg-green-500/30 text-green-400 border-green-500/40"
              : "bg-green-500/20 text-green-400 border-green-500/30"
          }`}
        >
          <FileText className="h-3 w-3 mr-1" />
          {centre.documentsCount || 0}
        </Badge>
      </TableCell>

      {/* Actions Column */}
      <TableCell className="py-4 table-cell-center">
        <ResponsibilityCentreActionsDropdown
          centre={centre}
          onEdit={() => onEdit(centre)}
          onDelete={() => onDelete(centre)}
          onAssociateUsers={() => onAssociateUsers(centre)}
          onViewDetails={() => onViewDetails(centre)}
        />
      </TableCell>
    </TableRow>
  );
}
