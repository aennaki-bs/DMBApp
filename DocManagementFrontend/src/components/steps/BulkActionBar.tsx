import { Button } from '@/components/ui/button';
import { Trash, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BulkActionBarProps {
  selectedCount: number;
  onBulkDelete: () => void;
  disabled?: boolean;
}

export const BulkActionBar = ({ 
  selectedCount, 
  onBulkDelete,
  disabled = false 
}: BulkActionBarProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg p-4 flex justify-between items-center z-10">
      <div>
        <span className="font-medium">{selectedCount}</span> step{selectedCount !== 1 ? 's' : ''} selected
      </div>
      <div className="flex gap-2">
        {disabled ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="destructive" 
                  disabled
                  className="bg-red-600/50 hover:bg-red-600/50 cursor-not-allowed opacity-70"
                >
                  <Trash className="h-4 w-4 mr-2" /> Delete Selected
                  <AlertCircle className="ml-2 h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Cannot delete steps from active circuit</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button 
            variant="destructive" 
            onClick={onBulkDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash className="h-4 w-4 mr-2" /> Delete Selected
          </Button>
        )}
      </div>
    </div>
  );
};
