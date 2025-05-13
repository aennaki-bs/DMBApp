import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import { Shield, ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";

interface UserRoleSelectProps {
  currentRole: string;
  onRoleChange: (roleName: string) => void;
}

function getAvailableRoles(currentRole: string): string[] {
  const allRoles = ["Admin", "FullUser", "SimpleUser"];
  return allRoles.filter((role) => role !== currentRole);
}

function getRoleIcon(role: string) {
  switch (role) {
    case "Admin":
      return <ShieldAlert className="h-3.5 w-3.5 text-red-400 mr-1.5" />;
    case "FullUser":
      return <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 mr-1.5" />;
    case "SimpleUser":
      return <Shield className="h-3.5 w-3.5 text-blue-400 mr-1.5" />;
    default:
      return <ShieldQuestion className="h-3.5 w-3.5 text-gray-400 mr-1.5" />;
  }
}

function getRoleColor(role: string) {
  switch (role) {
    case "Admin":
      return "text-red-300 bg-red-900/20 border-red-500/30";
    case "FullUser":
      return "text-emerald-300 bg-emerald-900/20 border-emerald-500/30";
    case "SimpleUser":
      return "text-blue-300 bg-blue-900/20 border-blue-500/30";
    default:
      return "text-gray-300 bg-gray-900/20 border-gray-500/30";
  }
}

export function UserRoleSelect({
  currentRole,
  onRoleChange,
}: UserRoleSelectProps) {
  return (
    <Select value={currentRole} onValueChange={onRoleChange}>
      <SelectTrigger
        className={`w-[130px] bg-gradient-to-r from-[#1a2c6b]/50 to-[#0a1033]/50 border-blue-900/30 text-blue-100 hover:border-blue-500/40 transition-all duration-150 shadow-sm ${
          currentRole === "Admin"
            ? "border-red-500/30"
            : currentRole === "FullUser"
            ? "border-emerald-500/30"
            : "border-blue-500/30"
        }`}
      >
        <div className="flex items-center">
          {getRoleIcon(currentRole)}
          <SelectValue placeholder={currentRole} />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-blue-100 rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95 duration-100">
        <SelectItem
          key={currentRole}
          value={currentRole}
          className={`flex items-center ${getRoleColor(
            currentRole
          )} border-l-2 rounded-md mb-1`}
        >
          {/* {getRoleIcon(currentRole)} */}
          {currentRole}
        </SelectItem>
        <SelectSeparator className="bg-blue-900/30 my-1" />
        {getAvailableRoles(currentRole).map((role) => (
          <SelectItem
            key={role}
            value={role}
            className="flex items-center text-blue-200 hover:bg-blue-900/30 rounded-md"
          >
            {/* {getRoleIcon(role)} */}
            {role}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
