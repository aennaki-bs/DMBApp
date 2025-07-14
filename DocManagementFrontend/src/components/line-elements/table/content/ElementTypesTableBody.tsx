import { TableBody } from "@/components/ui/table";
import { LignesElementType } from "@/models/lineElements";
import { ElementTypesTableRow } from "./ElementTypesTableRow";

interface ElementTypesTableBodyProps {
    elementTypes: LignesElementType[];
    selectedElementTypes: number[];
    onSelectElementType: (id: number) => void;
    onEdit: (elementType: LignesElementType) => void;
    onView: (elementType: LignesElementType) => void;
    onDelete: (id: number) => void;
}

export function ElementTypesTableBody({
    elementTypes,
    selectedElementTypes,
    onSelectElementType,
    onEdit,
    onView,
    onDelete,
}: ElementTypesTableBodyProps) {
    return (
        <TableBody>
            {elementTypes.map((elementType) => (
                <ElementTypesTableRow
                    key={elementType.id}
                    elementType={elementType}
                    isSelected={selectedElementTypes.includes(elementType.id)}
                    onSelect={() => onSelectElementType(elementType.id)}
                    onEdit={() => onEdit(elementType)}
                    onView={() => onView(elementType)}
                    onDelete={() => onDelete(elementType.id)}
                />
            ))}
        </TableBody>
    );
} 