import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { ProfessionalBulkActionsBar } from "@/components/shared/ProfessionalBulkActionsBar";
import {
    MoreHorizontal,
    Edit,
    Trash2,
    ArrowUpDown,
    FileText,
    Tag,
    Filter,
    CalendarDays,
    Building2,
    GitBranch,
    Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Document } from "@/models/document";
import { format } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

interface BulkSelection {
    all: boolean;
    partial: boolean;
}

interface DocumentsTableContentProps {
    documents: Document[];
    allDocuments: Document[];
    selectedDocuments: number[];
    bulkSelection: BulkSelection;
    pagination: PaginationProps;
    onSelectDocument: (id: number) => void;
    onSelectAll: () => void;
    onDelete: (id: number) => void;
    onAssignCircuit: (document: Document) => void;
    sortConfig: { key: string; direction: "ascending" | "descending" } | null;
    onSort: (key: string) => void;
    canManageDocuments: boolean;
    isLoading: boolean;
    isError: boolean;
    onClearFilters: () => void;
}

export function DocumentsTableContent({
    documents,
    allDocuments,
    selectedDocuments,
    bulkSelection,
    pagination,
    onSelectDocument,
    onSelectAll,
    onDelete,
    onAssignCircuit,
    sortConfig,
    onSort,
    canManageDocuments,
    isLoading,
    isError,
    onClearFilters,
}: DocumentsTableContentProps) {
    const { t } = useTranslation();

    const getSortIcon = (columnKey: string) => {
        if (sortConfig?.key === columnKey) {
            return sortConfig.direction === "ascending" ? "↑" : "↓";
        }
        return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    };

    const renderSortableHeader = (
        label: string,
        key: string,
        icon: React.ReactNode
    ) => (
        <div
            className="flex items-center gap-2 cursor-pointer select-none hover:text-primary transition-colors"
            onClick={() => onSort(key)}
        >
            {icon}
            <span>{label}</span>
            <div className="ml-1 w-4 flex justify-center">
                {getSortIcon(key)}
            </div>
        </div>
    );

    const getStatusBadge = (status: number) => {
        switch (status) {
            case 0:
                return (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                        Draft
                    </Badge>
                );
            case 1:
                return (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                        In Progress
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline">Unknown</Badge>
                );
        }
    };

    const formatDate = (date: string) => {
        return format(new Date(date), "MMM dd, yyyy");
    };

    if (isLoading) {
        return (
            <div className="flex-1 p-8">
                <div className="space-y-4">
                    <div className="h-12 bg-muted/50 rounded animate-pulse" />
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="h-16 bg-muted/30 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                    <div className="text-destructive">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    </div>
                    <h3 className="text-lg font-medium">Error loading documents</h3>
                    <p className="text-muted-foreground">
                        There was an error loading the documents. Please try again.
                    </p>
                    <Button onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    if (allDocuments.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                    <div className="text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    </div>
                    <h3 className="text-lg font-medium">No documents found</h3>
                    <p className="text-muted-foreground">
                        {selectedDocuments.length > 0 ?
                            "No documents match your current filters." :
                            "Get started by creating your first document."
                        }
                    </p>
                    {selectedDocuments.length > 0 && (
                        <Button variant="outline" onClick={onClearFilters}>
                            Clear filters
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Bulk Actions Bar */}
            {selectedDocuments.length > 0 && (
                <div className="px-6 py-3 border-b border-border/50">
                    <ProfessionalBulkActionsBar
                        selectedCount={selectedDocuments.length}
                        totalCount={allDocuments.length}
                        entityName="document"
                        actions={[
                            ...(canManageDocuments ? [
                                {
                                    id: "delete",
                                    label: "Delete",
                                    icon: Trash2,
                                    onClick: () => { },  // This will be handled by parent
                                    variant: "destructive" as const,
                                },
                                ...(selectedDocuments.length === 1 ? [{
                                    id: "assign-circuit",
                                    label: "Assign Circuit",
                                    icon: GitBranch,
                                    onClick: () => {
                                        const doc = allDocuments.find(d => d.id === selectedDocuments[0]);
                                        if (doc) onAssignCircuit(doc);
                                    },
                                    variant: "outline" as const,
                                }] : [])
                            ] : [])
                        ]}
                        onClearSelection={() => { }} // This will be handled by parent
                    />
                </div>
            )}

            {/* Table */}
            <div className="flex-1 overflow-auto">
                <Table>
                    <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12">
                                {canManageDocuments ? (
                                    <Checkbox
                                        checked={bulkSelection.all}
                                        ref={(el) => {
                                            if (el) el.indeterminate = bulkSelection.partial;
                                        }}
                                        onCheckedChange={onSelectAll}
                                        className="border-border/50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                    />
                                ) : (
                                    <span className="text-muted-foreground">#</span>
                                )}
                            </TableHead>
                            <TableHead className="min-w-[180px]">
                                {renderSortableHeader("Document Code", "documentKey", <Tag className="h-4 w-4" />)}
                            </TableHead>
                            <TableHead className="min-w-[200px]">
                                {renderSortableHeader("Title", "title", <FileText className="h-4 w-4" />)}
                            </TableHead>
                            <TableHead className="min-w-[150px]">
                                {renderSortableHeader("Type", "documentType", <Filter className="h-4 w-4" />)}
                            </TableHead>
                            <TableHead className="min-w-[120px]">
                                Status
                            </TableHead>
                            <TableHead className="min-w-[140px]">
                                {renderSortableHeader("Date", "docDate", <CalendarDays className="h-4 w-4" />)}
                            </TableHead>
                            <TableHead className="min-w-[160px]">
                                {renderSortableHeader("Responsibility Centre", "responsibilityCentre", <Building2 className="h-4 w-4" />)}
                            </TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.map((document, index) => (
                            <TableRow
                                key={document.id}
                                className={cn(
                                    "hover:bg-muted/50 transition-colors cursor-pointer",
                                    selectedDocuments.includes(document.id) && "bg-primary/5 border-primary/20"
                                )}
                            >
                                <TableCell>
                                    {canManageDocuments ? (
                                        <Checkbox
                                            checked={selectedDocuments.includes(document.id)}
                                            onCheckedChange={() => onSelectDocument(document.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="border-border/50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                        />
                                    ) : (
                                        <span className="text-muted-foreground text-sm">
                                            {(pagination.currentPage - 1) * pagination.pageSize + index + 1}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium text-foreground">
                                        {document.documentKey}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium text-foreground truncate max-w-[200px]">
                                        {document.title}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="bg-background/50">
                                        {document.documentType.typeName}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(document.status)}
                                </TableCell>
                                <TableCell>
                                    <span className="text-muted-foreground">
                                        {formatDate(document.docDate)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-muted-foreground">
                                        {document.responsibilityCentreId ?
                                            `RC-${document.responsibilityCentreId}` :
                                            "Not assigned"
                                        }
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {canManageDocuments && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-muted"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem className="cursor-pointer">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer">
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAssignCircuit(document);
                                                    }}
                                                >
                                                    <GitBranch className="mr-2 h-4 w-4" />
                                                    Assign Circuit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="cursor-pointer text-destructive focus:text-destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(document.id);
                                                    }}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
                    <div className="text-sm text-muted-foreground">
                        Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
                        {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{" "}
                        {pagination.totalItems} documents
                    </div>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => pagination.onPageChange(Math.max(1, pagination.currentPage - 1))}
                                    className={cn(
                                        "cursor-pointer",
                                        pagination.currentPage === 1 && "pointer-events-none opacity-50"
                                    )}
                                />
                            </PaginationItem>
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                .filter(page => {
                                    const current = pagination.currentPage;
                                    return page === 1 || page === pagination.totalPages ||
                                        (page >= current - 1 && page <= current + 1);
                                })
                                .map((page, index, array) => {
                                    const prevPage = array[index - 1];
                                    const showEllipsis = prevPage && page - prevPage > 1;

                                    return (
                                        <React.Fragment key={page}>
                                            {showEllipsis && (
                                                <PaginationItem>
                                                    <span className="px-3 py-2 text-muted-foreground">...</span>
                                                </PaginationItem>
                                            )}
                                            <PaginationItem>
                                                <PaginationLink
                                                    onClick={() => pagination.onPageChange(page)}
                                                    isActive={pagination.currentPage === page}
                                                    className="cursor-pointer"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        </React.Fragment>
                                    );
                                })}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                                    className={cn(
                                        "cursor-pointer",
                                        pagination.currentPage === pagination.totalPages && "pointer-events-none opacity-50"
                                    )}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </>
    );
} 