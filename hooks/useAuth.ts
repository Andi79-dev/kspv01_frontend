import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi, menusApi, permissionsApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { LoginPayload } from "@/types";

// Login mutation hook
export function useLogin() {
  const router = useRouter();
  const { login, setMenus, setPermissions } = useAuthStore();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: async (data) => {
      // Store auth data - handle different response structures
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = data as any;
      const user = response.user || response;
      const token = response.token || response.access_token;

      if (!user || !token) {
        console.error("Invalid login response - empty or malformed:", data);
        throw new Error(
          "Login failed: Invalid response from server. Please check if the backend is running.",
        );
      }

      login(user, token);

      try {
        // Fetch menus and permissions using roleId
        // API endpoint: /permissions/role/{roleId}
        const [menus, permissions] = await Promise.all([
          menusApi.getAllNoPagination(),
          permissionsApi.getByRoleId(user.roleId),
        ]);

        setMenus(menus);
        setPermissions(permissions);
      } catch (error) {
        console.error("Failed to fetch menus/permissions:", error);
      }

      // Redirect to dashboard
      router.push("/dashboard");
    },
  });
}

// Logout hook
export function useLogout() {
  const router = useRouter();
  const { logout } = useAuthStore();

  return () => {
    logout();
    router.push("/login");
  };
}

// Check auth status hook (for protected routes)
export function useAuth() {
  const { isAuthenticated, user, token, roleId } = useAuthStore();

  return {
    isAuthenticated,
    user,
    token,
    roleId,
  };
}
