
import { useAuth } from '@/context/AuthContext';
import { useCircuitList } from './hooks/useCircuitList';
import { CircuitListContent } from './CircuitListContent';

interface CircuitsListProps {
  onApiError?: (errorMessage: string) => void;
  searchQuery?: string;
}

export default function CircuitsList({ onApiError, searchQuery = '' }: CircuitsListProps) {
  const { user } = useAuth();
  const isSimpleUser = user?.role === 'SimpleUser';
  
  const {
    circuits,
    isLoading,
    isError,
    selectedCircuit,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    detailsDialogOpen,
    setDetailsDialogOpen,
    handleEdit,
    handleDelete,
    handleViewDetails,
    confirmDelete,
    refetch
  } = useCircuitList({ 
    onApiError, 
    searchQuery 
  });

  return (
    <CircuitListContent
      circuits={circuits}
      isLoading={isLoading}
      isError={isError}
      isSimpleUser={isSimpleUser}
      searchQuery={searchQuery}
      selectedCircuit={selectedCircuit}
      editDialogOpen={editDialogOpen}
      deleteDialogOpen={deleteDialogOpen}
      detailsDialogOpen={detailsDialogOpen}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onViewDetails={handleViewDetails}
      setEditDialogOpen={setEditDialogOpen}
      setDeleteDialogOpen={setDeleteDialogOpen}
      setDetailsDialogOpen={setDetailsDialogOpen}
      confirmDelete={confirmDelete}
      refetch={refetch}
    />
  );
}
