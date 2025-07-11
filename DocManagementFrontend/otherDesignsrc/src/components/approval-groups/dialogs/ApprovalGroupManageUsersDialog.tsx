import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, RefreshCw, Users, X, UserPlus, UserMinus } from "lucide-react";
import { toast } from "sonner";
import approvalService from "@/services/approvalService";
import { ApprovalGroup, ApproverInfo } from "@/models/approval";

interface ApprovalGroupManageUsersDialogProps {
  group: ApprovalGroup | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApprovalGroupManageUsersDialog({
  group,
  isOpen,
  onClose,
  onSuccess,
}: ApprovalGroupManageUsersDialogProps) {
  const [availableUsers, setAvailableUsers] = useState<ApproverInfo[]>([]);
  const [currentUsers, setCurrentUsers] = useState<ApproverInfo[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("available");

  useEffect(() => {
    if (isOpen && group) {
      fetchUsers();
      setSelectedUsers([]);
      setSearchQuery("");
      setActiveTab("available");
    }
  }, [isOpen, group]);

  const fetchUsers = async () => {
    if (!group) return;

    setIsLoading(true);
    try {
      // Get all eligible approvers
      const allUsers = await approvalService.getEligibleApprovers();

      // Get current group members - these are in a different format from the ApprovalGroup
      // The group.approvers comes from the API and only has userId and username
      const currentMembers = group.approvers || [];

      // Convert current members to ApproverInfo format by adding an id field
      const currentMembersFormatted: ApproverInfo[] = currentMembers.map(
        (member) => ({
          id: member.userId, // Use userId as id for consistency
          userId: member.userId,
          username: member.username,
        })
      );

      // Filter available users (not currently in the group)
      const currentUserIds = currentMembers.map((u) => u.userId);
      const available = allUsers.filter(
        (user) => !currentUserIds.includes(user.userId)
      );

      setAvailableUsers(available);
      setCurrentUsers(currentMembersFormatted);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (users: ApproverInfo[]) => {
    const userIds = users.map((u) => u.userId);
    if (
      selectedUsers.length === userIds.length &&
      selectedUsers.every((id) => userIds.includes(id))
    ) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(userIds);
    }
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddUsers = async () => {
    if (!group || selectedUsers.length === 0) return;

    setIsLoading(true);
    try {
      // Add users one by one using the existing service method
      await Promise.all(
        selectedUsers.map((userId) =>
          approvalService.addUserToGroup(group.id, userId)
        )
      );

      // Enhanced success feedback
      toast.success(
        `Successfully added ${selectedUsers.length} user(s) to "${group.name}"`,
        {
          description: "The approval group table will refresh automatically.",
          duration: 4000,
        }
      );

      setSelectedUsers([]);
      await fetchUsers();
      onSuccess(); // Trigger parent refresh
    } catch (error) {
      console.error("Failed to add users:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add users to group";

      toast.error("Failed to add users to group", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUsers = async () => {
    if (!group || selectedUsers.length === 0) return;

    setIsLoading(true);
    try {
      // Remove users one by one using the existing service method
      await Promise.all(
        selectedUsers.map((userId) =>
          approvalService.removeUserFromGroup(group.id, userId)
        )
      );

      // Enhanced success feedback
      toast.success(
        `Successfully removed ${selectedUsers.length} user(s) from "${group.name}"`,
        {
          description: "The approval group table will refresh automatically.",
          duration: 4000,
        }
      );

      setSelectedUsers([]);
      await fetchUsers();
      onSuccess(); // Trigger parent refresh
    } catch (error) {
      console.error("Failed to remove users:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to remove users from group";

      toast.error("Failed to remove users from group", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAvailableUsers = availableUsers.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCurrentUsers = currentUsers.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!group) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Approvers in Group
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Manage users in approval group "{group.name}"
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
          {/* Search */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <div className="flex-1 min-h-0 flex flex-col">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 min-h-0 flex flex-col"
            >
              <div className="flex items-center justify-between flex-shrink-0 mb-4">
                <TabsList className="grid w-fit grid-cols-2">
                  <TabsTrigger value="available">Available Users</TabsTrigger>
                  <TabsTrigger value="current">Current Members</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchUsers}
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                  {selectedUsers.length > 0 && (
                    <Badge variant="secondary">
                      {selectedUsers.length} Selected
                    </Badge>
                  )}
                </div>
              </div>

              <TabsContent value="available" className="flex-1 min-h-0 mt-0">
                <div className="border rounded-lg overflow-hidden h-full flex flex-col">
                  <div className="p-3 bg-muted/50 border-b flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={
                          selectedUsers.length ===
                            filteredAvailableUsers.length &&
                          filteredAvailableUsers.length > 0 &&
                          selectedUsers.every((id) =>
                            filteredAvailableUsers.some((u) => u.userId === id)
                          )
                        }
                        onCheckedChange={() =>
                          handleSelectAll(filteredAvailableUsers)
                        }
                      />
                      <span className="text-sm font-medium">
                        Select All ({filteredAvailableUsers.length})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedUsers.length} Selected
                      </span>
                      {selectedUsers.length > 0 && (
                        <Button
                          size="sm"
                          onClick={handleAddUsers}
                          disabled={isLoading}
                          className="h-7"
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {filteredAvailableUsers.map((user) => (
                      <div
                        key={user.userId}
                        className="p-3 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedUsers.includes(user.userId)}
                            onCheckedChange={() =>
                              handleSelectUser(user.userId)
                            }
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {user.username}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              User ID: {user.userId}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredAvailableUsers.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        {searchQuery
                          ? "No matching users found"
                          : "No available users to add"}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="current" className="flex-1 min-h-0 mt-0">
                <div className="border rounded-lg overflow-hidden h-full flex flex-col">
                  <div className="p-3 bg-muted/50 border-b flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={
                          selectedUsers.length ===
                            filteredCurrentUsers.length &&
                          filteredCurrentUsers.length > 0 &&
                          selectedUsers.every((id) =>
                            filteredCurrentUsers.some((u) => u.userId === id)
                          )
                        }
                        onCheckedChange={() =>
                          handleSelectAll(filteredCurrentUsers)
                        }
                      />
                      <span className="text-sm font-medium">
                        Select All ({filteredCurrentUsers.length})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedUsers.length} Selected
                      </span>
                      {selectedUsers.length > 0 && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={handleRemoveUsers}
                          disabled={isLoading}
                          className="h-7"
                        >
                          <UserMinus className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {filteredCurrentUsers.map((user) => (
                      <div
                        key={user.userId}
                        className="p-3 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedUsers.includes(user.userId)}
                            onCheckedChange={() =>
                              handleSelectUser(user.userId)
                            }
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {user.username}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              User ID: {user.userId}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredCurrentUsers.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        {searchQuery
                          ? "No matching members found"
                          : "No members in this group"}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer actions */}
          <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
