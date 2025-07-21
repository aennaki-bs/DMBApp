import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import documentService from "@/services/documentService";
import sousLigneService from "@/services/documents/sousLigneService";
import { SousLigne, Ligne } from "@/models/document";
import { BulkActionsBar } from "@/components/shared/BulkActionsBar";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { CreateSousLigneDialog } from "@/components/document/ligne/dialogs/CreateSousLigneDialog";
import { EditSousLigneDialog } from "@/components/document/ligne/dialogs/EditSousLigneDialog";
import { SubLinesTable } from "@/components/document/sublines/SubLinesTable";
import {
    ArrowLeft,
    Plus,
    Trash2,
    FileText,
    Layers,
    AlertCircle,
    Loader2
} from "lucide-react";

const SubLinesPage = () => {
    const { documentId, ligneId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // State management
    const [selectedSubLines, setSelectedSubLines] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<keyof SousLigne | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentSubLine, setCurrentSubLine] = useState<SousLigne | null>(null);

    // Check permissions
    const canManageDocuments = user?.role === "Admin" || user?.role === "FullUser";

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
    };

    // Fetch document details
    const {
        data: document,
        isLoading: isLoadingDocument,
        error: documentError,
    } = useQuery({
        queryKey: ["document", Number(documentId)],
        queryFn: () => documentService.getDocumentById(Number(documentId)),
        enabled: !!documentId,
    });

    // Fetch ligne details
    const {
        data: ligne,
        isLoading: isLoadingLigne,
        error: ligneError,
    } = useQuery({
        queryKey: ["ligne", Number(ligneId)],
        queryFn: () => documentService.getLigneById(Number(ligneId)),
        enabled: !!ligneId,
    });

    // Fetch sublines
    const {
        data: subLines = [],
        isLoading: isLoadingSubLines,
        error: subLinesError,
        refetch: refetchSubLines,
    } = useQuery({
        queryKey: ["sousLignes", Number(ligneId)],
        queryFn: () => documentService.getSousLignesByLigneId(Number(ligneId)),
        enabled: !!ligneId,
    });

    // Filter and sort sublines
    const filteredSubLines = subLines.filter((subLine) =>
        searchQuery === "" ||
        subLine.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subLine.attribute?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedSubLines = [...filteredSubLines].sort((a, b) => {
        if (!sortBy || !sortDirection) return 0;

        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
    });

    // Handlers
    const handleSelectSubLine = (subLineId: number) => {
        setSelectedSubLines(prev =>
            prev.includes(subLineId)
                ? prev.filter(id => id !== subLineId)
                : [...prev, subLineId]
        );
    };

    const handleSelectAll = () => {
        setSelectedSubLines(
            selectedSubLines.length === sortedSubLines.length
                ? []
                : sortedSubLines.map(subLine => subLine.id)
        );
    };

    const handleSort = (column: keyof SousLigne) => {
        if (sortBy === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortDirection("asc");
        }
    };

    const handleCreate = () => {
        setIsCreateDialogOpen(true);
    };

    const handleEdit = (subLine: SousLigne) => {
        setCurrentSubLine(subLine);
        setIsEditDialogOpen(true);
    };

    const handleDelete = (subLine: SousLigne) => {
        setCurrentSubLine(subLine);
        setIsDeleteDialogOpen(true);
    };

    const handleBulkDelete = () => {
        if (selectedSubLines.length > 0) {
            setIsDeleteDialogOpen(true);
        }
    };

    const handleCreateSubmit = async (data: { title: string; attribute: string }) => {
        try {
            await sousLigneService.createSousLigne({
                ligneId: Number(ligneId),
                title: data.title,
                attribute: data.attribute,
            });
            toast.success("Sub-line created successfully");
            setIsCreateDialogOpen(false);
            refetchSubLines();
            queryClient.invalidateQueries({ queryKey: ["documentLignes", Number(documentId)] });
        } catch (error) {
            console.error("Failed to create sub-line:", error);
            toast.error("Failed to create sub-line");
        }
    };

    const handleEditSubmit = async (data: { title: string; attribute: string }) => {
        if (!currentSubLine) return;

        try {
            await sousLigneService.updateSousLigne(currentSubLine.id, data);
            toast.success("Sub-line updated successfully");
            setIsEditDialogOpen(false);
            setCurrentSubLine(null);
            refetchSubLines();
            queryClient.invalidateQueries({ queryKey: ["documentLignes", Number(documentId)] });
        } catch (error) {
            console.error("Failed to update sub-line:", error);
            toast.error("Failed to update sub-line");
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            if (selectedSubLines.length > 0) {
                // Bulk delete
                await Promise.all(
                    selectedSubLines.map(id => sousLigneService.deleteSousLigne(id))
                );
                toast.success(`${selectedSubLines.length} sub-line(s) deleted successfully`);
                setSelectedSubLines([]);
            } else if (currentSubLine) {
                // Single delete
                await sousLigneService.deleteSousLigne(currentSubLine.id);
                toast.success("Sub-line deleted successfully");
                setCurrentSubLine(null);
            }

            setIsDeleteDialogOpen(false);
            refetchSubLines();
            queryClient.invalidateQueries({ queryKey: ["documentLignes", Number(documentId)] });
        } catch (error) {
            console.error("Failed to delete sub-line(s):", error);
            toast.error("Failed to delete sub-line(s)");
        }
    };

    const handleBack = () => {
        navigate(`/documents/${documentId}`);
    };

    // Loading state
    if (isLoadingDocument || isLoadingLigne) {
        return (
            <PageLayout
                title="Loading..."
                subtitle="Please wait while we load the data"
                icon={Loader2}
                actions={[]}
            >
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading sub-lines...</p>
                    </div>
                </div>
            </PageLayout>
        );
    }

    // Error state
    if (documentError || ligneError) {
        const error = documentError || ligneError;
        return (
            <PageLayout
                title="Error"
                subtitle="Failed to load data"
                icon={AlertCircle}
                actions={[
                    {
                        label: "Back to Document",
                        variant: "outline",
                        icon: ArrowLeft,
                        onClick: handleBack,
                    },
                ]}
            >
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
                        <p className="text-destructive font-medium">Failed to load data</p>
                        <p className="text-muted-foreground text-sm mt-1">
                            {error instanceof Error ? error.message : 'Unknown error occurred'}
                        </p>
                    </div>
                </div>
            </PageLayout>
        );
    }

    // Page actions
    const pageActions = [
        {
            label: "Back to Document",
            variant: "outline" as const,
            icon: ArrowLeft,
            onClick: handleBack,
        },
        ...(canManageDocuments ? [
            {
                label: "Add Sub-Line",
                variant: "default" as const,
                icon: Plus,
                onClick: handleCreate,
            },
        ] : []),
    ];

    // Page title and subtitle
    const pageTitle = ligne
        ? `Sub-Lines for Line: ${ligne.ligneKey || `L${ligne.id}`}`
        : "Sub-Lines";

    const pageSubtitle = document && ligne
        ? `${document.documentKey} • Line: ${ligne.title || "Untitled Line"}`
        : "Manage sub-lines for this document line";

    return (
        <PageLayout
            title={pageTitle}
            subtitle={pageSubtitle}
            icon={Layers}
            actions={pageActions}
        >
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6"
            >
                {/* Bulk Actions */}
                {selectedSubLines.length > 0 && canManageDocuments && (
                    <motion.div variants={itemVariants}>
                        <BulkActionsBar
                            selectedCount={selectedSubLines.length}
                            entityName="sub-lines"
                            actions={[
                                {
                                    id: "delete",
                                    label: "Delete Selected",
                                    icon: <Trash2 className="h-4 w-4" />,
                                    variant: "destructive" as const,
                                    onClick: handleBulkDelete,
                                },
                            ]}
                        />
                    </motion.div>
                )}

                {/* Sub-Lines Table */}
                <motion.div variants={itemVariants}>
                    <SubLinesTable
                        subLines={sortedSubLines}
                        isLoading={isLoadingSubLines}
                        error={subLinesError instanceof Error ? subLinesError.message : null}
                        selectedSubLines={selectedSubLines}
                        onSelectSubLine={handleSelectSubLine}
                        onSelectAll={handleSelectAll}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        canManageDocuments={canManageDocuments}
                        onCreateNew={handleCreate}
                    />
                </motion.div>
            </motion.div>

            {/* Dialogs */}
            <CreateSousLigneDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSubmit={handleCreateSubmit}
            />

            <EditSousLigneDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                sousLigne={currentSubLine}
                onSubmit={handleEditSubmit}
            />

            <DeleteConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={(open) => {
                    setIsDeleteDialogOpen(open);
                    if (!open) {
                        setCurrentSubLine(null);
                    }
                }}
                onConfirm={handleDeleteConfirm}
                title={
                    selectedSubLines.length > 0
                        ? `Delete ${selectedSubLines.length} Sub-Line(s)`
                        : "Delete Sub-Line"
                }
                description={
                    selectedSubLines.length > 0
                        ? `Are you sure you want to delete ${selectedSubLines.length} selected sub-line(s)? This action cannot be undone.`
                        : `Are you sure you want to delete "${currentSubLine?.title}"? This action cannot be undone.`
                }
            />
        </PageLayout>
    );
};

export default SubLinesPage; 