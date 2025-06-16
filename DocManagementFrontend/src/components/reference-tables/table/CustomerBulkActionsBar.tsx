import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash, Users } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";

interface CustomerBulkActionsBarProps {
  selectedCount: number;
  onDelete: () => void;
}

export function CustomerBulkActionsBar({
  selectedCount,
  onDelete,
}: CustomerBulkActionsBarProps) {
  return (
    <>
      {createPortal(
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 right-16 transform -translate-x-1/2 z-[9999] w-[calc(100vw-4rem)] max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-r from-primary/95 to-primary/80 backdrop-blur-lg shadow-[0_8px_32px_rgba(var(--primary),0.3)] rounded-2xl border border-primary/60 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 ring-2 ring-primary/40">
            <div className="flex items-center text-primary-foreground font-medium">
              <div className="bg-primary-foreground/30 p-1.5 rounded-xl mr-3 flex-shrink-0">
                <Users className="w-5 h-5 text-primary-foreground/80" />
              </div>
              <span className="text-sm sm:text-base text-center sm:text-left">
                <span className="font-bold text-primary-foreground">
                  {selectedCount}
                </span>{" "}
                customers selected
              </span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                className="bg-destructive/40 border-destructive/40 text-destructive-foreground hover:text-destructive-foreground hover:bg-destructive/60 hover:border-destructive/60 transition-all duration-200 shadow-lg min-w-[80px] font-medium"
                onClick={onDelete}
              >
                <Trash className="w-4 h-4 mr-1.5" />
                Delete
              </Button>
            </div>
          </div>
        </motion.div>,
        document.body
      )}
    </>
  );
}
