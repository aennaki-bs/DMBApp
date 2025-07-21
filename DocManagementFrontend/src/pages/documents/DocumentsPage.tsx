import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useDocumentsData } from "@/hooks/documents/useDocumentsData";
import { useDocumentsFilter } from "@/hooks/documents/useDocumentsFilter";
import DocumentsTable from "@/components/documents/DocumentsTable";
import DocumentsEmptyState from "@/components/documents/DocumentsEmptyState";
import DeleteConfirmDialog from "@/components/documents/DeleteConfirmDialog";
import AssignCircuitDialog from "@/components/circuits/AssignCircuitDialog";
import CreateDocumentWizard from "@/components/create-document/CreateDocumentWizard";
import { FileText, Plus, GitBranch, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { PageLayout } from "@/components/layout/PageLayout";
import { Document } from "@/models/document";
import { BulkActionsBar } from "@/components/shared/BulkActionsBar";
import { DocumentsSearchBar } from "@/components/documents/DocumentsSearchBar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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

  // State management
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
  const [assignCircuitDialogOpen, setAssignCircuitDialogOpen] = useState(false);
  const [documentToAssign, setDocumentToAssign] = useState<Document | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredItems.length / pageSize));
    setPage(1);
  }, [filteredItems, pageSize]);

  // Check if any filters are applied
  const hasActiveFilters =
    activeFilters.searchQuery !== "" ||
    activeFilters.statusFilter !== "any" ||
    activeFilters.typeFilter !== "any" ||
    activeFilters.dateRange !== undefined;

  const getPageDocuments = () => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredItems.slice(start, end);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSelectDocument = (documentId: number) => {
    setSelectedDocuments((prev) => {
      if (prev.includes(documentId)) {
        return prev.filter((id) => id !== documentId);
      } else {
        return [...prev, documentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === getPageDocuments().length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(getPageDocuments().map((doc) => doc.id));
    }
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
      } else if (selectedDocuments.length > 0) {
        try {
          const results = await deleteMultipleDocuments(selectedDocuments);
          if (results.successful.length === selectedDocuments.length) {
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
        setSelectedDocuments([]);
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
    <div className="flex flex-col h-full">
      {/* Search Bar with Integrated Filters */}
      <DocumentsSearchBar
        hasActiveFilters={hasActiveFilters}
        className="mb-6"
      />

      {/* Selected Documents Bar */}
      <AnimatePresence>
        {selectedDocuments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mb-6"
          >
            <BulkActionsBar
              selectedCount={selectedDocuments.length}
              entityName="document"
              icon={<FileText className="h-4 w-4 text-primary" />}
              actions={[
                {
                  id: "delete",
                  label: t("common.delete"),
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: openDeleteDialog,
                  variant: "destructive",
                },
                ...(selectedDocuments.length === 1 ? [{
                  id: "assign-circuit",
                  label: t("documents.assignCircuit"),
                  icon: <GitBranch className="h-4 w-4" />,
                  onClick: () => {
                    const doc = documents.find(d => d.id === selectedDocuments[0]);
                    if (doc) openAssignCircuitDialog(doc);
                  },
                  variant: "outline" as const,
                }] : [])
              ]}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <Card className="flex-1 border-border/50 bg-background/50 backdrop-blur-sm shadow-lg">
        {isLoading ? (
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">{t("common.loading")}</p>
            </div>
          </CardContent>
        ) : filteredItems.length === 0 ? (
          <DocumentsEmptyState
            canManageDocuments={canManageDocuments}
            onDocumentCreated={fetchDocuments}
            hasFilters={hasActiveFilters}
            onClearFilters={resetFilters}
          />
        ) : (
          <>
            <CardContent className="p-0">
              <DocumentsTable
                documents={getPageDocuments()}
                selectedDocuments={selectedDocuments}
                canManageDocuments={canManageDocuments}
                handleSelectDocument={handleSelectDocument}
                handleSelectAll={handleSelectAll}
                openDeleteDialog={openDeleteSingleDialog}
                openAssignCircuitDialog={openAssignCircuitDialog}
                sortConfig={sortConfig}
                requestSort={requestSort}
                page={page}
                pageSize={pageSize}
              />
            </CardContent>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center py-4 border-t border-border/50">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(1, page - 1))}
                        className={
                          page === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          onClick={() => handlePageChange(i + 1)}
                          isActive={page === i + 1}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(Math.min(totalPages, page + 1))
                        }
                        className={
                          page === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </Card>
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
        open={isCreateDocumentOpen}
        onOpenChange={setIsCreateDocumentOpen}
        onSuccess={handleDocumentCreated}
      />
    </PageLayout>
  );
};

export default DocumentsPage;
