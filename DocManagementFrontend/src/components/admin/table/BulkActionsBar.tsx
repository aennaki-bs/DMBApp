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
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm sm:text-base">
              <span className="font-bold text-blue-100">{selectedCount}</span>{" "}
              users selected
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-blue-900/30 border-blue-500/30 text-blue-200 hover:text-blue-100 hover:bg-blue-800/50 hover:border-blue-400/50 transition-all duration-200 shadow-md"
              onClick={onChangeRole}
            >
              <Shield className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Change</span> Role
            </Button>
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

      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-blue-100">
              Block Multiple Users
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-300">
              Are you sure you want to block {selectedCount} users? This will
              prevent them from accessing the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-blue-800/40 text-blue-300 hover:bg-blue-800/20 hover:text-blue-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onBlock?.();
                setShowBlockDialog(false);
              }}
              className="bg-red-900/30 text-red-300 hover:bg-red-900/50 hover:text-red-200 border border-red-500/30 hover:border-red-400/50 transition-all duration-200"
            >
              Block Users
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
