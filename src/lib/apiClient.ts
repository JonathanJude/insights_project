import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG, ERROR_MESSAGES } from '../constants';
import type { APIResponse, PaginatedResponse } from '../types';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth tokens and logging
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling responses and errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }
    
    return response;
  },
  (error: AxiosError) => {
    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
    }
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token');
      // You can dispatch a logout action here if using auth
    }
    
    return Promise.reject(error);
  }
);

// Generic API request function with retry logic
export const makeRequest = async <T>(
  config: AxiosRequestConfig,
  retries: number = API_CONFIG.RETRY_ATTEMPTS
): Promise<T> => {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    if (retries > 0 && shouldRetry(error as AxiosError)) {
      await delay(API_CONFIG.RETRY_DELAY);
      return makeRequest<T>(config, retries - 1);
    }
    throw handleApiError(error as AxiosError);
  }
};

// Determine if request should be retried
const shouldRetry = (error: AxiosError): boolean => {
  // Retry on network errors or 5xx server errors
  return (
    !error.response ||
    (error.response.status >= 500 && error.response.status < 600) ||
    error.code === 'NETWORK_ERROR' ||
    error.code === 'TIMEOUT'
  );
};

// Delay function for retry logic
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Error handler that converts API errors to user-friendly messages
export const handleApiError = (error: AxiosError): Error => {
  let message = ERROR_MESSAGES.GENERIC_ERROR;
  
  if (!error.response) {
    // Network error
    message = ERROR_MESSAGES.NETWORK_ERROR;
  } else {
    // HTTP error
    switch (error.response.status) {
      case 400:
        message = ERROR_MESSAGES.VALIDATION_ERROR;
        break;
      case 401:
        message = ERROR_MESSAGES.UNAUTHORIZED;
        break;
      case 404:
        message = ERROR_MESSAGES.NOT_FOUND;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        message = ERROR_MESSAGES.SERVER_ERROR;
        break;
      default: {
        // Try to get error message from response
        const responseData = error.response.data as { message?: string };
        if (responseData?.message) {
          message = responseData.message;
        }
        break;
      }
    }
  }
  
  return new Error(message);
};

// Typed API methods
export const api = {
  // GET request
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> => {
    return makeRequest<APIResponse<T>>({ method: 'GET', url, ...config });
  },
  
  // POST request
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<APIResponse<T>> => {
    return makeRequest<APIResponse<T>>({ method: 'POST', url, data, ...config });
  },
  
  // PUT request
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<APIResponse<T>> => {
    return makeRequest<APIResponse<T>>({ method: 'PUT', url, data, ...config });
  },
  
  // PATCH request
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<APIResponse<T>> => {
    return makeRequest<APIResponse<T>>({ method: 'PATCH', url, data, ...config });
  },
  
  // DELETE request
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> => {
    return makeRequest<APIResponse<T>>({ method: 'DELETE', url, ...config });
  },
  
  // GET request with pagination
  getPaginated: <T>(url: string, config?: AxiosRequestConfig): Promise<PaginatedResponse<T>> => {
    return makeRequest<PaginatedResponse<T>>({ method: 'GET', url, ...config });
  }
};

// Query parameter builder utility
export const buildQueryParams = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        // Handle array parameters
        value.forEach(item => searchParams.append(key, item.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });
  
  return searchParams.toString();
};

// URL builder utility
export const buildUrl = (endpoint: string, params?: Record<string, unknown>): string => {
  if (!params || Object.keys(params).length === 0) {
    return endpoint;
  }
  
  const queryString = buildQueryParams(params);
  return queryString ? `${endpoint}?${queryString}` : endpoint;
};

// File upload utility
export const uploadFile = async (url: string, file: File, onProgress?: (progress: number) => void): Promise<APIResponse<unknown>> => {
  const formData = new FormData();
  formData.append('file', file);
  
  return makeRequest<APIResponse<unknown>>({
    method: 'POST',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    }
  });
};

// Download file utility
export const downloadFile = async (url: string, filename?: string): Promise<void> => {
  try {
    const response = await apiClient({
      method: 'GET',
      url,
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    throw handleApiError(error as AxiosError);
  }
};

export default apiClient;