import { TableBody } from "@/components/ui/table";
import { ResponsibilityCentre } from "@/models/responsibilityCentre";
import { ResponsibilityCentreTableRow } from "../ResponsibilityCentreTableRow";

interface ResponsibilityCentreTableBodyProps {
  centres: ResponsibilityCentre[] | undefined;
  selectedCentres: number[];
  onSelectCentre: (centreId: number) => void;
  onToggleStatus: (centreId: number, currentStatus: boolean) => void;
  onEdit: (centre: ResponsibilityCentre) => void;
  onDelete: (centreId: number) => void;
  onViewDetails: (centre: ResponsibilityCentre) => void;
  onAssociateUsers: (centre: ResponsibilityCentre) => void;
  onRemoveUsers?: (centre: ResponsibilityCentre) => void;
  userCounts?: Record<number, number>;
}

export function ResponsibilityCentreTableBody({
  centres,
  selectedCentres,
  onSelectCentre,
  onToggleStatus,
  onEdit,
  onDelete,
  onViewDetails,
  onAssociateUsers,
  onRemoveUsers,
  userCounts = {},
}: ResponsibilityCentreTableBodyProps) {
  return (
    <TableBody>
      {centres?.map((centre) => (
        <ResponsibilityCentreTableRow
          key={centre.id}
          centre={centre}
          isSelected={selectedCentres.includes(centre.id)}
          onSelect={onSelectCentre}
          onToggleStatus={onToggleStatus}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
          onAssociateUsers={onAssociateUsers}
          onRemoveUsers={onRemoveUsers}
          userCount={userCounts[centre.id] || 0}
        />
      ))}
    </TableBody>
  );
} 