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
import { UserPlus, Search, X, Loader2, User as UserIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssociateUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  centre: ResponsibilityCentre;
}

export function AssociateUsersDialog({
  open,
  onOpenChange,
  onSuccess,
  centre,
}: AssociateUsersDialogProps) {
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

  // Fetch users - stable function without dependencies
  const fetchUsers = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      setIsLoadingUsers(true);
      
      // Get all users and filter out those already assigned to ANY centre
      const allUsers = await responsibilityCentreService.getAvailableUsers();
      
      if (!mountedRef.current) return;
      
      // Filter out users already associated with ANY responsibility centre
      // Only show users who are not currently assigned to any centre
      const availableUsers = allUsers.filter(user => 
        !user.responsibilityCentre || user.responsibilityCentre.id === null || user.responsibilityCentre.id === undefined
      );
      
      setUsers(availableUsers);
    } catch (error) {
      if (!mountedRef.current) return;
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      if (mountedRef.current) {
        setIsLoadingUsers(false);
      }
    }
  }, []);

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
      toast.error("Please select at least one user to associate");
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await responsibilityCentreService.associateUsers(
        centre.id, 
        selectedUserIds
      );

      if (!mountedRef.current) return;

      // Check if there were any errors
      if (response.errors && response.errors.length > 0) {
        toast.warning(`Associated ${response.usersSuccessfullyAssociated} of ${response.totalUsersRequested} users. Some errors occurred.`);
        response.errors.forEach(error => {
          toast.error(error);
        });
      } else {
        toast.success(`Successfully associated ${response.usersSuccessfullyAssociated} users to ${centre.descr}`);
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      if (!mountedRef.current) return;
      console.error('Error associating users:', error);
      toast.error('Failed to associate users to responsibility centre');
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 dark:bg-blue-400/10">
              <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">
                Associate Users
              </DialogTitle>
              <p id="dialog-description" className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Associate users with "{centre.descr}" responsibility centre
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
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {selectedUserIds.length} user{selectedUserIds.length !== 1 ? 's' : ''} selected
                </Badge>
              </div>
            )}

            {/* Users List */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Available Users ({filteredUsers.length})
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
                      {searchQuery ? 'No users found matching your search' : 'No available users to associate'}
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
                            isSelected && "bg-blue-50 dark:bg-blue-900/20"
                          )}
                          onClick={() => handleUserToggle(user.id)}
                        >
                          {/* Custom checkbox visual indicator */}
                          <div className={cn(
                            "h-4 w-4 rounded border flex items-center justify-center transition-all",
                            isSelected 
                              ? "bg-blue-600 border-blue-600 text-white" 
                              : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                          )}>
                            {isSelected && <Check className="h-3 w-3" />}
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
                              Available for assignment
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
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Associating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Associate {selectedUserIds.length > 0 ? `${selectedUserIds.length} ` : ''}User{selectedUserIds.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 