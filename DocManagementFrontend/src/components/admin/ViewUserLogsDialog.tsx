
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import adminService from '@/services/adminService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface ViewUserLogsDialogProps {
  userId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewUserLogsDialog({ 
  userId, 
  open, 
  onOpenChange 
}: ViewUserLogsDialogProps) {
  const { data: logs, isLoading, isError } = useQuery({
    queryKey: ['user-logs', userId],
    queryFn: () => adminService.getUserLogs(userId),
    enabled: open,
  });

  const getActionTypeLabel = (actionType: number): string => {
    const actionTypes = {
      0: 'Logout',
      1: 'Login',
      2: 'Profile Create',
      3: 'Profile Update',
      4: 'Document Create',
      5: 'Document Update',
      6: 'Document Delete',
      7: 'Profile Create',
      8: 'Profile Update',
      9: 'Profile Delete'
    };
    
    return actionTypes[actionType as keyof typeof actionTypes] || `Action ${actionType}`;
  };

  const getActionColor = (actionType: number): string => {
    switch (actionType) {
      case 0: // Logout
        return 'bg-yellow-100 text-yellow-800';
      case 1: // Login
        return 'bg-purple-100 text-purple-800';
      case 2: // Profile Create
      case 7: // Profile Create (duplicate)
        return 'bg-green-100 text-green-800';
      case 3: // Profile Update
      case 8: // Profile Update (duplicate)
        return 'bg-blue-100 text-blue-800';
      case 4: // Document Create
        return 'bg-green-100 text-green-800';
      case 5: // Document Update
        return 'bg-blue-100 text-blue-800';
      case 6: // Document Delete
      case 9: // Profile Delete
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto bg-[#0a1033] border-blue-900/30 text-white">
        <DialogHeader>
          <DialogTitle>User Activity Logs</DialogTitle>
          <DialogDescription className="text-blue-300">
            View all activity logs for this user
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-10 text-blue-300">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
            Loading logs...
          </div>
        ) : isError ? (
          <div className="text-red-400 py-10 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Error loading activity logs
          </div>
        ) : logs && logs.length > 0 ? (
          <div className="rounded-md border border-blue-900/30">
            <Table>
              <TableHeader className="bg-blue-900/20">
                <TableRow className="border-blue-900/30 hover:bg-transparent">
                  <TableHead className="text-blue-300">Action</TableHead>
                  <TableHead className="text-blue-300">Timestamp</TableHead>
                  <TableHead className="text-blue-300">Description</TableHead>
                  <TableHead className="text-blue-300">User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className="border-blue-900/30 hover:bg-blue-900/10">
                    <TableCell>
                      <Badge className={getActionColor(log.actionType)}>
                        {getActionTypeLabel(log.actionType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {format(new Date(log.timestamp), 'PPpp')}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {log.description || '-'}
                    </TableCell>
                    <TableCell>
                      {log.user.username}
                      {log.user.role && (
                        <span className="text-xs text-gray-400 ml-2">
                          ({log.user.role})
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            No activity logs found for this user
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
