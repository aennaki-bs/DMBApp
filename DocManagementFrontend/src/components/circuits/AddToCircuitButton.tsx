
import { useState } from 'react';
import { GitBranch, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AssignCircuitDialog from './AssignCircuitDialog';

interface AddToCircuitButtonProps {
  documentId: number;
  documentTitle: string;
  onSuccess?: () => void;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function AddToCircuitButton({
  documentId,
  documentTitle,
  onSuccess,
  variant = "default",
  size = "default",
  className
}: AddToCircuitButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <>
      <Button 
        variant={variant} 
        size={size}
        className={className}
        onClick={() => setIsDialogOpen(true)}
      >
        <GitBranch className="mr-2 h-4 w-4" />
        Assign to Circuit
      </Button>

      <AssignCircuitDialog
        documentId={documentId}
        documentTitle={documentTitle}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
}
