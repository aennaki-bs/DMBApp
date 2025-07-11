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
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t } = useTranslation();

  const handleStatusToggle = () => {
    setShowBlockDialog(true);
  };

  const confirmStatusToggle = () => {
    onToggleStatus(user.id, user.isActive);
    setShowBlockDialog(false);
  };

  const handleEdit = () => {
    console.log("Handling edit for user:", user);
    onEdit(user);
  };

  const handleRowClick = (event: React.MouseEvent) => {
    // Don't trigger row selection if clicking on action buttons, links, or switches
    const target = event.target as HTMLElement;
    const isActionElement = target.closest(
      'button, a, [role="button"], .dropdown-trigger, .switch, select, input'
    );

    if (!isActionElement) {
      onSelect(user.id);
    }
  };

  const handleSelectChange = (checked: boolean) => {
    onSelect(user.id);
  };

  return (
    <>
      <TableRow
        className={`transition-all duration-200 cursor-pointer select-none h-12 ${
          isSelected
            ? "bg-primary/10 border-primary/30 shadow-sm"
            : "hover:bg-muted/30"
        }`}
        onClick={handleRowClick}
        style={
          isSelected
            ? {
                borderLeft: "4px solid hsl(var(--primary))",
                background:
                  "linear-gradient(90deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.05) 100%)",
              }
            : {}
        }
      >
        <TableCell className="w-[40px] py-2">
          <div className="flex items-center justify-center">
            <Checkbox
              enhanced={true}
              size="sm"
              checked={isSelected}
              onCheckedChange={handleSelectChange}
              onClick={(e) => e.stopPropagation()}
              className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-auto"
              aria-label={`Select user ${user.username}`}
            />
          </div>
        </TableCell>
        <TableCell className="w-[40px] py-2">
          <Avatar className="border border-border/40 h-7 w-7">
            <AvatarImage src={user.profilePicture} alt={user.username} />
            <AvatarFallback
              className={`text-xs transition-all duration-200 ${
                isSelected
                  ? "bg-gradient-to-br from-primary/30 to-primary/20 text-primary-foreground"
                  : "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
              }`}
            >
              {user.firstName.charAt(0)}
              {user.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </TableCell>
        <TableCell className="w-[180px] py-2">
          <div
            className={`font-medium text-sm leading-tight transition-colors duration-200 ${
              isSelected ? "text-primary" : "text-foreground"
            }`}
          >
            {user.firstName} {user.lastName}
          </div>
          <div className="text-[10px] text-muted-foreground leading-tight">
            @{user.username}
          </div>
        </TableCell>
        <TableCell className="w-[250px] py-2">
          <span
            className={`block truncate text-sm transition-colors duration-200 ${
              isSelected ? "text-primary/90" : "text-foreground"
            }`}
          >
            {user.email}
          </span>
        </TableCell>

        <TableCell
          className="w-[130px] py-2"
          onClick={(e) => e.stopPropagation()}
        >
          <UserRoleSelect
            currentRole={currentRole}
            onRoleChange={(role) => onRoleChange(user.id, role)}
          />
        </TableCell>

        <TableCell className="w-[100px] py-2">
          {user.isActive ? (
            <Badge
              variant="secondary"
              className={`text-xs px-2 py-0.5 h-5 transition-colors duration-200 ${
                isSelected
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
              }`}
            >
              <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
              {t("userManagement.active")}
            </Badge>
          ) : (
            <Badge
              variant="destructive"
              className={`text-xs px-2 py-0.5 h-5 transition-colors duration-200 ${
                isSelected
                  ? "bg-red-500/20 text-red-400 border-red-500/40"
                  : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
              }`}
            >
              <XCircle className="w-2.5 h-2.5 mr-1" />
              {t("userManagement.inactive")}
            </Badge>
          )}
        </TableCell>

        <TableCell
          className="w-[80px] py-2"
          onClick={(e) => e.stopPropagation()}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Switch
                    checked={user.isActive}
                    onCheckedChange={handleStatusToggle}
                    className={`h-4 w-7 transition-all duration-200 ${
                      user.isActive
                        ? "bg-emerald-600 data-[state=checked]:bg-emerald-600"
                        : "bg-red-600 data-[state=unchecked]:bg-red-600"
                    }`}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {user.isActive
                  ? t("userManagement.blockUser")
                  : t("userManagement.unblockUser")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>

        <TableCell
          className="w-[70px] text-right py-2 pr-3"
          onClick={(e) => e.stopPropagation()}
        >
          <UserActionsDropdown
            user={user}
            onEdit={handleEdit}
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
