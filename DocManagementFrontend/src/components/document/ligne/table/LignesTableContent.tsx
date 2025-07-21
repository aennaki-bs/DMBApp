import { Table } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Ligne } from "@/models/document";
import { LignesTableHeader } from "./LignesTableHeader";
import { LignesTableBody } from "./LignesTableBody";
import { LignesTableFooter } from "./LignesTableFooter";

interface LignesTableContentProps {
    lignes: Ligne[];
    isLoading: boolean;
    error: string | null;
    selectedLignes: number[];
    onSelectLigne: (ligneId: number) => void;
    onSelectAll: () => void;
    sortBy: keyof Ligne | null;
    sortDirection: "asc" | "desc" | null;
    onSort: (column: keyof Ligne) => void;
    onEdit: (ligne: Ligne) => void;
    onDelete: (ligne: Ligne) => void;
    canManageDocuments: boolean;
    onCreateNew: () => void;
    documentId: number;
}

export function LignesTableContent({
    lignes,
    isLoading,
    error,
    selectedLignes,
    onSelectLigne,
    onSelectAll,
    sortBy,
    sortDirection,
    onSort,
    onEdit,
    onDelete,
    canManageDocuments,
    onCreateNew,
    documentId,
}: LignesTableContentProps) {
    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading lines...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
                    <p className="text-destructive font-medium">Failed to load lines</p>
                    <p className="text-muted-foreground text-sm mt-1">{error}</p>
                </div>
            </div>
        );
    }

    // Empty state
    if (lignes.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16"
            >
                <div className="text-center">
                    <div className="p-4 rounded-full bg-muted/30 border border-border/30 mb-4 inline-block">
                        <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No Lines Found</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        This document doesn't have any lines yet. Create your first line to get started.
                    </p>
                    {/* {canManageDocuments && (
                        <Button
                            onClick={onCreateNew}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Line
                        </Button>
                    )} */}
                </div>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Main Table structure */}
            <div className="flex-1 relative overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-lg">
                {/* Gradient overlay for visual depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-background/5 pointer-events-none z-0"></div>

                {/* Header and Scrollable Body */}
                <div className="relative flex flex-col z-10">
                    {/* Fixed Table Header */}
                    <div className="flex-shrink-0 overflow-x-auto border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
                        <div className="min-w-[1180px]">
                            <Table className="table-fixed w-full table-compact">
                                <LignesTableHeader
                                    selectedCount={selectedLignes.length}
                                    totalCount={lignes.length}
                                    onSelectAll={onSelectAll}
                                    sortBy={sortBy}
                                    sortDirection={sortDirection}
                                    onSort={onSort}
                                />
                            </Table>
                        </div>
                    </div>

                    {/* Scrollable Table Body */}
                    <div className="overflow-hidden" style={{ maxHeight: "calc(100vh - 260px)" }}>
                        <ScrollArea className="table-scroll-area h-full w-full">
                            <div className="min-w-[1180px] pb-4">
                                <Table className="table-fixed w-full table-compact">
                                    <LignesTableBody
                                        lignes={lignes}
                                        selectedLignes={selectedLignes}
                                        onSelectLigne={onSelectLigne}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        canManageDocuments={canManageDocuments}
                                        documentId={documentId}
                                    />
                                </Table>
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>

            {/* Comprehensive Totals Footer */}
            <LignesTableFooter lignes={lignes} />
        </div>
    );
} 