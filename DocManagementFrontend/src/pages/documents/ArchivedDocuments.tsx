import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import documentService from "@/services/documentService";
import { FileArchive } from "lucide-react";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import ArchivedDocumentsTable from "@/components/documents/ArchivedDocumentsTable";
import ArchivedDocumentsEmptyState from "@/components/documents/ArchivedDocumentsEmptyState";
import { ArchivedDocumentsSearchBar } from "@/components/documents/ArchivedDocumentsSearchBar";
import { useArchivedDocumentsData } from "@/hooks/documents/useArchivedDocumentsData";
import { ArchivedDocumentsFilterProvider, useArchivedDocumentsFilter } from "@/hooks/documents/useArchivedDocumentsFilter";
import PaginationWithBulkActions, { BulkAction } from "@/components/shared/PaginationWithBulkActions";
import { PageLayout } from "@/components/layout/PageLayout";
import { useTranslation } from "@/hooks/useTranslation";

function ArchivedDocumentsContent() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ["archivedDocuments"],
    queryFn: () => documentService.getArchivedDocuments(),
  });

  const { filteredItems, requestSort, sortConfig, filteredCount, totalCount } = useArchivedDocumentsData(documents);
  const { isFilterActive, resetFilters } = useArchivedDocumentsFilter();

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
  });

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredCount]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Bulk actions (empty for archived documents as they're read-only)
  const bulkActions: BulkAction[] = [];

  const pageActions = [
    // No actions for archived documents as they're read-only
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-background/50 backdrop-blur-sm shadow-lg rounded-xl border border-border/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading archived documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-background/50 backdrop-blur-sm shadow-lg rounded-xl border border-border/50">
        <div className="text-center">
          <p className="text-destructive">Error loading archived documents</p>
        </div>
      </div>
    );
  }

  const mainContent = (
    <div className="h-full flex flex-col gap-6 w-full" style={{ minHeight: "100%" }}>
      {/* Search and Filter Bar */}
      <ArchivedDocumentsSearchBar hasActiveFilters={isFilterActive} />

      {/* Main Table Content */}
      <div className="flex-1 min-h-0">
        {filteredItems.length === 0 ? (
          <div className="bg-background/50 backdrop-blur-sm shadow-lg rounded-xl border border-border/50">
            <ArchivedDocumentsEmptyState
              hasFilters={isFilterActive}
              onClearFilters={resetFilters}
            />
          </div>
        ) : (
          <ArchivedDocumentsTable
            documents={paginatedDocuments}
            onSort={requestSort}
            sortConfig={sortConfig}
            selectedDocuments={bulkSelection.selectedItems}
            bulkSelection={bulkSelection}
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
      title="Archived Documents"
      subtitle={`${filteredCount} of ${totalCount} documents${isFilterActive ? ' (filtered)' : ''}`}
      icon={FileArchive}
      actions={pageActions}
    >
      {mainContent}
    </PageLayout>
  );
}

function ArchivedDocuments() {
  return (
    <ArchivedDocumentsFilterProvider>
      <ArchivedDocumentsContent />
    </ArchivedDocumentsFilterProvider>
  );
}

export default ArchivedDocuments; 