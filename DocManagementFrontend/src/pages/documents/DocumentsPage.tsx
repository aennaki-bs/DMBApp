import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useDocumentsData } from "@/hooks/documents/useDocumentsData";
import { useDocumentsFilter } from "@/hooks/documents/useDocumentsFilter";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import DocumentsTable from "@/components/documents/DocumentsTable";
import DocumentsEmptyState from "@/components/documents/DocumentsEmptyState";
import DeleteConfirmDialog from "@/components/documents/DeleteConfirmDialog";
import AssignCircuitDialog from "@/components/circuits/AssignCircuitDialog";
import CreateDocumentWizard from "@/components/create-document/CreateDocumentWizard";
import PaginationWithBulkActions, { BulkAction } from "@/components/shared/PaginationWithBulkActions";
import { FileText, Plus, GitBranch, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { PageLayout } from "@/components/layout/PageLayout";
import { Document } from "@/models/document";
import { DocumentsSearchBar } from "@/components/documents/DocumentsSearchBar";
import { AnimatePresence, motion } from "framer-motion";

const DocumentsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isCreateDocumentOpen, setIsCreateDocumentOpen] = useState(false);
  const { t, tWithParams } = useTranslation();

  const canManageDocuments = user?.role === "Admin" || user?.role === "FullUser";

  const {
    documents,
    filteredItems,
    isLoading,
    fetchDocuments,
    deleteDocument,
    deleteMultipleDocuments,
    sortConfig,
    setSortConfig,
    requestSort,
  } = useDocumentsData();

  const { activeFilters, resetFilters } = useDocumentsFilter();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const totalPages = Math.ceil(filteredItems.length / pageSize);
  const totalItems = filteredItems.length;

  const getPageDocuments = () => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredItems.slice(start, end);
  };

  const paginatedDocuments = getPageDocuments();

  // Bulk selection
  const bulkSelection = useBulkSelection({
    data: filteredItems,
    paginatedData: paginatedDocuments,
    keyField: 'id',
    currentPage,
    pageSize,
    onSelectionChange: (selectedIds) => {
      // Optional: handle selection changes
    },
  });

  // State management
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
  const [assignCircuitDialogOpen, setAssignCircuitDialogOpen] = useState(false);
  const [documentToAssign, setDocumentToAssign] = useState<Document | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [filteredItems]);

  // Check if any filters are applied
  const hasActiveFilters =
    activeFilters.searchQuery !== "" ||
    activeFilters.statusFilter !== "any" ||
    activeFilters.typeFilter !== "any" ||
    activeFilters.dateRange !== undefined;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const handleSelectDocument = (documentId: number) => {
    const document = paginatedDocuments.find(d => d.id === documentId);
    if (document) {
      bulkSelection.toggleItem(document);
    }
  };

  const handleSelectAll = () => {
    bulkSelection.toggleSelectCurrentPage();
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
      if (documentToDelete !== null) {
        await deleteDocument(documentToDelete);
        toast.success(t("documents.documentDeleted"));
      } else if (bulkSelection.selectedCount > 0) {
        try {
          const selectedIds = bulkSelection.selectedItems;
          const results = await deleteMultipleDocuments(selectedIds);
          if (results.successful.length === selectedIds.length) {
            toast.success(
              tWithParams("documents.documentsDeleted", { count: results.successful.length })
            );
          }
        } catch (error: any) {
          if (error.results) {
            const { successful, failed, erpArchivedCount = 0 } = error.results;

            if (successful.length > 0 && failed.length > 0) {
              toast.success(
                tWithParams("documents.documentsDeleted", { count: successful.length })
              );

              if (erpArchivedCount > 0) {
                toast.error(
                  `${erpArchivedCount} document${erpArchivedCount !== 1 ? 's' : ''} could not be deleted because they are archived to ERP`,
                  { duration: 6000 }
                );
              }

              const otherFailures = failed.length - erpArchivedCount;
              if (otherFailures > 0) {
                toast.error(
                  `${otherFailures} document${otherFailures !== 1 ? 's' : ''} failed to delete for other reasons`,
                  { duration: 4000 }
                );
              }
            } else if (successful.length === 0) {
              if (erpArchivedCount === failed.length) {
                toast.error(
                  `Cannot delete ${erpArchivedCount} document${erpArchivedCount !== 1 ? 's' : ''} - they are archived to ERP`,
                  { duration: 6000 }
                );
              } else if (erpArchivedCount > 0) {
                toast.error(
                  `${erpArchivedCount} document${erpArchivedCount !== 1 ? 's' : ''} are archived to ERP, ${failed.length - erpArchivedCount} failed for other reasons`,
                  { duration: 6000 }
                );
              } else {
                toast.error(
                  tWithParams("documents.failedToDelete", { count: failed.length })
                );
              }
            }
          } else {
            const errorMessage = error.message || t("documents.failedToDelete");
            if (errorMessage.includes('archived to ERP')) {
              toast.error(errorMessage, { duration: 6000 });
            } else {
              toast.error(errorMessage);
            }
          }
        }
        bulkSelection.deselectAll();
      }

      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document(s):", error);
      toast.error(t("documents.failedToDelete"));
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
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
    toast.success(t("documents.circuitAssignedSuccess"));
  };

  const handleDocumentCreated = () => {
    setIsCreateDocumentOpen(false);
    toast.success("Document created successfully");
    fetchDocuments();
  };

  // Bulk actions
  const bulkActions: BulkAction[] = [
    {
      id: "delete",
      label: t("common.delete"),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: openDeleteDialog,
      variant: "destructive",
    },
    ...(bulkSelection.selectedCount === 1 ? [{
      id: "assign-circuit",
      label: "Assign Circuit",
      icon: <GitBranch className="h-4 w-4" />,
      onClick: () => {
        const selectedObjects = bulkSelection.getSelectedObjects();
        if (selectedObjects.length === 1) {
          openAssignCircuitDialog(selectedObjects[0]);
        }
      },
      variant: "outline" as const,
    }] : [])
  ];

  const pageActions = [
    {
      label: t("documents.newDocument"),
      variant: "default" as const,
      icon: Plus,
      onClick: () => setIsCreateDocumentOpen(true),
      disabled: !canManageDocuments,
      tooltip: !canManageDocuments ? "You don't have permission to create documents" : undefined,
    },
  ];

  const mainContent = (
    <div className="h-full flex flex-col gap-6 w-full" style={{ minHeight: "100%" }}>
      {/* Search Bar with Integrated Filters */}
      <DocumentsSearchBar
        hasActiveFilters={hasActiveFilters}
      />

      {/* Main Table Content */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 bg-background/50 backdrop-blur-sm shadow-lg rounded-xl border border-border/50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-background/50 backdrop-blur-sm shadow-lg rounded-xl border border-border/50">
            <DocumentsEmptyState
              canManageDocuments={canManageDocuments}
              onDocumentCreated={fetchDocuments}
              hasFilters={hasActiveFilters}
              onClearFilters={resetFilters}
            />
          </div>
        ) : (
          <DocumentsTable
            documents={paginatedDocuments}
            selectedDocuments={bulkSelection.selectedItems}
            canManageDocuments={canManageDocuments}
            handleSelectDocument={handleSelectDocument}
            handleSelectAll={handleSelectAll}
            openDeleteDialog={openDeleteSingleDialog}
            openAssignCircuitDialog={openAssignCircuitDialog}
            sortConfig={sortConfig}
            requestSort={requestSort}
            page={currentPage}
            pageSize={pageSize}
          />
        )}
      </div>

      {/* Professional Pagination with Bulk Actions */}
      {filteredItems.length > 0 && (
        <PaginationWithBulkActions
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          bulkSelection={bulkSelection}
          bulkActions={bulkActions}
        />
      )}
    </div>
  );

  return (
    <PageLayout
      title={t("documents.title")}
      subtitle={t("documents.subtitle")}
      icon={FileText}
      actions={pageActions}
    >
      {mainContent}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        count={documentToDelete ? 1 : bulkSelection.selectedCount}
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
        open={isCreateDocumentOpen}
        onOpenChange={setIsCreateDocumentOpen}
        onSuccess={handleDocumentCreated}
      />
    </PageLayout>
  );
};

export default DocumentsPage;
