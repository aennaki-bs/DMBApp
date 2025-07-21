import {
  ArrowUpDown,
  Tag,
  FileText,
  Filter,
  CalendarDays,
  User,
  Archive,
  ExternalLink,
  FileCheck,
} from "lucide-react";
import { Document } from "@/models/document";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";

interface BulkSelectionType {
  selectedItems: any[];
  selectedCount: number;
  toggleItem: (item: Document) => void;
  toggleSelectCurrentPage: () => void;
  isSelected: (item: Document) => boolean;
}

interface ArchivedDocumentsTableProps {
  documents: Document[];
  sortConfig?: { key: string; direction: "ascending" | "descending" } | null;
  onSort?: (key: string) => void;
  showErpStatus?: boolean; // When true, shows completed status instead of archived
  selectedDocuments?: any[];
  bulkSelection?: BulkSelectionType;
  page?: number;
  pageSize?: number;
}

export default function ArchivedDocumentsTable({
  documents,
  sortConfig,
  onSort,
  showErpStatus = false,
  selectedDocuments = [],
  bulkSelection,
  page = 1,
  pageSize = 25,
}: ArchivedDocumentsTableProps) {
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
      onClick={() => onSort?.(key)}
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleSelectDocument = (documentId: number) => {
    const document = documents.find(d => d.id === documentId);
    if (document && bulkSelection) {
      bulkSelection.toggleItem(document);
    }
  };

  const handleSelectAll = () => {
    if (bulkSelection) {
      bulkSelection.toggleSelectCurrentPage();
    }
  };

  return (
    <div className="rounded-xl border border-primary/10 overflow-hidden bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-lg">
      {/* Fixed Header - Never Scrolls */}
      <div className="min-w-[1200px] border-b border-primary/10">
        <Table className="table-fixed w-full">
          <TableHeader className="bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
            <TableRow className="border-primary/10 hover:bg-transparent">
              <TableHead className="w-[50px] text-foreground font-medium">
                {bulkSelection ? (
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
                  "Created By",
                  "createdBy",
                  <User className="h-4 w-4 text-primary" />
                )}
              </TableHead>
              <TableHead className="w-[140px] text-foreground font-medium">
                ERP Code
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      </div>

      {/* Table Body - Shows all items on current page */}
      <div className="min-w-[1200px]">
        <Table className="table-fixed w-full">
          <TableBody>
            {documents.map((document, index) => (
              <TableRow
                key={document.id}
                className={`border-primary/10 hover:bg-primary/5 transition-all duration-200 ${selectedDocuments.includes(document.id) ? "bg-primary/10 border-l-4 border-l-primary" : ""
                  }`}
              >
                <TableCell className="w-[50px] py-3">
                  {bulkSelection ? (
                    <ProfessionalCheckbox
                      checked={selectedDocuments.includes(document.id)}
                      onCheckedChange={() => handleSelectDocument(document.id)}
                      size="md"
                      variant="row"
                      className="shadow-sm"
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">{index + 1}</span>
                  )}
                </TableCell>

                <TableCell className="w-[160px] font-mono text-sm py-3">
                  <Link
                    to={`/documents/${document.id}?from=${showErpStatus ? 'completed' : 'archived'}`}
                    className="text-primary hover:text-primary/80 hover:underline transition-colors flex items-center gap-1"
                    onClick={() => sessionStorage.setItem('documentContext', showErpStatus ? 'completed' : 'archived')}
                  >
                    <FileText className="h-3.5 w-3.5 opacity-70" />
                    {document.documentKey}
                  </Link>
                </TableCell>

                <TableCell className="w-[250px] py-3">
                  <Link
                    to={`/documents/${document.id}?from=${showErpStatus ? 'completed' : 'archived'}`}
                    className="text-foreground hover:text-primary font-medium hover:underline transition-colors"
                    onClick={() => sessionStorage.setItem('documentContext', showErpStatus ? 'completed' : 'archived')}
                  >
                    {document.title}
                  </Link>
                </TableCell>

                <TableCell className="w-[150px] text-foreground py-3">
                  {document.documentType?.typeName || 'N/A'}
                </TableCell>

                <TableCell className="w-[140px] text-muted-foreground text-sm py-3">
                  {formatDate(document.docDate)}
                </TableCell>

                <TableCell className="w-[150px] text-muted-foreground text-sm py-3">
                  {document.createdBy?.username || 'N/A'}
                </TableCell>

                <TableCell className="w-[140px] py-3">
                  {document.erpDocumentCode ? (
                    <Badge variant="secondary" className="font-mono bg-orange-100 text-orange-800">
                      {document.erpDocumentCode}
                    </Badge>
                  ) : showErpStatus ? (
                    <Badge variant="destructive" className="text-xs">
                      Pending
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">N/A</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 