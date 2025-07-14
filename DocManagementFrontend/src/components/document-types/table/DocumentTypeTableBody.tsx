import { TableBody } from "@/components/ui/table";
import { DocumentType } from "@/models/document";
import { DocumentTypeTableRow } from "./DocumentTypeTableRow";

interface DocumentTypeTableBodyProps {
    types: DocumentType[] | undefined;
    selectedTypes: number[];
    onSelectType: (typeId: number) => void;
    onEditType: (type: DocumentType) => void;
    onDeleteType: (typeId: number) => void;
}

export function DocumentTypeTableBody({
    types,
    selectedTypes,
    onSelectType,
    onEditType,
    onDeleteType,
}: DocumentTypeTableBodyProps) {
    return (
        <TableBody>
            {types?.map((type) => (
                <DocumentTypeTableRow
                    key={type.id}
                    type={type}
                    isSelected={selectedTypes.includes(type.id!)}
                    onSelect={onSelectType}
                    onEditType={onEditType}
                    onDeleteType={onDeleteType}
                />
            ))}
        </TableBody>
    );
} 