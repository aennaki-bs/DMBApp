import { useState, useEffect } from "react";
import { useDocumentsData } from "./hooks/useDocumentsData";
import { DocumentTable } from "@/components/documents/DocumentTable";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import { Document } from "@/models/document";

import { toast } from "sonner";
import AssignCircuitDialog from "@/components/circuits/AssignCircuitDialog";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { PageLayout } from "@/components/layout/PageLayout";
import { FileText, Plus } from "lucide-react";
import CreateDocumentWizard from "@/components/create-document/CreateDocumentWizard";

const DocumentsPage = () => {
  const { t, tWithParams } = useTranslation();
  const { user } = useAuth();
  const canManageDocuments =
    user?.role === "Admin" || user?.role === "FullUser";

  const {
    documents,
    isLoading,
    fetchDocuments,
    deleteDocument,
    deleteMultipleDocuments,
    useFakeData,
    sortConfig,
    setSortConfig,
    requestSort,
  } = useDocumentsData();

  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
  const [assignCircuitDialogOpen, setAssignCircuitDialogOpen] = useState(false);
  const [documentToAssign, setDocumentToAssign] = useState<Document | null>(
    null
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocuments(documents.map((doc) => doc.id));
    } else {
      setSelectedDocuments([]);
    }
  };

  const handleSelectDocument = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedDocuments((prev) => [...prev, id]);
    } else {
      setSelectedDocuments((prev) => prev.filter((docId) => docId !== id));
    }
  };

  const openDeleteSingleDialog = (documentId: number) => {
    setDocumentToDelete(documentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (documentToDelete) {
        // Single document deletion
        await deleteDocument(documentToDelete);
        toast.success("Document deleted successfully");
        setDocumentToDelete(null);
      } else if (selectedDocuments.length > 0) {
        // Bulk deletion
        await deleteMultipleDocuments(selectedDocuments);
        toast.success(
          `${selectedDocuments.length} document${
            selectedDocuments.length > 1 ? "s" : ""
          } deleted successfully`
        );
        setSelectedDocuments([]);
      }
      setDeleteDialogOpen(false);
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document(s):", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      if (errorMessage.includes("foreign key constraint")) {
        toast.error(
          "Cannot delete document(s) because they are referenced by other records."
        );
      } else if (errorMessage.includes("not found")) {
        toast.error(
          "Document(s) not found. They may have already been deleted."
        );
        // Refresh the list to reflect current state
        fetchDocuments();
      } else if (errorMessage.includes("permission")) {
        toast.error("You don't have permission to delete these document(s).");
      } else {
        toast.error(`Failed to delete document(s): ${errorMessage}`);
      }
      setDeleteDialogOpen(false);
    }
  };

  const handleBulkDelete = () => {
    if (selectedDocuments.length > 0) {
      setDeleteDialogOpen(true);
    }
  };

  const openAssignCircuitDialog = (document: Document) => {
    setDocumentToAssign(document);
    setAssignCircuitDialogOpen(true);
  };

  const handleAssignCircuitSuccess = () => {
    setAssignCircuitDialogOpen(false);
    setDocumentToAssign(null);
    fetchDocuments();
  };

  // Page actions for the header
  const pageActions = [
    ...(canManageDocuments
      ? [
          {
            label: t("documents.newDocument"),
            variant: "default" as const,
            icon: Plus,
            onClick: () => setCreateModalOpen(true),
          },
        ]
      : []),
  ];

  return (
    <PageLayout
      title={t("documents.title")}
      subtitle={t("documents.subtitle")}
      icon={FileText}
      actions={pageActions}
    >
      <DocumentTable
        documents={documents}
        selectedDocuments={selectedDocuments}
        onSelectDocument={handleSelectDocument}
        onSelectAll={handleSelectAll}
        onDeleteDocument={openDeleteSingleDialog}
        onBulkDelete={handleBulkDelete}
        onEditDocument={(document: Document) => {
          // This would open an edit modal - for now just log
          console.log("Edit document:", document);
        }}
        onAssignCircuit={openAssignCircuitDialog}
        canManageDocuments={canManageDocuments}
        isLoading={isLoading}
        onRefresh={fetchDocuments}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        count={documentToDelete ? 1 : selectedDocuments.length}
      />

      {/* Assign Circuit Dialog */}
      {documentToAssign && (
        <AssignCircuitDialog
          open={assignCircuitDialogOpen}
          onOpenChange={setAssignCircuitDialogOpen}
          documentId={documentToAssign.id}
          documentKey={documentToAssign.documentKey}
          documentTypeId={documentToAssign.typeId}
          onSuccess={handleAssignCircuitSuccess}
        />
      )}

      {/* Create Document Wizard */}
      <CreateDocumentWizard
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={fetchDocuments}
      />
    </PageLayout>
  );
};

export default DocumentsPage;
