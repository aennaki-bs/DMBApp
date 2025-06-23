import { DocumentTypeWorkingTable } from "./DocumentTypeWorkingTable";
import { DocumentType } from "@/models/document";

interface DocumentTypeManagementTableProps {
  types: DocumentType[];
  selectedTypes: number[];
  onSelectType: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteType: (id: number) => void;
  onEditType: (type: DocumentType) => void;
  isLoading: boolean;
}

export function DocumentTypeManagementTable({
  types,
  selectedTypes,
  onSelectType,
  onSelectAll,
  onDeleteType,
  onEditType,
  isLoading,
}: DocumentTypeManagementTableProps) {
  return (
    <DocumentTypeWorkingTable
      types={types}
      selectedTypes={selectedTypes}
      onSelectType={onSelectType}
      onSelectAll={onSelectAll}
      onDeleteType={onDeleteType}
      onEditType={onEditType}
      isLoading={isLoading}
    />
  );
}
