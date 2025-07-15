import { TableBody } from "@/components/ui/table";
import { UniteCode } from "@/models/lineElements";
import { UnitCodesTableRow } from "./UnitCodesTableRow";

interface UnitCodesTableBodyProps {
  unitCodes: UniteCode[];
  selectedItems: string[]; // Array of unit code codes
  onSelectItem: (code: string) => void;
  onEdit: (unitCode: UniteCode) => void;
  onView: (unitCode: UniteCode) => void;
  onDelete: (code: string) => void;
}

export function UnitCodesTableBody({
  unitCodes,
  selectedItems,
  onSelectItem,
  onEdit,
  onView,
  onDelete,
}: UnitCodesTableBodyProps) {
  return (
    <TableBody>
      {unitCodes.map((unitCode) => {
        const isSelected = selectedItems.includes(unitCode.code); // Check if code is in selectedItems array

        return (
          <UnitCodesTableRow
            key={unitCode.code}
            unitCode={unitCode}
            isSelected={isSelected}
            onSelect={() => onSelectItem(unitCode.code)}
            onEdit={() => onEdit(unitCode)}
            onView={() => onView(unitCode)}
            onDelete={() => onDelete(unitCode.code)}
          />
        );
      })}
    </TableBody>
  );
}

export default UnitCodesTableBody; 