import { Dialog, DialogContent } from "@/components/ui/dialog";

interface EditResponsibilityCentreDialogProps {
  centre: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (centreId: number, data: any) => void;
}

export function EditResponsibilityCentreDialog({
  centre,
  isOpen,
  onClose,
  onSave,
}: EditResponsibilityCentreDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <div>Edit Responsibility Centre Dialog - To be implemented</div>
      </DialogContent>
    </Dialog>
  );
}
