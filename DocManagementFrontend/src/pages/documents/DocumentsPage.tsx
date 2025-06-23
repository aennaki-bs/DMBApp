import { useState, useEffect } from "react";
import { useDocumentsData } from "./hooks/useDocumentsData";
import DocumentsHeader from "./components/DocumentsHeader";
import { DocumentsWorkingTable } from "./components/DocumentsWorkingTable";
import DocumentsEmptyState from "./components/DocumentsEmptyState";
import SelectedDocumentsBar from "./components/SelectedDocumentsBar";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import { Document } from "@/models/document";

import { toast } from "sonner";
import AssignCircuitDialog from "@/components/circuits/AssignCircuitDialog";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  FileText,
  Plus,
  GitBranch,
  Trash2,
  AlertCircle,
  Filter,
  Search,
  X,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import CreateDocumentWizard from "@/components/create-document/CreateDocumentWizard";
import { useDocumentsFilter } from "./hooks/useDocumentsFilter";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";
import {
  DEFAULT_STATUS_FILTERS,
  DEFAULT_TYPE_FILTERS,
  DEFAULT_DOCUMENT_SEARCH_FIELDS,
} from "@/components/table";
import { BulkActionsBar } from "@/components/responsibility-centre/table/BulkActionsBar";

const DocumentsPage = () => {
  const { t, tWithParams } = useTranslation();
  const { user } = useAuth();
  const canManageDocuments =
    user?.role === "Admin" || user?.role === "FullUser";

  const {
    documents,
    filteredItems,
    isLoading,
    fetchDocuments,
    deleteDocument,
    deleteMultipleDocuments,
    useFakeData,
    sortConfig,
    setSortConfig,
    requestSort,
  } = useDocumentsData();

  // Get filter state to check if filters are applied
  const {
    searchQuery,
    setSearchQuery,
    activeFilters,
    applyFilters,
    resetFilters,
  } = useDocumentsFilter();

  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
  const [assignCircuitDialogOpen, setAssignCircuitDialogOpen] = useState(false);
  const [documentToAssign, setDocumentToAssign] = useState<Document | null>(
    null
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Check if any filters are applied
  const hasActiveFilters =
    activeFilters.searchQuery !== "" ||
    activeFilters.statusFilter !== "any" ||
    activeFilters.typeFilter !== "any" ||
    activeFilters.dateRange !== undefined;

  const handleRefresh = async () => {
    try {
      await fetchDocuments();
      toast.success("Documents refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh documents");
    }
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === filteredItems.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredItems.map((doc) => doc.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedDocuments([]);
  };

  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
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
      openDeleteDialog();
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
      <div className="h-full flex flex-col w-full">
        {/* Main Content */}
        <div className="flex-1 min-h-0">
          {isLoading ? (
            <div className="h-full flex items-center justify-center rounded-2xl table-glass-container shadow-lg backdrop-blur-md">
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20"></div>
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent absolute top-0 left-0"></div>
                </div>
                <p className="text-foreground/80 mt-6 text-lg font-medium">
                  {t("common.loading")}
                </p>
                <p className="text-muted-foreground mt-2 text-sm">
                  Fetching documents...
                </p>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <DocumentsEmptyState
              canManageDocuments={canManageDocuments}
              onDocumentCreated={fetchDocuments}
              hasFilters={hasActiveFilters}
              onClearFilters={resetFilters}
            />
          ) : (
            <DocumentsWorkingTable
              documents={filteredItems}
              selectedDocuments={selectedDocuments}
              onSelectDocument={(id: number, checked: boolean) => {
                if (checked) {
                  setSelectedDocuments((prev) => [...prev, id]);
                } else {
                  setSelectedDocuments((prev) =>
                    prev.filter((docId) => docId !== id)
                  );
                }
              }}
              onSelectAll={handleSelectAll}
              onDeleteDocument={openDeleteSingleDialog}
              onBulkDelete={handleBulkDelete}
              onEditDocument={(document: Document) => {
                // This would open an edit modal - for now just log
                console.log("Edit document:", document);
              }}
              onAssignCircuit={openAssignCircuitDialog}
              canManageDocuments={canManageDocuments}
              isLoading={false}
              onRefresh={handleRefresh}
            />
          )}
        </div>
      </div>

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
