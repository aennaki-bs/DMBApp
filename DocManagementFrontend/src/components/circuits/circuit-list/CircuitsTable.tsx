import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CircuitListActions } from './CircuitListActions';

interface CircuitsTableProps {
  circuits: Circuit[];
  isSimpleUser: boolean;
  onEdit: (circuit: Circuit) => void;
  onDelete: (circuit: Circuit) => void;
  onViewDetails: (circuit: Circuit) => void;
}

export function CircuitsTable({ 
  circuits, 
  isSimpleUser, 
  onEdit, 
  onDelete, 
  onViewDetails 
}: CircuitsTableProps) {
  const navigate = useNavigate();

  const handleCircuitClick = (circuitId: number) => {
    navigate(`/circuits/${circuitId}/statuses`);
  };

  return (
    <div className="rounded-md">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-blue-900/30">
            <TableHead className="text-blue-300">Circuit Code</TableHead>
            <TableHead className="text-blue-300">Title</TableHead>
            <TableHead className="text-blue-300">Description</TableHead>
            <TableHead className="text-blue-300">Status</TableHead>
            <TableHead className="text-right text-blue-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {circuits.map((circuit) => (
            <TableRow 
              key={circuit.id} 
              className="border-blue-900/30 hover:bg-blue-900/20 transition-colors cursor-pointer"
              onClick={() => handleCircuitClick(circuit.id)}
            >
              <TableCell className="font-medium text-blue-100">
                {circuit.circuitKey}
              </TableCell>
              <TableCell className="text-blue-100">
                {circuit.title}
              </TableCell>
              <TableCell className="max-w-xs truncate text-blue-200/70">
                {circuit.descriptif || 'No description'}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={circuit.isActive ? "default" : "secondary"}
                  className={circuit.isActive 
                    ? "bg-green-900/50 text-green-300 hover:bg-green-900/70 border-green-700/50"
                    : "bg-gray-800/50 text-gray-400 hover:bg-gray-800/70 border-gray-700/50"
                  }
                >
                  {circuit.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                <CircuitListActions
                  circuit={circuit}
                  isSimpleUser={isSimpleUser}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onViewDetails={onViewDetails}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
