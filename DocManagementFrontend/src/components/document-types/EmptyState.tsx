
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FolderPlus, Plus } from 'lucide-react';

interface EmptyStateProps {
  onAddType: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddType }) => {
  return (
    <Card className="border border-dashed">
      <CardContent className="p-0">
        <div className="text-center py-20">
          <FolderPlus className="mx-auto h-16 w-16 text-muted-foreground/60 mb-4" />
          <h3 className="text-2xl font-semibold mb-2">No document types found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Document types help categorize your documents. Start by creating your first document type.
          </p>
          <Button 
            onClick={onAddType} 
            className="px-6 py-2 text-base"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Document Type
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
