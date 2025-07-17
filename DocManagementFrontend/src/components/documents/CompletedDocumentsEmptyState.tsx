import { Button } from "@/components/ui/button";
import { FileCheck, FilterX, Search } from "lucide-react";
import { useArchivedDocumentsFilter } from "@/hooks/documents/useArchivedDocumentsFilter";
import { motion } from "framer-motion";

interface CompletedDocumentsEmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export default function CompletedDocumentsEmptyState({
  hasFilters = false,
  onClearFilters,
}: CompletedDocumentsEmptyStateProps) {
  const { searchQuery } = useArchivedDocumentsFilter();

  const isSearching = !!searchQuery;

  return (
    <motion.div
      className="text-center py-16 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto h-20 w-20 rounded-full bg-amber-900/30 border border-amber-800/50 flex items-center justify-center mb-4 shadow-inner">
        {hasFilters ? (
          <FilterX className="h-10 w-10 text-amber-400/80" />
        ) : isSearching ? (
          <Search className="h-10 w-10 text-amber-400/80" />
        ) : (
          <FileCheck className="h-10 w-10 text-amber-400/80" />
        )}
      </div>

      <h3 className="text-xl font-semibold text-white">
        {hasFilters ? "No matching completed documents" : "No completed documents found"}
      </h3>

      <p className="text-blue-100/70 text-sm mt-2 max-w-lg mx-auto">
        {hasFilters ? (
          <>
            No completed documents match your current filter criteria. Try adjusting your
            filters or clearing them to see all completed documents.
          </>
        ) : searchQuery ? (
          <>
            No completed documents match your search for{" "}
            <span className="text-amber-300 font-medium">"{searchQuery}"</span>.
            Try a different search term or browse all completed documents.
          </>
        ) : (
          <>
            There are currently no completed documents pending ERP archival. Documents that
            have completed their workflow circuit but are not yet archived will appear here.
          </>
        )}
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        {hasFilters && onClearFilters && (
          <Button
            variant="outline"
            className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20 min-w-[160px]"
            onClick={onClearFilters}
          >
            <FilterX className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </motion.div>
  );
} 