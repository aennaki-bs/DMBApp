
import { useState, useEffect } from 'react';
import { Document, Ligne } from '@/models/document';
import { LignesTableContent } from './ligne/table/LignesTableContent';
import CreateLigneDialog from './ligne/dialogs/CreateLigneDialog';
import EditLigneDialog from './ligne/dialogs/EditLigneDialog';
import DeleteLigneDialog from './ligne/dialogs/DeleteLigneDialog';
import { ViewLigneDetailsDialog } from './ligne/dialogs/ViewLigneDetailsDialog';
import { toast } from 'sonner';
import documentService from '@/services/documentService';
import { useQueryClient } from '@tanstack/react-query';
import { usePagination } from '@/hooks/usePagination';
import { useBulkSelection } from '@/hooks/useBulkSelection';

interface LignesListProps {
  document: Document;
  lignes: Ligne[];
  canManageDocuments: boolean;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
}

const LignesList = ({
  document,
  lignes,
  canManageDocuments,
  isCreateDialogOpen,
  setIsCreateDialogOpen
}: LignesListProps) => {
  const queryClient = useQueryClient();

  // Sorting state
  const [sortBy, setSortBy] = useState<keyof Ligne | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  // Dialog states for lignes
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [currentLigne, setCurrentLigne] = useState<Ligne | null>(null);

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sort lignes
  const sortedLignes = [...lignes].sort((a, b) => {
    if (!sortBy || !sortDirection) return 0;

    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination hook
  const pagination = usePagination({
    data: sortedLignes,
    initialPageSize: 15,
  });

  // Bulk selection hook
  const bulkSelection = useBulkSelection<Ligne>({
    data: sortedLignes,
    paginatedData: pagination.paginatedData,
    keyField: 'id',
    currentPage: pagination.currentPage,
    pageSize: pagination.pageSize,
  });

  // Sorting handlers
  const handleSort = (column: keyof Ligne) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  // CRUD handlers for lignes
  const handleEditLigne = (ligne: Ligne) => {
    setCurrentLigne(ligne);
    setIsEditDialogOpen(true);
  };

  const handleDeleteLigne = (ligne: Ligne) => {
    setCurrentLigne(ligne);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetails = (ligne: Ligne) => {
    setCurrentLigne(ligne);
    setIsViewDetailsDialogOpen(true);
  };

  const handleSubmitDeleteLigne = async () => {
    if (!currentLigne) return;

    setIsSubmitting(true);
    try {
      await documentService.deleteLigne(currentLigne.id);
      toast.success('Line deleted successfully');
      setIsDeleteDialogOpen(false);
      setCurrentLigne(null);
      queryClient.invalidateQueries({ queryKey: ['documentLignes', document.id] });
    } catch (error) {
      console.error('Failed to delete line:', error);
      toast.error('Failed to delete line');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk actions handlers
  const handleBulkDelete = async () => {
    const selectedLignes = bulkSelection.getSelectedObjects();
    if (selectedLignes.length === 0) {
      toast.error('No lines selected');
      return;
    }

    try {
      // Delete all selected lines
      await Promise.all(
        selectedLignes.map(ligne => documentService.deleteLigne(ligne.id))
      );
      
      toast.success(`${selectedLignes.length} lines deleted successfully`);
      bulkSelection.deselectAll();
      queryClient.invalidateQueries({ queryKey: ['documentLignes', document.id] });
    } catch (error) {
      console.error('Failed to delete lines:', error);
      toast.error('Failed to delete selected lines');
    }
  };

  // Clear selection when lignes change
  useEffect(() => {
    bulkSelection.deselectAll();
  }, [lignes]);

  return (
    <>
      <div className="h-full">
        <LignesTableContent
          lignes={pagination.paginatedData}
          allLignes={sortedLignes}
          isLoading={false}
          error={null}
          bulkSelection={bulkSelection}
          pagination={pagination}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          onEdit={handleEditLigne}
          onDelete={handleDeleteLigne}
          onBulkDelete={handleBulkDelete}
          canManageDocuments={canManageDocuments}
          onCreateNew={() => setIsCreateDialogOpen(true)}
          documentId={document.id}
          onViewDetails={handleViewDetails}
        />
      </div>

      {/* Create Ligne Dialog */}
      <CreateLigneDialog
        document={document}
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {/* Edit Ligne Dialog */}
      <EditLigneDialog
        document={document}
        ligne={currentLigne}
        isOpen={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setCurrentLigne(null);
          }
        }}
      />

      {/* View Ligne Details Dialog */}
      <ViewLigneDetailsDialog
        ligne={currentLigne}
        isOpen={isViewDetailsDialogOpen}
        onOpenChange={(open) => {
          setIsViewDetailsDialogOpen(open);
          if (!open) {
            setCurrentLigne(null);
          }
        }}
      />

      {/* Delete Ligne Dialog */}
      <DeleteLigneDialog
        document={document}
        ligne={currentLigne}
        isOpen={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setCurrentLigne(null);
          }
        }}
      />
    </>
  );
};

export default LignesList;
