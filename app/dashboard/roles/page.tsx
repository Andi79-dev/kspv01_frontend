"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from "@/hooks/usePermissions";
import { useAuthStore } from "@/store/authStore";
import { DataTable, createActionColumn } from "@/components/modules";
import { RoleForm } from "@/components/modules/roles/RoleForm";
import type { Role } from "@/types";
import { handleApiError, showSuccessToast } from "@/lib/errorHandler";

// Icons
import { Plus } from "lucide-react";

// Dialog components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function RolesPage() {
  const { canEdit, canDelete } = useAuthStore();

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Queries and mutations
  const { data: roles, isLoading, refetch } = useRoles();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  // Define table columns
  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "nama_role",
      header: "Nama Role",
    },
    {
      accessorKey: "deskripsi",
      header: "Deskripsi",
    },
  ];

  // Add action column if user has permissions
  if (canEdit(1) || canDelete(1)) {
    columns.push(
      createActionColumn<Role>(
        canEdit(1) ? handleEdit : undefined,
        canDelete(1) ? handleDelete : undefined,
        canEdit(1),
        canDelete(1),
      ),
    );
  }

  // Handlers
  function handleEdit(row: Role) {
    setSelectedRole(row);
    setIsDialogOpen(true);
  }

  function handleDelete(row: Role) {
    setSelectedRole(row);
    setIsDeleteOpen(true);
  }

  async function handleSubmit(data: { nama_role: string; deskripsi?: string }) {
    try {
      if (selectedRole) {
        await updateRole.mutateAsync({
          id: selectedRole.id,
          role: data,
        });
        showSuccessToast("Role updated successfully");
      } else {
        await createRole.mutateAsync(data);
        showSuccessToast("Role created successfully");
      }

      setIsDialogOpen(false);
      setSelectedRole(null);
      refetch();
    } catch (error) {
      handleApiError(error);
    }
  }

  async function handleDeleteConfirm() {
    if (selectedRole) {
      try {
        await deleteRole.mutateAsync(selectedRole.id);
        showSuccessToast("Role deleted successfully");
        setIsDeleteOpen(false);
        setSelectedRole(null);
        refetch();
      } catch (error) {
        handleApiError(error);
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground">Manage role permissions</p>
        </div>
        {canEdit(1) && (
          <Button
            onClick={() => {
              setSelectedRole(null);
              setIsDialogOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Role
          </Button>
        )}
      </div>

      {/* Data Table */}
      <DataTable<Role, unknown>
        columns={columns}
        data={roles || []}
        isLoading={isLoading}
        canEdit={canEdit(1)}
        canDelete={canDelete(1)}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedRole ? "Edit Role" : "Create Role"}
            </DialogTitle>
            <DialogDescription>
              {selectedRole
                ? "Update role information below"
                : "Fill in the form to create a new role"}
            </DialogDescription>
          </DialogHeader>
          <RoleForm
            role={selectedRole}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsDialogOpen(false);
              setSelectedRole(null);
            }}
            isLoading={createRole.isPending || updateRole.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              {`Are you sure you want to delete role "${selectedRole?.nama_role}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
