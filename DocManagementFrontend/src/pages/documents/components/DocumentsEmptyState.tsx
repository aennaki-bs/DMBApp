import { useState } from "react";
import { Button } from "@/components/ui/button";
import { File, Plus, FilterX, Search } from "lucide-react";
import { useDocumentsFilter } from "../hooks/useDocumentsFilter";
import CreateDocumentWizard from "@/components/create-document/CreateDocumentWizard";
import { motion } from "framer-motion";

interface DocumentsEmptyStateProps {
  canManageDocuments: boolean;
  onDocumentCreated?: () => void;
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export default function DocumentsEmptyState({
  canManageDocuments,
  onDocumentCreated,
  hasFilters = false,
  onClearFilters,
}: DocumentsEmptyStateProps) {
  const { searchQuery, dateRange, activeFilters } = useDocumentsFilter();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const isSearching = !!searchQuery;

  return (
    <motion.div
      className="table-glass-empty-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="table-glass-empty-icon">
        {hasFilters ? (
          <FilterX className="table-glass-empty-icon-svg" />
        ) : isSearching ? (
          <Search className="table-glass-empty-icon-svg" />
        ) : (
          <File className="table-glass-empty-icon-svg" />
        )}
      </div>

      <h3 className="table-glass-empty-title">
        {hasFilters ? "No matching documents" : "No documents found"}
      </h3>

      <p className="table-glass-empty-description">
        {hasFilters ? (
          <>
            No documents match your current filter criteria. Try adjusting your
            filters or clearing them to see all documents.
          </>
        ) : searchQuery ? (
          <>
            No documents match your search for{" "}
            <span className="table-glass-empty-search-term">
              "{searchQuery}"
            </span>
            . Try a different search term or browse all documents.
          </>
        ) : canManageDocuments ? (
          <>
            Get started by creating your first document. You can upload files,
            create new documents, and organize them into categories.
          </>
        ) : (
          <>
            There are currently no documents available for viewing. Please check
            back later or contact an administrator.
          </>
        )}
      </p>

      <div className="table-glass-empty-actions">
        {hasFilters && onClearFilters && (
          <Button
            variant="outline"
            className="table-glass-empty-button-secondary"
            onClick={onClearFilters}
          >
            <FilterX className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}

        {canManageDocuments && (
          <Button
            className="table-glass-empty-button-primary"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Document
          </Button>
        )}
      </div>

      {/* Create Document Wizard */}
      <CreateDocumentWizard
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          if (onDocumentCreated) onDocumentCreated();
        }}
      />
    </motion.div>
  );
}
