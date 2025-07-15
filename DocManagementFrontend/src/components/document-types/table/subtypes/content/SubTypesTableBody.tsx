import React from "react";
import { SubType } from "@/models/subtype";
import { SubTypesTableRow } from "./SubTypesTableRow";
import { TableBody } from "@/components/ui/table";

interface SubTypesTableBodyProps {
    subTypes: SubType[];
    selectedSubTypes: any[];
    onSelectSubType: (subType: SubType) => void;
    onEdit: (subType: SubType) => void;
    onDelete: (id: number) => void;
}

export function SubTypesTableBody({
    subTypes,
    selectedSubTypes,
    onSelectSubType,
    onEdit,
    onDelete,
}: SubTypesTableBodyProps) {
    return (
        <TableBody>
            {subTypes.map((subType, index) => {
                return (
                    <SubTypesTableRow
                        key={subType.id}
                        subType={subType}
                        isSelected={selectedSubTypes.some(id => id === subType.id)}
                        onSelect={() => onSelectSubType(subType)}
                        onEdit={() => onEdit(subType)}
                        onDelete={() => onDelete(subType.id)}
                        index={index}
                    />
                );
            })}
        </TableBody>
    );
} 