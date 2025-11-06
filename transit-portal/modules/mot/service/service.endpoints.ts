import http from '@/modules/utils/axios';
import { IService, IServicePayload, IServiceFilters, IServiceStageExecution } from './service.types';

const serviceEndpoints = Object.freeze({
  getAll: '/Service/GetAll',
  getById: '/Service/GetById',
  create: '/Service/Create',
  createCustomer: '/Customer/services', // New endpoint for customer service creation
  update: '/Service/Update',
  delete: '/Service/Delete',
  updateStatus: '/Service/UpdateStatus',
  assign: '/Service/Assign',
  getStages: '/Service/GetStages',
  updateStageStatus: '/Service/UpdateStageStatus',
  getMyServices: '/Customer/services',
  getServiceDetails: '/Customer/services',
});

export const getAllServices = (filters?: IServiceFilters): Promise<Response> => {
  return http.get({ 
    url: serviceEndpoints.getAll, 
    params: filters 
  });
};

export const getServiceById = (id: number): Promise<Response> => {
  return http.get({ 
    url: `${serviceEndpoints.getById}/${id}` 
  });
};

export const createService = (payload: IServicePayload): Promise<Response> => {
  return http.post({ 
    url: serviceEndpoints.create, 
    data: payload 
  });
};

export const createCustomerService = (payload: IServicePayload): Promise<Response> => {
  return http.post({ 
    url: serviceEndpoints.createCustomer, 
    data: payload 
  });
};

export const updateService = (id: number, payload: Partial<IServicePayload>): Promise<Response> => {
  return http.put({ 
    url: `${serviceEndpoints.update}/${id}`, 
    data: payload 
  });
};

export const deleteService = (id: number): Promise<Response> => {
  return http.delete({ 
    url: `${serviceEndpoints.delete}/${id}` 
  });
};

export const updateServiceStatus = (id: number, status: number): Promise<Response> => {
  return http.put({ 
    url: `${serviceEndpoints.updateStatus}/${id}`, 
    data: { status } 
  });
};

export const assignService = (id: number, userId: number, role: 'caseExecutor' | 'assessor'): Promise<Response> => {
  return http.put({ 
    url: `${serviceEndpoints.assign}/${id}`, 
    data: { userId, role } 
  });
};

export const getServiceStages = (serviceId: number): Promise<Response> => {
  return http.get({ 
    url: `${serviceEndpoints.getStages}/${serviceId}` 
  });
};

export const updateStageStatus = (stageId: number, status: number, notes?: string): Promise<Response> => {
  return http.put({ 
    url: `${serviceEndpoints.updateStageStatus}/${stageId}`, 
    data: { status, notes } 
  });
};

export const getMyServices = (status?: number): Promise<Response> => {
  return http.get({ 
    url: serviceEndpoints.getMyServices, 
    params: status ? { status } : {} 
  });
};

export const getServiceDetails = (serviceId: number): Promise<Response> => {
  return http.get({ 
    url: `${serviceEndpoints.getServiceDetails}/${serviceId}` 
  });
};

