import { TableBody } from "@/components/ui/table";
import { DocumentType } from "@/models/document";
import { DocumentTypeTableRow } from "../DocumentTypeTableRow";

interface DocumentTypeTableBodyProps {
  types: DocumentType[];
  selectedTypes: number[];
  onSelectType: (typeId: number) => void;
  onEdit: (type: DocumentType) => void;
  onDelete: (type: DocumentType) => void;
}

export function DocumentTypeTableBody({
  types,
  selectedTypes,
  onSelectType,
  onEdit,
  onDelete,
}: DocumentTypeTableBodyProps) {
  return (
    <TableBody>
      {types.map((type) => (
        <DocumentTypeTableRow
          key={type.id}
          type={type}
          isSelected={type.id ? selectedTypes.includes(type.id) : false}
          onSelect={onSelectType}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </TableBody>
  );
}
