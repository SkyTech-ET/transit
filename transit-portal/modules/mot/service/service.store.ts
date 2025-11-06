import { create } from 'zustand';
import { notification } from 'antd';
import { 
  IService, 
  IServiceState, 
  IServiceActions, 
  IServicePayload, 
  IServiceFilters,
  ServiceStatus,
  StageStatus
} from './service.types';
import {
  getAllServices,
  getServiceById,
  createService,
  createCustomerService,
  updateService,
  deleteService,
  updateServiceStatus,
  assignService,
  getServiceStages,
  updateStageStatus,
  getMyServices,
  getServiceDetails
} from './service.endpoints';

const useServiceStore = create<IServiceState & IServiceActions>((set, get) => ({
  // State
  services: [],
  currentService: null,
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,

  // Actions
  getAllServices: async (filters?: IServiceFilters) => {
    set({ loading: true, error: null });
    try {
      const response = await getAllServices(filters);
      if (response?.data?.isError) {
        throw new Error(response.data.message || 'Failed to fetch services');
      }
      
      set({ 
        services: response?.data?.payload || [],
        totalCount: response?.data?.totalCount || 0,
        currentPage: filters?.page || 1,
        pageSize: filters?.pageSize || 10,
        loading: false 
      });
    } catch (error: any) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to fetch services',
        services: [], // Set empty array on error
        totalCount: 0
      });
      // Don't show notification for empty data, just log the error
      console.warn('Failed to fetch services:', error.message);
    }
  },

  getServiceById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await getServiceById(id);
      if (response?.data?.isError) {
        throw new Error(response.data.message || 'Failed to fetch service');
      }
      
      set({ 
        currentService: response?.data?.payload,
        loading: false 
      });
    } catch (error: any) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to fetch service' 
      });
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to fetch service',
      });
    }
  },

  createService: async (payload: IServicePayload) => {
    set({ loading: true, error: null });
    try {
      const response = await createService(payload);
      if (response?.data?.isError) {
        throw new Error(response.data.message || 'Failed to create service');
      }
      
      notification.success({
        message: 'Success',
        description: 'Service created successfully',
      });
      
      // Refresh services list
      await get().getAllServices();
      set({ loading: false });
    } catch (error: any) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to create service' 
      });
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to create service',
      });
    }
  },

  createCustomerService: async (payload: IServicePayload) => {
    set({ loading: true, error: null });
    try {
      const response = await createCustomerService(payload);
      if (response?.data?.isError) {
        throw new Error(response.data.message || 'Failed to create service');
      }
      
      notification.success({
        message: 'Success',
        description: 'Service request created successfully',
      });
      
      // Refresh customer services list
      await get().getMyServices();
      set({ loading: false });
    } catch (error: any) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to create service' 
      });
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to create service',
      });
    }
  },

  updateService: async (id: number, payload: Partial<IServicePayload>) => {
    set({ loading: true, error: null });
    try {
      const response = await updateService(id, payload);
      if (response?.data?.isError) {
        throw new Error(response.data.message || 'Failed to update service');
      }
      
      notification.success({
        message: 'Success',
        description: 'Service updated successfully',
      });
      
      // Refresh services list
      await get().getAllServices();
      set({ loading: false });
    } catch (error: any) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to update service' 
      });
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to update service',
      });
    }
  },

  deleteService: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await deleteService(id);
      if (response?.data?.isError) {
        throw new Error(response.data.message || 'Failed to delete service');
      }
      
      notification.success({
        message: 'Success',
        description: 'Service deleted successfully',
      });
      
      // Refresh services list
      await get().getAllServices();
      set({ loading: false });
    } catch (error: any) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to delete service' 
      });
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to delete service',
      });
    }
  },

  updateServiceStatus: async (id: number, status: ServiceStatus) => {
    set({ loading: true, error: null });
    try {
      const response = await updateServiceStatus(id, status);
      if (response?.data?.isError) {
        throw new Error(response.data.message || 'Failed to update service status');
      }
      
      notification.success({
        message: 'Success',
        description: 'Service status updated successfully',
      });
      
      // Refresh services list
      await get().getAllServices();
      set({ loading: false });
    } catch (error: any) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to update service status' 
      });
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to update service status',
      });
    }
  },

  assignService: async (id: number, userId: number, role: 'caseExecutor' | 'assessor') => {
    set({ loading: true, error: null });
    try {
      const response = await assignService(id, userId, role);
      if (response?.data?.isError) {
        throw new Error(response.data.message || 'Failed to assign service');
      }
      
      notification.success({
        message: 'Success',
        description: 'Service assigned successfully',
      });
      
      // Refresh services list
      await get().getAllServices();
      set({ loading: false });
    } catch (error: any) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to assign service' 
      });
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to assign service',
      });
    }
  },

  getServiceStages: async (serviceId: number) => {
    set({ loading: true, error: null });
    try {
      const response = await getServiceStages(serviceId);
      if (response?.data?.isError) {
        throw new Error(response.data.message || 'Failed to fetch service stages');
      }
      
      // Update current service with stages
      const currentService = get().currentService;
      if (currentService && currentService.id === serviceId) {
        set({ 
          currentService: {
            ...currentService,
            stages: response?.data?.payload || []
          },
          loading: false 
        });
      } else {
        set({ loading: false });
      }
    } catch (error: any) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to fetch service stages' 
      });
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to fetch service stages',
      });
    }
  },

  updateStageStatus: async (stageId: number, status: StageStatus, notes?: string) => {
    set({ loading: true, error: null });
    try {
      const response = await updateStageStatus(stageId, status, notes);
      if (response?.data?.isError) {
        throw new Error(response.data.message || 'Failed to update stage status');
      }
      
      notification.success({
        message: 'Success',
        description: 'Stage status updated successfully',
      });
      
      // Refresh service stages
      const currentService = get().currentService;
      if (currentService) {
        await get().getServiceStages(currentService.id);
      }
      set({ loading: false });
    } catch (error: any) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to update stage status' 
      });
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to update stage status',
      });
    }
  },

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  setCurrentService: (service: IService | null) => set({ currentService: service }),
}));

export default useServiceStore;

