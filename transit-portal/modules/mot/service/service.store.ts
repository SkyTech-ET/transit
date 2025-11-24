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
  getAllServices: async () => {
  set({ loading: true, error: null });

  try {
    const raw = await getAllServices();
    const array = Array.isArray(raw) ? raw : [];

    const services = array.map((s) => ({
      ...s,
      serviceType: s.serviceType === 1 ? "Multimodal" : "Unimodal",
      status:
        s.status === 0 ? "Draft" :
        s.status === 1 ? "NotStarted" :
        s.status === 2 ? "Pending" :
        s.status === 3 ? "Completed" :
        "Draft",
      riskLevel:
        s.riskLevel === 0 ? "Blue" :
        s.riskLevel === 1 ? "Yellow" :
        "Red",
    }));

    set({
      services,
      totalCount: services.length,
      loading: false
    });

  } catch (error: any) {
    console.error("Failed to load services:", error);

    set({
      services: [],
      error: error.message || "Failed to load services",
      loading: false
    });
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

