import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableRow } from "@/components/ui/table";
import { UserDto } from "@/services/adminService";
import { UserActionsDropdown } from "./row/UserActionsDropdown";
import { UserRoleSelect } from "./row/UserRoleSelect";
import { BlockUserDialog } from "./row/BlockUserDialog";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UserTableRowProps {
  user: UserDto;
  isSelected: boolean;
  onSelect: (userId: number) => void;
  onToggleStatus: (userId: number, currentStatus: boolean) => void;
  onRoleChange: (userId: number, roleName: string) => void;
  onEdit: (user: UserDto) => void;
  onEditEmail: (user: UserDto) => void;
  onViewLogs: (userId: number) => void;
  onDelete: (userId: number) => void;
}

function getRoleString(
  role: string | { roleId?: number; roleName?: string }
): string {
  if (typeof role === "string") {
    return role;
  }

  if (role && typeof role === "object" && "roleName" in role) {
    return role.roleName || "Unknown";
  }

  return "Unknown";
}

export function UserTableRow({
  user,
  isSelected,
  onSelect,
  onToggleStatus,
  onRoleChange,
  onEdit,
  onEditEmail,
  onViewLogs,
  onDelete,
}: UserTableRowProps) {
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const currentRole = getRoleString(user.role);

  const handleStatusToggle = () => {
    setShowBlockDialog(true);
  };

  const confirmStatusToggle = () => {
    onToggleStatus(user.id, user.isActive);
    setShowBlockDialog(false);
  };

  return (
    <>
      <TableRow
        className={`border-blue-900/30 transition-all duration-150 ${
          isSelected
            ? "bg-blue-900/30 border-l-4 border-l-blue-500"
            : "hover:bg-blue-900/20"
        }`}
      >
        <TableCell>
          <div className="flex items-center justify-center">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(user.id)}
              aria-label={`Select user ${user.username}`}
              className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-500"
            />
          </div>
        </TableCell>
        <TableCell>
          <Avatar className="border-2 border-blue-900/50 h-9 w-9">
            <AvatarImage src={user.profilePicture} alt={user.username} />
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
              {user.firstName.charAt(0)}
              {user.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </TableCell>
        <TableCell>
          <div className="font-medium text-blue-100">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-xs text-blue-400">@{user.username}</div>
        </TableCell>
        <TableCell className="text-blue-200 max-w-[180px]">
          <span className="block truncate">{user.email}</span>
        </TableCell>

        <TableCell>
          <UserRoleSelect
            currentRole={currentRole}
            onRoleChange={(role) => onRoleChange(user.id, role)}
          />
        </TableCell>

        <TableCell>
          {user.isActive ? (
            <Badge
              variant="secondary"
              className="bg-emerald-900/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/30"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Active
            </Badge>
          ) : (
            <Badge
              variant="destructive"
              className="bg-red-900/20 text-red-300 border border-red-500/30 hover:bg-red-900/30"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              Inactive
            </Badge>
          )}
        </TableCell>

        <TableCell>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Switch
                    checked={user.isActive}
                    onCheckedChange={handleStatusToggle}
                    className={
                      user.isActive
                        ? "bg-emerald-600 data-[state=checked]:bg-emerald-600"
                        : "bg-red-600 data-[state=unchecked]:bg-red-600"
                    }
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-blue-900/90 text-blue-100 border-blue-500/30"
              >
                {user.isActive ? "Block User" : "Unblock User"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>

        <TableCell className="text-right">
          <UserActionsDropdown
            user={user}
            onEdit={onEdit}
            onEditEmail={onEditEmail}
            onViewLogs={onViewLogs}
            onDelete={onDelete}
          />
        </TableCell>
      </TableRow>

      <BlockUserDialog
        isOpen={showBlockDialog}
        onOpenChange={setShowBlockDialog}
        onConfirm={confirmStatusToggle}
        userName={`${user.firstName} ${user.lastName}`}
        isBlocked={user.isActive}
      />
    </>
  );
}
