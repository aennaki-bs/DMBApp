
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

interface BottomActionBarProps {
  selectedCount: number;
  onBulkDelete: () => void;
}

const BottomActionBar: React.FC<BottomActionBarProps> = ({ selectedCount, onBulkDelete }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg p-4 flex justify-between items-center z-10">
      <div>
        <span className="font-medium">{selectedCount}</span> document type{selectedCount !== 1 ? 's' : ''} selected
      </div>
      <div className="flex gap-2">
        <Button 
          variant="destructive" 
          onClick={onBulkDelete}
          className="bg-red-600 hover:bg-red-700"
        >
          <Trash className="h-4 w-4 mr-2" /> Delete Selected
        </Button>
      </div>
    </div>
  );
};

export default BottomActionBar;
