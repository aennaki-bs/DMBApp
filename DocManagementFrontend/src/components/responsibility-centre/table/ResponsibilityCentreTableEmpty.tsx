import { Building2, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ResponsibilityCentreTableEmptyProps {
  onClearFilters: () => void;
}

export function ResponsibilityCentreTableEmpty({ onClearFilters }: ResponsibilityCentreTableEmptyProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-10 px-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative mb-5">
        {/* Glowing background effect */}
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl w-20 h-20 -z-10"></div>

        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-gradient-to-br dark:from-blue-900/60 dark:to-blue-950/80 shadow-lg border border-blue-300 dark:border-blue-800/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Building2
              className="h-10 w-10 text-blue-600 dark:text-blue-400"
              strokeWidth={1.5}
            />
          </motion.div>
        </div>
      </div>

      <motion.h3
        className="text-xl font-semibold text-blue-900 dark:text-white mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        No centres found
      </motion.h3>

      <motion.p
        className="text-blue-700 dark:text-blue-300/90 max-w-md mx-auto mb-6 leading-relaxed text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        Try adjusting your search criteria or filters to find what you're
        looking for. You can also create a new responsibility centre.
      </motion.p>

      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600 transition-all duration-200 hover:border-blue-400 hover:shadow-md"
        >
          <Search className="h-4 w-4" />
          Clear Filters
        </Button>
      </motion.div>
    </motion.div>
  );
} 