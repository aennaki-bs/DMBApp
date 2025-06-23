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

interface VendorDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onConfirm: () => void;
}

export function VendorDeleteDialog({
  isOpen,
  onClose,
  selectedCount,
  onConfirm,
}: VendorDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Multiple Vendors</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {selectedCount} selected vendor
            {selectedCount === 1 ? "" : "s"}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete {selectedCount} Vendor{selectedCount === 1 ? "" : "s"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
