import React from "react";
import { Document } from "@/models/document";
import { Table } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { usePagination } from "@/hooks/usePagination";
import SmartPagination from "@/components/shared/SmartPagination";
import { DocumentTableHeader } from "./table/DocumentTableHeader";
import { DocumentTableBody } from "./table/DocumentTableBody";
import { DocumentTableEmpty } from "./table/DocumentTableEmpty";

interface DocumentsWorkingTableProps {
  documents: Document[] | undefined;
  selectedDocuments: number[];
  onSelectAll: (checked: boolean) => void;
  onSelectDocument: (id: number, checked: boolean) => void;
  onEditDocument: (document: Document) => void;
  onDeleteDocument: (id: number) => void;
  onAssignCircuit: (document: Document) => void;
  canManageDocuments: boolean;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function DocumentsWorkingTable({
  documents,
  selectedDocuments,
  onSelectAll,
  onSelectDocument,
  onEditDocument,
  onDeleteDocument,
  onAssignCircuit,
  canManageDocuments,
  isLoading = false,
}: DocumentsWorkingTableProps) {
  // Use pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedDocuments,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: documents || [],
    initialPageSize: 15,
  });

  // Check if we have documents to display
  const hasDocuments = documents && documents.length > 0;

  // Handle select all for paginated data
  const handleSelectAll = () => {
    const currentPageDocumentIds = paginatedDocuments.map(
      (document) => document.id
    );
    const allCurrentSelected = currentPageDocumentIds.every((id) =>
      selectedDocuments.includes(id)
    );

    onSelectAll(!allCurrentSelected);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl table-glass-container shadow-lg">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading documents...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col gap-4 w-full px-1"
      style={{ minHeight: "100%" }}
    >
      {/* Modern Document Table */}
      <div className="flex-1 relative overflow-hidden rounded-2xl table-glass-container min-h-0 shadow-xl">
        {hasDocuments ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Fixed Header with Glass Effect */}
            <div className="flex-shrink-0 overflow-x-auto table-glass-header border-b border-border/20">
              <div className="min-w-[1100px]">
                <Table className="table-fixed w-full">
                  <DocumentTableHeader
                    documents={paginatedDocuments}
                    selectedDocuments={selectedDocuments.filter((id) =>
                      paginatedDocuments.some((document) => document.id === id)
                    )}
                    onSelectAll={handleSelectAll}
                    isSimpleUser={!canManageDocuments}
                  />
                </Table>
              </div>
            </div>

            {/* Scrollable Body with Better Height Management */}
            <div
              className="flex-1 overflow-hidden"
              style={{ maxHeight: "calc(100vh - 320px)" }}
            >
              <ScrollArea className="h-full w-full">
                <div className="min-w-[1100px]">
                  <Table className="table-fixed w-full">
                    <DocumentTableBody
                      documents={paginatedDocuments}
                      selectedDocuments={selectedDocuments}
                      onSelectDocument={onSelectDocument}
                      onEdit={onEditDocument}
                      onDelete={onDeleteDocument}
                      onAssignCircuit={onAssignCircuit}
                      isSimpleUser={!canManageDocuments}
                    />
                  </Table>
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="relative h-full flex items-center justify-center z-10">
            <Table>
              <DocumentTableEmpty isFiltered={false} />
            </Table>
          </div>
        )}
      </div>

      {/* Enhanced Pagination with Glass Effect */}
      {hasDocuments && (
        <div className="flex-shrink-0 table-glass-container p-5 rounded-2xl shadow-lg backdrop-blur-md">
          <SmartPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            className="justify-center"
            pageSizeOptions={[10, 15, 25, 50, 100]}
            showFirstLast={true}
            maxVisiblePages={5}
          />
        </div>
      )}
    </div>
  );
}
