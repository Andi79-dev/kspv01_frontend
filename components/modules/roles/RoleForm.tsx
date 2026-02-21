"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

// Icons
import { Loader2 } from "lucide-react";

// Zod validation schema
const roleSchema = z.object({
  nama_role: z.string().min(1, "Nama role is required"),
  deskripsi: z.string().optional(),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleFormProps {
  role?: Role | null;
  onSubmit: (data: RoleFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RoleForm({
  role,
  onSubmit,
  onCancel,
  isLoading,
}: RoleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      nama_role: role?.nama_role || "",
      deskripsi: role?.deskripsi || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Nama Role */}
      <div className="space-y-2">
        <label htmlFor="nama_role" className="text-sm font-medium">
          Nama Role
        </label>
        <input
          {...register("nama_role")}
          id="nama_role"
          type="text"
          placeholder="Enter role name"
          className={cn(
            "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm",
            errors.nama_role && "border-destructive",
          )}
        />
        {errors.nama_role && (
          <p className="text-sm text-destructive">{errors.nama_role.message}</p>
        )}
      </div>

      {/* Deskripsi */}
      <div className="space-y-2">
        <label htmlFor="deskripsi" className="text-sm font-medium">
          Deskripsi
        </label>
        <textarea
          {...register("deskripsi")}
          id="deskripsi"
          placeholder="Enter description"
          rows={3}
          className={cn(
            "flex w-full rounded-md border bg-background px-3 py-2 text-sm",
            errors.deskripsi && "border-destructive",
          )}
        />
        {errors.deskripsi && (
          <p className="text-sm text-destructive">{errors.deskripsi.message}</p>
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
          ) : role ? (
            "Update"
          ) : (
            "Create"
          )}
        </button>
      </div>
    </form>
  );
}

export default RoleForm;
