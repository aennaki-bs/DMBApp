import { UserPlus, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UserTableEmpty() {
  return (
    <div className="p-12 text-center">
      <div className="bg-blue-900/20 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-900/30">
        <Users className="h-10 w-10 text-blue-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-medium text-blue-200 mb-2">No users found</h3>
      <p className="text-blue-400 max-w-md mx-auto mb-6">
        Try adjusting your search criteria or filters to find what you're
        looking for.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="bg-blue-900/30 border-blue-500/30 text-blue-200 hover:bg-blue-800/40"
        >
          <Search className="h-4 w-4 mr-1.5" />
          Clear Filters
        </Button>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
          <UserPlus className="h-4 w-4 mr-1.5" />
          Add New User
        </Button>
      </div>
    </div>
  );
}
