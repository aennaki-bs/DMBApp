
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
  isSingleDocument: boolean;
  count: number;
}

export default function DeleteConfirmDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  isSingleDocument, 
  count 
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a1033] border-blue-900/30 text-white">
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription className="text-blue-300">
            {isSingleDocument 
              ? "Are you sure you want to delete this document? This action cannot be undone."
              : `Are you sure you want to delete ${count} selected documents? This action cannot be undone.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-blue-800 hover:bg-blue-900/30">Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
