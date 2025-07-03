import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import DocumentTypesSimpleHeaderSection from "./DocumentTypesSimpleHeaderSection";
import DocumentTypesContent from "./DocumentTypesContent";
import DocumentTypeDrawer from "./DocumentTypeDrawer";
import DeleteConfirmDialog from "@/components/document-types/DeleteConfirmDialog";
import BottomActionBar from "@/components/document-types/BottomActionBar";
import DocumentTypeFilterBar from "@/components/document-types/DocumentTypeFilterBar";
import { DocumentType } from "@/models/document";
import documentService from "@/services/documentService";
import { Tag, Trash2 } from "lucide-react";
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
import { useDocumentTypeSmartFilter } from "@/hooks/document-types/useDocumentTypeSmartFilter";

const DocumentTypesManagementPage = () => {
  const [types, setTypes] = useState<DocumentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [typeToEdit, setTypeToEdit] = useState<DocumentType | null>(null);
  const [typeToDelete, setTypeToDelete] = useState<DocumentType | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Use our smart filter hook
  const {
    filters,
    updateFilters,
    resetFilters,
    filteredTypes,
    sortField,
    sortDirection,
    handleSort,
    isFilterActive,
    activeFilterCount
  } = useDocumentTypeSmartFilter(types);

  // Fetch document types
  const fetchTypes = async () => {
    try {
      setIsLoading(true);
      const data = await documentService.getAllDocumentTypes();
      setTypes(data);
    } catch (error) {
      console.error('Failed to fetch document types:', error);
      toast.error('Failed to load document types');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTypes = async () => {
    await fetchTypes();
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleViewModeChange = (mode: "table" | "grid") => {
    setViewMode(mode);
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

  // Handle select type
  const handleSelectType = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedTypes((prev) => [...prev, id]);
    } else {
      setSelectedTypes((prev) => prev.filter((typeId) => typeId !== id));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredTypes.map((type) => type.id!);
      setSelectedTypes(allIds);
    } else {
      setSelectedTypes([]);
    }
  };

  const bulkActions: BulkAction[] = [
    {
      id: "delete",
      label: "Delete Selected",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: "destructive",
      className:
        "bg-red-900/30 border-red-500/30 text-red-300 hover:text-red-200 hover:bg-red-900/50 hover:border-red-400/50 transition-all duration-200 shadow-md",
    },
  ];

  // Document types table props
  const documentTypesProps = {
    sortField,
    sortDirection,
    handleSort,
    currentPage: 1,
    setCurrentPage: () => {},
    totalPages: 1,
    filteredAndSortedTypes: filteredTypes
  };

  return (
    <div className="space-y-4 p-6">
      <DocumentTypesSimpleHeaderSection
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onNewTypeClick={() => setIsDrawerOpen(true)}
      />

      <div className="px-1">
        <DocumentTypeFilterBar
          filters={filters}
          updateFilters={updateFilters}
          resetFilters={resetFilters}
          isFilterActive={isFilterActive}
          activeFilterCount={activeFilterCount}
        />
      </div>

      <DocumentTypesContent
        isLoading={isLoading}
        types={filteredTypes}
        viewMode={viewMode}
        selectedTypes={selectedTypes}
        onDeleteType={handleDeleteType}
        onEditType={handleEditType}
        onSelectType={handleSelectType}
        onSelectAll={handleSelectAll}
        searchQuery={filters.searchQuery}
        setSearchQuery={(query) => updateFilters({ searchQuery: query })}
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

      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0a1033] border border-blue-900/30">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document Types</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedTypes.length} document
              types? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border border-blue-900/30 text-blue-300 hover:bg-blue-900/20 hover:text-blue-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-red-900/80 text-red-100 hover:bg-red-900"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AnimatePresence>
        {selectedTypes.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedTypes.length}
            entityName="document type"
            actions={bulkActions}
            icon={<Tag className="w-5 h-5 text-blue-400" />}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentTypesManagementPage;
