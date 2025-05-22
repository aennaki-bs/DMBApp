import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { DocumentType } from "@/models/document";
import { DocumentTypeTableHeader } from "./table/DocumentTypeTableHeader";
import { DocumentTypeTableRow } from "./table/DocumentTypeTableRow";
import { AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const areAllEligibleSelected =
    types.length > 0 &&
    types.filter((type) => type.documentCounter === 0).length ===
      selectedTypes.length;
  const hasEligibleTypes = types.some((t) => t.documentCounter === 0);

  return (
    <div className="rounded-xl border border-blue-900/30 overflow-hidden bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
      <ScrollArea className="h-[calc(100vh-280px)] min-h-[400px]">
        <div className="min-w-[800px]">
          <Table>
            <DocumentTypeTableHeader
              onSelectAll={onSelectAll}
              areAllEligibleSelected={areAllEligibleSelected}
              hasEligibleTypes={hasEligibleTypes}
              onSort={onSort}
              sortField={sortField}
              sortDirection={sortDirection}
            />
            <TableBody>
              {types.length === 0 ? (
                <TableRow className="border-blue-900/20 hover:bg-blue-900/20">
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-blue-300">
                      <AlertTriangle className="h-8 w-8 text-blue-400 mb-2" />
                      <p className="text-sm">No document types found</p>
                      {searchQuery && (
                        <p className="text-xs text-blue-400 mt-1">
                          Try adjusting your search or filters
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                types.map((type) => (
                  <DocumentTypeTableRow
                    key={type.id}
                    type={type}
                    isSelected={selectedTypes.includes(type.id!)}
                    onSelectType={onSelectType}
                    onDeleteType={onDeleteType}
                    onEditType={onEditType}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
};

export default DocumentTypeTable;
