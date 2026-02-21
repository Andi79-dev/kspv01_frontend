import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import type {
  LoginPayload,
  LoginResponse,
  UserResponse,
  Role,
  Menu,
  Permission,
  ApiResponse,
  Paging,
} from "@/types";
import {
  getStatusMessage,
  getAxiosErrorMessage,
  handleApiError,
} from "./errorHandler";

// API base URL - adjust based on your environment
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4021/api";
// process.env.NEXT_PUBLIC_API_URL || "http://localhost:4021/api";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

/**
 * Health check API - lightweight endpoint for checking API availability
 * Uses /roles endpoint to avoid duplicate /menus calls
 */
export const healthApi = {
  /**
   * Check if the API server is reachable
   * @returns Promise<boolean> - true if API is healthy, false otherwise
   */
  check: async (): Promise<boolean> => {
    try {
      // Attempt lightweight HEAD request first
      const response = await apiClient.head("/roles", { timeout: 5000 });
      return response.status >= 200 && response.status < 400;
    } catch {
      // Fallback: try minimal GET request if HEAD fails
      try {
        const response = await apiClient.get("/roles", {
          params: { page: 1, size: 1 },
          timeout: 5000,
        });
        return response.status >= 200 && response.status < 400;
      } catch {
        return false;
      }
    }
  },
};

// Auth API
export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    let loadingId: string | number | undefined;

    try {
      // Show loading toast
      loadingId = toast.loading("Logging in...");

      // Make POST request to login endpoint
      // We use response.data.data because Axios wraps the response,
      // and the backend wraps the result in a 'data' object
      const response = await apiClient.post<{ data: UserResponse }>(
        "/users/login",
        payload,
      );

      // Check response status (axios uses status, not ok)
      const status = response.status;
      if (status < 200 || status >= 300) {
        const message = getStatusMessage(status);
        toast.error(message, { id: loadingId });
        throw new Error(message);
      }

      // Handle if response data is null or undefined
      if (!response.data) {
        const message = "Invalid response: No data received from server";
        toast.error(message, { id: loadingId });
        throw new Error(message);
      }

      // Transform the response to match expected format
      // Since backend doesn't return a token, we'll generate a simple one based on user data
      const userData = response.data.data;

      // Handle if userData is null or undefined
      if (!userData) {
        const message = "Invalid response: User data not found";
        toast.error(message, { id: loadingId });
        throw new Error(message);
      }

      const token = `token_${userData.id}_${Date.now()}`;

      // Dismiss loading and show success toast
      toast.dismiss(loadingId);
      toast.success(`Login berhasil! Selamat datang, ${userData.nama}!`);

      return {
        user: userData,
        token: token,
      };
    } catch (error) {
      // Handle error and show toast
      const message = getAxiosErrorMessage(error);
      console.error("Login API error:", error);

      // Dismiss loading toast first
      if (loadingId) {
        toast.dismiss(loadingId);
      }

      // Show error toast
      toast.error(message);
      throw error;
    }
  },
  logout: async (): Promise<void> => {
    // Optionally call logout endpoint
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  },
};

// Users API
export const usersApi = {
  getAll: async (
    page: number = 1,
    size: number = 10,
  ): Promise<{ data: UserResponse[]; paging: Paging }> => {
    try {
      const response = await apiClient.get<ApiResponse<UserResponse[]>>(
        "/users",
        {
          params: { page, size },
        },
      );
      return {
        data: response.data.data,
        paging: response.data.paging!,
      };
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getById: async (id: number): Promise<UserResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<UserResponse>>(
        `/users/${id}`,
      );
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  create: async (
    user: Partial<UserResponse> & { password: string },
  ): Promise<UserResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<UserResponse>>(
        "/users",
        user,
      );
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  update: async (
    id: number,
    user: Partial<UserResponse>,
  ): Promise<UserResponse> => {
    try {
      const response = await apiClient.put<ApiResponse<UserResponse>>(
        `/users/${id}`,
        user,
      );
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

// Roles API
export const rolesApi = {
  getAll: async (): Promise<Role[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Role[]>>("/roles");
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Role> => {
    try {
      const response = await apiClient.get<ApiResponse<Role>>(`/roles/${id}`);
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  create: async (role: Partial<Role>): Promise<Role> => {
    try {
      const response = await apiClient.post<ApiResponse<Role>>("/roles", role);
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  update: async (id: number, role: Partial<Role>): Promise<Role> => {
    try {
      const response = await apiClient.patch<ApiResponse<Role>>(
        `/roles/${id}`,
        role,
      );
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/roles/${id}`);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

// Menu types for API
export interface MenuCreateInput {
  nama_menu: string;
  icon?: string;
  url?: string | null;
  order?: number;
  parentId?: number | null;
}

export interface MenuUpdateInput {
  nama_menu?: string;
  icon?: string;
  url?: string | null;
  order?: number;
  parentId?: number | null;
}

// Menus API
export const menusApi = {
  getAll: async (
    page: number = 1,
    size: number = 10,
  ): Promise<{ data: Menu[]; paging: Paging }> => {
    try {
      const response = await apiClient.get<ApiResponse<Menu[]>>("/menus", {
        params: { page, size },
      });
      return {
        data: response.data.data,
        paging: response.data.paging || {
          current_page: 1,
          size: size,
          total_page: Math.ceil(response.data.data.length / size),
        },
      };
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getAllNoPagination: async (): Promise<Menu[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Menu[]>>("/menus");
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Menu> => {
    try {
      const response = await apiClient.get<ApiResponse<Menu>>(`/menus/${id}`);
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  create: async (menu: MenuCreateInput): Promise<Menu> => {
    try {
      const response = await apiClient.post<ApiResponse<Menu>>("/menus", menu);
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  update: async (id: number, menu: MenuUpdateInput): Promise<Menu> => {
    try {
      const response = await apiClient.put<ApiResponse<Menu>>(
        `/menus/${id}`,
        menu,
      );
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/menus/${id}`);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

// Permission types for API
export interface PermissionCreateInput {
  roleId: number;
  menuId: number;
  can_view: boolean;
  can_edit: boolean;
  can_approve: boolean;
}

export interface PermissionUpdateInput {
  can_view?: boolean;
  can_edit?: boolean;
  can_approve?: boolean;
}

// Permissions API
export const permissionsApi = {
  getAll: async (
    page: number = 1,
    size: number = 10,
  ): Promise<{ data: Permission[]; paging: Paging }> => {
    try {
      const response = await apiClient.get<ApiResponse<Permission[]>>(
        "/permissions",
        {
          params: { page, size },
        },
      );
      return {
        data: response.data.data,
        paging: response.data.paging!,
      };
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Get permissions by roleId using path parameter: /permissions/role/{roleId}
  getByRoleId: async (roleId: number): Promise<Permission[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Permission[]>>(
        `/permissions/role/${roleId}`,
      );
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  create: async (permission: PermissionCreateInput): Promise<Permission> => {
    try {
      const response = await apiClient.post<ApiResponse<Permission>>(
        "/permissions",
        permission,
      );
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  update: async (
    id: number,
    permission: PermissionUpdateInput,
  ): Promise<Permission> => {
    try {
      const response = await apiClient.put<ApiResponse<Permission>>(
        `/permissions/${id}`,
        permission,
      );
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/permissions/${id}`);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  updateByRole: async (
    roleId: number,
    permissions: Partial<Permission>[],
  ): Promise<Permission[]> => {
    try {
      const response = await apiClient.put<ApiResponse<Permission[]>>(
        `/permissions/role/${roleId}`,
        {
          permissions,
        },
      );
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

export default apiClient;
