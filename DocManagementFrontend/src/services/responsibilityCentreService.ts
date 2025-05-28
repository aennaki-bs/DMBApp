import api from './api/index';
import { 
  ResponsibilityCentre, 
  CreateResponsibilityCentreRequest, 
  UpdateResponsibilityCentreRequest, 
  ValidateResponsibilityCentreCodeRequest,
  ResponsibilityCentreSimple,
  User
} from '@/models/responsibilityCentre';

// Define interfaces for the associate users API
interface AssociateUsersToResponsibilityCentreRequest {
  responsibilityCentreId: number;
  userIds: number[];
}

interface UserAssociationResult {
  userId: number;
  userEmail: string;
  userName: string;
  success: boolean;
  errorMessage?: string;
  previousResponsibilityCentre?: string;
}

interface AssociateUsersToResponsibilityCentreResponse {
  responsibilityCentreId: number;
  responsibilityCentreCode: string;
  responsibilityCentreDescription: string;
  totalUsersRequested: number;
  usersSuccessfullyAssociated: number;
  errors?: string[];
  results?: UserAssociationResult[];
}

/**
 * Service for managing responsibility centres
 */
const responsibilityCentreService = {
  // Get all responsibility centres
  getAllResponsibilityCentres: async (): Promise<ResponsibilityCentre[]> => {
    const response = await api.get('/ResponsibilityCentre');
    return response.data;
  },

  // Get simplified list of responsibility centres (for dropdowns, etc.)
  getSimpleResponsibilityCentres: async (): Promise<ResponsibilityCentreSimple[]> => {
    const response = await api.get('/ResponsibilityCentre/simple');
    return response.data;
  },

  // Get a specific responsibility centre by ID
  getResponsibilityCentreById: async (id: number): Promise<ResponsibilityCentre> => {
    const response = await api.get(`/ResponsibilityCentre/${id}`);
    return response.data;
  },

  // Create a new responsibility centre
  createResponsibilityCentre: async (
    responsibilityCentre: CreateResponsibilityCentreRequest
  ): Promise<ResponsibilityCentre> => {
    const response = await api.post('/ResponsibilityCentre', responsibilityCentre);
    return response.data;
  },

  // Update an existing responsibility centre
  updateResponsibilityCentre: async (
    id: number,
    responsibilityCentre: UpdateResponsibilityCentreRequest
  ): Promise<void> => {
    await api.put(`/ResponsibilityCentre/${id}`, responsibilityCentre);
  },

  // Delete a responsibility centre
  deleteResponsibilityCentre: async (id: number): Promise<void> => {
    await api.delete(`/ResponsibilityCentre/${id}`);
  },

  // Validate a responsibility centre code
  validateResponsibilityCentreCode: async (
    request: ValidateResponsibilityCentreCodeRequest
  ): Promise<boolean> => {
    const response = await api.post('/ResponsibilityCentre/validate-code', request);
    return response.data;
  },

  // Activate a responsibility centre
  activateResponsibilityCentre: async (id: number): Promise<void> => {
    await api.put(`/ResponsibilityCentre/${id}/activate`);
  },

  // Deactivate a responsibility centre
  deactivateResponsibilityCentre: async (id: number): Promise<void> => {
    await api.put(`/ResponsibilityCentre/${id}/deactivate`);
  },

  // Associate users to a responsibility centre
  associateUsers: async (
    responsibilityCentreId: number,
    userIds: number[]
  ): Promise<AssociateUsersToResponsibilityCentreResponse> => {
    const request: AssociateUsersToResponsibilityCentreRequest = {
      responsibilityCentreId,
      userIds
    };
    const response = await api.post('/ResponsibilityCentre/associate-users', request);
    return response.data;
  },

  // Get users that can be associated with responsibility centers
  // This returns all users with their responsibility centre info
  getAvailableUsers: async (): Promise<User[]> => {
    // Use the actual User API endpoint
    const response = await api.get('/Admin/users');
    return response.data;
  },
  
  // Get users that are not associated with any responsibility centre
  getUnassignedUsers: async (): Promise<User[]> => {
    const response = await api.get('/Admin/users/unassigned');
    return response.data;
  },

  // Get users associated with a responsibility center
  // This now uses the direct center endpoint which includes users array
  getUsersByResponsibilityCentre: async (responsibilityCentreId: number): Promise<User[]> => {
    const response = await api.get(`/ResponsibilityCentre/${responsibilityCentreId}`);
    return response.data.users || [];
  },

  // Remove users from a responsibility centre
  removeUsers: async (
    userIds: number[]
  ): Promise<AssociateUsersToResponsibilityCentreResponse> => {
    const request = {
      userIds
    };
    const response = await api.post('/ResponsibilityCentre/remove-users', request);
    return response.data;
  }
};

export default responsibilityCentreService; 