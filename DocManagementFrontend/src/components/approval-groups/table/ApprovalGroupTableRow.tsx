import { Checkbox } from "@/components/ui/checkbox";
import { Users, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { ApprovalGroup } from "@/models/approval";

interface ApprovalGroupTableRowProps {
  group: ApprovalGroup;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onEdit: (group: ApprovalGroup) => void;
  onDelete: (group: ApprovalGroup) => void;
}

export function ApprovalGroupTableRow({
  group,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: ApprovalGroupTableRowProps) {
  const ruleTypeColors = {
    ALL: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    ANY: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    SEQUENTIAL: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  return (
    <TableRow
      className={`table-glass-row group h-12 ${
        isSelected ? "table-glass-row-selected" : ""
      }`}
    >
      {/* Checkbox */}
      <TableCell className="w-[40px] py-2">
        <div className="flex items-center justify-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(group.id)}
            aria-label={`Select ${group.name}`}
            className="h-3.5 w-3.5"
          />
        </div>
      </TableCell>

      {/* Group Name */}
      <TableCell className="w-[280px] py-2">
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{group.name}</p>
          </div>
        </div>
      </TableCell>

      {/* Rule Type */}
      <TableCell className="w-[140px] py-2">
        <Badge
          variant="outline"
          className={`text-xs font-medium px-2 py-1 ${
            ruleTypeColors[group.ruleType as keyof typeof ruleTypeColors] ||
            "bg-muted/50 text-muted-foreground border-muted"
          }`}
        >
          {group.ruleType}
        </Badge>
      </TableCell>

      {/* Comment */}
      <TableCell className="w-[300px] py-2">
        <div className="max-w-xs">
          <p
            className="text-sm text-muted-foreground truncate"
            title={group.comment || ""}
          >
            {group.comment || "—"}
          </p>
        </div>
      </TableCell>

      {/* Approvers Count */}
      <TableCell className="w-[100px] py-2 text-center">
        <div className="flex items-center justify-center">
          <span className="text-sm font-medium">
            {group.approvers?.length || 0}
          </span>
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell className="w-[120px] py-2 pr-3">
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-muted/50 opacity-70 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[120px]">
              <DropdownMenuItem
                onClick={() => onEdit(group)}
                className="cursor-pointer text-xs"
              >
                <Edit className="mr-2 h-3 w-3" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(group)}
                className="text-destructive cursor-pointer text-xs"
              >
                <Trash2 className="mr-2 h-3 w-3" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
