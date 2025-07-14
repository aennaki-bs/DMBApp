import React from "react";
import { TableBody } from "@/components/ui/table";
import { UnitCodesTableRow } from "../UnitCodesTableRow";
import { UniteCode } from "@/models/lineElements";

interface UnitCodesTableBodyProps {
  unitCodes: UniteCode[];
  selectedUnitCodes: string[];
  onSelectUnitCode: (code: string) => void;
  onEditUnitCode: (unitCode: UniteCode) => void;
  onDeleteUnitCode: (unitCode: UniteCode) => void;
  onViewUnitCode: (unitCode: UniteCode) => void;
}

export const UnitCodesTableBody: React.FC<UnitCodesTableBodyProps> = ({
  unitCodes,
  selectedUnitCodes,
  onSelectUnitCode,
  onEditUnitCode,
  onDeleteUnitCode,
  onViewUnitCode,
}) => {
  return (
    <TableBody>
      {unitCodes.map((unitCode) => (
        <UnitCodesTableRow
          key={unitCode.code}
          unitCode={unitCode}
          isSelected={selectedUnitCodes.includes(unitCode.code)}
          onSelect={() => onSelectUnitCode(unitCode.code)}
          onEdit={() => onEditUnitCode(unitCode)}
          onDelete={() => onDeleteUnitCode(unitCode)}
          onView={() => onViewUnitCode(unitCode)}
        />
      ))}
    </TableBody>
  );
};

export default UnitCodesTableBody; 