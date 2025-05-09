import { DocumentWorkflowStatus } from '@/models/documentCircuit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircleCheck, CircleAlert, Clock, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import circuitService from '@/services/circuitService';
import { toast } from 'sonner';

interface DocumentStatusCardProps {
  workflowStatus: DocumentWorkflowStatus;
  onStatusChange?: () => void;
}

export function DocumentStatusCard({ workflowStatus, onStatusChange }: DocumentStatusCardProps) {
  const { status, statusText, currentStatusTitle, currentStatusId, isCircuitCompleted } = workflowStatus;
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Get the current status full details
  const currentStatusDetails = (workflowStatus.statuses || []).find(s => s.statusId === currentStatusId);
  
  // Determine status type for styling
  const getStatusColor = () => {
    if (isCircuitCompleted) return "bg-green-900/20 border-green-700/30";
    if (status === 3) return "bg-red-900/20 border-red-700/30"; // Rejected
    if (status === 1) return "bg-blue-900/20 border-blue-700/30"; // In progress
    return "bg-gray-900/20 border-gray-700/30"; // Default
  };

  const getStatusBadge = () => {
    if (isCircuitCompleted) return <Badge className="bg-green-700">Completed</Badge>;
    if (status === 3) return <Badge className="bg-red-700">Rejected</Badge>;
    if (status === 1) return <Badge className="bg-blue-700">In Progress</Badge>;
    return <Badge variant="outline">Draft</Badge>;
  };

  const getStatusIcon = () => {
    if (isCircuitCompleted) return <CircleCheck className="h-7 w-7 text-green-500" />;
    if (status === 3) return <CircleAlert className="h-7 w-7 text-red-500" />;
    if (status === 1) return <Clock className="h-7 w-7 text-blue-500" />;
    return <Info className="h-7 w-7 text-gray-500" />;
  };

  // Handle the status completion toggle
  const handleCompleteStatusToggle = async (checked: boolean) => {
    if (!currentStatusId || !workflowStatus.documentId) return;
    
    setIsUpdating(true);
    try {
      await circuitService.completeStatus({
        documentId: workflowStatus.documentId,
        statusId: currentStatusId,
        isComplete: checked,
        comments: `Status ${currentStatusTitle} marked as ${checked ? 'complete' : 'incomplete'}`
      });
      
      toast.success(`Status marked as ${checked ? 'complete' : 'incomplete'}`);
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error('Error updating status completion:', error);
      
      // Display a more user-friendly error message
      const errorMessage = error.response?.data || 'Failed to update status';
      toast.error(`Could not update status: ${errorMessage}`);
      
      // No need to manually revert the checkbox as the parent component
      // will refresh with the correct state via onStatusChange()
      if (onStatusChange) {
        onStatusChange();
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className={`${getStatusColor()} overflow-hidden border-b border-t border-l border-r`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-white">Document Status</CardTitle>
            <CardDescription className="text-zinc-400">
              Current status information
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {getStatusIcon()}
          </div>
          <div className="space-y-2 flex-1">
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-white tracking-tight">
                {currentStatusTitle || 'No Status'}
              </h3>
              <p className="text-sm text-gray-400">
                {statusText}
              </p>
            </div>
            
            {currentStatusDetails && (
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                {currentStatusDetails.description && (
                  <div className="col-span-2">
                    <p className="text-gray-300">{currentStatusDetails.description}</p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Type:</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex gap-1">
                          {currentStatusDetails.isInitial && (
                            <Badge variant="outline" className="bg-blue-900/20 border-blue-700/30 text-blue-400">
                              Initial
                            </Badge>
                          )}
                          {currentStatusDetails.isFinal && (
                            <Badge variant="outline" className="bg-green-900/20 border-green-700/30 text-green-400">
                              Final
                            </Badge>
                          )}
                          {currentStatusDetails.isFlexible && (
                            <Badge variant="outline" className="bg-purple-900/20 border-purple-700/30 text-purple-400">
                              Flexible
                            </Badge>
                          )}
                          {!currentStatusDetails.isInitial && !currentStatusDetails.isFinal && !currentStatusDetails.isFlexible && (
                            <Badge variant="outline">Regular</Badge>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Status Type</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Required:</span>
                  <Badge variant={currentStatusDetails.isRequired ? "default" : "outline"} className="h-5">
                    {currentStatusDetails.isRequired ? "Yes" : "No"}
                  </Badge>
                </div>
                
                {/* Complete status checkbox */}
                <div className="col-span-2 mt-3 flex items-center space-x-2">
                  <Checkbox 
                    id="status-complete"
                    checked={isCircuitCompleted}
                    onCheckedChange={handleCompleteStatusToggle}
                    disabled={isUpdating}
                  />
                  <label
                    htmlFor="status-complete"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Mark status as complete
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
