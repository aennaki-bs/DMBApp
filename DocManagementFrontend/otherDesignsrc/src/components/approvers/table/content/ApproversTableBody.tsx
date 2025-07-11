import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  User,
  MessageSquare,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Settings,
} from "lucide-react";
import { Approver } from "@/hooks/useApprovers";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

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
  const handleRowClick = (approverId: number, event: React.MouseEvent) => {
    // Don't trigger row selection if clicking on action buttons or links
    const target = event.target as HTMLElement;
    const isActionElement = target.closest(
      'button, a, [role="button"], .dropdown-trigger'
    );

    if (!isActionElement) {
      const isSelected = selectedApprovers.includes(approverId);
      onSelectApprover(approverId, !isSelected);
    }
  };

  if (approvers.length === 0) {
    return (
      <TableBody>
        <TableRow className="hover:bg-transparent border-none approvers-table-layout">
          <TableCell
            colSpan={4}
            className="h-32 text-center py-8 col-span-full"
          >
            <div className="flex flex-col items-center justify-center space-y-3 text-muted-foreground">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  No approvers found
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Create your first approver to manage document workflows
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
      {approvers.map((approver) => {
        const isSelected = selectedApprovers.includes(approver.id);

        return (
          <TableRow
            key={approver.id}
            className={`approvers-table-layout transition-all duration-200 cursor-pointer select-none ${
              isSelected
                ? "bg-primary/10 border-primary/30 shadow-sm"
                : "hover:bg-muted/30"
            }`}
            onClick={(e) => handleRowClick(approver.id, e)}
          >
            {/* Selection Column */}
            <TableCell className="py-4 table-cell-center">
              <Checkbox
                enhanced={true}
                size="sm"
                checked={isSelected}
                onCheckedChange={(checked) =>
                  onSelectApprover(approver.id, checked as boolean)
                }
                className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
              />
            </TableCell>

            {/* Approver Name Column */}
            <TableCell className="py-4 table-cell-start">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="flex-shrink-0">
                  <div
                    className={`h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center transition-all duration-200 ${
                      isSelected
                        ? "from-primary/30 to-primary/20 border-primary/40 shadow-sm"
                        : ""
                    }`}
                  >
                    <User className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm font-medium truncate transition-colors duration-200 ${
                      isSelected ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {approver.username}
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    ID: {approver.userId}
                    {approver.stepTitle && (
                      <span className="ml-2 text-primary/70">
                        • {approver.stepTitle}
                      </span>
                    )}
                  </div>
                  {approver.allAssociations &&
                    approver.allAssociations.length > 1 && (
                      <div className="mt-1.5">
                        <Badge
                          variant="secondary"
                          className={`text-xs px-2 py-0.5 transition-colors duration-200 ${
                            isSelected
                              ? "bg-primary/20 text-primary border-primary/30"
                              : "bg-primary/10 text-primary border-primary/20"
                          }`}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          {approver.allAssociations.length} steps
                        </Badge>
                      </div>
                    )}
                </div>
              </div>
            </TableCell>

            {/* Comment Column */}
            <TableCell className="py-4 table-cell-start max-md:hidden">
              <div className="flex items-center gap-2 min-w-0">
                <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                {approver.comment ? (
                  <span className="text-sm truncate max-w-[200px] text-foreground">
                    {approver.comment}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground italic">
                    No comment
                  </span>
                )}
              </div>
            </TableCell>

            {/* Actions Column */}
            <TableCell className="py-4 table-cell-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-muted/50 dropdown-trigger"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(approver);
                    }}
                    className="cursor-pointer"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(approver);
                    }}
                    className="cursor-pointer"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(approver.id);
                    }}
                    className="text-destructive cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  );
}
