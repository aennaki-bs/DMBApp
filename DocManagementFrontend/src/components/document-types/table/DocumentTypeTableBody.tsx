import { TableBody } from "@/components/ui/table";
import { DocumentType } from "@/models/document";
import { DocumentTypeTableRow } from "./DocumentTypeTableRow";

interface DocumentTypeTableBodyProps {
    types: DocumentType[] | undefined;
    selectedTypes: number[];
    onSelectType: (typeId: number) => void;
    onEditType: (type: DocumentType) => void;
    onDeleteType: (typeId: number) => void;
    canSelectType?: (type: DocumentType) => boolean;
    getDisabledReason?: (type: DocumentType) => string | null;
}

export function DocumentTypeTableBody({
    types,
    selectedTypes,
    onSelectType,
    onEditType,
    onDeleteType,
    canSelectType,
    getDisabledReason,
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
                    canSelectType={canSelectType}
                    getDisabledReason={getDisabledReason}
                />
            ))}
        </TableBody>
    );
} 