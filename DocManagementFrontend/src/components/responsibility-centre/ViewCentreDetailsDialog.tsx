import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, FileText, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import responsibilityCentreService from "@/services/responsibilityCentreService";
import { ResponsibilityCentre, User } from "@/models/responsibilityCentre";

interface ViewCentreDetailsDialogProps {
  centre: ResponsibilityCentre | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewCentreDetailsDialog({
  centre,
  isOpen,
  onClose,
}: ViewCentreDetailsDialogProps) {
  const [associatedUsers, setAssociatedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && centre) {
      fetchAssociatedUsers();
    }
  }, [isOpen, centre]);

  const fetchAssociatedUsers = async () => {
    if (!centre) return;

    setIsLoading(true);
    try {
      const users =
        await responsibilityCentreService.getUsersByResponsibilityCentre(
          centre.id
        );
      setAssociatedUsers(users);
    } catch (error) {
      console.error("Failed to fetch associated users:", error);
      toast.error("Failed to load associated users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async (userId: number) => {
    try {
      await responsibilityCentreService.removeUsers([userId]);
      toast.success("User removed successfully");
      await fetchAssociatedUsers();
    } catch (error) {
      console.error("Failed to remove user:", error);
      toast.error("Failed to remove user");
    }
  };

  if (!centre) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Responsibility Centre Details
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            View and manage details for "{centre.code}"
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-6 flex-1 min-h-0 overflow-hidden">
          {/* Centre Information */}
          <div className="grid grid-cols-2 gap-6 flex-shrink-0">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Code
              </h3>
              <p className="text-lg font-semibold bg-muted/30 px-3 py-2 rounded-md">
                {centre.code}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Name
              </h3>
              <p className="text-lg bg-muted/30 px-3 py-2 rounded-md">
                {centre.descr}
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-6 flex-shrink-0">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Associated Users
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm px-3 py-2">
                  <Users className="w-4 h-4 mr-2" />
                  {centre.usersCount || 0} Users
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Documents
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm px-3 py-2">
                  <FileText className="w-4 h-4 mr-2" />
                  {centre.documentsCount || 0} Documents
                </Badge>
              </div>
            </div>
          </div>

          {/* Associated Users */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 className="text-lg font-semibold">Associated Users</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAssociatedUsers}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden flex-1 min-h-0 flex flex-col">
              {isLoading ? (
                <div className="p-8 text-center flex-1 flex items-center justify-center">
                  <div className="space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground">
                      Loading users...
                    </p>
                  </div>
                </div>
              ) : associatedUsers.length > 0 ? (
                <div className="flex-1 overflow-y-auto">
                  {associatedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {user.username} • {user.email}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveUser(user.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground flex-1 flex items-center justify-center">
                  <div className="space-y-2">
                    <Users className="w-12 h-12 mx-auto opacity-50" />
                    <p>No users currently assigned to this centre</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions - Fixed at bottom */}
          <div className="flex justify-end pt-4 border-t flex-shrink-0 bg-background">
            <Button onClick={onClose} className="min-w-[100px]">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
