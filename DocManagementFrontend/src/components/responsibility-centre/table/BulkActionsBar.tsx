import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Building2, Trash2, X } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onDelete,
}: BulkActionsBarProps) {
  return createPortal(
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[9999] w-[calc(100vw-4rem)] max-w-4xl mx-auto"
    >
      <div className="bg-gradient-to-r from-primary/95 to-primary/80 backdrop-blur-lg shadow-[0_8px_32px_rgba(var(--primary),0.3)] rounded-2xl border border-primary/60 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 ring-2 ring-primary/40">
        <div className="flex items-center text-primary-foreground font-medium">
          <div className="bg-primary-foreground/30 p-1.5 rounded-xl mr-3 flex-shrink-0">
            <Building2 className="w-5 h-5 text-primary-foreground/80" />
          </div>
          <span className="text-sm sm:text-base text-center sm:text-left">
            <span className="font-bold text-primary-foreground">
              {selectedCount}
            </span>{" "}
            centre{selectedCount !== 1 ? "s" : ""} selected
          </span>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            className="bg-destructive/40 border-destructive/40 text-destructive-foreground hover:text-destructive-foreground hover:bg-destructive/60 hover:border-destructive/60 transition-all duration-200 shadow-lg min-w-[80px] font-medium"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>
    </motion.div>,
    document.body
  );
}
