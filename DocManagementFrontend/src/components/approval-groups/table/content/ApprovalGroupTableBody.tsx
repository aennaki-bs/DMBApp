import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ApprovalGroup } from "@/models/approval";
import { ApprovalGroupTableRow } from "../ApprovalGroupTableRow";
import { Users } from "lucide-react";

interface ApprovalGroupTableBodyProps {
  groups: ApprovalGroup[];
  selectedGroups: number[];
  onSelectGroup: (groupId: number, checked: boolean) => void;
  onEditGroup: (group: ApprovalGroup) => void;
  onViewGroup: (group: ApprovalGroup) => void;
  onDeleteGroup: (group: ApprovalGroup) => void;
  onManageApprovers: (group: ApprovalGroup) => void;
}

export function ApprovalGroupTableBody({
  groups,
  selectedGroups,
  onSelectGroup,
  onEditGroup,
  onViewGroup,
  onDeleteGroup,
  onManageApprovers,
}: ApprovalGroupTableBodyProps) {
  if (groups.length === 0) {
    return (
      <TableBody>
        <TableRow className="hover:bg-transparent border-none approval-table-layout">
          <TableCell
            colSpan={6}
            className="h-32 text-center py-8 col-span-full"
          >
            <div className="flex flex-col items-center justify-center space-y-3 text-muted-foreground">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  No approval groups found
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Create your first approval group to manage document approvals
                </p>
              </div>
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
          onSelectChange={(checked) => onSelectGroup(group.id, checked)}
          onEdit={() => onEditGroup(group)}
          onView={() => onViewGroup(group)}
          onDelete={() => onDeleteGroup(group)}
          onManageApprovers={() => onManageApprovers(group)}
        />
      ))}
    </TableBody>
  );
}
