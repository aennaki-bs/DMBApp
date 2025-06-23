import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  Settings,
  Eye,
  MoreVertical,
  UserPlus,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { ApprovalGroup } from "@/models/approval";
import { cn } from "@/lib/utils";

interface ApprovalGroupTableRowProps {
  group: ApprovalGroup;
  isSelected: boolean;
  onSelectChange: (checked: boolean) => void;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  onManageApprovers: () => void;
}

export function ApprovalGroupTableRow({
  group,
  isSelected,
  onSelectChange,
  onEdit,
  onView,
  onDelete,
  onManageApprovers,
}: ApprovalGroupTableRowProps) {
  const handleRowClick = (event: React.MouseEvent) => {
    // Don't trigger row selection if clicking on action buttons or links
    const target = event.target as HTMLElement;
    const isActionElement = target.closest(
      'button, a, [role="button"], .dropdown-trigger'
    );

    if (!isActionElement) {
      onSelectChange(!isSelected);
    }
  };

  const getRuleTypeBadge = (ruleType: string) => {
    const config = {
      All: {
        color:
          "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
        label: "All",
      },
      Any: {
        color:
          "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
        label: "Any",
      },
      Sequential: {
        color:
          "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
        label: "Sequential",
      },
    };

    const rule = config[ruleType as keyof typeof config] || config.All;

    return (
      <Badge
        variant="outline"
        className={`${
          rule.color
        } text-xs font-medium px-2 py-1 transition-all duration-200 ${
          isSelected ? "opacity-90 shadow-sm" : ""
        }`}
      >
        {rule.label}
      </Badge>
    );
  };

  return (
    <TableRow
      className={`approval-table-layout transition-all duration-200 cursor-pointer select-none ${
        isSelected
          ? "bg-primary/10 border-primary/30 shadow-sm"
          : "hover:bg-muted/30"
      }`}
      onClick={handleRowClick}
    >
      {/* Selection Column */}
      <TableCell className="py-4 table-cell-center">
        <Checkbox
          enhanced={true}
          size="sm"
          checked={isSelected}
          onCheckedChange={onSelectChange}
          className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
        />
      </TableCell>

      {/* Group Name Column */}
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
              <Users className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div
              className={`text-sm font-medium truncate transition-colors duration-200 ${
                isSelected ? "text-primary" : "text-foreground"
              }`}
            >
              {group.name}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              ID: {group.id}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Rule Type Column */}
      <TableCell className="py-4 table-cell-center max-md:hidden">
        {getRuleTypeBadge(group.ruleType)}
      </TableCell>

      {/* Comment Column */}
      <TableCell className="py-4 table-cell-start max-md:hidden">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          {group.comment ? (
            <span className="text-sm truncate max-w-[200px]">
              {group.comment}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground italic">
              No comment
            </span>
          )}
        </div>
      </TableCell>

      {/* Approvers Column */}
      <TableCell className="py-4 table-cell-center">
        <Badge
          variant="secondary"
          className={`text-xs px-2 py-1 transition-colors duration-200 ${
            isSelected
              ? "bg-primary/20 text-primary border-primary/30"
              : "bg-primary/10 text-primary border-primary/20"
          }`}
        >
          <Users className="h-3 w-3 mr-1" />
          {group.approvers?.length || 0}
        </Badge>
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
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onManageApprovers();
              }}
              className="cursor-pointer"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Manage Approvers
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
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
}
