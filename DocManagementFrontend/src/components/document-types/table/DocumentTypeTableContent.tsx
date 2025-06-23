import { DocumentType } from "@/models/document";
import { Table } from "@/components/ui/table";
import { DocumentTypeTableHeader } from "./content/DocumentTypeTableHeader";
import { DocumentTypeTableBody } from "./content/DocumentTypeTableBody";
import { DocumentTypeTableEmpty } from "./DocumentTypeTableEmpty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";

interface DocumentTypeTableContentProps {
  types: DocumentType[] | undefined;
  selectedTypes: number[];
  onSelectAll: () => void;
  onSelectType: (typeId: number) => void;
  onEdit: (type: DocumentType) => void;
  onDelete: (type: DocumentType) => void;
  sortBy: string;
  sortDirection: string;
  onSort: (field: string) => void;
  onClearFilters?: () => void;
  isLoading?: boolean;
  isError?: boolean;
}

export function DocumentTypeTableContent({
  types,
  selectedTypes,
  onSelectAll,
  onSelectType,
  onEdit,
  onDelete,
  sortBy,
  sortDirection,
  onSort,
  onClearFilters,
  isLoading = false,
  isError = false,
}: DocumentTypeTableContentProps) {
  // Use pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedTypes,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: types || [],
    initialPageSize: 15,
  });

  // Check if we have types to display
  const hasTypes = types && types.length > 0;

  // Handle select all for paginated data
  const handleSelectAll = () => {
    const currentPageTypeIds = paginatedTypes.map((type) => type.id!);
    const allCurrentSelected = currentPageTypeIds.every((id) =>
      selectedTypes.includes(id)
    );

    if (allCurrentSelected) {
      // Deselect all types on current page
      currentPageTypeIds.forEach((typeId) => {
        if (selectedTypes.includes(typeId)) {
          onSelectType(typeId);
        }
      });
    } else {
      // Select all types on current page only
      currentPageTypeIds.forEach((typeId) => {
        if (!selectedTypes.includes(typeId)) {
          onSelectType(typeId);
        }
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl table-glass-loading shadow-lg">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin table-glass-loading-spinner" />
              <p className="table-glass-loading-text">
                Loading document types...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl table-glass-error shadow-lg">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 rounded-full table-glass-error-icon flex items-center justify-center">
                <span className="font-bold">!</span>
              </div>
              <p className="table-glass-error-text">
                Failed to load document types. Please try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-full flex flex-col gap-4 w-full px-1`}
      style={{ minHeight: "100%" }}
    >
      {/* Modern Document Type Table */}
      <div className="flex-1 relative overflow-hidden rounded-2xl table-glass-container min-h-0 shadow-xl">
        {hasTypes ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Fixed Header with Glass Effect */}
            <div className="flex-shrink-0 overflow-x-auto table-glass-header border-b border-border/20">
              <div className="min-w-[1100px]">
                <Table className="table-fixed w-full">
                  <DocumentTypeTableHeader
                    types={paginatedTypes}
                    selectedTypes={selectedTypes.filter((id) =>
                      paginatedTypes.some((type) => type.id === id)
                    )}
                    onSelectAll={handleSelectAll}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={onSort}
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
                    <DocumentTypeTableBody
                      types={paginatedTypes}
                      selectedTypes={selectedTypes}
                      onSelectType={onSelectType}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </Table>
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="relative h-full flex items-center justify-center z-10">
            <DocumentTypeTableEmpty onClearFilters={onClearFilters} />
          </div>
        )}
      </div>

      {/* Enhanced Pagination with Glass Effect */}
      {hasTypes && (
        <div className="flex-shrink-0 table-glass-pagination p-4 rounded-2xl shadow-lg backdrop-blur-md">
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
