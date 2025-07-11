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

interface BulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  selectedCount: number;
}

export function BulkDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  selectedCount,
}: BulkDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="table-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle className="table-dialog-title">
            Delete Approval Groups
          </AlertDialogTitle>
          <AlertDialogDescription className="table-dialog-description">
            Are you sure you want to delete {selectedCount} approval group
            {selectedCount === 1 ? "" : "s"}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="table-dialog-cancel">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete {selectedCount} Group{selectedCount === 1 ? "" : "s"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
