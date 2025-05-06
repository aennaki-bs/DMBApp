import api from './api';
import { toast } from 'sonner';

const stepService = {
  getAllSteps: async (): Promise<Step[]> => {
    try {
      const response = await api.get('/Steps');
      return response.data;
    } catch (error) {
      console.error('Error fetching steps:', error);
      toast.error('Failed to fetch steps');
      return [];
    }
  },

  getStepById: async (id: number): Promise<Step | null> => {
    try {
      const response = await api.get(`/Steps/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching step ${id}:`, error);
      toast.error('Failed to fetch step details');
      return null;
    }
  },

  getStepsByCircuitId: async (circuitId: number): Promise<Step[]> => {
    try {
      const response = await api.get(`/Circuit/${circuitId}`);
      return response.data.steps || [];
    } catch (error) {
      console.error(`Error fetching steps for circuit ${circuitId}:`, error);
      toast.error('Failed to fetch circuit steps');
      return [];
    }
  },

  createStep: async (step: CreateStepDto): Promise<Step | null> => {
    try {
      const response = await api.post(`/Circuit/${step.circuitId}/steps`, step);
      toast.success('Step created successfully');
      return response.data;
    } catch (error) {
      console.error('Error creating step:', error);
      toast.error('Failed to create step');
      return null;
    }
  },

  updateStep: async (id: number, step: UpdateStepDto): Promise<boolean> => {
    try {
      await api.put(`/Circuit/steps/${id}`, step);
      toast.success('Step updated successfully');
      return true;
    } catch (error) {
      console.error(`Error updating step ${id}:`, error);
      toast.error('Failed to update step');
      return false;
    }
  },

  deleteStep: async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/Circuit/steps/${id}`);
      toast.success('Step deleted successfully');
      return true;
    } catch (error) {
      console.error(`Error deleting step ${id}:`, error);
      toast.error('Failed to delete step');
      return false;
    }
  },

  deleteMultipleSteps: async (ids: number[]): Promise<boolean> => {
    try {
      // Sequentially delete steps as there might not be a bulk delete endpoint
      for (const id of ids) {
        await api.delete(`/Circuit/steps/${id}`);
      }
      toast.success(`Successfully deleted ${ids.length} steps`);
      return true;
    } catch (error) {
      console.error('Error deleting multiple steps:', error);
      toast.error('Failed to delete some or all steps');
      return false;
    }
  },
};

export default stepService;
