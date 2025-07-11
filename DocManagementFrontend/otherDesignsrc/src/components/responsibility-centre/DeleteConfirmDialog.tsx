import { Dialog, DialogContent } from "@/components/ui/dialog";

interface DeleteConfirmDialogProps {
  centre: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (centreId: number) => void;
}

export function DeleteConfirmDialog({
  centre,
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <div>Delete Confirm Dialog - To be implemented</div>
      </DialogContent>
    </Dialog>
  );
}
