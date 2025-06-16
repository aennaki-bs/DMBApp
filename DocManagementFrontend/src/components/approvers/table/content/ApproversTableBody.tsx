import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  User,
  MessageSquare,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
} from "lucide-react";
import { Approver } from "@/hooks/useApprovers";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ApproversTableBodyProps {
  approvers: Approver[];
  selectedApprovers: number[];
  onSelectApprover: (approverId: number, checked: boolean) => void;
  onEdit: (approver: Approver) => void;
  onView: (approver: Approver) => void;
  onDelete: (approverId: number) => void;
}

export function ApproversTableBody({
  approvers,
  selectedApprovers,
  onSelectApprover,
  onEdit,
  onView,
  onDelete,
}: ApproversTableBodyProps) {
  return (
    <TableBody>
      {approvers.map((approver) => (
        <TableRow
          key={approver.id}
          className={`table-glass-row h-12 ${
            selectedApprovers.includes(approver.id)
              ? "table-glass-row-selected"
              : ""
          }`}
        >
          {/* Checkbox Column */}
          <TableCell className="w-[40px] py-2">
            <div className="flex items-center justify-center">
              <Checkbox
                checked={selectedApprovers.includes(approver.id)}
                onCheckedChange={(checked) =>
                  onSelectApprover(approver.id, checked as boolean)
                }
                aria-label={`Select ${approver.username}`}
                className="h-3.5 w-3.5"
              />
            </div>
          </TableCell>

          {/* Approver Name Column */}
          <TableCell className="w-[280px] py-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-medium truncate">{approver.username}</span>
            </div>
          </TableCell>

          {/* Comment Column */}
          <TableCell className="w-[400px] py-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              {approver.comment ? (
                <span className="truncate">{approver.comment}</span>
              ) : (
                <span className="text-muted-foreground text-sm italic">
                  No comment
                </span>
              )}
            </div>
          </TableCell>

          {/* Actions Column */}
          <TableCell className="w-[120px] py-2 text-right pr-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-muted/50"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onView(approver)}
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onEdit(approver)}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(approver.id)}
                  className="text-destructive cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}
