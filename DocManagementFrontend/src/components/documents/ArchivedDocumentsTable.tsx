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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface ArchivedDocumentsTableProps {
  documents: Document[];
  sortConfig?: { key: string; direction: "ascending" | "descending" } | null;
  onSort?: (key: string) => void;
  showErpStatus?: boolean; // When true, shows completed status instead of archived
}

export default function ArchivedDocumentsTable({
  documents,
  sortConfig,
  onSort,
  showErpStatus = false,
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
      className="flex items-center gap-1 cursor-pointer select-none"
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

  return (
    <div className="rounded-xl border border-blue-900/30 overflow-hidden bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
      {/* Fixed Header - Never Scrolls */}
      <div className="min-w-[1200px] border-b border-blue-900/30">
        <Table className="table-fixed w-full">
          <TableHeader className="bg-gradient-to-r from-[#1a2c6b] to-[#0a1033]">
            <TableRow className="border-blue-900/50 hover:bg-transparent">
              <TableHead className="w-[50px] text-blue-300 font-medium">
                #
              </TableHead>
              <TableHead className="w-[160px] text-blue-300 font-medium">
                {renderSortableHeader(
                  "Document Code",
                  "documentKey",
                  <Tag className="h-4 w-4 text-blue-400" />
                )}
              </TableHead>
              <TableHead className="w-[250px] text-blue-300 font-medium">
                {renderSortableHeader(
                  "Title",
                  "title",
                  <FileText className="h-4 w-4 text-blue-400" />
                )}
              </TableHead>
              <TableHead className="w-[150px] text-blue-300 font-medium">
                {renderSortableHeader(
                  "Type",
                  "documentType",
                  <Filter className="h-4 w-4 text-blue-400" />
                )}
              </TableHead>
              <TableHead className="w-[140px] text-blue-300 font-medium">
                {renderSortableHeader(
                  "Document Date",
                  "docDate",
                  <CalendarDays className="h-4 w-4 text-blue-400" />
                )}
              </TableHead>
              <TableHead className="w-[150px] text-blue-300 font-medium">
                {renderSortableHeader(
                  "Created By",
                  "createdBy",
                  <User className="h-4 w-4 text-blue-400" />
                )}
              </TableHead>
              <TableHead className="w-[140px] text-blue-300 font-medium">
                ERP Code
              </TableHead>
              <TableHead className="w-[100px] text-right text-blue-300 font-medium">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      </div>

      {/* Scrollable Body - Only Content Scrolls */}
      <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
        <div className="min-w-[1200px]">
          <Table className="table-fixed w-full">
            <TableBody>
              {documents.map((document, index) => (
                <motion.tr
                  key={document.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="border-blue-900/30 hover:bg-blue-900/20 transition-all duration-200"
                >
                  <TableCell className="w-[50px] py-3">
                    <span className="text-sm text-gray-500">{index + 1}</span>
                  </TableCell>
                  
                  <TableCell className="w-[160px] font-mono text-sm py-3">
                    <Link
                      to={`/documents/${document.id}?from=${showErpStatus ? 'completed' : 'archived'}`}
                      className="text-blue-300 hover:text-blue-200 hover:underline transition-colors flex items-center gap-1"
                      onClick={() => sessionStorage.setItem('documentContext', showErpStatus ? 'completed' : 'archived')}
                    >
                      <FileText className="h-3.5 w-3.5 opacity-70" />
                      {document.documentKey}
                    </Link>
                  </TableCell>
                  
                  <TableCell className="w-[250px] py-3">
                    <Link
                      to={`/documents/${document.id}?from=${showErpStatus ? 'completed' : 'archived'}`}
                      className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
                      onClick={() => sessionStorage.setItem('documentContext', showErpStatus ? 'completed' : 'archived')}
                    >
                      {document.title}
                    </Link>
                  </TableCell>
                  
                  <TableCell className="w-[150px] text-blue-100 py-3">
                    {document.documentType?.typeName || 'N/A'}
                  </TableCell>
                  
                  <TableCell className="w-[140px] text-blue-100/70 text-sm py-3">
                    {formatDate(document.docDate)}
                  </TableCell>
                  
                  <TableCell className="w-[150px] text-blue-100/70 text-sm py-3">
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
                      <span className="text-blue-100/50 text-sm">N/A</span>
                    )}
                  </TableCell>
                  
                  <TableCell className="w-[100px] text-right py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Badge 
                        variant="outline" 
                        className={showErpStatus 
                          ? "bg-amber-50 text-amber-700 border-amber-200 text-xs" 
                          : "bg-orange-50 text-orange-700 border-orange-200 text-xs"
                        }
                      >
                        {showErpStatus ? (
                          <>
                            <FileCheck className="h-3 w-3 mr-1" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Archive className="h-3 w-3 mr-1" />
                            Archived
                          </>
                        )}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0 rounded-full hover:bg-blue-800/30 transition-colors"
                      >
                        <Link 
                          to={`/documents/${document.id}?from=${showErpStatus ? 'completed' : 'archived'}`}
                          onClick={() => sessionStorage.setItem('documentContext', showErpStatus ? 'completed' : 'archived')}
                        >
                          <ExternalLink className="h-4 w-4 text-blue-400" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
} 