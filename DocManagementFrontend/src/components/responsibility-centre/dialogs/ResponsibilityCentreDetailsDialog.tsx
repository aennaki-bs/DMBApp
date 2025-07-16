import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResponsibilityCentre, User } from "@/models/responsibilityCentre";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, Users, FileText, CheckCircle2, XCircle, Calendar, User as UserIcon, Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useQuery } from "@tanstack/react-query";
import responsibilityCentreService from "@/services/responsibilityCentreService";

interface ResponsibilityCentreDetailsDialogProps {
  centre: ResponsibilityCentre | null;
  open: boolean;
  onClose: () => void;
}

export function ResponsibilityCentreDetailsDialog({
  centre,
  open,
  onClose,
}: ResponsibilityCentreDetailsDialogProps) {
  const { t } = useTranslation();

  // Fetch users associated with the centre
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['centre-users', centre?.id],
    queryFn: () => centre ? responsibilityCentreService.getUsersByResponsibilityCentre(centre.id) : Promise.resolve([]),
    enabled: !!centre?.id && open,
  });

  if (!centre) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleName = (role: any) => {
    if (!role) return '';
    if (typeof role === 'string') return role;
    if (typeof role === 'object' && role.roleName) return role.roleName;
    return '';
  };

  const UsersList = ({ users, isLoading }: { users: User[], isLoading: boolean }) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-muted-foreground">Loading users...</div>
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <UserIcon className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Users Assigned</h3>
          <p className="text-sm text-muted-foreground">
            This responsibility centre doesn't have any users assigned yet.
          </p>
        </div>
      );
    }

    return (
      <ScrollArea className="h-80">
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.profilePicture} alt={user.username} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.firstName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                  </h4>
                  <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  {user.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  )}
                  {getRoleName(user.role) && (
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-3 w-3" />
                      <span>{getRoleName(user.role)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            Responsibility Centre Details
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users ({users.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Centre Code
                  </div>
                  <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    {centre.code}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Description
                  </div>
                  <div className="text-slate-800 dark:text-slate-200">
                    {centre.descr || "No description provided"}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Status
                  </div>
                  <Badge
                    variant={centre.isActive ? "default" : "secondary"}
                    className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${centre.isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                  >
                    {centre.isActive ? (
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-1" />
                    )}
                    {centre.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                  Statistics
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Users</div>
                      <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {users.length}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Documents</div>
                      <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {centre.documentsCount || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                  Timestamps
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">Created:</span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {formatDate(centre.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">Updated:</span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {formatDate(centre.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground">Associated Users</h3>
                <Badge variant="secondary" className="text-sm">
                  {users.length} user{users.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              <UsersList users={users} isLoading={isLoadingUsers} />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 