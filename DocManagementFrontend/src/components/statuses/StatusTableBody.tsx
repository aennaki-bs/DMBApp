import { TableBody } from "@/components/ui/table";
import { StatusTableRow } from "./StatusTableRow";

interface StatusTableBodyProps {
    statuses: any[];
    selectedStatuses: number[]; // Array of status IDs, not status objects
    onSelectStatus: (statusId: number) => void;
    onEdit: (status: any) => void;
    onDelete: (statusId: number) => void;
    isCircuitActive: boolean;
}

export function StatusTableBody({
    statuses,
    selectedStatuses,
    onSelectStatus,
    onEdit,
    onDelete,
    isCircuitActive,
}: StatusTableBodyProps) {
    return (
        <TableBody>
            {statuses?.map((status) => {
                const statusId = status.id || status.statusId || status.Id;
                return (
                    <StatusTableRow
                        key={statusId}
                        status={status}
                        isSelected={selectedStatuses.includes(statusId)}
                        onSelect={onSelectStatus}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        isCircuitActive={isCircuitActive}
                    />
                );
            })}
        </TableBody>
    );
} 