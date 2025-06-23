import { TableBody } from "@/components/ui/table";
import { CircuitTableRow } from "../CircuitTableRow";

interface CircuitTableBodyProps {
  circuits: Circuit[] | undefined;
  selectedCircuits: number[];
  onSelectCircuit: (circuitId: number) => void;
  onEdit: (circuit: Circuit) => void;
  onView: (circuit: Circuit) => void;
  onViewStatuses: (circuit: Circuit) => void;
  onDelete: (circuit: Circuit) => void;
  onToggleActive: (circuit: Circuit) => void;
  loadingCircuits: number[];
  isSimpleUser: boolean;
}

export function CircuitTableBody({
  circuits,
  selectedCircuits,
  onSelectCircuit,
  onEdit,
  onView,
  onViewStatuses,
  onDelete,
  onToggleActive,
  loadingCircuits,
  isSimpleUser,
}: CircuitTableBodyProps) {
  return (
    <TableBody>
      {circuits?.map((circuit) => (
        <CircuitTableRow
          key={circuit.id}
          circuit={circuit}
          isSelected={selectedCircuits.includes(circuit.id)}
          onSelect={onSelectCircuit}
          onEdit={onEdit}
          onView={onView}
          onViewStatuses={onViewStatuses}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
          loadingCircuits={loadingCircuits}
          isSimpleUser={isSimpleUser}
        />
      ))}
    </TableBody>
  );
}
