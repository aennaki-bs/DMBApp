import { TableBody } from "@/components/ui/table";
import { StepTableRow } from "./StepTableRow";
import { Step } from "@/models/step";

interface Circuit {
    id: number;
    title: string;
    circuitKey: string;
    isActive: boolean;
}

interface StepTableBodyProps {
    steps: Step[];
    selectedSteps: number[]; // Array of step IDs, not step objects
    onSelectStep: (stepId: number) => void;
    onEdit: (step: Step) => void;
    onDelete: (step: Step) => void;
    isCircuitActive?: boolean;
    isSimpleUser?: boolean;
    circuit?: Circuit;
}

export function StepTableBody({
    steps,
    selectedSteps,
    onSelectStep,
    onEdit,
    onDelete,
    isCircuitActive = false,
    isSimpleUser = false,
    circuit,
}: StepTableBodyProps) {
    return (
        <TableBody>
            {steps?.map((step) => {
                const stepId = step.id;
                return (
                    <StepTableRow
                        key={stepId}
                        step={step}
                        isSelected={selectedSteps.includes(stepId)}
                        onSelect={onSelectStep}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        isCircuitActive={isCircuitActive}
                        isSimpleUser={isSimpleUser}
                        circuit={circuit}
                    />
                );
            })}
        </TableBody>
    );
} 