import { create } from "zustand";
import { notification } from "antd";
import { RecordStatus } from "../common/common.types";
import { IAdditionalParam, IUserPayload, IUserState, IUserStore } from "./user.types";
import { addUser, deleteUser, getUser, getUsers, getUsersByOrg, updateUser } from "./user.endpoint";
import { checkFieldValue } from "../utils";


const defaultInitState: IUserState = {
  users: [],
  user: null,
  error: null,
  orgUsers: [],
  searchTerm: '',
  loading: false,
  filteredUsers: [],
  listLoading: false,
  additionalParam: null,
  currentPage: 1,  
  totalPages: 1    
};

export const useUserStore = create<IUserStore>((set) => ({
  ...defaultInitState,
  addUser: async (payload: IUserPayload) => {
    set({ loading: true, error: null });
    return new Promise((resolve, reject) => {
      set({ loading: true, error: null });
      let request = payload as any
      if (!checkFieldValue(request, 'organizationId')) {
        request.organizationId = useUserStore.getState().additionalParam?.orgId
      }
      if (!checkFieldValue(request, 'roles')) {
        request.roles = useUserStore.getState().additionalParam?.roles as any
      } else {
        request.roles = Array.isArray(request.roles) ? request.roles : [request.roles]
      }
      addUser(request)
        .then((res: any) => {
          set({ loading: false, error: null });
          notification.open({
            message: 'Success',
            type: "success",
            description: "User created successfully!",
          });
          resolve(res)
        })
        .catch((error: any) => {
          set({ loading: false, error: error || "Failed to create user." });
          notification.open({
            message: 'Error',
            type: "error",
            description: error || "Failed to create user.",
          });
          reject(error)
        });
    })
  },
  updateUser: async (payload: IUserPayload, id: number) => {
    set({ loading: true, error: null });
    let request = payload as any
    if (!checkFieldValue(request, 'organizationId')) {
      request.organizationId = useUserStore.getState().additionalParam?.orgId
    }
    if (!checkFieldValue(request, 'roles')) {
      request.roles = useUserStore.getState().additionalParam?.roles as any
    } else {
      request.roles = Array.isArray(request.roles) ? request.roles : [request.roles]
    }
    return new Promise((resolve, reject) => {
      updateUser(payload, id)
        .then((res: any) => {
          set({ loading: false, error: null });
          notification.open({
            message: 'Success',
            type: "success",
            description: "User updated successfully!",
          });
          resolve(res)
        })
        .catch((error: any) => {
          set({ loading: false, error: error || "Failed to update user." });
          notification.open({
            message: 'Error',
            type: "error",
            description: error || "Failed to update user.",
          });
          reject(error)
        });
    })
  },
  deleteUser: async (id: number) => {
    set({ loading: true, error: null });
    return new Promise((resolve, reject) => {
      deleteUser(id)
        .then((res: any) => {
          set({ loading: false, error: null });
          notification.open({
            message: 'Success',
            type: "success",
            description: "User deleted successfully!",
          });
          resolve(res)
        })
        .catch((error: any) => {
          set({ loading: false, error: error || "Failed to delete user." });
          notification.open({
            message: 'Error',
            type: "error",
            description: error || "Failed to delete user.",
          });
          reject(error)
        });
    })
  },

  getUsers: async (status: RecordStatus, pageNumber: number = 1) => {
    set({ listLoading: true, error: null, filteredUsers: [] });
  
    return new Promise((resolve, reject) => {
      getUsers(status, pageNumber) 
        .then((res: any) => {
          if (!res.errors) {
            const users = res.users || [];
            set({
              users: users,
              filteredUsers: users,
              listLoading: false,
              error: null,
              currentPage: pageNumber, 
              totalPages: res.totalPages || 1, 
              
            });
          } else {
            set({
              users: [],
              filteredUsers: [],
              listLoading: false,
              error: null,
              currentPage: 1,  
              totalPages: 1,   
            });
          }
          resolve(res);
        })
        .catch((error: any) => {
          set({
            users: [],
            filteredUsers: [],
            listLoading: false,
            error: error || "Failed to fetch users.",
            currentPage: 1, 
            totalPages: 1,   
          });
          reject(error);
        });
    });
  },
  



  getUsersByOrg: async (id: number, status: RecordStatus) => {
    set({ listLoading: true, error: null, filteredUsers: [] });
    return new Promise((resolve, reject) => {
      getUsersByOrg(id, status)
        .then((res: any) => {
          if (!res.errors) {
            set({ orgUsers: res, filteredUsers: res, listLoading: false, error: null });
          } else {
            set({ orgUsers: [], filteredUsers: [], listLoading: false, error: null });
          }
          resolve(res)
        })
        .catch((error: any) => {
          set((state) => ({
            users: [], filteredUsers: [], listLoading: false,
            error: error || "Failed to fetch users by organization."
          }));
          reject(error)
        });
    })
  },
  getUser: async (id: number) => {
    set({ listLoading: true, error: null });
    return new Promise((resolve, reject) => {
      getUser(id)
        .then((res: any) => {
          let userRes = res;
          if (res.roles != null && res.roles.length > 0) {
            userRes.roles = res.roles.map((r: any) => r.id)
          }
          set({ user: userRes, listLoading: false, error: null });
          resolve(res)
        })
        .catch((error: any) => {
          set((state) => ({
            user: null, listLoading: false,
            error: error || "Failed to fetch user."
          }));
          reject(error)
        });
    })
  },
  setSearchTerm: (searchTerm: string) => {
    set({ searchTerm });
    set((state) => ({
      filteredUsers: state.users.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }));
  },
  setAdditionalParams(params: IAdditionalParam) {
    set({ additionalParam: { orgId: params.orgId, userId: params.userId, roles: params.roles } })
  },
}));
