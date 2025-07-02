import React from "react";
import { Document } from "@/models/document";
import { Table } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, FileText } from "lucide-react";
import { DocumentTableHeader } from "./table/DocumentTableHeader";
import { DocumentTableBody } from "./table/DocumentTableBody";
import { DocumentTableEmpty } from "./table/DocumentTableEmpty";
import { useTheme } from "@/context/ThemeContext";

interface DocumentsWorkingTableProps {
  documents: Document[] | undefined;
  selectedDocuments: number[];
  onSelectAll: (checked: boolean) => void;
  onSelectDocument: (id: number, checked: boolean) => void;
  onEditDocument: (document: Document) => void;
  onDeleteDocument: (id: number) => void;
  onAssignCircuit: (document: Document) => void;
  canManageDocuments: boolean;
}

export function DocumentsWorkingTable({
  documents,
  selectedDocuments,
  onSelectAll,
  onSelectDocument,
  onEditDocument,
  onDeleteDocument,
  onAssignCircuit,
  canManageDocuments,
}: DocumentsWorkingTableProps) {
  const { theme } = useTheme();

  // Check if we have documents to display
  const hasDocuments = documents && documents.length > 0;

  // Handle select all for current documents
  const handleSelectAll = (checked: boolean) => {
    onSelectAll(checked);
  };

  // Get theme-specific colors for styling
  const getThemeColors = () => {
    const themeVariant = theme.variant || "ocean-blue";
    const isDark = theme.mode === "dark";

    return {
      headerBg: isDark ? "bg-background/90" : "bg-background/95",
      headerBorder: isDark ? "border-border/30" : "border-border/20",
      rowHover: isDark ? "hover:bg-accent/20" : "hover:bg-accent/10",
      selectedRow: isDark ? "bg-primary/10" : "bg-primary/5",
    };
  };

  const colors = getThemeColors();

  if (!hasDocuments) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 rounded-full bg-muted/50">
            <FileText className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No documents available</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            There are no documents to display. Try adjusting your filters or
            create a new document.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Modern Document Table */}
      <div className="relative w-full">
        {/* Fixed Header with Glass Effect */}
        <div
          className={`sticky top-0 z-20 w-full ${colors.headerBg} backdrop-blur-sm border-b ${colors.headerBorder}`}
        >
          <Table>
            <DocumentTableHeader
              documents={documents}
              selectedDocuments={selectedDocuments}
              onSelectAll={() =>
                handleSelectAll(
                  !selectedDocuments.length ||
                    selectedDocuments.length < documents.length
                )
              }
              isSimpleUser={!canManageDocuments}
            />
          </Table>
        </div>

        {/* Table Body */}
        <Table>
          <DocumentTableBody
            documents={documents}
            selectedDocuments={selectedDocuments}
            onSelectDocument={onSelectDocument}
            onEdit={onEditDocument}
            onDelete={onDeleteDocument}
            onAssignCircuit={onAssignCircuit}
            isSimpleUser={!canManageDocuments}
          />
        </Table>
      </div>
    </div>
  );
}
