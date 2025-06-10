import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { DocumentType } from "@/models/document";
import { DocumentTypeTableHeader } from "./table/DocumentTypeTableHeader";
import { DocumentTypeTableRow } from "./table/DocumentTypeTableRow";
import { AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";

interface DocumentTypeTableProps {
  types: DocumentType[];
  selectedTypes: number[];
  onSelectType: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteType: (id: number) => void;
  onEditType: (type: DocumentType) => void;
  onSort: (field: string) => void;
  sortField: string | null;
  sortDirection: "asc" | "desc";
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const DocumentTypeTable = ({
  types,
  selectedTypes,
  onSelectType,
  onSelectAll,
  onDeleteType,
  onEditType,
  onSort,
  sortField,
  sortDirection,
  searchQuery,
  onSearchChange,
}: DocumentTypeTableProps) => {
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
    data: types,
    initialPageSize: 25,
  });

  const areAllEligibleSelected =
    paginatedTypes.length > 0 &&
    paginatedTypes.filter((type) => type.documentCounter === 0).length ===
      selectedTypes.filter((id) =>
        paginatedTypes.some((type) => type.id === id)
      ).length;
  const hasEligibleTypes = paginatedTypes.some((t) => t.documentCounter === 0);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-900/30 overflow-hidden bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
        {types.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-blue-300">
              <AlertTriangle className="h-8 w-8 text-blue-400 mb-2" />
              <p className="text-sm">No document types found</p>
              {searchQuery && (
                <p className="text-xs text-blue-400 mt-1">
                  Try adjusting your search or filters
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Fixed Header - Never Scrolls */}
            <div className="min-w-[900px] border-b border-blue-900/30">
              <Table className="table-fixed w-full">
                <DocumentTypeTableHeader
                  onSelectAll={onSelectAll}
                  areAllEligibleSelected={areAllEligibleSelected}
                  hasEligibleTypes={hasEligibleTypes}
                  onSort={onSort}
                  sortField={sortField}
                  sortDirection={sortDirection}
                />
              </Table>
            </div>

            {/* Scrollable Body - Only Content Scrolls */}
            <ScrollArea className="h-[calc(100vh-380px)] min-h-[300px]">
              <div className="min-w-[900px]">
                <Table className="table-fixed w-full">
                  <TableBody>
                    {paginatedTypes.map((type) => (
                      <DocumentTypeTableRow
                        key={type.id}
                        type={type}
                        isSelected={selectedTypes.includes(type.id!)}
                        onSelectType={onSelectType}
                        onDeleteType={onDeleteType}
                        onEditType={onEditType}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </>
        )}
      </div>

      {/* Smart Pagination */}
      {types.length > 0 && (
        <SmartPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
};

export default DocumentTypeTable;
