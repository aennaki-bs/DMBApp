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
import { Search, RefreshCw, Users, X } from "lucide-react";
import { toast } from "sonner";
import responsibilityCentreService from "@/services/responsibilityCentreService";
import { ResponsibilityCentre, User } from "@/models/responsibilityCentre";

interface AssociateUsersDialogProps {
  centre: ResponsibilityCentre | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AssociateUsersDialog({
  centre,
  isOpen,
  onClose,
  onSuccess,
}: AssociateUsersDialogProps) {
  const [unassignedUsers, setUnassignedUsers] = useState<User[]>([]);
  const [currentUsers, setCurrentUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("unassigned");

  useEffect(() => {
    if (isOpen && centre) {
      fetchUsers();
    }
  }, [isOpen, centre]);

  const fetchUsers = async () => {
    if (!centre) return;

    setIsLoading(true);
    try {
      const [unassigned, current] = await Promise.all([
        responsibilityCentreService.getUnassignedUsers(),
        responsibilityCentreService.getUsersByResponsibilityCentre(centre.id),
      ]);

      setUnassignedUsers(unassigned);
      setCurrentUsers(current);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (users: User[]) => {
    const userIds = users.map((u) => u.id);
    if (selectedUsers.length === userIds.length) {
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

  const handleAssociateUsers = async () => {
    if (!centre || selectedUsers.length === 0) return;

    setIsLoading(true);
    try {
      await responsibilityCentreService.associateUsers(
        centre.id,
        selectedUsers
      );
      toast.success(`Successfully associated ${selectedUsers.length} users`);
      setSelectedUsers([]);
      await fetchUsers();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to associate users:", error);
      toast.error("Failed to associate users");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUnassignedUsers = unassignedUsers.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const filteredCurrentUsers = currentUsers.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  if (!centre) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Associate Users with Responsibility Centre
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Select users to associate with "{centre.code}"
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
                  <TabsTrigger value="unassigned">Unassigned Users</TabsTrigger>
                  <TabsTrigger value="current">Current Users</TabsTrigger>
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

              <TabsContent value="unassigned" className="flex-1 min-h-0 mt-0">
                <div className="border rounded-lg overflow-hidden h-full flex flex-col">
                  <div className="p-3 bg-muted/50 border-b flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={
                          selectedUsers.length ===
                            filteredUnassignedUsers.length &&
                          filteredUnassignedUsers.length > 0
                        }
                        onCheckedChange={() =>
                          handleSelectAll(filteredUnassignedUsers)
                        }
                      />
                      <span className="text-sm font-medium">
                        Select All ({filteredUnassignedUsers.length})
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {selectedUsers.length} Selected
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {filteredUnassignedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="p-3 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => handleSelectUser(user.id)}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {user.username} • {user.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredUnassignedUsers.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        No unassigned users found
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="current" className="flex-1 min-h-0 mt-0">
                <div className="border rounded-lg overflow-hidden h-full flex flex-col">
                  <div className="p-3 bg-muted/50 border-b flex-shrink-0">
                    <span className="text-sm font-medium">
                      Current Users ({filteredCurrentUsers.length})
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {filteredCurrentUsers.map((user) => (
                      <div
                        key={user.id}
                        className="p-3 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {user.username} • {user.email}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}

                    {filteredCurrentUsers.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        No users currently assigned
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Actions - Fixed at bottom */}
          <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0 bg-background">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAssociateUsers}
              disabled={selectedUsers.length === 0 || isLoading}
            >
              Associate {selectedUsers.length} Users
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
