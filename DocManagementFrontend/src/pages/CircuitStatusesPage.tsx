import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import circuitService from '@/services/circuitService';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, AlertCircle, Network } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { StatusTable } from '@/components/statuses/StatusTable';
import { StatusFormDialog } from '@/components/statuses/dialogs/StatusFormDialog';
import { DeleteStatusDialog } from '@/components/statuses/dialogs/DeleteStatusDialog';
import { toast } from 'sonner';

export default function CircuitStatusesPage() {
  const { circuitId } = useParams<{ circuitId: string }>();
  const { user } = useAuth();
  const isSimpleUser = user?.role === 'SimpleUser';
  const queryClient = useQueryClient();
  
  const [apiError, setApiError] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<any | null>(null);

  // Fetch circuit details
  const { 
    data: circuit,
    isLoading: isCircuitLoading,
    isError: isCircuitError,
    refetch: refetchCircuit
  } = useQuery({
    queryKey: ['circuit', circuitId],
    queryFn: () => circuitService.getCircuitById(Number(circuitId)),
    enabled: !!circuitId
  });

  // Fetch statuses for the circuit
  const {
    data: statuses = [],
    isLoading: isStatusesLoading,
    isError: isStatusesError,
    refetch: refetchStatuses
  } = useQuery({
    queryKey: ['circuit-statuses', circuitId],
    queryFn: () => {
      if (circuit?.statuses) {
        return circuit.statuses;
      }
      return [];
    },
    enabled: !!circuit
  });

  // Handler to refresh all data after changes
  const handleRefreshData = async () => {
    try {
      // Invalidate all related queries to force a refresh
      await queryClient.invalidateQueries({ queryKey: ['circuit', circuitId] });
      await queryClient.invalidateQueries({ queryKey: ['circuit-statuses', circuitId] });
      
      // Refetch the data
      await refetchCircuit();
      await refetchStatuses();
      
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    }
  };

  // Handler logic for add/edit/delete
  const handleAddStatus = () => {
    if (circuit?.isActive) return; // Don't allow adding statuses if circuit is active
    setSelectedStatus(null);
    setFormDialogOpen(true);
  };

  const handleEditStatus = (status: any) => {
    if (circuit?.isActive) return; // Don't allow editing statuses if circuit is active
    setSelectedStatus(status);
    setFormDialogOpen(true);
  };

  const handleDeleteStatus = (status: any) => {
    if (circuit?.isActive) return; // Don't allow deleting statuses if circuit is active
    setSelectedStatus(status);
    setDeleteDialogOpen(true);
  };

  // Handle successful operations
  const handleOperationSuccess = () => {
    handleRefreshData();
  };
  
  const isLoading = isCircuitLoading || isStatusesLoading;
  const isError = isCircuitError || isStatusesError;

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-blue-900/30 rounded w-1/3"></div>
          <div className="h-4 bg-blue-900/30 rounded w-1/4"></div>
          <div className="h-64 bg-blue-900/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError || !circuit) {
    return (
      <div className="p-4 md:p-6">
        <Alert variant="destructive" className="mb-4 border-red-800 bg-red-950/50 text-red-300">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {apiError || 'Failed to load circuit statuses. Please try again later.'}
          </AlertDescription>
        </Alert>
        <Button variant="outline" asChild>
          <Link to="/circuits">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Circuits
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 overflow-x-hidden">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/circuits">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
            <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-blue-200 to-purple-200 text-transparent bg-clip-text truncate">
              {circuit.title} - Statuses
            </h1>
          </div>
          <p className="text-gray-400 mt-1 text-sm">
            Circuit: <span className="text-blue-300">{circuit.circuitKey}</span>
            {circuit.isActive && (
              <span className="ml-2 text-green-400 font-semibold">(Active Circuit)</span>
            )}
          </p>
        </div>
        
        <div className="flex space-x-2">
          {/* Steps Button */}
          {!isSimpleUser && (
            <Button 
              variant="outline"
              size="sm"
              className="border-blue-500/30 text-blue-300 hover:text-blue-200"
              asChild
            >
              <Link to={`/circuit/${circuit.id}/steps`}>
                <Network className="mr-2 h-4 w-4" /> Status Steps
              </Link>
            </Button>
          )}
          
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            className="border-blue-700/50 hover:bg-blue-900/20"
          >
            Refresh
          </Button>
          
          {!isSimpleUser && (
            circuit.isActive ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      className="bg-blue-500/50 text-blue-200 cursor-not-allowed"
                      disabled>
                      <Plus className="mr-2 h-4 w-4" /> Add Status
                      <AlertCircle className="ml-2 h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cannot add statuses to active circuit</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      onClick={handleAddStatus}>
                <Plus className="mr-2 h-4 w-4" /> Add Status
              </Button>
            )
          )}
        </div>
      </div>

      {/* Content */}
      {apiError && (
        <Alert variant="destructive" className="mb-4 border-red-800 bg-red-950/50 text-red-300">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {apiError}
          </AlertDescription>
        </Alert>
      )}
      <Card className="w-full shadow-md bg-[#111633]/70 border-blue-900/30">
        <CardHeader className="flex flex-row items-center justify-between border-b border-blue-900/30 bg-blue-900/20 p-3 sm:p-4">
          <CardTitle className="text-lg text-blue-100">Circuit Statuses</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <StatusTable 
            statuses={statuses}
            onEdit={handleEditStatus}
            onDelete={handleDeleteStatus}
            isCircuitActive={circuit.isActive}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      {!isSimpleUser && (
        <>
          <StatusFormDialog
            open={formDialogOpen}
            onOpenChange={setFormDialogOpen}
            onSuccess={handleOperationSuccess}
            status={selectedStatus}
            circuitId={Number(circuitId)}
          />
          <DeleteStatusDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            status={selectedStatus}
            onSuccess={handleOperationSuccess}
          />
        </>
      )}
    </div>
  );
} 