import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Network } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to={`/circuits/${circuit.id}/steps`}>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-blue-400 hover:text-blue-600 hover:bg-blue-100/10"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>View Steps</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {!isSimpleUser && (
        <>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to={`/circuit/${circuit.id}/steps`}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-blue-400 hover:text-blue-600 hover:bg-blue-100/10"
                  >
                    <Network className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Status Steps</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(circuit)}
                  className="text-blue-400 hover:text-blue-600 hover:bg-blue-100/10"
                  disabled={circuit.isActive}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{circuit.isActive ? 'Cannot edit active circuit' : 'Edit Circuit'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(circuit)}
                  className="text-red-400 hover:text-red-600 hover:bg-red-100/10"
                  disabled={circuit.isActive}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{circuit.isActive ? 'Cannot delete active circuit' : 'Delete Circuit'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
    </div>
  );
}
