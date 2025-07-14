import { Users, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface CustomerTableEmptyProps {
  onClearFilters: () => void;
}

export function CustomerTableEmpty({ onClearFilters }: CustomerTableEmptyProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 px-8 text-center"
    >
      <motion.div 
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="p-6 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm mb-6"
      >
        <Users className="h-12 w-12 text-primary/60" />
      </motion.div>
      
      <motion.h3 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-xl font-semibold text-foreground mb-2"
      >
        No customers found
      </motion.h3>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="text-muted-foreground mb-6 max-w-md"
      >
        No customers match your current search and filter criteria. Try adjusting your filters or search terms.
      </motion.p>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="flex items-center gap-3"
      >
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300"
        >
          <Filter className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      </motion.div>
    </motion.div>
  );
} 