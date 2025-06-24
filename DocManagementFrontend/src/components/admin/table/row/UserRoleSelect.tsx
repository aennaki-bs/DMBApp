import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";

interface UserRoleSelectProps {
  currentRole: string;
  onRoleChange: (roleName: string) => void;
}

function getRoleIcon(role: string) {
  switch (role) {
    case "Admin":
      return (
        <ShieldAlert className="h-3.5 w-3.5 text-red-500 dark:text-red-400 mr-2" />
      );
    case "FullUser":
      return (
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 mr-2" />
      );
    case "SimpleUser":
      return (
        <Shield className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mr-2" />
      );
    default:
      return (
        <Shield className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 mr-2" />
      );
  }
}

function getRoleDisplayName(role: string) {
  switch (role) {
    case "Admin":
      return "Admin";
    case "FullUser":
      return "Full User";
    case "SimpleUser":
      return "Simple User";
    default:
      return role;
  }
}

function getRoleTriggerColor(role: string) {
  switch (role) {
    case "Admin":
      return "border-red-500/40 bg-red-500/10 text-red-400 hover:border-red-400/60 hover:bg-red-500/20";
    case "FullUser":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:border-emerald-400/60 hover:bg-emerald-500/20";
    case "SimpleUser":
      return "border-blue-500/40 bg-blue-500/10 text-blue-400 hover:border-blue-400/60 hover:bg-blue-500/20";
    default:
      return "border-gray-500/40 bg-gray-500/10 text-gray-400 hover:border-gray-400/60 hover:bg-gray-500/20";
  }
}

export function UserRoleSelect({
  currentRole,
  onRoleChange,
}: UserRoleSelectProps) {
  return (
    <Select value={currentRole} onValueChange={onRoleChange}>
      <SelectTrigger
        className={`w-[120px] h-8 text-xs font-medium backdrop-blur-sm transition-all duration-200 ${getRoleTriggerColor(
          currentRole
        )}`}
      >
        <div className="flex items-center">
          {getRoleIcon(currentRole)}
          <span className="truncate">{getRoleDisplayName(currentRole)}</span>
        </div>
      </SelectTrigger>
      <SelectContent
        className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-xl z-[200] min-w-[160px]"
        position="popper"
        sideOffset={5}
      >
        {["Admin", "FullUser", "SimpleUser"].map((role) => (
          <SelectItem
            key={role}
            value={role}
            className={`flex items-center px-3 py-2 cursor-pointer transition-colors duration-200 ${
              role === currentRole
                ? "bg-primary/20 text-primary font-medium"
                : "hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center w-full">
              {getRoleIcon(role)}
              <span>{getRoleDisplayName(role)}</span>
              {role === currentRole && (
                <div className="ml-auto w-2 h-2 rounded-full bg-primary"></div>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
