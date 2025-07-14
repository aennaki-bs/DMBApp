import { TableCell, TableRow } from "@/components/ui/table";
import { ResponsibilityCentre } from "@/models/responsibilityCentre";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";
import { ResponsibilityCentreActionsDropdown } from "./row/ResponsibilityCentreActionsDropdown";
import { useTranslation } from "@/hooks/useTranslation";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface ResponsibilityCentreTableRowProps {
  centre: ResponsibilityCentre;
  isSelected: boolean;
  onSelect: (centreId: number) => void;
  onToggleStatus: (centreId: number, currentStatus: boolean) => void;
  onEdit: (centre: ResponsibilityCentre) => void;
  onDelete: (centreId: number) => void;
  onViewDetails: (centre: ResponsibilityCentre) => void;
  onAssociateUsers: (centre: ResponsibilityCentre) => void;
  onRemoveUsers?: (centre: ResponsibilityCentre) => void;
  userCount?: number;
  index?: number;
}

export function ResponsibilityCentreTableRow({
  centre,
  isSelected,
  onSelect,
  onToggleStatus,
  onEdit,
  onDelete,
  onViewDetails,
  onAssociateUsers,
  onRemoveUsers,
  userCount = 0,
  index = 0,
}: ResponsibilityCentreTableRowProps) {
  const { t } = useTranslation();
  
  return (
    <TableRow
      className={`border-slate-200/50 dark:border-slate-700/50 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer group ${
        isSelected
          ? "bg-blue-50/80 dark:bg-blue-900/20 border-l-2 border-l-blue-500 shadow-sm ring-1 ring-blue-200/50 dark:ring-blue-800/50"
          : "hover:shadow-sm"
      }`}
      onClick={(e) => {
        // Don't trigger row selection if clicking on interactive elements
        const target = e.target as HTMLElement;
        if (
          target.closest('button') ||
          target.closest('input') ||
          target.closest('[role="button"]')
        ) {
          return;
        }
        onSelect(centre.id);
      }}
    >
      <TableCell className="w-[48px]">
        <div className="flex items-center justify-center">
          <ProfessionalCheckbox
            checked={isSelected}
            onCheckedChange={() => onSelect(centre.id)}
            size="md"
            variant="row"
          />
        </div>
      </TableCell>
      
      <TableCell className="w-[200px]">
        <div className="font-medium text-blue-900 dark:text-blue-100">
          {centre.code}
        </div>
      </TableCell>
      
      <TableCell className="flex-1">
        <div className="text-blue-800 dark:text-blue-200">
          {centre.descr || "No description"}
        </div>
      </TableCell>
      
      <TableCell className="w-[100px]">
        <div className="flex items-center justify-center">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {userCount}
          </Badge>
        </div>
      </TableCell>
      
      <TableCell className="w-[120px]">
        <div className="flex items-center justify-center">
          <ResponsibilityCentreActionsDropdown
            centre={centre}
            onEdit={() => onEdit(centre)}
            onDelete={() => onDelete(centre.id)}
            onToggleStatus={() => onToggleStatus(centre.id, centre.isActive)}
            onViewDetails={() => onViewDetails(centre)}
            onAssociateUsers={() => onAssociateUsers(centre)}
            onRemoveUsers={onRemoveUsers ? () => onRemoveUsers(centre) : undefined}
            userCount={userCount}
          />
        </div>
      </TableCell>
    </TableRow>
  );
} 