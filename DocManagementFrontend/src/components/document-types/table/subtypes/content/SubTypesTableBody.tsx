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
    seriesUsageMap: Record<number, { isUsed: boolean; documentCount: number }>;
    isSeriesRestricted: (seriesId: number) => boolean;
    getSeriesDocumentCount: (seriesId: number) => number;
}

export function SubTypesTableBody({
    subTypes,
    selectedSubTypes,
    onSelectSubType,
    onEdit,
    onDelete,
    seriesUsageMap,
    isSeriesRestricted,
    getSeriesDocumentCount
}: SubTypesTableBodyProps) {
    return (
        <TableBody>
            {subTypes.map((subType, index) => {
                const isRestricted = subType.id ? isSeriesRestricted(subType.id) : false;
                const documentCount = subType.id ? getSeriesDocumentCount(subType.id) : 0;

                return (
                    <SubTypesTableRow
                        key={subType.id}
                        subType={subType}
                        isSelected={selectedSubTypes.some(id => id === subType.id)}
                        onSelect={() => onSelectSubType(subType)}
                        onEdit={() => onEdit(subType)}
                        onDelete={() => onDelete(subType.id)}
                        index={index}
                        isRestricted={isRestricted}
                        documentCount={documentCount}
                    />
                );
            })}
        </TableBody>
    );
} 