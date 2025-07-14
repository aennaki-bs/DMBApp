import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import responsibilityCentreService from "@/services/responsibilityCentreService";
import { ResponsibilityCentre, User } from "@/models/responsibilityCentre";
import { UserMinus, Search, X, Loader2, User as UserIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RemoveUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  centre: ResponsibilityCentre;
}

export function RemoveUsersDialog({
  open,
  onOpenChange,
  onSuccess,
  centre,
}: RemoveUsersDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const mountedRef = useRef(true);
  const { t } = useTranslation();

  // Reset mounted ref when component unmounts
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Fetch users assigned to this centre
  const fetchUsers = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      setIsLoadingUsers(true);
      
      // Get users directly assigned to this centre
      const assignedUsers = await responsibilityCentreService.getUsersByResponsibilityCentre(centre.id);
      
      if (!mountedRef.current) return;
      
      console.log(`Fetched ${assignedUsers.length} users for centre ${centre.code}:`, assignedUsers);
      setUsers(assignedUsers);
    } catch (error) {
      if (!mountedRef.current) return;
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch assigned users');
    } finally {
      if (mountedRef.current) {
        setIsLoadingUsers(false);
      }
    }
  }, [centre.id]);

  // Only fetch when dialog opens
  useEffect(() => {
    if (open && mountedRef.current) {
      fetchUsers();
      // Reset selections when dialog opens
      setSelectedUserIds([]);
      setSearchQuery("");
    }
  }, [open, fetchUsers]);

  // Memoized filtered users
  const filteredUsers = useMemo(() => {
    if (!users.length) return [];
    
    const query = searchQuery.toLowerCase().trim();
    if (!query) return users;
    
    return users.filter(user =>
      user.username?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  // Stable user toggle handler
  const handleUserToggle = useCallback((userId: number) => {
    if (!mountedRef.current) return;
    
    setSelectedUserIds(prev => {
      const isCurrentlySelected = prev.includes(userId);
      if (isCurrentlySelected) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  }, []);

  // Stable submit handler
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mountedRef.current) return;
    
    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one user to remove");
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await responsibilityCentreService.removeUsers(
        selectedUserIds
      );

      if (!mountedRef.current) return;

      // Check if there were any errors
      if (response.errors && response.errors.length > 0) {
        const successCount = response.usersSuccessfullyAssociated || (selectedUserIds.length - response.errors.length);
        toast.warning(`Removed ${successCount} of ${selectedUserIds.length} users. Some errors occurred.`);
        response.errors.forEach(error => {
          toast.error(error);
        });
      } else {
        toast.success(`Successfully removed ${selectedUserIds.length} user${selectedUserIds.length !== 1 ? 's' : ''} from ${centre.descr}`);
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      if (!mountedRef.current) return;
      console.error('Error removing users:', error);
      toast.error('Failed to remove users from responsibility centre');
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [selectedUserIds, centre.id, centre.descr, onSuccess, onOpenChange]);

  // Stable close handler
  const handleClose = useCallback(() => {
    if (!mountedRef.current) return;
    
    setSelectedUserIds([]);
    setSearchQuery("");
    onOpenChange(false);
  }, [onOpenChange]);

  // Stable search handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!mountedRef.current) return;
    setSearchQuery(e.target.value);
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-2xl max-h-[80vh] overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl"
        aria-describedby="dialog-description"
      >
        <DialogHeader className="space-y-3 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 dark:bg-red-400/10">
              <UserMinus className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">
                Remove Users
              </DialogTitle>
              <p id="dialog-description" className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Remove users from "{centre.descr}" responsibility centre
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Search Users
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by name, email, or username..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Selected Users Count */}
            {selectedUserIds.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  {selectedUserIds.length} user{selectedUserIds.length !== 1 ? 's' : ''} selected for removal
                </Badge>
              </div>
            )}

            {/* Users List */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Assigned Users ({filteredUsers.length})
              </Label>
              
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 max-h-64 overflow-y-auto">
                {isLoadingUsers ? (
                  <div className="p-4 space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                        <div className="flex-1 space-y-1">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse" />
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-8 text-center">
                    <UserIcon className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 dark:text-slate-400">
                      {searchQuery ? 'No users found matching your search' : 'No users assigned to this centre'}
                    </p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {filteredUsers.map((user) => {
                      const isSelected = selectedUserIds.includes(user.id);
                      
                      return (
                        <div
                          key={user.id}
                          className={cn(
                            "flex items-center space-x-3 p-3 rounded-md cursor-pointer transition-colors",
                            "hover:bg-white dark:hover:bg-slate-700",
                            isSelected && "bg-red-50 dark:bg-red-900/20"
                          )}
                          onClick={() => handleUserToggle(user.id)}
                        >
                          {/* Custom checkbox visual indicator */}
                          <div className={cn(
                            "h-4 w-4 rounded border flex items-center justify-center transition-all",
                            isSelected 
                              ? "bg-red-600 border-red-600 text-white" 
                              : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                          )}>
                            {isSelected && <Trash2 className="h-3 w-3" />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                {user.firstName || user.username} {user.lastName}
                              </p>
                              {user.role && (
                                <Badge variant="outline" className="text-xs">
                                  {user.role.roleName}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                              {user.email || user.username}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              Assigned to: {centre.descr}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || selectedUserIds.length === 0}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <UserMinus className="w-4 h-4 mr-2" />
                  Remove {selectedUserIds.length > 0 ? `${selectedUserIds.length} ` : ''}User{selectedUserIds.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 