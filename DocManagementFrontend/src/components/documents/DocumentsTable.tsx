import {
  ArrowUpDown,
  Tag,
  FileText,
  Filter,
  CalendarDays,
  Building2,
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
import { cn } from "@/lib/utils";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";

interface DocumentsTableProps {
  documents: Document[];
  selectedDocuments: number[];
  canManageDocuments: boolean;
  handleSelectDocument: (id: number) => void;
  handleSelectAll: () => void;
  openDeleteDialog: (id: number) => void;
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
      className="flex items-center gap-1 cursor-pointer select-none hover:text-primary transition-colors duration-200"
      onClick={() => requestSort(key)}
    >
      {icon}
      <span className="ml-1">{label}</span>
      <div className="ml-1 w-4 text-center">
        {getSortIndicator(key) || (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border border-primary/10 overflow-hidden bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-lg">
      {/* Fixed Header - Never Scrolls */}
      <div className="min-w-[1100px] border-b border-primary/10">
        <Table className="table-fixed w-full table-compact">
          <TableHeader className="bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
            <TableRow className="border-primary/10 hover:bg-transparent">
              <TableHead className="w-[50px] text-foreground font-medium">
                {canManageDocuments ? (
                  <ProfessionalCheckbox
                    checked={
                      selectedDocuments.length === documents.length &&
                      documents.length > 0
                    }
                    indeterminate={
                      selectedDocuments.length > 0 &&
                      selectedDocuments.length < documents.length
                    }
                    onCheckedChange={handleSelectAll}
                    size="md"
                    variant="header"
                    className="shadow-lg"
                  />
                ) : (
                  <span>#</span>
                )}
              </TableHead>
              <TableHead className="w-[160px] text-foreground font-medium">
                {renderSortableHeader(
                  "Document Code",
                  "documentKey",
                  <Tag className="h-4 w-4 text-primary" />
                )}
              </TableHead>
              <TableHead className="w-[250px] text-foreground font-medium">
                {renderSortableHeader(
                  "Title",
                  "title",
                  <FileText className="h-4 w-4 text-primary" />
                )}
              </TableHead>
              <TableHead className="w-[150px] text-foreground font-medium">
                {renderSortableHeader(
                  "Type",
                  "documentType",
                  <Filter className="h-4 w-4 text-primary" />
                )}
              </TableHead>
              <TableHead className="w-[140px] text-foreground font-medium">
                {renderSortableHeader(
                  "Document Date",
                  "docDate",
                  <CalendarDays className="h-4 w-4 text-primary" />
                )}
              </TableHead>
              <TableHead className="w-[150px] text-foreground font-medium">
                {renderSortableHeader(
                  "Responsibility Center",
                  "responsibilityCentre.code",
                  <Building2 className="h-4 w-4 text-primary" />
                )}
              </TableHead>
              <TableHead className="w-[100px] text-right text-foreground font-medium">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      </div>

      {/* Table Body - Shows all items on current page */}
      <div className="min-w-[1100px]">
        <Table className="table-fixed w-full table-compact">
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
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
