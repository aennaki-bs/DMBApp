import { TableBody } from "@/components/ui/table";
import { DocumentTableRow } from "./DocumentTableRow";

interface DocumentTableBodyProps {
  documents: any[];
  selectedDocuments: number[];
  onSelectDocument: (id: number, checked: boolean) => void;
  onEdit: (document: any) => void;
  onDelete: (id: number) => void;
  onAssignCircuit: (document: any) => void;
  isSimpleUser: boolean;
}

export function DocumentTableBody({
  documents,
  selectedDocuments,
  onSelectDocument,
  onEdit,
  onDelete,
  onAssignCircuit,
  isSimpleUser,
}: DocumentTableBodyProps) {
  return (
    <TableBody>
      {documents.map((document) => (
        <DocumentTableRow
          key={document.id}
          document={document}
          isSelected={selectedDocuments.includes(document.id)}
          onSelect={(checked) => onSelectDocument(document.id, checked)}
          onEdit={onEdit}
          onDelete={() => onDelete(document.id)}
          onAssignCircuit={onAssignCircuit}
          isSimpleUser={isSimpleUser}
        />
      ))}
    </TableBody>
  );
}
