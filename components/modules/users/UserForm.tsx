/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRoles } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import type { UserResponse, Role } from "@/types";

// Icons
import { Loader2 } from "lucide-react";

// Zod validation schema
const userSchema = z.object({
  username: z.string().min(1, "Username is required"),
  nama: z.string().min(1, "Nama is required"),
  roleId: z.number().min(1, "Role is required"),
  status: z.boolean().optional(),
  password: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: UserResponse | null;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function UserForm({
  user,
  onSubmit,
  onCancel,
  isLoading,
}: UserFormProps) {
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: user?.username || "",
      nama: user?.nama || "",
      roleId: user?.roleId || 0,
      status: user?.status ?? true,
      password: "",
    },
  });

  // Watch roleId for potential use
  void watch("roleId");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Username */}
      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium">
          Username
        </label>
        <input
          {...register("username")}
          id="username"
          type="text"
          placeholder="Enter username"
          className={cn(
            "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm",
            errors.username && "border-destructive",
          )}
          disabled={!!user} // Username should not be editable
        />
        {errors.username && (
          <p className="text-sm text-destructive">{errors.username.message}</p>
        )}
      </div>

      {/* Nama */}
      <div className="space-y-2">
        <label htmlFor="nama" className="text-sm font-medium">
          Nama Lengkap
        </label>
        <input
          {...register("nama")}
          id="nama"
          type="text"
          placeholder="Enter full name"
          className={cn(
            "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm",
            errors.nama && "border-destructive",
          )}
        />
        {errors.nama && (
          <p className="text-sm text-destructive">{errors.nama.message}</p>
        )}
      </div>

      {/* Role */}
      <div className="space-y-2">
        <label htmlFor="roleId" className="text-sm font-medium">
          Role
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

      {/* Password (only for new user) */}
      {!user && (
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <input
              {...register("password")}
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              className={cn(
                "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm pr-10",
                errors.password && "border-destructive",
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
      )}

      {/* Status */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="status"
          checked={watch("status")}
          onChange={(e) => setValue("status", e.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor="status" className="text-sm font-medium">
          Active
        </label>
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
          ) : user ? (
            "Update"
          ) : (
            "Create"
          )}
        </button>
      </div>
    </form>
  );
}

export default UserForm;
