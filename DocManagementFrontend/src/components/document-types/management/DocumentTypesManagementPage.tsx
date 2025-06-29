import { useState } from "react";
import { useDocumentTypes } from "@/hooks/useDocumentTypes";
import DocumentTypesHeaderSection from "./DocumentTypesHeaderSection";
import DocumentTypesContent from "./DocumentTypesContent";
import DocumentTypeDrawer from "./DocumentTypeDrawer";
import DeleteConfirmDialog from "@/components/document-types/DeleteConfirmDialog";
import BottomActionBar from "@/components/document-types/BottomActionBar";
import DocumentTypeFilters from "@/components/document-types/DocumentTypeFilters";
import { DocumentType } from "@/models/document";
import { toast } from "sonner";
import documentService from "@/services/documentService";
import { FilterContent } from "@/components/shared/FilterContent";
import { FilterBadges, FilterBadge } from "@/components/shared/FilterBadges";
import { Tag, Trash2, Plus, FileText, Download } from "lucide-react";
import { BulkActionsBar, BulkAction } from "@/components/shared/BulkActionsBar";
import { AnimatePresence } from "framer-motion";
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
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    viewMode,
    setViewMode,
    handleSelectType,
    handleSelectAll,
    documentTypesProps,
    setFilters,
    appliedFilters,
    setAppliedFilters,
    filterBadges,
    setFilterBadges,
    refreshTypes,
  } = useDocumentTypes();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [typeToEdit, setTypeToEdit] = useState<DocumentType | null>(null);
  const [typeToDelete, setTypeToDelete] = useState<DocumentType | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setAppliedFilters(newFilters);

    // Create filter badges
    const badges: FilterBadge[] = [];
    if (newFilters.hasDocuments !== "any") {
      badges.push({
        id: "hasDocuments",
        label:
          newFilters.hasDocuments === "yes" ? "Has Documents" : "No Documents",
        value: newFilters.hasDocuments,
        onRemove: () => {
          const updatedFilters = { ...newFilters, hasDocuments: "any" };
          setFilters(updatedFilters);
          setAppliedFilters(updatedFilters);
          handleFilterChange(updatedFilters);
        },
      });
    }

    setFilterBadges(badges);
  };

  const clearAllFilters = () => {
    const defaultFilters = {
      hasDocuments: "any",
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setFilterBadges([]);
    setShowFilters(false);
  };

  const handleViewModeChange = (mode: "table" | "grid") => {
    setViewMode(mode);
  };

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

  const bulkActions: BulkAction[] = [
    {
      id: "delete",
      label: "Delete Selected",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: "destructive",
    },
  ];

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
      <DocumentTypesContent
        isLoading={isLoading}
        types={types}
        viewMode={viewMode}
        selectedTypes={selectedTypes}
        onDeleteType={handleDeleteType}
        onEditType={handleEditType}
        onSelectType={handleSelectType}
        onSelectAll={handleSelectAll}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setViewMode={setViewMode}
        onAddType={() => {
          setTypeToEdit(null);
          setIsDrawerOpen(true);
        }}
        {...documentTypesProps}
      />

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

      <AnimatePresence>
        {selectedTypes.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedTypes.length}
            entityName="document type"
            actions={bulkActions}
            icon={<Tag className="w-5 h-5 text-primary-foreground/80" />}
          />
        )}
      </AnimatePresence>

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
