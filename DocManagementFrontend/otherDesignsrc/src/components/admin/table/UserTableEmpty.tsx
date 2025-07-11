import { UserPlus, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface UserTableEmptyProps {
  onClearFilters: () => void;
}

export function UserTableEmpty({ onClearFilters }: UserTableEmptyProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-10 px-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative mb-5">
        {/* Glowing background effect */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl w-20 h-20 -z-10"></div>

        <div className="relative flex items-center justify-center w-20 h-20 rounded-full table-glass-empty-icon shadow-lg backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Users className="h-10 w-10" strokeWidth={1.5} />
          </motion.div>
        </div>
      </div>

      <motion.h3
        className="text-xl font-semibold table-glass-empty-title mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        No users found
      </motion.h3>

      <motion.p
        className="table-glass-empty-description max-w-md mx-auto mb-6 leading-relaxed text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        Try adjusting your search criteria or filters to find what you're
        looking for. You can also add new users to the system.
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row items-center justify-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Button
          variant="outline"
          size="sm"
          className="min-w-[130px] table-glass-empty-button transition-all duration-300 backdrop-blur-sm"
          onClick={onClearFilters}
        >
          <Search className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>

        <Button
          size="sm"
          className="min-w-[130px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg transition-all duration-300"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-primary/5 blur-xl"></div>
      <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-primary/5 blur-xl"></div>
    </motion.div>
  );
}
