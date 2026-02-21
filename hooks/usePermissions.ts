import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  usersApi,
  rolesApi,
  permissionsApi,
  menusApi,
  type MenuCreateInput,
  type MenuUpdateInput,
  type PermissionCreateInput,
  type PermissionUpdateInput,
} from "@/lib/api";
import type { UserResponse, Role, Menu, Permission } from "@/types";
import type { Paging } from "@/types";

// Query keys
export const queryKeys = {
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (page: number, size: number) =>
      [...queryKeys.users.lists(), { page, size }] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.users.details(), id] as const,
  },
  roles: {
    all: ["roles"] as const,
    lists: () => [...queryKeys.roles.all, "list"] as const,
    list: () => [...queryKeys.roles.lists()] as const,
    details: () => [...queryKeys.roles.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.roles.details(), id] as const,
  },
  permissions: {
    all: ["permissions"] as const,
    lists: () => [...queryKeys.permissions.all, "list"] as const,
    list: (page: number, size: number) =>
      [...queryKeys.permissions.lists(), { page, size }] as const,
    byRole: (roleId: number) =>
      [...queryKeys.permissions.all, "role", roleId] as const,
  },
  menus: {
    all: ["menus"] as const,
    lists: () => [...queryKeys.menus.all, "list"] as const,
    list: (page: number, size: number) =>
      [...queryKeys.menus.lists(), { page, size }] as const,
    allNoPagination: () => [...queryKeys.menus.all, "all"] as const,
  },
};

// ==================== USERS HOOKS ====================

export function useUsers(page: number = 1, size: number = 10) {
  return useQuery<{ data: UserResponse[]; paging: Paging }>({
    queryKey: queryKeys.users.list(page, size),
    queryFn: () => usersApi.getAll(page, size),
  });
}

export function useUser(id: number) {
  return useQuery<UserResponse>({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: Partial<UserResponse> & { password: string }) =>
      usersApi.create(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, user }: { id: number; user: Partial<UserResponse> }) =>
      usersApi.update(id, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

// ==================== ROLES HOOKS ====================

export function useRoles() {
  return useQuery<Role[]>({
    queryKey: queryKeys.roles.list(),
    queryFn: () => rolesApi.getAll(),
  });
}

export function useRole(id: number) {
  return useQuery<Role>({
    queryKey: queryKeys.roles.detail(id),
    queryFn: () => rolesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (role: Partial<Role>) => rolesApi.create(role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.lists() });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: Partial<Role> }) =>
      rolesApi.update(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.lists() });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => rolesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.lists() });
    },
  });
}

// ==================== PERMISSIONS HOOKS ====================

export function usePermissions(page: number = 1, size: number = 10) {
  return useQuery<{ data: Permission[]; paging: Paging }>({
    queryKey: queryKeys.permissions.list(page, size),
    queryFn: () => permissionsApi.getAll(page, size),
  });
}

export function usePermissionsByRole(roleId: number) {
  return useQuery<Permission[]>({
    queryKey: queryKeys.permissions.byRole(roleId),
    queryFn: () => permissionsApi.getByRoleId(roleId),
    enabled: !!roleId,
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (permission: PermissionCreateInput) =>
      permissionsApi.create(permission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
    },
  });
}

export function useUpdatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      permission,
    }: {
      id: number;
      permission: PermissionUpdateInput;
    }) => permissionsApi.update(id, permission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
    },
  });
}

export function useDeletePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => permissionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
    },
  });
}

export function useUpdatePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      permissions,
    }: {
      roleId: number;
      permissions: Partial<Permission>[];
    }) => permissionsApi.updateByRole(roleId, permissions),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.permissions.byRole(roleId),
      });
    },
  });
}

// ==================== MENUS HOOKS ====================

// Menus with pagination
export function useMenus(page: number = 1, size: number = 10) {
  return useQuery<{ data: Menu[]; paging: Paging }>({
    queryKey: queryKeys.menus.list(page, size),
    queryFn: () => menusApi.getAll(page, size),
  });
}

// Menus without pagination (for sidebar and dropdowns)
export function useMenusAll() {
  return useQuery<Menu[]>({
    queryKey: queryKeys.menus.allNoPagination(),
    queryFn: () => menusApi.getAllNoPagination(),
  });
}

export function useMenu(id: number) {
  return useQuery<Menu>({
    queryKey: [...queryKeys.menus.all, "detail", id],
    queryFn: () => menusApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (menu: MenuCreateInput) => menusApi.create(menu),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menus.all });
    },
  });
}

export function useUpdateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, menu }: { id: number; menu: MenuUpdateInput }) =>
      menusApi.update(id, menu),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menus.all });
    },
  });
}

export function useDeleteMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => menusApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menus.all });
    },
  });
}
