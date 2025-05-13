import { Button } from "@/components/ui/button";
import { Trash, GitBranch } from "lucide-react";
import { motion } from "framer-motion";

interface CircuitBulkActionsBarProps {
  selectedCount: number;
  onDelete: () => void;
}

export function CircuitBulkActionsBar({
  selectedCount,
  onDelete,
}: CircuitBulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-3xl"
    >
      <div className="bg-gradient-to-r from-[#1a2c6b] to-[#0a1033] backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.3)] rounded-xl border border-blue-500/30 p-4 flex items-center justify-between">
        <div className="flex items-center text-blue-200 font-medium">
          <div className="bg-blue-500/20 p-1.5 rounded-lg mr-3">
            <GitBranch className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-sm sm:text-base">
            <span className="font-bold text-blue-100">{selectedCount}</span>{" "}
            {selectedCount === 1 ? "circuit" : "circuits"} selected
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-red-900/30 border-red-500/30 text-red-300 hover:text-red-200 hover:bg-red-900/50 hover:border-red-400/50 transition-all duration-200 shadow-md"
            onClick={onDelete}
          >
            <Trash className="w-4 h-4 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
