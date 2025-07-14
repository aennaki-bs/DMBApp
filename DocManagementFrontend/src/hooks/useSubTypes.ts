
import { useState, useCallback } from 'react';
import { SubType } from '@/models/subtype';
import subTypeService from '@/services/subTypeService';
import { toast } from 'sonner';

// Utility function to extract error messages from API responses
const extractErrorMessage = (error: any, defaultMessage: string): string => {
  if (error?.response?.data) {
    if (typeof error.response.data === 'string') {
      return error.response.data;
    } else if (error.response.data.message) {
      return error.response.data.message;
    } else if (error.response.data.title) {
      return error.response.data.title;
    } else if (error.response.data.errors) {
      // Handle validation errors
      const validationErrors = Object.values(error.response.data.errors).flat();
      return validationErrors.join(', ');
    }
  } else if (error?.message) {
    return error.message;
  }
  return defaultMessage;
};

export const useSubTypes = (documentTypeId: number) => {
  const [subTypes, setSubTypes] = useState<SubType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSubType, setSelectedSubType] = useState<SubType | null>(null);
  const [seriesUsageMap, setSeriesUsageMap] = useState<Record<number, { isUsed: boolean; documentCount: number }>>({});

  const fetchSubTypes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use the correct API endpoint
      const data = await subTypeService.getSubTypesByDocType(documentTypeId);
      setSubTypes(data);

      // Fetch usage information for all series
      if (data.length > 0) {
        const seriesIds = data.map(subType => subType.id).filter(id => id !== undefined) as number[];
        const usageMap = await subTypeService.checkMultipleSeriesUsage(seriesIds);
        setSeriesUsageMap(usageMap);
      } else {
        setSeriesUsageMap({});
      }
    } catch (error: any) {
      console.error('Error fetching subtypes:', error);
      setError(error?.message || 'Failed to load subtypes');
      toast.error('Failed to load subtypes');
      setSeriesUsageMap({});
    } finally {
      setIsLoading(false);
    }
  }, [documentTypeId]);

  const handleCreate = async (newSubType: any) => {
    try {
      await subTypeService.createSubType({
        ...newSubType,
        documentTypeId
      });
      toast.success('Subtype created successfully');
      fetchSubTypes();
    } catch (error: any) {
      console.error('Error creating subtype:', error);
      const errorMessage = extractErrorMessage(error, 'Failed to create subtype');

      toast.error(errorMessage, {
        duration: 5000,
        description: 'Please check your input and try again.'
      });
    }
  };

  const handleEdit = async (id: number, updatedData: any) => {
    try {
      await subTypeService.updateSubType(id, updatedData);
      toast.success('Subtype updated successfully');
      fetchSubTypes();
      setEditDialogOpen(false);
      return { success: true };
    } catch (error: any) {
      console.error('Error updating subtype:', error);
      const errorMessage = extractErrorMessage(error, 'Failed to update subtype');

      // Return the error message instead of showing toast
      return { success: false, error: errorMessage };
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // Check if series is in use before attempting to delete
      const usage = seriesUsageMap[id];
      if (usage && usage.isUsed) {
        toast.error(`Cannot delete series - it is being used by ${usage.documentCount} document(s)`, {
          duration: 5000,
          description: 'Please remove or update the documents using this series first.'
        });
        return;
      }

      await subTypeService.deleteSubType(id);
      toast.success('Subtype deleted successfully');
      fetchSubTypes();
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('Error deleting subtype:', error);
      const errorMessage = extractErrorMessage(error, 'Failed to delete subtype');

      toast.error(errorMessage, {
        duration: 5000,
        description: 'Please check if the subtype is being used by documents.'
      });
    }
  };

  // Helper function to check if a series is restricted (in use)
  const isSeriesRestricted = useCallback((seriesId: number): boolean => {
    const usage = seriesUsageMap[seriesId];
    return usage ? usage.isUsed : false;
  }, [seriesUsageMap]);

  // Helper function to get document count for a series
  const getSeriesDocumentCount = useCallback((seriesId: number): number => {
    const usage = seriesUsageMap[seriesId];
    return usage ? usage.documentCount : 0;
  }, [seriesUsageMap]);

  return {
    subTypes,
    isLoading,
    error,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedSubType,
    setSelectedSubType,
    fetchSubTypes,
    handleCreate,
    handleEdit,
    handleDelete,
    seriesUsageMap,
    isSeriesRestricted,
    getSeriesDocumentCount
  };
};
