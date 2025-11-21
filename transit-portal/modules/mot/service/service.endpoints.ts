import http from '@/modules/utils/axios';
import { IService, IServicePayload, IServiceFilters, IServiceStageExecution } from './service.types';

const serviceEndpoints = Object.freeze({
  getAll: '/Service/GetAll',
  getById: '/Service/GetById',
  create: '/Service/Create',
  createCustomer: '/Customer/services', // Customer creates service request
  update: '/Service/Update',
  delete: '/Service/Delete',
  updateStatus: '/Service/UpdateStatus',
  assign: '/Service/Assign', // Service assignment
  assignExecutor: '/Manager/AssignExecutor', // Manager assigns executor
  getStages: '/Service/GetStages',
  updateStageStatus: '/CaseExecutor/UpdateStageStatus', // CaseExecutor updates stage
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

export const assignService = (serviceId: number, userId: number, role: 'caseExecutor' | 'assessor'): Promise<Response> => {
  if (role === 'caseExecutor') {
    // Use Manager endpoint for case executor assignment
    return http.put({ 
      url: serviceEndpoints.assignExecutor, 
      data: { serviceId, caseExecutorId: userId } 
    });
  } else {
    // Use Service endpoint for assessor assignment
    return http.put({ 
      url: serviceEndpoints.assign, 
      data: { serviceId, userId, role } 
    });
  }
};

export const getServiceStages = (serviceId: number): Promise<Response> => {
  return http.get({ 
    url: `${serviceEndpoints.getStages}/${serviceId}` 
  });
};

export const updateStageStatus = (serviceId: number, stageId: number, status: number, notes?: string): Promise<Response> => {
  return http.put({ 
    url: serviceEndpoints.updateStageStatus, 
    data: { 
      serviceId, 
      stageId, 
      status, 
      comments: notes 
    } 
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

