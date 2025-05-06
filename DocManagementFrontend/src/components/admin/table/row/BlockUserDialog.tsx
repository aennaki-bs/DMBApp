
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

interface BlockUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  userName: string;
  isBlocked: boolean;
}

export function BlockUserDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  userName,
  isBlocked,
}: BlockUserDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#0a1033] border-blue-900/30 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isBlocked ? "Block User" : "Unblock User"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-blue-300">
            Are you sure you want to {isBlocked ? "block" : "unblock"} {userName}? 
            {isBlocked && " This will prevent them from accessing the system."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent border-blue-800/40 text-blue-300 hover:bg-blue-800/20 hover:text-blue-200">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={isBlocked 
              ? "bg-red-900/20 text-red-400 hover:bg-red-900/30 hover:text-red-300 border border-red-900/30"
              : "bg-green-900/20 text-green-400 hover:bg-green-900/30 hover:text-green-300 border border-green-900/30"
            }
          >
            {isBlocked ? "Block User" : "Unblock User"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
