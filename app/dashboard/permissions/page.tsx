"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  usePermissions,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
} from "@/hooks/usePermissions";
import { useAuthStore } from "@/store/authStore";
import { DataTable, createActionColumn } from "@/components/modules";
import { PermissionForm } from "@/components/modules/permissions/PermissionForm";
import type { Permission } from "@/types";

// Icons
import { Plus, Check, X } from "lucide-react";

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

// Extend Permission type for display
interface PermissionDisplay extends Permission {
  roleName?: string;
  menuName?: string;
}

export default function PermissionsPage() {
  const { canEdit, canDelete } = useAuthStore();

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<PermissionDisplay | null>(null);

  // Queries and mutations
  const { data, isLoading, refetch } = usePermissions(page, pageSize);
  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const deletePermission = useDeletePermission();

  // Extract permissions data and paging
  const permissions: PermissionDisplay[] = data?.data || [];
  const paging = data?.paging;

  // Define table columns
  const columns: ColumnDef<PermissionDisplay>[] = [
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role;
        return role ? (
          <span className="text-sm font-medium">{role.nama_role}</span>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        );
      },
    },
    {
      accessorKey: "menu",
      header: "Menu",
      cell: ({ row }) => {
        const menu = row.original.menu;
        return menu ? (
          <span className="text-sm">{menu.nama_menu}</span>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        );
      },
    },
    {
      accessorKey: "can_view",
      header: "Can View",
      cell: ({ row }) => {
        const canView = row.original.can_view;
        return canView ? (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            <Check className="mr-1 h-3 w-3" />
            Yes
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            <X className="mr-1 h-3 w-3" />
            No
          </span>
        );
      },
    },
    {
      accessorKey: "can_edit",
      header: "Can Edit",
      cell: ({ row }) => {
        const canEdit = row.original.can_edit;
        return canEdit ? (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            <Check className="mr-1 h-3 w-3" />
            Yes
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            <X className="mr-1 h-3 w-3" />
            No
          </span>
        );
      },
    },
    {
      accessorKey: "can_approve",
      header: "Can Approve",
      cell: ({ row }) => {
        const canApprove = row.original.can_approve;
        return canApprove ? (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            <Check className="mr-1 h-3 w-3" />
            Yes
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            <X className="mr-1 h-3 w-3" />
            No
          </span>
        );
      },
    },
  ];

  // Add action column if user has permissions
  if (canEdit(1) || canDelete(1)) {
    columns.push(
      createActionColumn<PermissionDisplay>(
        canEdit(1) ? handleEdit : undefined,
        canDelete(1) ? handleDelete : undefined,
        canEdit(1),
        canDelete(1),
      ),
    );
  }

  // Handlers
  function handleEdit(row: PermissionDisplay) {
    setSelectedPermission(row);
    setIsDialogOpen(true);
  }

  function handleDelete(row: PermissionDisplay) {
    setSelectedPermission(row);
    setIsDeleteOpen(true);
  }

  async function handleSubmit(data: {
    roleId: number;
    menuId: number;
    can_view: boolean;
    can_edit: boolean;
    can_approve: boolean;
  }) {
    try {
      if (selectedPermission) {
        await updatePermission.mutateAsync({
          id: selectedPermission.id,
          permission: {
            can_view: data.can_view,
            can_edit: data.can_edit,
            can_approve: data.can_approve,
          },
        });
      } else {
        await createPermission.mutateAsync(data);
      }

      setIsDialogOpen(false);
      setSelectedPermission(null);
      refetch();
    } catch (error) {
      console.error("Error saving permission:", error);
    }
  }

  async function handleDeleteConfirm() {
    if (selectedPermission) {
      try {
        await deletePermission.mutateAsync(selectedPermission.id);
        setIsDeleteOpen(false);
        setSelectedPermission(null);
        refetch();
      } catch (error) {
        console.error("Error deleting permission:", error);
      }
    }
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
          <p className="text-muted-foreground">
            Manage role-based menu permissions
          </p>
        </div>
        {canEdit(1) && (
          <Button
            onClick={() => {
              setSelectedPermission(null);
              setIsDialogOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Permission
          </Button>
        )}
      </div>

      {/* Data Table */}
      <DataTable<PermissionDisplay, unknown>
        columns={columns}
        data={permissions}
        paging={paging}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        isLoading={isLoading}
        canEdit={canEdit(1)}
        canDelete={canDelete(1)}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedPermission ? "Edit Permission" : "Create Permission"}
            </DialogTitle>
            <DialogDescription>
              {selectedPermission
                ? "Update permission settings below"
                : "Fill in the form to create a new permission"}
            </DialogDescription>
          </DialogHeader>
          <PermissionForm
            permission={selectedPermission}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsDialogOpen(false);
              setSelectedPermission(null);
            }}
            isLoading={createPermission.isPending || updatePermission.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Permission</AlertDialogTitle>
            <AlertDialogDescription>
              {`Are you sure you want to delete this permission? This action cannot be undone.`}
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
