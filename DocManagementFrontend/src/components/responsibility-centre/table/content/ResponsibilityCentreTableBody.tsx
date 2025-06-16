import { TableBody } from "@/components/ui/table";
import { ResponsibilityCentre } from "@/models/responsibilityCentre";
import { ResponsibilityCentreTableRow } from "../ResponsibilityCentreTableRow";

interface ResponsibilityCentreTableBodyProps {
  centres: ResponsibilityCentre[] | undefined;
  selectedCentres: number[];
  onSelectCentre: (centreId: number) => void;
  onEdit: (centre: ResponsibilityCentre) => void;
  onDelete: (centre: ResponsibilityCentre) => void;
  onAssociateUsers: (centre: ResponsibilityCentre) => void;
  onViewDetails: (centre: ResponsibilityCentre) => void;
}

export function ResponsibilityCentreTableBody({
  centres,
  selectedCentres,
  onSelectCentre,
  onEdit,
  onDelete,
  onAssociateUsers,
  onViewDetails,
}: ResponsibilityCentreTableBodyProps) {
  return (
    <TableBody>
      {centres?.map((centre) => (
        <ResponsibilityCentreTableRow
          key={centre.id}
          centre={centre}
          isSelected={selectedCentres.includes(centre.id)}
          onSelect={onSelectCentre}
          onEdit={onEdit}
          onDelete={onDelete}
          onAssociateUsers={onAssociateUsers}
          onViewDetails={onViewDetails}
        />
      ))}
    </TableBody>
  );
}
