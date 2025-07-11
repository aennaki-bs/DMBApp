import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { DocumentType } from "@/models/document";
import { DocumentTypeTableHeader } from "./table/DocumentTypeTableHeader";
import { DocumentTypeTableRow } from "./table/DocumentTypeTableRow";
import { AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

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
    types.filter((type) => (type.documentCounter || 0) === 0).length > 0 &&
    types
      .filter((type) => (type.documentCounter || 0) === 0)
      .every((type) => selectedTypes.includes(type.id!));
  const hasEligibleTypes = types.some((t) => (t.documentCounter || 0) === 0);

  // Handle select all for current page
  const handleSelectAll = (checked: boolean) => {
    onSelectAll(checked);
  };

  return (
    <Card className="border-primary/10 bg-gradient-to-b from-background/95 to-primary/5 backdrop-blur-sm overflow-hidden">
      <ScrollArea className="h-[calc(100vh-400px)] min-h-[500px]">
        <div className="min-w-[1000px]">
          <Table className="table-fixed w-full">
            <DocumentTypeTableHeader
              onSelectAll={handleSelectAll}
              areAllEligibleSelected={areAllEligibleSelected}
              hasEligibleTypes={hasEligibleTypes}
              onSort={onSort}
              sortField={sortField}
              sortDirection={sortDirection}
            />
            <TableBody>
              {types.length === 0 ? (
                <TableRow className="border-primary/10 hover:bg-primary/5 transition-colors">
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <AlertTriangle className="h-12 w-12 text-primary/40 mb-4" />
                      <p className="text-lg font-medium mb-2">
                        No document types found
                      </p>
                      {searchQuery && (
                        <p className="text-sm text-muted-foreground">
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
    </Card>
  );
};

export default DocumentTypeTable;
