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
import { usePagination } from "@/hooks/usePagination";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { CreateSousLigneDialog } from "@/components/document/ligne/dialogs/CreateSousLigneDialog";
import { EditSousLigneDialog } from "@/components/document/ligne/dialogs/EditSousLigneDialog";
import { SubLinesTableContent } from "@/components/document/sublines/SubLinesTableContent";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import {
    ArrowLeft,
    Plus,
    Trash2,
    FileText,
    Layers,
    AlertCircle,
    Loader2,
    Search,
    Filter,
    X
} from "lucide-react";

const SubLinesPage = () => {
    const { documentId, ligneId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // State management
    const [searchQuery, setSearchQuery] = useState("");
    const [searchField, setSearchField] = useState("all");
    const [sortBy, setSortBy] = useState<keyof SousLigne | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentSubLine, setCurrentSubLine] = useState<SousLigne | null>(null);

    // Check permissions
    const canManageDocuments = user?.role === "Admin" || user?.role === "FullUser";

    // Search fields configuration
    const searchFields = [
        { id: "all", label: "All Fields" },
        { id: "title", label: "Title" },
        { id: "attribute", label: "Attribute" },
    ];

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

    // Pagination hook
    const pagination = usePagination({
        data: sortedSubLines,
        initialPageSize: 15,
    });

    // Bulk selection hook
    const bulkSelection = useBulkSelection<SousLigne>({
        data: sortedSubLines,
        paginatedData: pagination.paginatedData,
        keyField: 'id',
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
    });

    // Handlers
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

    const handleBulkDelete = async () => {
        const selectedSubLines = bulkSelection.getSelectedObjects();
        if (selectedSubLines.length === 0) {
            toast.error('No sub-lines selected');
            return;
        }

        try {
            // Delete all selected sub-lines
            await Promise.all(
                selectedSubLines.map(subLine => sousLigneService.deleteSousLigne(subLine.id))
            );
            
            toast.success(`${selectedSubLines.length} sub-lines deleted successfully`);
            bulkSelection.deselectAll();
            refetchSubLines();
            queryClient.invalidateQueries({ queryKey: ["documentLignes", Number(documentId)] });
        } catch (error) {
            console.error('Failed to delete sub-lines:', error);
            toast.error('Failed to delete selected sub-lines');
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
        if (!currentSubLine) return;

        try {
            await sousLigneService.deleteSousLigne(currentSubLine.id);
            toast.success("Sub-line deleted successfully");
            setIsDeleteDialogOpen(false);
            setCurrentSubLine(null);
            refetchSubLines();
            queryClient.invalidateQueries({ queryKey: ["documentLignes", Number(documentId)] });
        } catch (error) {
            console.error("Failed to delete sub-line:", error);
            toast.error("Failed to delete sub-line");
        }
    };

    const handleBack = () => {
        navigate(`/documents/${documentId}?tab=lignes`);
    };

    const hasActiveFilters = searchQuery.trim() !== "" || searchField !== "all";

    const clearAllFilters = () => {
        setSearchQuery("");
        setSearchField("all");
    };

    // Clear selection when sublines change
    useEffect(() => {
        bulkSelection.deselectAll();
    }, [subLines]);

    // Loading state
    if (isLoadingDocument || isLoadingLigne) {
        return (
            <PageLayout
                title="Loading..."
                subtitle="Please wait"
                icon={Loader2}
                actions={[]}
            >
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
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
        ? `Document: ${document.documentKey} • Line: ${ligne.title || "Untitled Line"}`
        : "Manage sub-lines for this document line";

    return (
        <PageLayout
            title={pageTitle}
            subtitle={pageSubtitle}
            icon={Layers}
            actions={pageActions}
        >
            {/* Main Content */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="h-full flex flex-col space-y-2"
            >
                {/* Search and Filter Bar */}
                <div className="flex-shrink-0 bg-gradient-to-r from-background/80 via-background/60 to-background/80 backdrop-blur-xl border border-border/50 shadow-lg rounded-xl p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="flex-1 flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search sub-lines..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-background/60 border-border/70 focus:border-primary/50 focus:ring-primary/20"
                                />
                            </div>
                            
                            {/* Field Selector */}
                            <Select value={searchField} onValueChange={setSearchField}>
                                <SelectTrigger className="w-[180px] bg-background/60 border-border/70">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {searchFields.map((field) => (
                                        <SelectItem key={field.id} value={field.id}>
                                            {field.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Advanced Filters Toggle */}
                        <div className="flex items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-background/60 border-border/70 hover:bg-primary/10"
                                    >
                                        <Filter className="h-4 w-4 mr-2" />
                                        Filters
                                        {hasActiveFilters && (
                                            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                                                {hasActiveFilters ? '1' : '0'}
                                            </Badge>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-4" align="end">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Advanced Filters</h4>
                                            {hasActiveFilters && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={clearAllFilters}
                                                    className="text-muted-foreground hover:text-foreground"
                                                >
                                                    <X className="h-4 w-4 mr-1" /> Clear All
                                                </Button>
                                            )}
                                        </div>

                                        {/* Filter Badges */}
                                        {hasActiveFilters && (
                                            <div className="flex flex-wrap gap-2">
                                                {searchQuery && (
                                                    <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                                                        Search: "{searchQuery}"
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setSearchQuery("")}
                                                            className="ml-1 h-4 w-4 p-0 hover:bg-primary/20"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </Badge>
                                                )}
                                                {searchField !== "all" && (
                                                    <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                                                        Field: {searchFields.find(f => f.id === searchField)?.label}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setSearchField("all")}
                                                            className="ml-1 h-4 w-4 p-0 hover:bg-primary/20"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>

                {/* Sub-Lines Table - Expandable */}
                <div className="flex-1 bg-background/50 backdrop-blur-sm border-border/50 rounded-xl border shadow-lg overflow-hidden min-h-0">
                    <SubLinesTableContent
                        subLines={pagination.paginatedData}
                        allSubLines={sortedSubLines}
                        isLoading={isLoadingSubLines}
                        error={subLinesError instanceof Error ? subLinesError.message : null}
                        bulkSelection={bulkSelection}
                        pagination={pagination}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onBulkDelete={handleBulkDelete}
                        canManageDocuments={canManageDocuments}
                        onCreateNew={handleCreate}
                    />
                </div>
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
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                count={currentSubLine ? 1 : bulkSelection.selectedCount}
            />
        </PageLayout>
    );
};

export default SubLinesPage; 