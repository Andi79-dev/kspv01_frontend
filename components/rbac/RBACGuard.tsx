"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RBACGuardProps {
  children: React.ReactNode;
  menuId: number;
  requireView?: boolean;
  requireEdit?: boolean;
  requireApprove?: boolean;
}

export function RBACGuard({
  children,
  menuId,
  requireView = true,
  requireEdit = false,
  requireApprove = false,
}: RBACGuardProps) {
  const router = useRouter();
  const { canView, canEdit, canApprove, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Check view permission
    if (requireView && !canView(menuId)) {
      router.push("/dashboard");
      return;
    }

    // Check edit permission
    if (requireEdit && !canEdit(menuId)) {
      router.push("/dashboard");
      return;
    }

    // Check approve permission
    if (requireApprove && !canApprove(menuId)) {
      router.push("/dashboard");
      return;
    }
  }, [
    isAuthenticated,
    canView,
    canEdit,
    canApprove,
    menuId,
    requireView,
    requireEdit,
    requireApprove,
    router,
  ]);

  // If any permission check fails, don't render children
  if (!isAuthenticated) {
    return null;
  }

  if (requireView && !canView(menuId)) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  if (requireEdit && !canEdit(menuId)) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">
            You do not have permission to edit this resource.
          </p>
        </div>
      </div>
    );
  }

  if (requireApprove && !canApprove(menuId)) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">
            You do not have permission to approve this action.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook version for conditional rendering
export function usePermissionCheck(
  menuId: number,
  permission: "view" | "edit" | "delete" | "approve" = "view",
) {
  const { canView, canEdit, canDelete, canApprove, isAuthenticated } =
    useAuthStore();

  if (!isAuthenticated) {
    return false;
  }

  switch (permission) {
    case "view":
      return canView(menuId);
    case "edit":
      return canEdit(menuId);
    case "delete":
      return canDelete(menuId);
    case "approve":
      return canApprove(menuId);
    default:
      return false;
  }
}

export default RBACGuard;
