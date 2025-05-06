
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Shield, Trash } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

interface BulkActionsBarProps {
  selectedCount: number;
  onChangeRole: () => void;
  onDelete: () => void;
  onBlock?: () => void;
}

export function BulkActionsBar({ selectedCount, onChangeRole, onDelete, onBlock }: BulkActionsBarProps) {
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a1033] border-t border-blue-900/30 p-4 flex items-center justify-between">
        <div className="text-blue-300">
          {selectedCount} users selected
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="bg-blue-900/20 border-blue-900/30 text-blue-300 hover:text-blue-200 hover:bg-blue-900/30"
            onClick={onChangeRole}
          >
            <Shield className="w-4 h-4 mr-2" />
            Change Role
          </Button>
          <Button 
            variant="outline" 
            className="bg-red-900/20 border-red-900/30 text-red-400 hover:text-red-300 hover:bg-red-900/30"
            onClick={onDelete}
          >
            <Trash className="w-4 h-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      </div>

      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent className="bg-[#0a1033] border-blue-900/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Block Multiple Users</AlertDialogTitle>
            <AlertDialogDescription className="text-blue-300">
              Are you sure you want to block {selectedCount} users? This will prevent them from accessing the system.
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
              className="bg-red-900/20 text-red-400 hover:bg-red-900/30 hover:text-red-300 border border-red-900/30"
            >
              Block Users
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
