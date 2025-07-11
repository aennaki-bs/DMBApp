import { TableBody } from "@/components/ui/table";
import { DocumentType } from "@/models/document";
import { DocumentTypeTableRow } from "./DocumentTypeTableRow";

interface DocumentTypeTableBodyProps {
  types: DocumentType[] | undefined;
  selectedTypes: number[];
  onSelectType: (id: number, checked: boolean) => void;
  onEdit: (type: DocumentType) => void;
  onDelete: (id: number) => void;
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
      {types?.map((type) => (
        <DocumentTypeTableRow
          key={type.id}
          type={type}
          isSelected={selectedTypes.includes(type.id!)}
          onSelect={onSelectType}
          onEdit={onEdit}
          onDelete={(id) => onDelete(id)}
        />
      ))}
    </TableBody>
  );
}
