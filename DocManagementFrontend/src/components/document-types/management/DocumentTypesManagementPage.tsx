import { useState } from "react";
import { useDocumentTypes } from "@/hooks/useDocumentTypes";
import { DocumentTypeManagementTable } from "../DocumentTypeManagementTable";
import DocumentTypeDrawer from "./DocumentTypeDrawer";
import DeleteConfirmDialog from "@/components/document-types/DeleteConfirmDialog";
import { DocumentType } from "@/models/document";
import { toast } from "sonner";
import documentService from "@/services/documentService";
import { Plus, FileText, Download } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageLayout } from "@/components/layout/PageLayout";
import { useTranslation } from "@/hooks/useTranslation";

const DocumentTypesManagementPage = () => {
  const { t } = useTranslation();
  const {
    types,
    isLoading,
    selectedTypes,
    setSelectedTypes,
    handleSelectType,
    handleSelectAll,
    refreshTypes,
  } = useDocumentTypes();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [typeToEdit, setTypeToEdit] = useState<DocumentType | null>(null);
  const [typeToDelete, setTypeToDelete] = useState<DocumentType | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const handleAddType = () => {
    setTypeToEdit(null);
    setIsDrawerOpen(true);
  };

  const handleEditType = (type: DocumentType) => {
    setTypeToEdit(type);
    setIsDrawerOpen(true);
  };

  const handleDeleteType = (id: number) => {
    const typeToDelete = types.find((type) => type.id === id);
    if (typeToDelete) {
      setTypeToDelete(typeToDelete);
    }
  };

  const confirmDeleteType = async () => {
    if (!typeToDelete) return;

    try {
      await documentService.deleteDocumentType(typeToDelete.id!);
      toast.success(
        `Document type "${typeToDelete.typeName}" deleted successfully`
      );
      refreshTypes();
      setTypeToDelete(null);
    } catch (error) {
      console.error("Error deleting document type:", error);
      toast.error("Failed to delete document type");
    }
  };

  const handleBulkDelete = () => {
    if (selectedTypes.length === 0) {
      toast.error("No document types selected");
      return;
    }

    // Check if any selected type has documents
    const hasDocuments = types
      .filter((type) => selectedTypes.includes(type.id!))
      .some((type) => type.documentCounter! > 0);

    if (hasDocuments) {
      toast.error("Cannot delete types with associated documents");
      return;
    }

    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await documentService.deleteMultipleDocumentTypes(selectedTypes);
      toast.success(
        `${selectedTypes.length} document types deleted successfully`
      );
      refreshTypes();
      setSelectedTypes([]);
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting document types:", error);
      toast.error("Failed to delete document types");
    }
  };

  const pageActions = [
    {
      label: "Export Types",
      variant: "outline" as const,
      icon: Download,
      onClick: () => {
        // Export functionality
        toast.info("Export functionality coming soon");
      },
    },
    {
      label: "New Type",
      variant: "default" as const,
      icon: Plus,
      onClick: handleAddType,
    },
  ];

  return (
    <PageLayout
      title="Document Types"
      subtitle="Manage document classification system"
      icon={FileText}
      actions={pageActions}
    >
      <div className="h-full">
        <DocumentTypeManagementTable
          types={types}
          selectedTypes={selectedTypes}
          onSelectType={handleSelectType}
          onSelectAll={handleSelectAll}
          onDeleteType={handleDeleteType}
          onEditType={handleEditType}
          isLoading={isLoading}
        />
      </div>

      <DocumentTypeDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        type={typeToEdit}
        onSuccess={() => {
          refreshTypes();
          setTypeToEdit(null);
        }}
      />

      <DeleteConfirmDialog
        open={!!typeToDelete}
        onOpenChange={(open) => !open && setTypeToDelete(null)}
        onConfirm={confirmDeleteType}
        title="Delete Document Type"
        description={
          typeToDelete
            ? `Are you sure you want to delete "${typeToDelete.typeName}"? This action cannot be undone.`
            : ""
        }
      />

      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-gradient-to-b from-primary/95 to-primary/80 border-primary/30 text-primary-foreground shadow-[0_0_25px_rgba(var(--primary),0.2)] rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-primary-foreground">
              Delete Multiple Document Types
            </AlertDialogTitle>
            <AlertDialogDescription className="text-primary-foreground/80">
              Are you sure you want to delete {selectedTypes.length} document
              types? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-primary-foreground/40 text-primary-foreground/80 hover:bg-primary-foreground/20 hover:text-primary-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive/30 text-destructive-foreground hover:bg-destructive/50 hover:text-destructive-foreground border border-destructive/30 hover:border-destructive/50 transition-all duration-200"
            >
              Delete Types
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default DocumentTypesManagementPage;
