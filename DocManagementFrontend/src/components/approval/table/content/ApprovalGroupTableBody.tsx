import { TableBody } from "@/components/ui/table";
import { ApprovalGroup } from "@/models/approval";
import { ApprovalGroupTableRow } from "../ApprovalGroupTableRow";

interface ApprovalGroupTableBodyProps {
  groups: ApprovalGroup[] | undefined;
  selectedGroups: number[];
  onSelectGroup: (groupId: number) => void;
  onView: (group: ApprovalGroup) => void;
  onEdit: (group: ApprovalGroup) => void;
  onDelete: (groupId: number) => void;
  associatedGroups: Record<number, boolean>;
  checkingAssociation: boolean;
}

export function ApprovalGroupTableBody({
  groups,
  selectedGroups,
  onSelectGroup,
  onView,
  onEdit,
  onDelete,
  associatedGroups,
  checkingAssociation,
}: ApprovalGroupTableBodyProps) {
  return (
    <TableBody>
      {groups?.map((group) => (
        <ApprovalGroupTableRow
          key={group.id}
          group={group}
          isSelected={selectedGroups.includes(group.id)}
          onSelect={onSelectGroup}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          isAssociated={associatedGroups[group.id] || false}
          checkingAssociation={checkingAssociation}
        />
      ))}
    </TableBody>
  );
} 