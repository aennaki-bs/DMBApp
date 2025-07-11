import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
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

  const isAllSelected =
    documents.length > 0 && selectedDocuments.length === documents.length;
  const isIndeterminate =
    selectedDocuments.length > 0 && selectedDocuments.length < documents.length;

  const renderSortIcon = (field: string) => {
    if (sortConfig?.key !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    }
    return sortConfig.direction === "ascending" ? (
      <ArrowUp className="ml-1 h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 text-primary" />
    );
  };

  const getSortButton = (
    field: string,
    label: string,
    icon?: React.ReactNode
  ) => (
    <button
      className="h-8 px-2 -ml-2 text-xs font-medium hover:bg-accent/50 flex items-center gap-1 rounded-md transition-all duration-200 hover:shadow-sm"
      onClick={() => requestSort(field)}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {label}
      {renderSortIcon(field)}
    </button>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 border-b border-border/10">
        <Table className="table-fixed w-full min-w-[1200px]">
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="border-border/20 hover:bg-muted/30 transition-colors duration-200 documents-table-layout">
              {/* Checkbox Column */}
              <TableHead className="py-3 table-cell-center w-[50px]">
                {canManageDocuments ? (
                  <Checkbox
                    enhanced={true}
                    size="sm"
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                    className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    ref={(el) => {
                      if (el && el.querySelector) {
                        const input = el.querySelector(
                          'input[type="checkbox"]'
                        ) as HTMLInputElement;
                        if (input) input.indeterminate = isIndeterminate;
                      }
                    }}
                  />
                ) : (
                  <span className="text-xs font-medium text-muted-foreground">
                    #
                  </span>
                )}
              </TableHead>

              {/* Document Code Column */}
              <TableHead className="py-3 table-cell-start w-[160px]">
                {getSortButton(
                  "documentKey",
                  t("documents.documentCode"),
                  <Tag className="h-3.5 w-3.5" />
                )}
              </TableHead>

              {/* Title Column */}
              <TableHead className="py-3 table-cell-start w-[250px]">
                {getSortButton(
                  "title",
                  t("common.title"),
                  <FileText className="h-3.5 w-3.5" />
                )}
              </TableHead>

              {/* Status Column */}
              <TableHead className="py-3 table-cell-center w-[120px]">
                {getSortButton(
                  "status",
                  t("common.status"),
                  <AlertCircle className="h-3.5 w-3.5" />
                )}
              </TableHead>

              {/* Type Column */}
              <TableHead className="py-3 table-cell-start w-[150px]">
                {getSortButton(
                  "documentType",
                  t("common.type"),
                  <Filter className="h-3.5 w-3.5" />
                )}
              </TableHead>

              {/* Date Column */}
              <TableHead className="py-3 table-cell-center w-[140px]">
                {getSortButton(
                  "docDate",
                  t("documents.documentDate"),
                  <CalendarDays className="h-3.5 w-3.5" />
                )}
              </TableHead>

              {/* Created By Column */}
              <TableHead className="py-3 table-cell-start w-[150px]">
                {getSortButton(
                  "createdBy",
                  t("documents.createdBy"),
                  <User className="h-3.5 w-3.5" />
                )}
              </TableHead>

              {/* Actions Column */}
              <TableHead className="py-3 table-cell-center w-[100px]">
                <span className="text-xs font-medium text-muted-foreground">
                  {t("common.actions")}
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full">
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
    </div>
  );
}
