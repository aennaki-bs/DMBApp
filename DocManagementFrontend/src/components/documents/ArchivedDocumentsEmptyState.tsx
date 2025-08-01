import { Button } from "@/components/ui/button";
import { Archive, FilterX, Search } from "lucide-react";
import { useArchivedDocumentsFilter } from "@/hooks/documents/useArchivedDocumentsFilter";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

interface ArchivedDocumentsEmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export default function ArchivedDocumentsEmptyState({
  hasFilters = false,
  onClearFilters,
}: ArchivedDocumentsEmptyStateProps) {
  const { t, tWithParams } = useTranslation();
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
        {hasFilters ? t('documents.noMatchingArchivedDocuments') : t('documents.noArchivedDocumentsFound')}
      </h3>

      <p className="text-blue-100/70 text-sm mt-2 max-w-lg mx-auto">
        {hasFilters ? (
          <>
            {t('documents.noArchivedDocumentsMatchFilters')}
          </>
        ) : searchQuery ? (
          <>
            {tWithParams('documents.noArchivedDocumentsMatchSearch', { searchQuery })}
          </>
        ) : (
          <>
            {t('documents.noArchivedDocumentsYet')}
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
            {t('documents.clearFilters')}
          </Button>
        )}
      </div>
    </motion.div>
  );
} 