import { useState } from 'react';
import { motion } from 'framer-motion';
import { Document, Ligne } from '@/models/document';
import LignesList from './LignesList';
import { SimpleLigneFilters } from './ligne/filters/SimpleLigneFilters';
import { useDocumentEditingStatus } from '@/hooks/useDocumentEditingStatus';
import React from 'react';

interface DocumentLinesTabProps {
  document: Document;
  lignes: Ligne[];
  canManageDocuments: boolean;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
}

const DocumentLinesTab = ({
  document,
  lignes,
  canManageDocuments,
  isCreateDialogOpen,
  setIsCreateDialogOpen
}: DocumentLinesTabProps) => {
  // Filtered lines state
  const [filteredLignes, setFilteredLignes] = useState<Ligne[]>(lignes);

  // Check if line editing should be disabled due to pending approval
  const { isLineEditingDisabled, disabledReason } = useDocumentEditingStatus(document.id);

  // Check if document is archived to ERP (read-only)
  const isArchivedToERP = !!(document.erpDocumentCode && document.erpDocumentCode.length > 0);

  // Update filtered lines when source data changes
  React.useEffect(() => {
    setFilteredLignes(lignes);
  }, [lignes]);

  const handleFiltersChange = (filtered: Ligne[]) => {
    setFilteredLignes(filtered);
  };

  return (
    <motion.div 
      className="h-full flex flex-col space-y-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Compact Filters */}
      <div className="flex-shrink-0">
        <SimpleLigneFilters
          lignes={lignes}
          onFiltersChange={handleFiltersChange}
          className="w-full"
        />
      </div>

      {/* Lines Table/List - Expandable */}
      <div className="flex-1 bg-background/50 backdrop-blur-sm border-border/50 rounded-xl border shadow-lg overflow-hidden min-h-0">
        <LignesList
          document={document}
          lignes={filteredLignes}
          canManageDocuments={canManageDocuments && !isArchivedToERP && !isLineEditingDisabled}
          isCreateDialogOpen={isCreateDialogOpen}
          setIsCreateDialogOpen={setIsCreateDialogOpen}
        />
      </div>
    </motion.div>
  );
};

export default DocumentLinesTab;
