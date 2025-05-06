
import { useState, useCallback } from 'react';
import { SubType } from '@/models/subtype';
import subTypeService from '@/services/subTypeService';
import { toast } from 'sonner';

export const useSubTypes = (documentTypeId: number) => {
  const [subTypes, setSubTypes] = useState<SubType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSubType, setSelectedSubType] = useState<SubType | null>(null);

  const fetchSubTypes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("useSubTypes: Calling subTypeService.getSubTypesByDocType with docTypeId:", documentTypeId);
      
      // Use the correct API endpoint
      const data = await subTypeService.getSubTypesByDocType(documentTypeId);
      console.log("useSubTypes: Received subtypes data:", data);
      setSubTypes(data);
    } catch (error: any) {
      console.error('Error fetching subtypes:', error);
      setError(error?.message || 'Failed to load subtypes');
      toast.error('Failed to load subtypes');
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
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating subtype:', error);
      toast.error('Failed to create subtype');
    }
  };

  const handleEdit = async (id: number, updatedData: any) => {
    try {
      await subTypeService.updateSubType(id, updatedData);
      toast.success('Subtype updated successfully');
      fetchSubTypes();
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating subtype:', error);
      toast.error('Failed to update subtype');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await subTypeService.deleteSubType(id);
      toast.success('Subtype deleted successfully');
      fetchSubTypes();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting subtype:', error);
      toast.error('Failed to delete subtype');
    }
  };

  return {
    subTypes,
    isLoading,
    error,
    createDialogOpen,
    setCreateDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedSubType,
    setSelectedSubType,
    fetchSubTypes,
    handleCreate,
    handleEdit,
    handleDelete
  };
};
