import { useState, useEffect } from "react";
import { useDocumentsData } from "./hooks/useDocumentsData";
import DocumentsHeader from "./components/DocumentsHeader";
import DocumentsTable from "./components/DocumentsTable";
import DocumentsEmptyState from "./components/DocumentsEmptyState";
import DocumentsFilterBar from "./components/DocumentsFilterBar";
import SelectedDocumentsBar from "./components/SelectedDocumentsBar";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import { Document } from "@/models/document";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import AssignCircuitDialog from "@/components/circuits/AssignCircuitDialog";
import { useAuth } from "@/context/AuthContext";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const DocumentsPage = () => {
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

  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [assignCircuitDialogOpen, setAssignCircuitDialogOpen] = useState(false);
  const [documentToAssign, setDocumentToAssign] = useState<Document | null>(
    null
  );

  useEffect(() => {
    setTotalPages(Math.ceil(filteredItems.length / pageSize));
    setPage(1); // Reset to first page when filters change
  }, [filteredItems, pageSize]);

  const getPageDocuments = () => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredItems.slice(start, end);
  };

  const handleSelectDocument = (id: number) => {
    if (!canManageDocuments) {
      toast.error("You do not have permission to select documents");
      return;
    }

    setSelectedDocuments((prev) => {
      if (prev.includes(id)) {
        return prev.filter((docId) => docId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (!canManageDocuments) {
      toast.error("You do not have permission to select documents");
      return;
    }

    if (selectedDocuments.length === getPageDocuments().length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(getPageDocuments().map((doc) => doc.id));
    }
  };

  const openDeleteDialog = (id?: number) => {
    if (!canManageDocuments) {
      toast.error("You do not have permission to delete documents");
      return;
    }

    if (id) {
      setDocumentToDelete(id);
    } else if (selectedDocuments.length > 0) {
      setDocumentToDelete(null);
    } else {
      return;
    }
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (documentToDelete) {
        await deleteDocument(documentToDelete);
        toast.success(
          "Document deleted successfully" + (useFakeData ? " (simulated)" : "")
        );
      } else if (selectedDocuments.length > 0) {
        await deleteMultipleDocuments(selectedDocuments);
        toast.success(
          `${selectedDocuments.length} documents deleted successfully` +
            (useFakeData ? " (simulated)" : "")
        );
        setSelectedDocuments([]);
      }
    } catch (error) {
      console.error("Failed to delete document(s):", error);
      toast.error("Failed to delete document(s)");
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const openAssignCircuitDialog = (document: Document) => {
    if (!canManageDocuments) {
      toast.error("You do not have permission to assign documents to circuits");
      return;
    }

    setDocumentToAssign(document);
    setAssignCircuitDialogOpen(true);
  };

  const handleAssignCircuitSuccess = () => {
    toast.success("Document assigned to circuit successfully");
    if (!useFakeData) {
      fetchDocuments();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <DocumentsHeader
        useFakeData={useFakeData}
        fetchDocuments={fetchDocuments}
        canManageDocuments={canManageDocuments}
        selectedDocuments={selectedDocuments}
        openDeleteDialog={openDeleteDialog}
        openAssignCircuitDialog={(documentId) => {
          const selectedDoc = documents.find((doc) => doc.id === documentId);
          if (selectedDoc) {
            openAssignCircuitDialog(selectedDoc);
          }
        }}
      />

      <Card className="border-blue-900/30 bg-[#0a1033]/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardHeader className="p-4 border-b border-blue-900/30">
          <DocumentsFilterBar />
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              <div className="h-10 bg-blue-900/20 rounded animate-pulse"></div>
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="h-16 bg-blue-900/10 rounded animate-pulse"
                ></div>
              ))}
            </div>
          ) : getPageDocuments().length > 0 ? (
            <div className="overflow-x-auto">
              <DocumentsTable
                documents={getPageDocuments()}
                selectedDocuments={selectedDocuments}
                canManageDocuments={canManageDocuments}
                handleSelectDocument={handleSelectDocument}
                handleSelectAll={handleSelectAll}
                openDeleteDialog={openDeleteDialog}
                openAssignCircuitDialog={openAssignCircuitDialog}
                page={page}
                pageSize={pageSize}
                sortConfig={sortConfig}
                requestSort={requestSort}
              />
            </div>
          ) : (
            <DocumentsEmptyState
              canManageDocuments={canManageDocuments}
              onDocumentCreated={fetchDocuments}
            />
          )}

          {totalPages > 1 && filteredItems.length > 0 && (
            <div className="p-4 border-t border-blue-900/30">
              <Pagination className="justify-center">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={
                        page === 1
                          ? "pointer-events-none opacity-50"
                          : "hover:bg-blue-800/30"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = page;
                    if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    if (pageNum > 0 && pageNum <= totalPages) {
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => setPage(pageNum)}
                            isActive={page === pageNum}
                            className={
                              page === pageNum
                                ? "bg-blue-600"
                                : "hover:bg-blue-800/30"
                            }
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      className={
                        page === totalPages
                          ? "pointer-events-none opacity-50"
                          : "hover:bg-blue-800/30"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedDocuments.length > 0 && (
        <SelectedDocumentsBar
          selectedCount={selectedDocuments.length}
          openDeleteDialog={openDeleteDialog}
          openAssignCircuitDialog={() => {
            if (selectedDocuments.length === 1) {
              const selectedDoc = documents.find(
                (doc) => doc.id === selectedDocuments[0]
              );
              if (selectedDoc) {
                openAssignCircuitDialog(selectedDoc);
              }
            }
          }}
          showAssignCircuit={selectedDocuments.length === 1}
        />
      )}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isSingleDocument={documentToDelete !== null}
        count={selectedDocuments.length}
      />

      {documentToAssign && (
        <AssignCircuitDialog
          documentId={documentToAssign.id}
          documentTitle={documentToAssign.title}
          open={assignCircuitDialogOpen}
          onOpenChange={setAssignCircuitDialogOpen}
          onSuccess={handleAssignCircuitSuccess}
        />
      )}
    </div>
  );
};

export default DocumentsPage;
