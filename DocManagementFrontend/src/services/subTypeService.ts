import api from './api';
import { SubType, CreateSubTypeDto, UpdateSubTypeDto } from '../models/subtype';

const subTypeService = {
  getAllSubTypes: async (): Promise<SubType[]> => {
    try {
      const response = await api.get('/SubType');
      return response.data;
    } catch (error) {
      console.error('Error fetching subtypes:', error);
      throw error;
    }
  },

  getSubType: async (id: number): Promise<SubType> => {
    try {
      const response = await api.get(`/SubType/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subtype with ID ${id}:`, error);
      throw error;
    }
  },

  getSubTypesByDocType: async (docTypeId: number): Promise<SubType[]> => {
    try {
      console.log(`Fetching subtypes for document type ID ${docTypeId} using correct endpoint`);
      const response = await api.get(`/SubType/by-document-type/${docTypeId}`);
      console.log('Subtypes response:', response);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subtypes for document type ${docTypeId}:`, error);
      throw error;
    }
  },

  getSubTypesForDate: async (docTypeId: number, date: Date | string): Promise<SubType[]> => {
    let formattedDate: string;
    if (date instanceof Date) {
      formattedDate = date.toISOString();
    } else {
      formattedDate = date;
    }
    
    try {
      const response = await api.get(`/SubType/for-date/${docTypeId}/${formattedDate}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subtypes for document type ${docTypeId} and date ${formattedDate}:`, error);
      throw error;
    }
  },

  createSubType: async (subType: CreateSubTypeDto): Promise<SubType> => {
    try {
      const response = await api.post('/SubType', subType);
      return response.data;
    } catch (error) {
      console.error('Error creating subtype:', error);
      throw error;
    }
  },

  updateSubType: async (id: number, subType: UpdateSubTypeDto): Promise<void> => {
    try {
      await api.put(`/SubType/${id}`, subType);
    } catch (error) {
      console.error(`Error updating subtype with ID ${id}:`, error);
      throw error;
    }
  },

  deleteSubType: async (id: number): Promise<void> => {
    try {
      await api.delete(`/SubType/${id}`);
    } catch (error) {
      console.error(`Error deleting subtype with ID ${id}:`, error);
      throw error;
    }
  }
};

export default subTypeService;
