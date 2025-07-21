
import { useState, useEffect } from 'react';
import { Document, Ligne } from '@/models/document';
import { LignesTableContent } from './ligne/table/LignesTableContent';
import CreateLigneDialog from './ligne/dialogs/CreateLigneDialog';
import EditLigneDialog from './ligne/dialogs/EditLigneDialog';
import DeleteLigneDialog from './ligne/dialogs/DeleteLigneDialog';
import { toast } from 'sonner';
import documentService from '@/services/documentService';
import { useQueryClient } from '@tanstack/react-query';

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

  // Selection state
  const [selectedLignes, setSelectedLignes] = useState<number[]>([]);

  // Sorting state
  const [sortBy, setSortBy] = useState<keyof Ligne | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  // Dialog states for lignes
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentLigne, setCurrentLigne] = useState<Ligne | null>(null);

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handlers for ligne selection
  const handleSelectLigne = (ligneId: number) => {
    setSelectedLignes(prev =>
      prev.includes(ligneId)
        ? prev.filter(id => id !== ligneId)
        : [...prev, ligneId]
    );
  };

  const handleSelectAll = () => {
    setSelectedLignes(
      selectedLignes.length === lignes.length ? [] : lignes.map(ligne => ligne.id)
    );
  };

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

  // Clear selection when lignes change
  useEffect(() => {
    setSelectedLignes([]);
  }, [lignes]);

  // Sort lignes
  const sortedLignes = [...lignes].sort((a, b) => {
    if (!sortBy || !sortDirection) return 0;

    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <>
      <LignesTableContent
        lignes={sortedLignes}
        isLoading={false}
        error={null}
        selectedLignes={selectedLignes}
        onSelectLigne={handleSelectLigne}
        onSelectAll={handleSelectAll}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        onEdit={handleEditLigne}
        onDelete={handleDeleteLigne}
        canManageDocuments={canManageDocuments}
        onCreateNew={() => setIsCreateDialogOpen(true)}
        documentId={document.id}
      />

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
