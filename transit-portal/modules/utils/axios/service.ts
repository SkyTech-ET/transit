import axios from "axios";
import type { AxiosError, AxiosInstance, AxiosResponse } from "axios";

import { getToken } from "../token/client-token.storage";
import { config } from "./config";

interface ApiResponse<T> {
  statusCode?: number;
  error?: boolean;
  errors?: string[] | Record<string, string[]>;
  message?: string;
  response?: {
    data: T | null;
  };
}


const service: AxiosInstance = axios.create({
  baseURL: config.base_url.base,
  timeout: config.request_timeout,
});

// Request
service.interceptors.request.use(
  async (config: any) => {
    const token = await getToken();
    // Set Auth token
    if (token != null) {
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
    }

    // Setup request for POST
    if (config.method === "post" && (config.headers as any)["Content-Type"] === "application/x-www-form-urlencoded") {
      config.data = JSON.stringify(config.data);
    }
    
    // Debug FormData requests and ensure proper Content-Type
    if ((config.method === "post" || config.method === "put") && config.data instanceof FormData) {
       // Remove Content-Type header to let axios set it automatically for FormData
      delete (config.headers as any)["Content-Type"];
      
   }

    // Setup request for GET
    if (config.method === "get" && config.params) {
      let url = config.url as string;
      url += "?";
      const keys = Object.keys(config.params);
      for (const key of keys) {
        if (config.params[key] !== void 0 && config.params[key] !== null) {
          url += `${key}=${encodeURIComponent(config.params[key])}&`;
        }
      }
      url = url.substring(0, url.length - 1);
      config.params = {};
      config.url = url;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
service.interceptors.response.use(
  (response: AxiosResponse<any>) => {
    const data = response.data;
    // If the response is directly an array (like the users API), return it
    if (Array.isArray(data)) {
     return data;
    }
    
    // If it's an object with statusCode (standard API response format)
    if (data && typeof data === 'object' && data.statusCode === 200 && !data.error) {
      if (data.response?.data !== null) {
        let responseData = data.response.data;
      return responseData;
      } else {
        return Promise.reject('No data available');
      }
    } else if (data && data.statusCode == 401) {
      window.location.href = "/auth/login";
      window.location.reload();
    } else {
      return Promise.reject(data?.message || 'Unexpected response structure');
    }
  },
  (error: AxiosError<ApiResponse<any>>) => {
    let errorMessage = 'An unexpected error occurred';
    if (error.response) {
      const data = error.response.data;
      console.error('🔍 DEBUG: Error response data:', data);

      if (data.message) {
        errorMessage = data.message;
      } else if (data.errors) {
        if (Array.isArray(data.errors)) {
          errorMessage = data.errors.join(', ');
        } else {
          errorMessage = Object.values(data.errors).flat().join(', ');
        }
      } else {
        errorMessage = 'An unexpected error structure was received';
      }
    }

    return Promise.reject(errorMessage);
  }
);


export { service };
