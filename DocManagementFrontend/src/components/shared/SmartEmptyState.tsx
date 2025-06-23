import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon, Plus, FilterX, Search } from "lucide-react";
import { motion } from "framer-motion";

interface SmartEmptyStateProps {
  // State detection
  hasFilters?: boolean;
  searchQuery?: string;

  // Data state (when no filters/search)
  dataIcon: LucideIcon;
  dataTitle: string;
  dataDescription: string;

  // Filtered state (when has filters/search)
  filteredTitle?: string;
  filteredDescription?: string;

  // Actions
  onClearFilters?: () => void;
  onCreateNew?: () => void;
  canCreate?: boolean;
  createButtonText?: string;

  // Customization
  className?: string;
}

export function SmartEmptyState({
  hasFilters = false,
  searchQuery,
  dataIcon: DataIcon,
  dataTitle,
  dataDescription,
  filteredTitle,
  filteredDescription,
  onClearFilters,
  onCreateNew,
  canCreate = false,
  createButtonText = "Create New",
  className = "",
}: SmartEmptyStateProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const isSearching = !!searchQuery;
  const isFilteredState = hasFilters || isSearching;

  // State 1: Filtered/Search Results Empty
  if (isFilteredState) {
    const FilterIcon = isSearching ? Search : FilterX;
    const filterTitle = isSearching
      ? "No matching results"
      : filteredTitle || "No results match your filters";
    const filterDesc = isSearching
      ? `No results match your search for "${searchQuery}". Try adjusting your search terms.`
      : filteredDescription ||
        "No results match your current filter criteria. Try adjusting your filters or search terms.";

    return (
      <div
        className={`relative w-full flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-background/95 via-background/90 to-background/95 border border-border/50 shadow-lg backdrop-blur-sm ${className}`}
        style={{ minHeight: "300px", height: "auto" }}
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        </div>

        {/* Filtered Results Empty State */}
        <motion.div
          className="relative flex flex-col items-center justify-center max-w-lg mx-auto px-6 py-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Filter Icon */}
          <div className="relative mb-6">
            <motion.div
              className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber/10 to-orange/10 border border-amber/20 shadow-inner backdrop-blur-sm"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            >
              <FilterIcon
                className="h-8 w-8 text-amber-500/70"
                strokeWidth={1.2}
              />
            </motion.div>
          </div>

          {/* Filter Title */}
          <motion.h3
            className="text-xl font-semibold text-foreground mb-3 tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {filterTitle}
          </motion.h3>

          {/* Filter Description */}
          <motion.p
            className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-md mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {filterDesc}
          </motion.p>

          {/* Clear Filters Button */}
          {onClearFilters && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button
                variant="outline"
                size="sm"
                className="min-w-[120px] bg-background/80 border-amber/30 hover:bg-amber/10 hover:border-amber/50 transition-all duration-300 backdrop-blur-sm shadow-sm text-amber-600 hover:text-amber-700"
                onClick={onClearFilters}
              >
                <FilterX className="h-3 w-3 mr-2" />
                Clear Filters
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  // State 2: Actually Empty Data
  return (
    <div
      className={`relative w-full flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-background/95 via-background/90 to-background/95 border border-border/50 shadow-lg backdrop-blur-sm ${className}`}
      style={{ minHeight: "300px", height: "auto" }}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      </div>

      {/* Empty Data State */}
      <motion.div
        className="relative flex flex-col items-center justify-center max-w-md mx-auto px-6 py-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Empty Data Icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl scale-150" />

          <motion.div
            className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 shadow-inner backdrop-blur-sm"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
            >
              <DataIcon className="h-8 w-8 text-primary/60" strokeWidth={1.2} />
            </motion.div>

            <motion.div
              className="absolute inset-0 rounded-full border border-primary/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>

        {/* Empty Data Title */}
        <motion.h3
          className="text-xl font-semibold text-foreground mb-3 tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {dataTitle}
        </motion.h3>

        {/* Empty Data Description */}
        <motion.p
          className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {dataDescription}
        </motion.p>

        {/* Create Button */}
        {canCreate && onCreateNew && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Button
              size="sm"
              className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 font-medium px-5 py-2"
              onClick={onCreateNew}
            >
              <Plus className="h-3 w-3 mr-2" />
              {createButtonText}
            </Button>
          </motion.div>
        )}

        {/* Decorative elements - subtle and elegant */}
        <div className="absolute -top-2 -left-2 w-1 h-1 rounded-full bg-primary/20 opacity-60" />
        <div className="absolute -bottom-2 -right-2 w-1 h-1 rounded-full bg-primary/30 opacity-40" />
        <div className="absolute top-1/4 -right-4 w-0.5 h-0.5 rounded-full bg-primary/15 opacity-50" />

        {/* Subtle gradient overlays */}
        <div className="absolute -top-2 -left-2 w-20 h-20 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-xl opacity-50" />
        <div className="absolute -bottom-2 -right-2 w-24 h-24 rounded-full bg-gradient-to-tl from-primary/5 to-transparent blur-xl opacity-50" />
      </motion.div>
    </div>
  );
}
