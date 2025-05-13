import {
  ArrowUpDown,
  Tag,
  FileText,
  Filter,
  CalendarDays,
  User,
} from "lucide-react";
import { Document } from "@/models/document";
import DocumentsTableRow from "./DocumentsTableRow";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DocumentsTableProps {
  documents: Document[];
  selectedDocuments: number[];
  canManageDocuments: boolean;
  handleSelectDocument: (id: number) => void;
  handleSelectAll: () => void;
  openDeleteDialog: (id: number) => void;
  openAssignCircuitDialog: (document: Document) => void;
  page: number;
  pageSize: number;
  sortConfig: { key: string; direction: "ascending" | "descending" } | null;
  requestSort: (key: string) => void;
}

export default function DocumentsTable({
  documents,
  selectedDocuments,
  canManageDocuments,
  handleSelectDocument,
  handleSelectAll,
  openDeleteDialog,
  openAssignCircuitDialog,
  page,
  pageSize,
  sortConfig,
  requestSort,
}: DocumentsTableProps) {
  const getSortIndicator = (columnKey: string) => {
    if (sortConfig && sortConfig.key === columnKey) {
      return sortConfig.direction === "ascending" ? "↑" : "↓";
    }
    return null;
  };

  const renderSortableHeader = (
    label: string,
    key: string,
    icon: React.ReactNode
  ) => (
    <div
      className="flex items-center gap-1 cursor-pointer select-none"
      onClick={() => requestSort(key)}
    >
      {icon}
      {label}
      <div className="ml-1 w-4 text-center">
        {getSortIndicator(key) || (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </div>
    </div>
  );

  return (
    <Table>
      <TableHeader className="bg-blue-900/20">
        <TableRow className="border-blue-900/50 hover:bg-blue-900/30">
          <TableHead className="w-12 text-blue-300">
            {canManageDocuments ? (
              <Checkbox
                checked={
                  selectedDocuments.length === documents.length &&
                  documents.length > 0
                }
                onCheckedChange={handleSelectAll}
                className="border-blue-500/50"
              />
            ) : (
              <span>#</span>
            )}
          </TableHead>
          <TableHead className="text-blue-300 w-52">
            {renderSortableHeader(
              "Document Code",
              "documentKey",
              <Tag className="h-4 w-4" />
            )}
          </TableHead>
          <TableHead className="text-blue-300">
            {renderSortableHeader(
              "Title",
              "title",
              <FileText className="h-4 w-4" />
            )}
          </TableHead>
          <TableHead className="text-blue-300">
            {renderSortableHeader(
              "Type",
              "documentType",
              <Filter className="h-4 w-4" />
            )}
          </TableHead>
          <TableHead className="text-blue-300">
            {renderSortableHeader(
              "Document Date",
              "docDate",
              <CalendarDays className="h-4 w-4" />
            )}
          </TableHead>
          <TableHead className="text-blue-300">
            {renderSortableHeader(
              "Created By",
              "createdBy",
              <User className="h-4 w-4" />
            )}
          </TableHead>
          <TableHead className="w-24 text-right text-blue-300">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((document, index) => (
          <DocumentsTableRow
            key={document.id}
            document={document}
            index={index + (page - 1) * pageSize}
            isSelected={selectedDocuments.includes(document.id)}
            canManageDocuments={canManageDocuments}
            onSelect={() => handleSelectDocument(document.id)}
            onDelete={() => openDeleteDialog(document.id)}
            onAssignCircuit={() => openAssignCircuitDialog(document)}
          />
        ))}
      </TableBody>
    </Table>
  );
}
