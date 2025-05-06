
import CircuitsList from '@/components/circuits/CircuitsList';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, Lock, AlertCircle, Plus, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CreateCircuitDialog from '@/components/circuits/CreateCircuitDialog';

export default function CircuitsPage() {
  const { user } = useAuth();
  const [apiError, setApiError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const isSimpleUser = user?.role === 'SimpleUser';

  // For dialog open/close state and refetch trigger
  const [createOpen, setCreateOpen] = useState(false);
  const [refreshCircuits, setRefreshCircuits] = useState(0);

  // Clear any API errors when component mounts or when user changes
  useEffect(() => {
    setApiError('');
  }, [user]);

  // Function to handle API errors from child components
  const handleApiError = (errorMessage: string) => {
    setApiError(errorMessage);
  };

  // Refetch circuits list after creation
  const handleCircuitCreated = () => {
    setRefreshCircuits((c) => c + 1);
  };

  return (
    <div className="p-6 space-y-6">
      <CreateCircuitDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleCircuitCreated}
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-blue-200 to-purple-200 text-transparent bg-clip-text">Circuit Management</h1>
          <p className="text-gray-400">
            {isSimpleUser ? 'View document workflow circuits' : 'Create and manage document workflow circuits'}
          </p>
        </div>
        
        {!isSimpleUser && (
          <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> New Circuit
          </Button>
        )}
      </div>
      
      {apiError && (
        <Alert variant="destructive" className="mb-4 border-red-800 bg-red-950/50 text-red-300">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {apiError}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-blue-900/20 p-4 rounded-lg border border-blue-800/30">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Search className="h-4 w-4 text-blue-400" />
          <h2 className="text-blue-300 font-medium">Search Circuits</h2>
        </div>
        <div className="relative flex-1 max-w-xl w-full">
          <Input
            placeholder="Search by Code, title or description..."
            className="bg-[#0a1033]/80 border-blue-800/50 text-blue-100 pl-4 pr-10 focus:border-blue-500 focus:ring-blue-500/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <CircuitsList onApiError={handleApiError} searchQuery={searchQuery} key={refreshCircuits} />
    </div>
  );
}
