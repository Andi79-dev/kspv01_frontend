import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserResponse, Permission, Menu } from "@/types";

interface AuthStore {
  // Auth state
  user: UserResponse | null;
  token: string | null;
  roleId: number | null;
  isAuthenticated: boolean;

  // Menu and permissions
  menus: Menu[];
  permissions: Permission[];

  // UI state
  sidebarOpen: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: UserResponse | null) => void;
  setToken: (token: string | null) => void;
  setRoleId: (roleId: number | null) => void;
  setMenus: (menus: Menu[]) => void;
  setPermissions: (permissions: Permission[]) => void;
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  login: (user: UserResponse, token: string) => void;
  logout: () => void;

  // Computed helpers
  canView: (menuId: number) => boolean;
  canEdit: (menuId: number) => boolean;
  canDelete: (menuId: number) => boolean;
  canApprove: (menuId: number) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      roleId: null,
      isAuthenticated: false,
      menus: [],
      permissions: [],
      sidebarOpen: true,
      isLoading: false,

      // Actions
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setRoleId: (roleId) => set({ roleId }),
      setMenus: (menus) => set({ menus }),
      setPermissions: (permissions) => set({ permissions }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setLoading: (loading) => set({ isLoading: loading }),

      login: async (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);

          // Set cookies for middleware to detect authentication
          // Using fetch to call a cookie-setting endpoint would be more secure,
          // but for simplicity we'll set cookies via client-side
          const expires = new Date();
          expires.setDate(expires.getDate() + 7); // 7 days expiry

          // Set cookie for token
          document.cookie = `token=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
          // Set cookie for roleId
          document.cookie = `roleId=${user.roleId}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
        }
        set({
          user,
          token,
          roleId: user.roleId,
          isAuthenticated: true,
        });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");

          // Clear cookies
          document.cookie =
            "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie =
            "roleId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        set({
          user: null,
          token: null,
          roleId: null,
          isAuthenticated: false,
          menus: [],
          permissions: [],
        });
      },

      // Permission helpers
      canView: (menuId: number) => {
        const permission = get().permissions.find((p) => p.menuId === menuId);
        return permission?.can_view ?? false;
      },

      canEdit: (menuId: number) => {
        const permission = get().permissions.find((p) => p.menuId === menuId);
        return permission?.can_edit ?? false;
      },

      canDelete: (menuId: number) => {
        const permission = get().permissions.find((p) => p.menuId === menuId);
        // Same as can_edit for most cases
        return permission?.can_edit ?? false;
      },

      canApprove: (menuId: number) => {
        const permission = get().permissions.find((p) => p.menuId === menuId);
        return permission?.can_approve ?? false;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        roleId: state.roleId,
        isAuthenticated: state.isAuthenticated,
        menus: state.menus,
        permissions: state.permissions,
      }),
    },
  ),
);

export default useAuthStore;
