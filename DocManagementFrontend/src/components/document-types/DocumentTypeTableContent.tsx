import { DocumentType } from "@/models/document";
import { Table } from "@/components/ui/table";
import { DocumentTypeTableHeader } from "./table/DocumentTypeTableHeader";
import { DocumentTypeTableBody } from "./table/DocumentTypeTableBody";
import { DocumentTypeTableEmpty } from "./table/DocumentTypeTableEmpty";
import { ScrollArea } from "@/components/ui/scroll-area";
import PaginationWithBulkActions, { BulkAction } from "@/components/shared/PaginationWithBulkActions";
import { Loader2, Edit, Trash2 } from "lucide-react";
import { BulkSelectionState } from "@/hooks/useBulkSelection";

interface DocumentTypeTableContentProps {
    types: DocumentType[] | undefined;
    allTypes?: DocumentType[] | undefined;
    selectedTypes: number[];
    bulkSelection: ReturnType<typeof import('@/hooks/useBulkSelection').useBulkSelection<DocumentType>>;
    pagination: {
        currentPage: number;
        pageSize: number;
        totalPages: number;
        totalItems: number;
        handlePageChange: (page: number) => void;
        handlePageSizeChange: (size: number) => void;
    };
    onEditType: (type: DocumentType) => void;
    onDeleteType: (typeId: number) => void;
    sortBy: string;
    sortDirection: string;
    onSort: (field: string) => void;
    onClearFilters: () => void;
    onBulkEdit?: () => void;
    onBulkDelete?: () => void;
    onCreateType?: () => void;
    isLoading?: boolean;
    isError?: boolean;
}

export function DocumentTypeTableContent({
    types,
    allTypes,
    selectedTypes,
    bulkSelection,
    pagination,
    onEditType,
    onDeleteType,
    sortBy,
    sortDirection,
    onSort,
    onClearFilters,
    onBulkEdit,
    onBulkDelete,
    onCreateType,
    isLoading = false,
    isError = false,
}: DocumentTypeTableContentProps) {
    // Use pagination from props
    const {
        currentPage,
        pageSize,
        totalPages,
        totalItems,
        handlePageChange,
        handlePageSizeChange,
    } = pagination;

    // Check if we have types to display
    const hasTypes = types && types.length > 0;

    // Define bulk actions - only for types without documents
    const bulkActions: BulkAction[] = [
        {
            id: 'edit',
            label: 'Edit Types',
            icon: <Edit className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => onBulkEdit?.(),
            shortcut: 'E',
        },
        {
            id: 'delete',
            label: 'Delete Types',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive',
            onClick: () => onBulkDelete?.(),
            requiresConfirmation: true,
            shortcut: 'Del',
        },
    ];

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-2xl">
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Loading document types...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl border border-destructive/10 bg-gradient-to-br from-destructive/5 via-background/60 to-background/80 backdrop-blur-xl shadow-2xl">
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 text-destructive" />
                            </div>
                            <p className="text-destructive">Failed to load document types</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col gap-4" style={{ minHeight: "100%" }}>
            <div className="flex-1 relative overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-lg min-h-0">
                {/* Subtle animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/2 via-transparent to-primary/2 animate-pulse"></div>

                {hasTypes ? (
                    <div className="relative h-full flex flex-col z-10">
                        {/* Fixed Header - Never Scrolls */}
                        <div className="flex-shrink-0 overflow-x-auto border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
                            <div className="min-w-[1000px]">
                                <Table className="table-fixed w-full">
                                    <DocumentTypeTableHeader
                                        selectedCount={bulkSelection.currentPageSelectedCount}
                                        totalCount={types?.length || 0}
                                        onSelectAll={bulkSelection.toggleSelectCurrentPage}
                                        sortBy={sortBy}
                                        sortDirection={sortDirection}
                                        onSort={onSort}
                                    />
                                </Table>
                            </div>
                        </div>

                        {/* Scrollable Body - Only Content Scrolls - FILL REMAINING HEIGHT */}
                        <div
                            className="flex-1 overflow-hidden"
                            style={{ maxHeight: "calc(100vh - 300px)" }}
                        >
                            <ScrollArea className="table-scroll-area h-full w-full">
                                <div className="min-w-[1000px] pb-4">
                                    <Table className="table-fixed w-full">
                                        <DocumentTypeTableBody
                                            types={types || []}
                                            selectedTypes={selectedTypes}
                                            onSelectType={(typeId) => {
                                                const type = types?.find(t => t.id === typeId);
                                                if (type) bulkSelection.toggleItem(type);
                                            }}
                                            onEditType={onEditType}
                                            onDeleteType={onDeleteType}
                                        />
                                    </Table>
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                ) : (
                    <div className="relative h-full flex items-center justify-center z-10">
                        <DocumentTypeTableEmpty
                            onClearFilters={onClearFilters}
                            onCreateType={onCreateType}
                        />
                    </div>
                )}
            </div>

            {/* Smart Pagination with Bulk Actions */}
            {hasTypes && (
                <PaginationWithBulkActions
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    bulkSelection={bulkSelection}
                    bulkActions={bulkActions}
                />
            )}
        </div>
    );
} 