import api from './api/index';
import { 
  DocumentCircuitHistory, 
  ProcessCircuitRequest, 
  MoveDocumentStepRequest, 
  AssignCircuitRequest, 
  DocumentWorkflowStatus,
  MoveToNextStepRequest,
  DocumentStatus
} from '@/models/documentCircuit';

/**
 * Service for managing circuits
 */
const circuitService = {
  // Circuit endpoints
  getAllCircuits: async (): Promise<Circuit[]> => {
    const response = await api.get('/Circuit');
    return response.data;
  },

  getCircuitById: async (id: number): Promise<Circuit> => {
    const response = await api.get(`/Circuit/${id}`);
    return response.data;
  },

  createCircuit: async (circuit: Omit<Circuit, 'id' | 'circuitKey' | 'crdCounter'>): Promise<Circuit> => {
    const response = await api.post('/Circuit', circuit);
    return response.data;
  },

  updateCircuit: async (id: number, circuit: Circuit): Promise<void> => {
    await api.put(`/Circuit/${id}`, circuit);
  },

  deleteCircuit: async (id: number): Promise<void> => {
    await api.delete(`/Circuit/${id}`);
  },

  // Add this new method for circuit validation
  validateCircuit: async (circuitId: number): Promise<CircuitValidation> => {
    const response = await api.get(`/Circuit/${circuitId}/validation`);
    return response.data;
  },
  // Circuit Steps endpoints - these are part of the Circuit response now
  getCircuitDetailsByCircuitId: async (circuitId: number): Promise<CircuitDetail[]> => {
    if (circuitId === 0 || !circuitId) return [];
    
    try {
      // Get circuit with included steps directly from the circuit endpoint
      const response = await api.get(`/Circuit/${circuitId}`);
      
      // Map the steps array to match the CircuitDetail interface
      if (response.data && Array.isArray(response.data.steps)) {
        return response.data.steps.map((step: any) => ({
          id: step.id,
          circuitDetailKey: step.stepKey,
          circuitId: step.circuitId,
          title: step.title,
          descriptif: step.descriptif || '',
          orderIndex: step.orderIndex,
          responsibleRoleId: step.responsibleRoleId,
          responsibleRole: step.responsibleRole,
          isFinalStep: step.isFinalStep,
          createdAt: step.createdAt || new Date().toISOString(),
          updatedAt: step.updatedAt || new Date().toISOString(),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching circuit details:', error);
      throw error;
    }
  },

  createCircuitDetail: async (detail: Omit<CircuitDetail, 'id' | 'circuitDetailKey'>): Promise<CircuitDetail> => {
    // Convert to the Steps format expected by the API
    const stepData = {
      circuitId: detail.circuitId,
      title: detail.title,
      descriptif: detail.descriptif || '',
      orderIndex: detail.orderIndex,
      responsibleRoleId: detail.responsibleRoleId,
    };
    
    const response = await api.post(`/Circuit/${detail.circuitId}/steps`, stepData);
    
    // Map the response back to CircuitDetail format
    return {
      id: response.data.id,
      circuitDetailKey: response.data.stepKey,
      circuitId: response.data.circuitId,
      title: response.data.title,
      descriptif: response.data.descriptif || '',
      orderIndex: response.data.orderIndex,
      responsibleRoleId: response.data.responsibleRoleId,
      responsibleRole: response.data.responsibleRole,
      createdAt: response.data.createdAt || new Date().toISOString(),
      updatedAt: response.data.updatedAt || new Date().toISOString(),
    };
  },

  updateCircuitDetail: async (id: number, detail: CircuitDetail): Promise<void> => {
    // Convert to the Steps format expected by the API
    const stepData = {
      id: detail.id,
      stepKey: detail.circuitDetailKey,
      circuitId: detail.circuitId,
      title: detail.title,
      descriptif: detail.descriptif || '',
      orderIndex: detail.orderIndex,
      responsibleRoleId: detail.responsibleRoleId,
    };
    
    await api.put(`/Steps/${id}`, stepData);
  },

  deleteCircuitDetail: async (id: number): Promise<void> => {
    await api.delete(`/Steps/${id}`);
  },

  // Workflow endpoints for document circuit processing
  assignDocumentToCircuit: async (request: AssignCircuitRequest): Promise<void> => {
    await api.post('/Workflow/assign-circuit', request);
  },

  processCircuitStep: async (request: ProcessCircuitRequest): Promise<void> => {
    console.log('Processing circuit step with action:', request);
    await api.post('/Workflow/perform-action', request);
  },

  moveDocumentToStep: async (request: MoveDocumentStepRequest): Promise<void> => {
    console.log('Moving document to step:', request);
    await api.post('/Workflow/change-step', request);
  },

  moveDocumentToNextStep: async (request: { documentId: number, comments?: string }): Promise<void> => {
    console.log('Moving document to next step:', request);
    await api.post('/Workflow/move-next', {
      documentId: request.documentId,
      comments: request.comments
    });
  },

  returnToPreviousStep: async (request: { documentId: number, comments?: string }): Promise<void> => {
    console.log('Returning document to previous step:', request);
    await api.post('/Workflow/return-to-previous', request);
  },

  getDocumentCircuitHistory: async (documentId: number): Promise<DocumentCircuitHistory[]> => {
    if (!documentId) return [];
    const response = await api.get(`/Workflow/document/${documentId}/history`);
    return response.data;
  },

  getPendingDocuments: async (): Promise<any[]> => {
    const response = await api.get('/Workflow/pending-documents');
    return response.data;
  },
  
  getPendingApprovals: async (): Promise<any[]> => {
    // There's no specific pending-approvals endpoint, so we'll use pending-documents
    const response = await api.get('/Workflow/pending-documents');
    return response.data;
  },

  // Method to get document current status
  getDocumentCurrentStatus: async (documentId: number): Promise<DocumentWorkflowStatus> => {
    if (!documentId) throw new Error("Document ID is required");
    const response = await api.get(`/Workflow/document/${documentId}/current-status`);
    return response.data;
  },

  // Method to perform an action
  performAction: async (request: ProcessCircuitRequest): Promise<void> => {
    console.log('Performing action:', request);
    await api.post('/Workflow/perform-action', request);
  },
  
  // Method to get step statuses
  getStepStatuses: async (documentId: number): Promise<DocumentStatus[]> => {
    if (!documentId) return [];
    const response = await api.get(`/Workflow/document/${documentId}/step-statuses`);
    return response.data;
  },

  // Method to complete status
  completeStatus: async (data: { 
    documentId: number;
    statusId: number;
    isComplete: boolean;
    comments: string;
  }): Promise<void> => {
    await api.post('/Workflow/complete-status', data);
  },

  
};

export default circuitService;
