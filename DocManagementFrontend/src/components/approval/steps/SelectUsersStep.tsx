import { useState, useEffect } from "react";
import { Check, Search, Users, X, UserRound, UserPlus, AlertTriangle, ArrowDown, ArrowUp, ListOrdered } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ApproverInfo } from "@/models/approval";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SelectUsersStepProps {
  availableUsers: ApproverInfo[];
  selectedUsers: ApproverInfo[];
  isLoading: boolean;
  isSequential?: boolean;
  onSelectedUsersChange: (users: ApproverInfo[]) => void;
}

export function SelectUsersStep({
  availableUsers,
  selectedUsers,
  isLoading,
  isSequential = false,
  onSelectedUsersChange,
}: SelectUsersStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<ApproverInfo[]>([]);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(availableUsers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = availableUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(query) ||
          user.role?.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, availableUsers]);

  const handleToggleUser = (user: ApproverInfo) => {
    const isSelected = selectedUsers.some((u) => u.userId === user.userId);

    if (isSelected) {
      // Remove user
      onSelectedUsersChange(
        selectedUsers.filter((u) => u.userId !== user.userId)
      );
    } else {
      // Add user
      onSelectedUsersChange([...selectedUsers, user]);
    }
  };

  const isUserSelected = (userId: number) => {
    return selectedUsers.some((user) => user.userId === userId);
  };

  const handleRemoveSelectedUser = (userId: number) => {
    onSelectedUsersChange(
      selectedUsers.filter((user) => user.userId !== userId)
    );
  };

  const moveUser = (userId: number, direction: 'up' | 'down') => {
    const index = selectedUsers.findIndex(u => u.userId === userId);
    if (index === -1) return;

    const newUsers = [...selectedUsers];
    if (direction === 'up' && index > 0) {
      // Swap with the user above
      [newUsers[index], newUsers[index - 1]] = [newUsers[index - 1], newUsers[index]];
      onSelectedUsersChange(newUsers);
    } else if (direction === 'down' && index < selectedUsers.length - 1) {
      // Swap with the user below
      [newUsers[index], newUsers[index + 1]] = [newUsers[index + 1], newUsers[index]];
      onSelectedUsersChange(newUsers);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Select Users</h3>
        <p className="text-sm text-muted-foreground">
          Choose users who will be part of this approval group
        </p>
      </div>

      {isSequential && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-semibold">Sequential approval selected.</span> The order of users below will determine the approval sequence. Use the arrows to change the order.
          </AlertDescription>
        </Alert>
      )}

      {/* Selected Users */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          {isSequential ? (
            <ListOrdered className="h-4 w-4 text-purple-500" />
          ) : (
            <UserRound className="h-4 w-4 text-blue-500" />
          )}
          {isSequential ? 'Users in Approval Order' : 'Selected Users'} ({selectedUsers.length})
        </Label>
        <div className="border rounded-md p-2 min-h-[60px] bg-muted/30">
          {selectedUsers.length === 0 ? (
            <div className="flex items-center justify-center h-[40px] text-sm text-muted-foreground">
              No users selected yet
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {selectedUsers.map((user, index) => (
                <div 
                  key={user.userId} 
                  className={`flex items-center justify-between p-2 rounded-md ${isSequential ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-muted/50'}`}
                >
                  <div className="flex items-center gap-2">
                    {isSequential && (
                      <span className="inline-flex justify-center items-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-600 text-xs font-semibold">
                        {index + 1}
                      </span>
                    )}
                    <span>{user.username}</span>
                    {user.role && (
                      <span className="text-xs text-muted-foreground">
                        ({user.role})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {isSequential && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full p-0 hover:bg-muted"
                          onClick={() => moveUser(user.userId, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                          <span className="sr-only">Move up</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full p-0 hover:bg-muted"
                          onClick={() => moveUser(user.userId, 'down')}
                          disabled={index === selectedUsers.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                          <span className="sr-only">Move down</span>
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full p-0 hover:bg-muted text-red-500 hover:text-red-600"
                      onClick={() => handleRemoveSelectedUser(user.userId)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            Available Users
          </Label>
          <div className="relative w-[220px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="border rounded-md">
          <ScrollArea className="h-[260px] rounded-md">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-4 rounded" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                {searchQuery.trim() !== "" ? (
                  <>
                    <Search className="h-8 w-8 mb-2 opacity-50" />
                    <p>No users found matching "{searchQuery}"</p>
                    <Button
                      variant="link"
                      onClick={() => setSearchQuery("")}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  </>
                ) : (
                  <>
                    <Users className="h-8 w-8 mb-2 opacity-50" />
                    <p>No users available</p>
                  </>
                )}
              </div>
            ) : (
              <div className="p-2">
                {filteredUsers.map((user) => {
                  const isSelected = isUserSelected(user.userId);
                  return (
                    <div
                      key={user.userId}
                      className={`flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors ${
                        isSelected ? "bg-muted" : ""
                      }`}
                      onClick={() => handleToggleUser(user)}
                    >
                      <Checkbox
                        checked={isSelected}
                        id={`user-${user.userId}`}
                        onCheckedChange={() => handleToggleUser(user)}
                        className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      />
                      <div className="flex flex-col min-w-0">
                        <Label
                          htmlFor={`user-${user.userId}`}
                          className="cursor-pointer font-medium text-sm"
                        >
                          {user.username}
                        </Label>
                        {user.role && (
                          <span className="text-xs text-muted-foreground truncate">
                            {user.role}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-blue-500 ml-auto" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
