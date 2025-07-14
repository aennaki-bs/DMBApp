import { TableBody } from "@/components/ui/table";
import { ApproversTableRow } from "./ApproversTableRow";

interface Approver {
  id: number;
  userId: number;
  username: string;
  comment?: string;
  stepId?: number;
  stepTitle?: string;
  allAssociations?: { stepId: number; stepTitle: string }[];
}

interface ApproversTableBodyProps {
  approvers: Approver[] | undefined;
  selectedApprovers: number[];
  onSelectApprover: (approverId: number) => void;
  onEdit: (approver: Approver) => void;
  onDelete: (approverId: number) => void;
}

export function ApproversTableBody({
  approvers,
  selectedApprovers,
  onSelectApprover,
  onEdit,
  onDelete,
}: ApproversTableBodyProps) {
  return (
    <TableBody>
      {approvers?.map((approver) => (
        <ApproversTableRow
          key={approver.id}
          approver={approver}
          isSelected={selectedApprovers.includes(approver.id)}
          onSelect={onSelectApprover}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </TableBody>
  );
} 