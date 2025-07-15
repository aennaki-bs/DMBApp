import { TableBody } from "@/components/ui/table";
import { CircuitTableRow } from "./CircuitTableRow";

interface CircuitTableBodyProps {
    circuits: Circuit[] | undefined;
    selectedItems: number[];
    onSelectCircuit: (circuit: Circuit) => void;
    onEdit: (circuit: Circuit) => void;
    onDelete: (circuitId: number) => void;
    onView: (circuit: Circuit) => void;
    onToggleStatus: (circuit: Circuit) => void;
    onManageSteps: (circuit: Circuit) => void;
    isSimpleUser?: boolean;
}

export function CircuitTableBody({
    circuits,
    selectedItems,
    onSelectCircuit,
    onEdit,
    onDelete,
    onView,
    onToggleStatus,
    onManageSteps,
    isSimpleUser = false,
}: CircuitTableBodyProps) {
    return (
        <TableBody>
            {circuits?.map((circuit) => (
                <CircuitTableRow
                    key={circuit.id}
                    circuit={circuit}
                    isSelected={selectedItems.includes(circuit.id)}
                    onSelect={() => onSelectCircuit(circuit)}
                    onEdit={() => onEdit(circuit)}
                    onDelete={() => onDelete(circuit.id)}
                    onView={() => onView(circuit)}
                    onToggleStatus={() => onToggleStatus(circuit)}
                    onManageSteps={() => onManageSteps(circuit)}
                    isSimpleUser={isSimpleUser}
                />
            ))}
        </TableBody>
    );
} 