"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRoles, useMenusAll } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import type { Role, Menu, Permission } from "@/types";

// Icons
import { Loader2 } from "lucide-react";

// Helper function to flatten menu hierarchy for display
function getMenuOptions(menus: Menu[]) {
  const options: { id: number; label: string }[] = [];

  // Sort parent menus by order
  const sortedMenus = [...menus].sort((a, b) => a.order - b.order);

  sortedMenus.forEach((menu) => {
    // Add parent menu
    options.push({
      id: menu.id,
      label: menu.nama_menu,
    });

    // Add sub-menus with indentation
    if (menu.subMenus && menu.subMenus.length > 0) {
      const sortedSubMenus = [...menu.subMenus].sort(
        (a, b) => a.order - b.order,
      );
      sortedSubMenus.forEach((subMenu) => {
        options.push({
          id: subMenu.id,
          label: `  ↳ ${subMenu.nama_menu}`,
        });
      });
    }
  });

  return options;
}

// Zod validation schema
const permissionSchema = z.object({
  roleId: z.number().min(1, "Role is required"),
  menuId: z.number().min(1, "Menu is required"),
  can_view: z.boolean(),
  can_edit: z.boolean(),
  can_approve: z.boolean(),
});

type PermissionFormData = z.infer<typeof permissionSchema>;

interface PermissionFormProps {
  permission?: Permission | null;
  onSubmit: (data: PermissionFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PermissionForm({
  permission,
  onSubmit,
  onCancel,
  isLoading,
}: PermissionFormProps) {
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { data: menus, isLoading: menusLoading } = useMenusAll();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      roleId: permission?.roleId || 0,
      menuId: permission?.menuId || 0,
      can_view: permission?.can_view ?? false,
      can_edit: permission?.can_edit ?? false,
      can_approve: permission?.can_approve ?? false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Role */}
      <div className="space-y-2">
        <label htmlFor="roleId" className="text-sm font-medium">
          Role <span className="text-destructive">*</span>
        </label>
        <select
          {...register("roleId", { valueAsNumber: true })}
          id="roleId"
          className={cn(
            "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm",
            errors.roleId && "border-destructive",
          )}
          disabled={rolesLoading}
        >
          <option value={0}>Select Role</option>
          {roles?.map((role: Role) => (
            <option key={role.id} value={role.id}>
              {role.nama_role}
            </option>
          ))}
        </select>
        {errors.roleId && (
          <p className="text-sm text-destructive">{errors.roleId.message}</p>
        )}
      </div>

      {/* Menu */}
      <div className="space-y-2">
        <label htmlFor="menuId" className="text-sm font-medium">
          Menu <span className="text-destructive">*</span>
        </label>
        <select
          {...register("menuId", { valueAsNumber: true })}
          id="menuId"
          className={cn(
            "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm",
            errors.menuId && "border-destructive",
          )}
          disabled={menusLoading}
        >
          <option value={0}>Select Menu</option>
          {menus &&
            getMenuOptions(menus).map((menuOption) => (
              <option key={menuOption.id} value={menuOption.id}>
                {menuOption.label}
              </option>
            ))}
        </select>
        {errors.menuId && (
          <p className="text-sm text-destructive">{errors.menuId.message}</p>
        )}
      </div>

      {/* Permissions */}
      <div className="space-y-3 pt-2">
        <label className="text-sm font-medium">Permissions</label>

        {/* Can View */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="can_view"
            {...register("can_view")}
            className="h-4 w-4"
          />
          <label htmlFor="can_view" className="text-sm">
            Can View
          </label>
        </div>

        {/* Can Edit */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="can_edit"
            {...register("can_edit")}
            className="h-4 w-4"
          />
          <label htmlFor="can_edit" className="text-sm">
            Can Edit
          </label>
        </div>

        {/* Can Approve */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="can_approve"
            {...register("can_approve")}
            className="h-4 w-4"
          />
          <label htmlFor="can_approve" className="text-sm">
            Can Approve
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90",
            isLoading && "opacity-50",
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : permission ? (
            "Update"
          ) : (
            "Create"
          )}
        </button>
      </div>
    </form>
  );
}

export default PermissionForm;
