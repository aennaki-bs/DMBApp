import api from './api';
import {
  ResponsibilityCentreSimple,
  ResponsibilityCentre,
} from '@/models/responsibilityCentre';

const responsibilityCentreService = {
  // Get simple list for dropdowns
  getSimple: async (): Promise<ResponsibilityCentreSimple[]> => {
    const response = await api.get('/ResponsibilityCentre/simple');
    return response.data;
  },

  // Get all responsibility centres with full data including users
  getAll: async (): Promise<ResponsibilityCentre[]> => {
    const response = await api.get('/ResponsibilityCentre');
    return response.data;
  },

  // Get single responsibility centre with full data including users
  getById: async (id: number): Promise<ResponsibilityCentre> => {
    const response = await api.get(`/ResponsibilityCentre/${id}`);
    return response.data;
  },
};

export default responsibilityCentreService; 