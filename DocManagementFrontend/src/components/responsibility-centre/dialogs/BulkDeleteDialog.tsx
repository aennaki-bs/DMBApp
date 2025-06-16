import { Dialog, DialogContent } from "@/components/ui/dialog";

interface BulkDeleteDialogProps {
  selectedCount: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function BulkDeleteDialog({
  selectedCount,
  isOpen,
  onClose,
  onConfirm,
}: BulkDeleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <div>Bulk Delete Dialog - To be implemented</div>
      </DialogContent>
    </Dialog>
  );
}
