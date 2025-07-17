import { Button } from "@/components/ui/button";
import { Archive, FilterX, Search } from "lucide-react";
import { useArchivedDocumentsFilter } from "@/hooks/documents/useArchivedDocumentsFilter";
import { motion } from "framer-motion";

interface ArchivedDocumentsEmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export default function ArchivedDocumentsEmptyState({
  hasFilters = false,
  onClearFilters,
}: ArchivedDocumentsEmptyStateProps) {
  const { searchQuery } = useArchivedDocumentsFilter();

  const isSearching = !!searchQuery;

  return (
    <motion.div
      className="text-center py-16 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto h-20 w-20 rounded-full bg-orange-900/30 border border-orange-800/50 flex items-center justify-center mb-4 shadow-inner">
        {hasFilters ? (
          <FilterX className="h-10 w-10 text-orange-400/80" />
        ) : isSearching ? (
          <Search className="h-10 w-10 text-orange-400/80" />
        ) : (
          <Archive className="h-10 w-10 text-orange-400/80" />
        )}
      </div>

      <h3 className="text-xl font-semibold text-white">
        {hasFilters ? "No matching archived documents" : "No archived documents found"}
      </h3>

      <p className="text-blue-100/70 text-sm mt-2 max-w-lg mx-auto">
        {hasFilters ? (
          <>
            No archived documents match your current filter criteria. Try adjusting your
            filters or clearing them to see all archived documents.
          </>
        ) : searchQuery ? (
          <>
            No archived documents match your search for{" "}
            <span className="text-orange-300 font-medium">"{searchQuery}"</span>.
            Try a different search term or browse all archived documents.
          </>
        ) : (
          <>
            There are currently no archived documents. Documents that have been
            successfully archived to the ERP system will appear here.
          </>
        )}
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        {hasFilters && onClearFilters && (
          <Button
            variant="outline"
            className="border-orange-500/50 text-orange-400 hover:bg-orange-500/20 min-w-[160px]"
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