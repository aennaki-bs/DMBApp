import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { ResponsibilityCentre } from "@/models/responsibilityCentre";
import { ResponsibilityCentreActionsDropdown } from "./row/ResponsibilityCentreActionsDropdown";
import { Building2, UsersRound, FileText } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t } = useTranslation();

  const handleEdit = () => {
    onEdit(centre);
  };

  const handleDelete = () => {
    onDelete(centre);
  };

  const handleAssociateUsers = () => {
    onAssociateUsers(centre);
  };

  const handleViewDetails = () => {
    onViewDetails(centre);
  };

  return (
    <TableRow
      className={`table-glass-row ${
        isSelected ? "table-glass-row-selected" : ""
      }`}
    >
      <TableCell className="w-[40px] py-2">
        <div className="flex items-center justify-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(centre.id)}
            aria-label={`Select centre ${centre.code}`}
            className="h-3.5 w-3.5"
          />
        </div>
      </TableCell>

      <TableCell className="w-[150px] py-2">
        <div className="font-medium text-sm leading-tight">{centre.code}</div>
      </TableCell>

      <TableCell className="w-[300px] py-2">
        <span className="block truncate text-sm">{centre.descr}</span>
      </TableCell>

      <TableCell className="w-[120px] py-2 text-center">
        <div className="flex items-center justify-center">
          <Badge
            variant="secondary"
            className="text-xs px-2 py-0.5 h-5 min-w-[40px] justify-center"
          >
            <UsersRound className="w-2.5 h-2.5 mr-1" />
            {Math.max(0, centre.usersCount || 0)}
          </Badge>
        </div>
      </TableCell>

      <TableCell className="w-[120px] py-2 text-center">
        <div className="flex items-center justify-center">
          <Badge
            variant="secondary"
            className="text-xs px-2 py-0.5 h-5 min-w-[40px] justify-center"
          >
            <FileText className="w-2.5 h-2.5 mr-1" />
            {centre.documentsCount || 0}
          </Badge>
        </div>
      </TableCell>

      <TableCell className="w-[200px] text-right py-2 pr-3">
        <ResponsibilityCentreActionsDropdown
          centre={centre}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAssociateUsers={handleAssociateUsers}
          onViewDetails={handleViewDetails}
        />
      </TableCell>
    </TableRow>
  );
}
