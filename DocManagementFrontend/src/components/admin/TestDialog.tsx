import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestDialog({ open, onOpenChange }: TestDialogProps) {
  console.log("TestDialog rendering with open state:", open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-blue-900 text-white">
        <DialogHeader>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogDescription>
            This is a test dialog to verify if dialogs are working properly.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          If you can see this message, the dialog system is working!
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
