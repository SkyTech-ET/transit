import { create } from "zustand";
import { notification } from "antd";
import { IUser } from "../user/user.types";
import { deleteCookies, storeToken } from "../utils";
import { removeUserData, setUserData } from "../utils/token/user.storage";
import { AuthState, AuthStore, IPasswordPayload, ILogin } from "./auth.types";
import { forgotPassword, changePassword, resetPassword, login, signup } from "./auth.endpoints";

const defaultInitState: AuthState = {
  user: null,
  error: null,
  loading: false,
  currentUser: null
};

const useAuthStore = create<AuthStore>((set) => ({
  ...defaultInitState,
  login: async (payload: ILogin) => {
    set({ loading: true, error: null });
    return new Promise((resolve, reject) => {
      login(payload)
        .then(async (res: any) => {
          await storeToken({ token: res?.accessToken, refresh_token: res?.refreshToken });
          const user: IUser = {
            id: res.id,
            email: res.email,
            roles: res.roles,
            username: res.username,
            lastName: res.lastName,
            firstName: res.firstName,
            phoneNumber: res.phoneNumber,
            organization: res.organization,
            organizationId:res.organizationId
          }
          setUserData(user)
          set({ user: user, loading: false, error: null });
          resolve(res)
        })
        .catch((error: any) => {
          console.log(error)
          set({ loading: false, error: error || "Login failed. Please try again." });
          notification.open({
            message: 'Error',
            type: "error",
            description: error || "Login failed. Please try again.",
          });
          reject(error)
        });
    })
  },
  logout: async () => {
    set({ loading: true });
    await deleteCookies();
    removeUserData()
    set({ user: null, error: null, loading: false });
  },
  signUp: async (data: IUser) => {
    set({ loading: true, error: null });
    try {
      signup(data)
        .then(async (res: any) => {
        })
        .catch((error: any) => {
          set({
            loading: false,
            error: error || "Login failed. Please try again.",
          });
        });
    } catch (error: any) {
      set({ loading: false, error: error || "Something went wrong." });
    }
  },
  forgotPassword: async (payload: IPasswordPayload) => {
    set({ loading: true, error: null });
    return new Promise((resolve, reject) => {
      forgotPassword(payload)
        .then((res: any) => {
          set({ loading: false, error: null });
          notification.open({
            type: "success",
            message: 'Success',
            description: res.message,
          });
          resolve(res)
        })
        .catch((error: any) => {
          set({ loading: false, error: error || "Failed to reset password." });
          notification.open({
            message: 'Error',
            type: "error",
            description: error || "Failed to reset password.",
          });
          reject(error)
        });
    })
  },
  updatePassword: async (payload: IPasswordPayload) => {
    set({ loading: true, error: null });
    return new Promise((resolve, reject) => {
      changePassword(payload)
        .then((res: any) => {
          set({ loading: false, error: null });
          notification.open({
            type: "success",
            message: 'Success',
            description: res.message,
          });
          resolve(res)
        })
        .catch((error: any) => {
          set({ loading: false, error: error || "Failed to update password." });
          notification.open({
            message: 'Error',
            type: "error",
            description: error || "Failed to update password.",
          });
          reject(error)
        });
    })
  },
  resetPassword: async (payload: IPasswordPayload) => {
    set({ loading: true, error: null });
    return new Promise((resolve, reject) => {
      resetPassword(payload)
        .then((res: any) => {
          set({ loading: false, error: null });
          notification.open({
            type: "success",
            message: 'Success',
            description: res.message,
          });
          resolve(res)
        })
        .catch((error: any) => {
          set({ loading: false, error: error || "Failed to reset password." });
          notification.open({
            message: 'Error',
            type: "error",
            description: error || "Failed to reset password.",
          });
          reject(error)
        });
    })
  },
}));

export default useAuthStore;
