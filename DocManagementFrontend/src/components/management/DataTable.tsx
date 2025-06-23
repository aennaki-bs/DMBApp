import React, { ReactNode } from "react";
import { Table, TableHeader, TableBody } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableProps {
  headers: ReactNode;
  children: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyState?: ReactNode;
  className?: string;
  minWidth?: string;
  maxHeight?: string;
  stickyHeader?: boolean;
}

export function DataTable({
  headers,
  children,
  isLoading = false,
  isEmpty = false,
  emptyState,
  className,
  minWidth = "700px",
  maxHeight = "calc(100vh - 320px)",
  stickyHeader = true,
}: DataTableProps) {
  if (isLoading) {
    return (
      <div className="flex-1 overflow-hidden rounded-2xl table-glass-container">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex-1 overflow-hidden rounded-2xl table-glass-container">
        <div
          className="flex items-center justify-center py-20"
          style={{ minHeight: "300px" }}
        >
          {emptyState}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex-1 overflow-hidden rounded-2xl table-glass-container",
        className
      )}
    >
      <div className="h-full flex flex-col">
        {/* Fixed Header */}
        {stickyHeader && (
          <div className="flex-shrink-0 overflow-x-auto table-glass-header">
            <div style={{ minWidth, width: "100%" }}>
              <Table className="w-full table-fixed">
                <TableHeader>{headers}</TableHeader>
              </Table>
            </div>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div style={{ minWidth, width: "100%", paddingBottom: "4px" }}>
              <Table className="w-full table-fixed">
                {!stickyHeader && <TableHeader>{headers}</TableHeader>}
                <TableBody>{children}</TableBody>
              </Table>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
