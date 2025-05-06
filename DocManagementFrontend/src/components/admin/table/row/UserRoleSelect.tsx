
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator
} from "@/components/ui/select";

interface UserRoleSelectProps {
  currentRole: string;
  onRoleChange: (roleName: string) => void;
}

function getAvailableRoles(currentRole: string): string[] {
  const allRoles = ["Admin", "FullUser", "SimpleUser"];
  return allRoles.filter(role => role !== currentRole);
}

export function UserRoleSelect({ currentRole, onRoleChange }: UserRoleSelectProps) {
  return (
    <Select 
      value={currentRole}
      onValueChange={onRoleChange}
    >
      <SelectTrigger className="w-[130px] bg-[#0a1033] border-blue-900/30 text-white">
        <SelectValue placeholder={currentRole} />
      </SelectTrigger>
      <SelectContent className="bg-[#0a1033] border-blue-900/30 text-white">
        <SelectItem 
          key={currentRole} 
          value={currentRole} 
          className="text-blue-400 bg-blue-900/20 border-l-2 border-blue-500"
        >
          {currentRole}
        </SelectItem>
        <SelectSeparator className="bg-blue-900/30" />
        {getAvailableRoles(currentRole).map(role => (
          <SelectItem 
            key={role} 
            value={role} 
            className="text-white hover:bg-blue-900/20"
          >
            {role}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
