import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import documentService from "@/services/documentService";
import { AlertTriangle, FileCheck } from "lucide-react";
import ArchivedDocumentsTable from "@/components/documents/ArchivedDocumentsTable";
import CompletedDocumentsEmptyState from "@/components/documents/CompletedDocumentsEmptyState";
import { ArchivedDocumentsSearchBar } from "@/components/documents/ArchivedDocumentsSearchBar";
import { useArchivedDocumentsData } from "@/hooks/documents/useArchivedDocumentsData";
import { ArchivedDocumentsFilterProvider, useArchivedDocumentsFilter } from "@/hooks/documents/useArchivedDocumentsFilter";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ITEMS_PER_PAGE = 10;

function CompletedNotArchivedDocumentsContent() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ["completedNotArchivedDocuments"],
    queryFn: () => documentService.getCompletedNotArchivedDocuments(),
  });

  const { filteredItems, requestSort, sortConfig, filteredCount, totalCount } = useArchivedDocumentsData(documents);
  const { isFilterActive, resetFilters } = useArchivedDocumentsFilter();

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageDocuments = filteredItems.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredCount]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading completed documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600">Error loading completed documents</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileCheck className="h-6 w-6 text-amber-600" />
          <h1 className="text-2xl font-bold">Completed Documents</h1>
          <span className="text-sm text-gray-900">(Pending ERP Archive)</span>
        </div>
        <div className="text-sm text-gray-500">
          {filteredCount} of {totalCount} documents
          {isFilterActive && (
            <span className="ml-2 text-amber-600 font-medium">(filtered)</span>
          )}
        </div>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-900/30 bg-blue-900/20">
        {/* <AlertTriangle className="h-4 w-4 text-amber-600" /> */}
        <AlertDescription className="text-sm font-medium">
          These documents have completed their workflow circuit but are not yet archived to the ERP system. 
          ERP archival may be in progress or may have failed and requires manual intervention.
        </AlertDescription>
      </Alert>

      {/* Search and Filter Bar */}
      <ArchivedDocumentsSearchBar hasActiveFilters={isFilterActive} />

      {/* Table or Empty State */}
      {filteredItems.length === 0 ? (
        <div className="rounded-xl border border-blue-900/30 overflow-hidden bg-gradient-to-b from-[#1a2c6b]/80 to-[#0a1033]/80">
          <CompletedDocumentsEmptyState
            hasFilters={isFilterActive}
            onClearFilters={resetFilters}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-blue-900/100 overflow-hidden bg-gradient-to-b from-[#1a2c6b]/80 to-[#0a1033]/80">
          <ArchivedDocumentsTable
            documents={currentPageDocuments}
            onSort={requestSort}
            sortConfig={sortConfig}
            showErpStatus={true}
          />
        </div>
      )}

      {/* Pagination */}
      {filteredItems.length > 0 && totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

function CompletedNotArchivedDocuments() {
  return (
    <ArchivedDocumentsFilterProvider>
      <CompletedNotArchivedDocumentsContent />
    </ArchivedDocumentsFilterProvider>
  );
}

export default CompletedNotArchivedDocuments; 