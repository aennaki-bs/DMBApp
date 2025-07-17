import { useState } from "react";
import { toast } from "sonner";
import { DocumentType } from "@/models/document";
import DocumentTypeDrawer from "./DocumentTypeDrawer";
import DeleteConfirmDialog from "@/components/document-types/DeleteConfirmDialog";
import documentService from "@/services/documentService";
import { Layers, Plus, Trash2 } from "lucide-react";
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
import { useDocumentTypeManagement } from "@/hooks/useDocumentTypeManagement";
import { DocumentTypesTable } from "../DocumentTypesTable";

const DocumentTypesManagementPage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [typeToEdit, setTypeToEdit] = useState<DocumentType | null>(null);

  // Use the professional management hook like user management
  const {
    selectedTypes,
    bulkSelection,
    pagination,
    types,
    paginatedTypes,
    editingType,
    deletingType,
    deleteMultipleOpen,
    searchQuery,
    setSearchQuery,
    searchField,
    setSearchField,
    tierTypeFilter,
    setTierTypeFilter,
    hasDocumentsFilter,
    setHasDocumentsFilter,
    showAdvancedFilters,
    setShowAdvancedFilters,
    isLoading,
    isError,
    refetch,
    setEditingType,
    setDeletingType,
    setDeleteMultipleOpen,
    handleSort,
    sortBy,
    sortDirection,
    handleTypeEdited,
    handleTypeDeleted,
    handleMultipleDeleted,
    erpTypeFilter,
    setErpTypeFilter,
  } = useDocumentTypeManagement();

  // Filter state for DocumentTypeFilterBar compatibility
  const filters = {
    searchQuery,
    searchField,
    tierType: tierTypeFilter as any,
    hasDocuments: hasDocumentsFilter as 'any' | 'yes' | 'no',
    erpType: erpTypeFilter,
  };

  const updateFilters = (newFilters: any) => {
    if (newFilters.searchQuery !== undefined) setSearchQuery(newFilters.searchQuery);
    if (newFilters.searchField !== undefined) setSearchField(newFilters.searchField);
    if (newFilters.tierType !== undefined) setTierTypeFilter(newFilters.tierType);
    if (newFilters.hasDocuments !== undefined) setHasDocumentsFilter(newFilters.hasDocuments);
    if (newFilters.erpType !== undefined) setErpTypeFilter(newFilters.erpType);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSearchField('all');
    setTierTypeFilter('any');
    setHasDocumentsFilter('any');
    setErpTypeFilter('any');
  };

  const isFilterActive = searchQuery !== '' || tierTypeFilter !== 'any' || hasDocumentsFilter !== 'any' || erpTypeFilter !== 'any';
  const activeFilterCount = [
    searchQuery !== '',
    tierTypeFilter !== 'any',
    hasDocumentsFilter !== 'any',
    erpTypeFilter !== 'any'
  ].filter(Boolean).length;

  const handleEditType = (type: DocumentType) => {
    setTypeToEdit(type);
    setIsDrawerOpen(true);
  };

  const handleDeleteType = (id: number) => {
    setDeletingType(id);
  };

  const confirmDeleteType = async () => {
    if (!deletingType) return;

    try {
      const typeToDelete = types.find((type) => type.id === deletingType);
      await documentService.deleteDocumentType(deletingType);
      toast.success(
        `Document type "${typeToDelete?.typeName || 'Unknown'}" deleted successfully`
      );
      handleTypeDeleted();
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
    const typesWithDocuments = types
      .filter((type) => selectedTypes.includes(type.id!))
      .filter((type) => type.documentCounter && type.documentCounter > 0);

    if (typesWithDocuments.length > 0) {
      toast.error(`Cannot delete ${typesWithDocuments.length} document type(s) with associated documents. Only types without documents can be deleted.`);
      return;
    }

    setDeleteMultipleOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await documentService.deleteMultipleDocumentTypes(selectedTypes);
      toast.success(
        `${selectedTypes.length} document types deleted successfully`
      );
      handleMultipleDeleted();
    } catch (error) {
      console.error("Error deleting document types:", error);
      toast.error("Failed to delete document types");
    }
  };

  const bulkActions = [
    {
      id: "delete",
      label: "Delete Selected",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: "destructive" as const,
      className:
        "bg-red-900/30 border-red-500/30 text-red-300 hover:text-red-200 hover:bg-red-900/50 hover:border-red-400/50 transition-all duration-200 shadow-md",
    },
  ];

  // Page actions for PageLayout
  const pageActions = [
    {
      label: "New Type",
      variant: "default" as const,
      icon: Plus,
      onClick: () => setIsDrawerOpen(true),
    },
  ];

  return (
    <PageLayout
      title="Document Types Management"
      subtitle="Manage document types and classification system"
      icon={Layers}
      actions={pageActions}
    >
      {/* Document Types Table with Search and Filters like User Management */}
      <DocumentTypesTable onCreateType={() => setIsDrawerOpen(true)} />

      {/* Drawer for editing/creating types */}
      <DocumentTypeDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        type={typeToEdit}
        onSuccess={() => {
          refetch();
          setTypeToEdit(null);
        }}
      />

      {/* Delete single type dialog */}
      <DeleteConfirmDialog
        open={!!deletingType}
        onOpenChange={(open) => !open && setDeletingType(null)}
        onConfirm={confirmDeleteType}
        title="Delete Document Type"
        description={
          deletingType
            ? `Are you sure you want to delete this document type? This action cannot be undone.`
            : ""
        }
      />

      {/* Bulk delete dialog */}
      <AlertDialog open={deleteMultipleOpen} onOpenChange={setDeleteMultipleOpen}>
        <AlertDialogContent className="bg-background/95 backdrop-blur-xl border-destructive/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Document Types
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedTypes.length} document
              types? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-background/50 border-border hover:bg-muted">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


    </PageLayout>
  );
};

export default DocumentTypesManagementPage;
