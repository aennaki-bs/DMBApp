import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Trash, Users } from "lucide-react";
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

interface BulkActionsBarProps {
  selectedCount: number;
  onChangeRole: () => void;
  onDelete: () => void;
  onBlock?: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onChangeRole,
  onDelete,
  onBlock,
}: BulkActionsBarProps) {
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  return (
    <>
      {createPortal(
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-16 sm:right-16 z-[9999] max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-r from-primary/95 to-primary/80 backdrop-blur-lg shadow-[0_8px_32px_rgba(var(--primary),0.3)] rounded-xl sm:rounded-2xl border border-primary/60 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 ring-2 ring-primary/40">
            <div className="flex items-center text-primary-foreground font-medium w-full sm:w-auto justify-center sm:justify-start">
              <div className="bg-primary-foreground/30 p-1.5 rounded-xl mr-3 flex-shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground/80" />
              </div>
              <span className="text-sm sm:text-base">
                <span className="font-bold text-primary-foreground">
                  {selectedCount}
                </span>{" "}
                {selectedCount === 1 ? "item" : "items"} selected
              </span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none bg-primary-foreground/20 border-primary-foreground/40 text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/30 hover:border-primary-foreground/60 transition-all duration-200 shadow-lg font-medium"
                onClick={onChangeRole}
              >
                <Shield className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Change</span> Role
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none bg-destructive/40 border-destructive/40 text-destructive-foreground hover:text-destructive-foreground hover:bg-destructive/60 hover:border-destructive/60 transition-all duration-200 shadow-lg font-medium"
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

      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent className="bg-gradient-to-b from-primary/95 to-primary/80 border-primary/30 text-primary-foreground shadow-[0_0_25px_rgba(var(--primary),0.2)] rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-primary-foreground">
              Block Multiple Users
            </AlertDialogTitle>
            <AlertDialogDescription className="text-primary-foreground/80">
              Are you sure you want to block {selectedCount} users? This will
              prevent them from accessing the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-primary-foreground/40 text-primary-foreground/80 hover:bg-primary-foreground/20 hover:text-primary-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onBlock?.();
                setShowBlockDialog(false);
              }}
              className="bg-destructive/30 text-destructive-foreground hover:bg-destructive/50 hover:text-destructive-foreground border border-destructive/30 hover:border-destructive/50 transition-all duration-200"
            >
              Block Users
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
