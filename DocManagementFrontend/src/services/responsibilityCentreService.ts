import api from './api';
import {
  ResponsibilityCentre,
  ResponsibilityCentreSimple,
  CreateResponsibilityCentreRequest,
  UpdateResponsibilityCentreRequest,
  ValidateCodeRequest,
} from '@/models/responsibilityCentre';

const responsibilityCentreService = {
  // Get all responsibility centres
  getAll: async (): Promise<ResponsibilityCentre[]> => {
    const response = await api.get('/ResponsibilityCentre');
    return response.data;
  },

  // Get simple list for dropdowns
  getSimple: async (): Promise<ResponsibilityCentreSimple[]> => {
    const response = await api.get('/ResponsibilityCentre/simple');
    return response.data;
  },

  // Get responsibility centre by ID
  getById: async (id: number): Promise<ResponsibilityCentre> => {
    const response = await api.get(`/ResponsibilityCentre/${id}`);
    return response.data;
  },

  // Create new responsibility centre
  create: async (data: CreateResponsibilityCentreRequest): Promise<ResponsibilityCentre> => {
    const response = await api.post('/ResponsibilityCentre', data);
    return response.data;
  },

  // Update responsibility centre
  update: async (id: number, data: UpdateResponsibilityCentreRequest): Promise<void> => {
    await api.put(`/ResponsibilityCentre/${id}`, data);
  },

  // Delete responsibility centre
  delete: async (id: number): Promise<void> => {
    await api.delete(`/ResponsibilityCentre/${id}`);
  },

  // Validate code uniqueness
  validateCode: async (code: string): Promise<boolean> => {
    const response = await api.post('/ResponsibilityCentre/validate-code', { code });
    return response.data;
  },

  // Activate responsibility centre
  activate: async (id: number): Promise<void> => {
    await api.put(`/ResponsibilityCentre/${id}/activate`);
  },

  // Deactivate responsibility centre
  deactivate: async (id: number): Promise<void> => {
    await api.put(`/ResponsibilityCentre/${id}/deactivate`);
  },
};

export default responsibilityCentreService; 