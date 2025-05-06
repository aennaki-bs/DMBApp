
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserDto } from "@/services/adminService";
import { Edit, Eye, Mail, MoreVertical, Trash } from "lucide-react";

interface UserActionsDropdownProps {
  user: UserDto;
  onEdit: (user: UserDto) => void;
  onEditEmail: (user: UserDto) => void;
  onViewLogs: (userId: number) => void;
  onDelete: (userId: number) => void;
}

export function UserActionsDropdown({
  user,
  onEdit,
  onEditEmail,
  onViewLogs,
  onDelete,
}: UserActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#161b22] border-gray-700 text-white">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem onClick={() => onEdit(user)} className="hover:bg-gray-800">
          <Edit className="mr-2 h-4 w-4" />
          Edit User
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEditEmail(user)} className="hover:bg-gray-800">
          <Mail className="mr-2 h-4 w-4" />
          Update Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onViewLogs(user.id)} className="hover:bg-gray-800">
          <Eye className="mr-2 h-4 w-4" />
          View Logs
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem 
          className="text-red-400 hover:bg-red-900/20 hover:text-red-300" 
          onClick={() => onDelete(user.id)}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
