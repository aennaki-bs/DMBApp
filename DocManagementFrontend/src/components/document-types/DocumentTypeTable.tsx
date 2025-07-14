import React, { useRef, useEffect } from "react";
import { DocumentType } from "@/models/document";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DocumentTypeTableRow } from "./table/DocumentTypeTableRow";
import { Checkbox } from "@/components/ui/checkbox";

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

const DocumentTypeTable: React.FC<DocumentTypeTableProps> = ({
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
}) => {
  const allSelected = types.length > 0 && selectedTypes.length === types.length;
  const someSelected = selectedTypes.length > 0 && selectedTypes.length < types.length;
  const checkboxRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  return (
    <div className="rounded-xl border border-primary/10 overflow-hidden bg-background/50 backdrop-blur-xl shadow-lg">
      <Table>
        <TableHeader className="bg-primary/5">
          <TableRow className="border-primary/10 hover:bg-primary/10">
            <TableHead className="w-12 text-muted-foreground">
              <Checkbox
                ref={checkboxRef}
                checked={allSelected}
                onCheckedChange={onSelectAll}
                aria-label="Select all"
                className="border-primary/50"
              />
            </TableHead>
            <TableHead className="text-muted-foreground font-medium">
              <button
                onClick={() => onSort("typeName")}
                className="flex items-center hover:text-foreground transition-colors"
              >
                Type Name
                {sortField === "typeName" && (
                  <span className="ml-1 text-primary">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </button>
            </TableHead>
            <TableHead className="text-muted-foreground font-medium">Description</TableHead>
            <TableHead className="text-muted-foreground font-medium">Tier Type</TableHead>
            <TableHead className="text-muted-foreground font-medium">ERP Type</TableHead>
            <TableHead className="text-right text-muted-foreground font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {types.map((type) => (
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
      {types.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-muted-foreground mb-2">No document types found</div>
          <div className="text-sm text-muted-foreground">
            Try adjusting your search criteria or create a new document type.
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentTypeTable;
