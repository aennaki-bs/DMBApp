import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ApprovalGroup } from "@/models/approval";
import { ApprovalGroupTableRow } from "../ApprovalGroupTableRow";
import { Users } from "lucide-react";

interface ApprovalGroupTableBodyProps {
  groups: ApprovalGroup[];
  selectedGroups: number[];
  onSelectGroup: (id: number) => void;
  onEditGroup: (group: ApprovalGroup) => void;
  onDeleteGroup: (group: ApprovalGroup) => void;
}

export function ApprovalGroupTableBody({
  groups,
  selectedGroups,
  onSelectGroup,
  onEditGroup,
  onDeleteGroup,
}: ApprovalGroupTableBodyProps) {
  if (groups.length === 0) {
    return (
      <TableBody>
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={6} className="h-24 text-center">
            <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
              <Users className="h-8 w-8" />
              <p className="text-sm font-medium">No approval groups found</p>
              <p className="text-xs opacity-70">
                Create your first approval group to get started
              </p>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {groups.map((group) => (
        <ApprovalGroupTableRow
          key={group.id}
          group={group}
          isSelected={selectedGroups.includes(group.id)}
          onSelect={(id) => onSelectGroup(id)}
          onEdit={(group) => onEditGroup(group)}
          onDelete={(group) => onDeleteGroup(group)}
        />
      ))}
    </TableBody>
  );
}
