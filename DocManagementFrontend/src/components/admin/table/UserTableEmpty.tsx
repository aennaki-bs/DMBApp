
import { UserPlus } from "lucide-react";

export function UserTableEmpty() {
  return (
    <div className="p-8 text-center">
      <UserPlus className="h-10 w-10 mx-auto mb-2 text-gray-500" />
      <p className="text-gray-400">No users found. Try adjusting your search or add new users.</p>
    </div>
  );
}
