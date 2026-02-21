import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
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

// API base URL - adjust based on your environment
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4021/api";

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

// Auth API
export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    try {
      // The actual API response is: { data: { id, username, nama, roleId, ... } }
      // We need to transform it to match LoginResponse: { user: {...}, token: "..." }
      const response = await apiClient.post<{ data: UserResponse }>(
        "/users/login",
        payload,
      );

      // Transform the response to match expected format
      // Since backend doesn't return a token, we'll generate a simple one based on user data
      const userData = response.data.data;
      const token = `token_${userData.id}_${Date.now()}`;

      return {
        user: userData,
        token: token,
      };
    } catch (error) {
      console.error("Login API error:", error);
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
  },

  getById: async (id: number): Promise<UserResponse> => {
    const response = await apiClient.get<ApiResponse<UserResponse>>(
      `/users/${id}`,
    );
    return response.data.data;
  },

  create: async (
    user: Partial<UserResponse> & { password: string },
  ): Promise<UserResponse> => {
    const response = await apiClient.post<ApiResponse<UserResponse>>(
      "/users",
      user,
    );
    return response.data.data;
  },

  update: async (
    id: number,
    user: Partial<UserResponse>,
  ): Promise<UserResponse> => {
    const response = await apiClient.put<ApiResponse<UserResponse>>(
      `/users/${id}`,
      user,
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};

// Roles API
export const rolesApi = {
  getAll: async (): Promise<Role[]> => {
    const response = await apiClient.get<ApiResponse<Role[]>>("/roles");
    return response.data.data;
  },

  getById: async (id: number): Promise<Role> => {
    const response = await apiClient.get<ApiResponse<Role>>(`/roles/${id}`);
    return response.data.data;
  },

  create: async (role: Partial<Role>): Promise<Role> => {
    const response = await apiClient.post<ApiResponse<Role>>("/roles", role);
    return response.data.data;
  },

  update: async (id: number, role: Partial<Role>): Promise<Role> => {
    const response = await apiClient.patch<ApiResponse<Role>>(
      `/roles/${id}`,
      role,
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
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
  },

  getAllNoPagination: async (): Promise<Menu[]> => {
    const response = await apiClient.get<ApiResponse<Menu[]>>("/menus");
    return response.data.data;
  },

  getById: async (id: number): Promise<Menu> => {
    const response = await apiClient.get<ApiResponse<Menu>>(`/menus/${id}`);
    return response.data.data;
  },

  create: async (menu: MenuCreateInput): Promise<Menu> => {
    const response = await apiClient.post<ApiResponse<Menu>>("/menus", menu);
    return response.data.data;
  },

  update: async (id: number, menu: MenuUpdateInput): Promise<Menu> => {
    const response = await apiClient.put<ApiResponse<Menu>>(
      `/menus/${id}`,
      menu,
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/menus/${id}`);
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
  },

  // Get permissions by roleId using path parameter: /permissions/role/{roleId}
  getByRoleId: async (roleId: number): Promise<Permission[]> => {
    const response = await apiClient.get<ApiResponse<Permission[]>>(
      `/permissions/role/${roleId}`,
    );
    return response.data.data;
  },

  create: async (permission: PermissionCreateInput): Promise<Permission> => {
    const response = await apiClient.post<ApiResponse<Permission>>(
      "/permissions",
      permission,
    );
    return response.data.data;
  },

  update: async (
    id: number,
    permission: PermissionUpdateInput,
  ): Promise<Permission> => {
    const response = await apiClient.put<ApiResponse<Permission>>(
      `/permissions/${id}`,
      permission,
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/permissions/${id}`);
  },

  updateByRole: async (
    roleId: number,
    permissions: Partial<Permission>[],
  ): Promise<Permission[]> => {
    const response = await apiClient.put<ApiResponse<Permission[]>>(
      `/permissions/role/${roleId}`,
      {
        permissions,
      },
    );
    return response.data.data;
  },
};

export default apiClient;
