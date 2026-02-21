"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMenusAll } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { iconOptions } from "@/lib/iconMap";
import type { Menu } from "@/types";

// Icons
import { Loader2 } from "lucide-react";

// Zod validation schema
const menuSchema = z.object({
  nama_menu: z.string().min(1, "Nama menu is required"),
  icon: z.string().optional(),
  url: z.string().nullable().optional(),
  order: z.number().min(0, "Order must be 0 or greater"),
  parentId: z.number().nullable().optional(),
});

type MenuFormData = z.infer<typeof menuSchema>;

interface MenuFormProps {
  menu?: Menu | null;
  menus?: Menu[]; // Optional - if provided, use these instead of fetching
  onSubmit: (data: MenuFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MenuForm({
  menu,
  menus: providedMenus,
  onSubmit,
  onCancel,
  isLoading,
}: MenuFormProps) {
  // Use provided menus or fetch all menus
  const { data: fetchedMenus, isLoading: menusLoading } = useMenusAll();
  const menus = providedMenus || fetchedMenus || [];

  // Filter parent menus (menus without parentId)
  const parentMenus = menus.filter((m) => !m.parentId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MenuFormData>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      nama_menu: menu?.nama_menu || "",
      icon: menu?.icon || "",
      url: menu?.url || null,
      order: menu?.order ?? 0,
      parentId: menu?.parentId ?? null,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Nama Menu */}
      <div className="space-y-2">
        <label htmlFor="nama_menu" className="text-sm font-medium">
          Nama Menu <span className="text-destructive">*</span>
        </label>
        <input
          {...register("nama_menu")}
          id="nama_menu"
          type="text"
          placeholder="Enter menu name"
          className={cn(
            "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm",
            errors.nama_menu && "border-destructive",
          )}
        />
        {errors.nama_menu && (
          <p className="text-sm text-destructive">{errors.nama_menu.message}</p>
        )}
      </div>

      {/* Icon */}
      <div className="space-y-2">
        <label htmlFor="icon" className="text-sm font-medium">
          Icon
        </label>
        <select
          {...register("icon")}
          id="icon"
          className={cn(
            "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm",
            errors.icon && "border-destructive",
          )}
        >
          <option value="">Select Icon</option>
          {iconOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.icon && (
          <p className="text-sm text-destructive">{errors.icon.message}</p>
        )}
      </div>

      {/* URL */}
      <div className="space-y-2">
        <label htmlFor="url" className="text-sm font-medium">
          URL
        </label>
        <input
          {...register("url")}
          id="url"
          type="text"
          placeholder="/path (leave empty for parent menu)"
          className={cn(
            "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm",
            errors.url && "border-destructive",
          )}
        />
        {errors.url && (
          <p className="text-sm text-destructive">{errors.url.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Leave empty if this is a parent/folder menu
        </p>
      </div>

      {/* Parent Menu */}
      <div className="space-y-2">
        <label htmlFor="parentId" className="text-sm font-medium">
          Parent Menu
        </label>
        <select
          {...register("parentId", { valueAsNumber: true })}
          id="parentId"
          className={cn(
            "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm",
            errors.parentId && "border-destructive",
          )}
          disabled={menusLoading}
        >
          <option value={0}>No Parent (Root Menu)</option>
          {parentMenus
            .filter((m) => m.id !== menu?.id) // Exclude current menu
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama_menu}
              </option>
            ))}
        </select>
        {errors.parentId && (
          <p className="text-sm text-destructive">{errors.parentId.message}</p>
        )}
      </div>

      {/* Order */}
      <div className="space-y-2">
        <label htmlFor="order" className="text-sm font-medium">
          Order
        </label>
        <input
          {...register("order", { valueAsNumber: true })}
          id="order"
          type="number"
          min="0"
          className={cn(
            "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm",
            errors.order && "border-destructive",
          )}
        />
        {errors.order && (
          <p className="text-sm text-destructive">{errors.order.message}</p>
        )}
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
          ) : menu ? (
            "Update"
          ) : (
            "Create"
          )}
        </button>
      </div>
    </form>
  );
}

export default MenuForm;
