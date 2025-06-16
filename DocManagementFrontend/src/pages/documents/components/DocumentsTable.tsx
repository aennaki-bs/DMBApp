import {
  ArrowUpDown,
  Tag,
  FileText,
  Filter,
  CalendarDays,
  User,
  AlertCircle,
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
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t } = useTranslation();
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
      className="flex items-center gap-1 cursor-pointer select-none group"
      onClick={() => requestSort(key)}
    >
      <span className="table-glass-header-icon group-hover:opacity-80 transition-opacity">
        {icon}
      </span>
      <span className="table-glass-header-text group-hover:opacity-80 transition-opacity">
        {label}
      </span>
      <div className="ml-1 w-4 text-center">
        {getSortIndicator(key) ? (
          <span className="table-glass-sort-active">
            {getSortIndicator(key)}
          </span>
        ) : (
          <ArrowUpDown className="h-3 w-3 table-glass-sort-inactive group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </div>
  );

  return (
    <div className="table-glass-container">
      {/* Fixed Header - Never Scrolls */}
      <div className="min-w-[1200px] table-glass-header-border">
        <Table className="table-fixed w-full">
          <TableHeader className="table-glass-header">
            <TableRow className="table-glass-header-row">
              <TableHead className="w-[50px] table-glass-header-cell">
                {canManageDocuments ? (
                  <Checkbox
                    checked={
                      selectedDocuments.length === documents.length &&
                      documents.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                    className="table-glass-checkbox"
                  />
                ) : (
                  <span>#</span>
                )}
              </TableHead>
              <TableHead className="w-[160px] table-glass-header-cell">
                {renderSortableHeader(
                  t("documents.documentCode"),
                  "documentKey",
                  <Tag className="h-4 w-4" />
                )}
              </TableHead>
              <TableHead className="w-[250px] table-glass-header-cell">
                {renderSortableHeader(
                  t("common.title"),
                  "title",
                  <FileText className="h-4 w-4" />
                )}
              </TableHead>
              <TableHead className="w-[120px] table-glass-header-cell">
                {renderSortableHeader(
                  t("common.status"),
                  "status",
                  <AlertCircle className="h-4 w-4" />
                )}
              </TableHead>
              <TableHead className="w-[150px] table-glass-header-cell">
                {renderSortableHeader(
                  t("common.type"),
                  "documentType",
                  <Filter className="h-4 w-4" />
                )}
              </TableHead>
              <TableHead className="w-[140px] table-glass-header-cell">
                {renderSortableHeader(
                  t("documents.documentDate"),
                  "docDate",
                  <CalendarDays className="h-4 w-4" />
                )}
              </TableHead>
              <TableHead className="w-[150px] table-glass-header-cell">
                {renderSortableHeader(
                  t("documents.createdBy"),
                  "createdBy",
                  <User className="h-4 w-4" />
                )}
              </TableHead>
              <TableHead className="w-[100px] text-right table-glass-header-cell">
                {t("common.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      </div>

      {/* Scrollable Body - Only Content Scrolls */}
      <ScrollArea className="h-[calc(100vh-380px)] min-h-[300px]">
        <div className="min-w-[1200px]">
          <Table className="table-fixed w-full">
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
        </div>
      </ScrollArea>
    </div>
  );
}
