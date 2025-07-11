import { useState } from 'react';
import { toast } from 'sonner';
import { circuitDeleteService, type DeleteOptions, type Circuit } from '@/services/circuitDeleteService';

export function useSmartDelete() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteCircuits = async (
    circuits: Circuit[], 
    options: DeleteOptions,
    onSuccess?: () => void
  ) => {
    if (isDeleting) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await circuitDeleteService.deleteCircuits(circuits, options);
      
      if (result.success) {
        if (result.deletedCount === circuits.length) {
          toast.success(
            `Successfully deleted ${result.deletedCount} circuit${result.deletedCount === 1 ? '' : 's'}`
          );
        } else {
          toast.warning(
            `Deleted ${result.deletedCount} of ${circuits.length} circuits. ${result.failedCount} failed.`
          );
        }
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const errorMessage = result.errors.length > 0 
          ? result.errors[0] 
          : 'Failed to delete circuits';
        setDeleteError(errorMessage);
        toast.error(errorMessage);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setDeleteError(errorMessage);
      toast.error(`Delete operation failed: ${errorMessage}`);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const clearError = () => {
    setDeleteError(null);
  };

  return {
    deleteCircuits,
    isDeleting,
    deleteError,
    clearError
  };
} 