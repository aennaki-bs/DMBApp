
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isBulk?: boolean;
  count?: number;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({ 
  open, 
  onOpenChange, 
  onConfirm,
  isBulk = false,
  count = 0
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isBulk ? 'Confirm Bulk Delete' : 'Confirm Delete'}
          </DialogTitle>
          <DialogDescription className="text-base py-3">
            {isBulk 
              ? `Are you sure you want to delete ${count} document type${count !== 1 ? 's' : ''}? This action cannot be undone.`
              : 'Are you sure you want to delete this document type? This action cannot be undone.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="sm:w-1/3">
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm} 
            className="sm:w-1/3"
          >
            {isBulk ? `Delete ${count} Type${count !== 1 ? 's' : ''}` : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
