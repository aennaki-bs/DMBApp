import React from "react";
import { Table } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UnitCodesTableHeader } from "./content/UnitCodesTableHeader";
import { UnitCodesTableBody } from "./content/UnitCodesTableBody";
import { UniteCode } from "@/models/lineElements";

interface UnitCodesTableContentProps {
  unitCodes: UniteCode[];
  sortField: keyof UniteCode;
  sortDirection: "asc" | "desc";
  onSort: (field: keyof UniteCode) => void;
  selectedUnitCodes: string[];
  onSelectUnitCode: (code: string) => void;
  onSelectAll: () => void;
  onEditUnitCode: (unitCode: UniteCode) => void;
  onDeleteUnitCode: (unitCode: UniteCode) => void;
  onViewUnitCode: (unitCode: UniteCode) => void;
}

export const UnitCodesTableContent: React.FC<UnitCodesTableContentProps> = ({
  unitCodes,
  sortField,
  sortDirection,
  onSort,
  selectedUnitCodes,
  onSelectUnitCode,
  onSelectAll,
  onEditUnitCode,
  onDeleteUnitCode,
  onViewUnitCode,
}) => {
  return (
    <div className="bg-background/60 backdrop-blur-md border border-primary/20 rounded-xl overflow-hidden shadow-xl">
      {/* Fixed Header */}
      <div className="border-b border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <Table>
          <UnitCodesTableHeader
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
            selectedUnitCodes={selectedUnitCodes}
            unitCodes={unitCodes}
            onSelectAll={onSelectAll}
          />
        </Table>
      </div>

      {/* Scrollable Body */}
      <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
        <Table>
          <UnitCodesTableBody
            unitCodes={unitCodes}
            selectedUnitCodes={selectedUnitCodes}
            onSelectUnitCode={onSelectUnitCode}
            onEditUnitCode={onEditUnitCode}
            onDeleteUnitCode={onDeleteUnitCode}
            onViewUnitCode={onViewUnitCode}
          />
        </Table>
      </ScrollArea>
    </div>
  );
};

export default UnitCodesTableContent; 