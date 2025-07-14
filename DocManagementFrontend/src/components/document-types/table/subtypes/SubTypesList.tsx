import { DocumentType } from "@/models/document";
import { SubTypesTable } from "./SubTypesTable";

interface SubTypesListProps {
  documentType: DocumentType;
  openCreateDialog: boolean;
  setOpenCreateDialog: (open: boolean) => void;
}

export default function SubTypesList({
  documentType,
  openCreateDialog,
  setOpenCreateDialog
}: SubTypesListProps) {
  return (
    <SubTypesTable
      documentType={documentType}
      openCreateDialog={openCreateDialog}
      setOpenCreateDialog={setOpenCreateDialog}
    />
  );
}
