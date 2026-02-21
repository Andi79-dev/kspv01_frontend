// TypeScript interfaces matching Prisma schema
// Zero 'any' usage - all types are strictly defined

// User Model
export interface User {
  id: number;
  username: string;
  password: string;
  nama: string;
  roleId: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  role?: Role;
}

// User response from API (includes nama_role)
export interface UserResponse {
  id: number;
  username: string;
  nama: string;
  roleId: number;
  nama_role: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

// Role Model
export interface Role {
  id: number;
  nama_role: string;
  deskripsi?: string;
}

// Menu Model with recursive subMenus
export interface Menu {
  id: number;
  nama_menu: string;
  icon?: string;
  url?: string | null;
  order: number;
  parentId?: number | null;
  subMenus: Menu[];
}

// Permission Model
export interface Permission {
  id: number;
  roleId: number;
  menuId: number;
  can_view: boolean;
  can_edit: boolean;
  can_approve: boolean;
  role?: Role;
  menu?: Menu;
}

// Pagination response
export interface Paging {
  current_page: number;
  size: number;
  total_page: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  paging?: Paging;
}

// Login payload
export interface LoginPayload {
  username: string;
  password: string;
}

// Login response
export interface LoginResponse {
  token: string;
  user: UserResponse;
}

// Auth state
export interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Sidebar menu item for rendering
export interface SidebarMenuItem {
  id: number;
  nama_menu: string;
  icon?: string;
  url?: string | null;
  order: number;
  parentId?: number | null;
  children?: SidebarMenuItem[];
}
