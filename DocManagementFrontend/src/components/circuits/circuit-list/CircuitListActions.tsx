
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface CircuitListActionsProps {
  circuit: Circuit;
  isSimpleUser: boolean;
  onEdit: (circuit: Circuit) => void;
  onDelete: (circuit: Circuit) => void;
  onViewDetails: (circuit: Circuit) => void;
}

export function CircuitListActions({
  circuit,
  isSimpleUser,
  onEdit,
  onDelete,
  onViewDetails
}: CircuitListActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Link to={`/circuits/${circuit.id}/steps`}>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-blue-400 hover:text-blue-600 hover:bg-blue-100/10"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </Link>
      
      {!isSimpleUser && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(circuit)}
            className="text-blue-400 hover:text-blue-600 hover:bg-blue-100/10"
            disabled={circuit.isActive}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(circuit)}
            className="text-red-400 hover:text-red-600 hover:bg-red-100/10"
            disabled={circuit.isActive}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
