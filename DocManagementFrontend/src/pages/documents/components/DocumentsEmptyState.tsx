import { useState } from "react";
import { Button } from "@/components/ui/button";
import { File, Plus, FilterX, Search, FileText } from "lucide-react";
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

  const getEmptyStateContent = () => {
    if (hasFilters) {
      return {
        icon: FilterX,
        title: "No matching documents found",
        description:
          "No documents match your current filter criteria. Try adjusting your filters or clearing them to see all documents.",
        iconColor: "text-orange-500",
        iconBg: "bg-orange-500/10",
      };
    } else if (isSearching) {
      return {
        icon: Search,
        title: "No search results",
        description: (
          <>
            No documents match your search for{" "}
            <span className="font-semibold text-primary">"{searchQuery}"</span>.
            Try different keywords or browse all documents.
          </>
        ),
        iconColor: "text-blue-500",
        iconBg: "bg-blue-500/10",
      };
    } else {
      return {
        icon: FileText,
        title: canManageDocuments
          ? "Ready to get started?"
          : "No documents available",
        description: canManageDocuments
          ? "Create your first document to begin organizing your workflow. You can upload files, create new documents, and manage them efficiently."
          : "There are currently no documents available for viewing. Please check back later or contact an administrator.",
        iconColor: "text-primary",
        iconBg: "bg-primary/10",
      };
    }
  };

  const content = getEmptyStateContent();
  const IconComponent = content.icon;

  return (
    <div className="h-full flex items-center justify-center rounded-2xl table-glass-container shadow-lg backdrop-blur-md">
      <motion.div
        className="flex flex-col items-center justify-center py-20 px-8 text-center max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated Icon */}
        <motion.div
          className={`flex items-center justify-center w-24 h-24 rounded-full ${content.iconBg} border border-border/20 shadow-lg mb-8`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.2,
            type: "spring",
            stiffness: 200,
          }}
        >
          <IconComponent className={`h-12 w-12 ${content.iconColor}`} />
        </motion.div>

        {/* Title */}
        <motion.h3
          className="text-2xl font-bold text-foreground mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {content.title}
        </motion.h3>

        {/* Description */}
        <motion.p
          className="text-muted-foreground mb-8 text-lg leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {content.description}
        </motion.p>

        {/* Search Term Highlight */}
        {isSearching && searchQuery && (
          <motion.div
            className="mb-6 p-3 rounded-lg bg-muted/50 border border-border/30"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <span className="text-sm text-muted-foreground">
              Searched for:{" "}
              <span className="font-mono font-semibold text-foreground">
                "{searchQuery}"
              </span>
            </span>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {hasFilters && onClearFilters && (
            <Button
              variant="outline"
              size="lg"
              onClick={onClearFilters}
              className="bg-background/50 border-border/40 hover:border-border/60 hover:bg-background/80 transition-all duration-200 shadow-sm rounded-lg flex items-center gap-2"
            >
              <FilterX className="h-5 w-5" />
              Clear All Filters
            </Button>
          )}

          {canManageDocuments && !hasFilters && (
            <Button
              size="lg"
              onClick={() => setCreateModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Create Document
            </Button>
          )}
        </motion.div>

        {/* Additional Help Text */}
        {!hasFilters && !isSearching && canManageDocuments && (
          <motion.div
            className="mt-8 p-4 rounded-lg bg-muted/30 border border-border/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h4 className="text-sm font-semibold text-foreground mb-2">
              Getting Started
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              <li>
                • Create documents from templates or upload existing files
              </li>
              <li>• Organize documents by type and status</li>
              <li>• Assign documents to approval circuits</li>
              <li>• Track document progress and history</li>
            </ul>
          </motion.div>
        )}

        {/* Statistics for filtered state */}
        {hasFilters && (
          <motion.div
            className="mt-6 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            Try browsing all documents or adjusting your search criteria
          </motion.div>
        )}
      </motion.div>

      {/* Create Document Wizard */}
      <CreateDocumentWizard
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          if (onDocumentCreated) onDocumentCreated();
        }}
      />
    </div>
  );
}
