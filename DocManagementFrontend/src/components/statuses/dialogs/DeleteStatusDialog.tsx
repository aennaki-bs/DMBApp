import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import api from "@/services/api";
import { DocumentStatus } from "@/models/documentCircuit";

interface DeleteStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: DocumentStatus | null;
  onSuccess: () => void;
}

export function DeleteStatusDialog({
  open,
  onOpenChange,
  status,
  onSuccess,
}: DeleteStatusDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!status) return;

    setIsDeleting(true);
    try {
      // Update to use new Status API endpoint
      await api.delete(`/Status/${status.statusId}`);
      toast.success("Status deleted successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting status:", error);
      toast.error("Failed to delete status");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!status) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-background border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Delete Status
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the status{" "}
            <span className="font-semibold">{status.title}</span>? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className="border-border">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
