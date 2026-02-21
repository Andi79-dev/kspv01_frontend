"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@/hooks/usePermissions";
import { useAuthStore } from "@/store/authStore";
import { DataTable, createActionColumn } from "@/components/modules";
import { UserForm } from "@/components/modules/users/UserForm";
import type { UserResponse } from "@/types";
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

// Format date to Indonesian locale
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function UsersPage() {
  const { canEdit, canDelete } = useAuthStore();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

  // Queries and mutations
  const { data, isLoading, refetch } = useUsers(page, pageSize);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  // Define table columns
  const columns: ColumnDef<UserResponse>[] = [
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "nama",
      header: "Nama",
    },
    {
      accessorKey: "nama_role",
      header: "Role",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            row.original.status
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.original.status ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  ];

  // Add action column if user has permissions
  if (canEdit(1) || canDelete(1)) {
    columns.push(
      createActionColumn<UserResponse>(
        canEdit(1) ? handleEdit : undefined,
        canDelete(1) ? handleDelete : undefined,
        canEdit(1),
        canDelete(1),
      ),
    );
  }

  // Handlers
  function handleEdit(row: UserResponse) {
    setSelectedUser(row);
    setIsDialogOpen(true);
  }

  function handleDelete(row: UserResponse) {
    setSelectedUser(row);
    setIsDeleteOpen(true);
  }

  async function handleSubmit(data: {
    username: string;
    nama: string;
    roleId: number;
    status?: boolean;
    password?: string;
  }) {
    try {
      if (selectedUser) {
        // Update existing user
        await updateUser.mutateAsync({
          id: selectedUser.id,
          user: {
            nama: data.nama,
            roleId: data.roleId,
            status: data.status ?? true,
          },
        });
        showSuccessToast("User updated successfully");
      } else {
        // Create new user
        await createUser.mutateAsync({
          username: data.username,
          nama: data.nama,
          roleId: data.roleId,
          status: data.status ?? true,
          password: data.password || "",
        });
        showSuccessToast("User created successfully");
      }

      // Close dialog and refresh data
      setIsDialogOpen(false);
      setSelectedUser(null);
      refetch();
    } catch (error) {
      handleApiError(error);
    }
  }

  async function handleDeleteConfirm() {
    if (selectedUser) {
      try {
        await deleteUser.mutateAsync(selectedUser.id);
        showSuccessToast("User deleted successfully");
        setIsDeleteOpen(false);
        setSelectedUser(null);
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
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        {canEdit(1) && (
          <Button
            onClick={() => {
              setSelectedUser(null);
              setIsDialogOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      {/* Data Table */}
      <DataTable<UserResponse, unknown>
        columns={columns}
        data={data?.data || []}
        paging={data?.paging}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        isLoading={isLoading}
        canEdit={canEdit(1)}
        canDelete={canDelete(1)}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Edit User" : "Create User"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser
                ? "Update user information below"
                : "Fill in the form to create a new user"}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            user={selectedUser}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsDialogOpen(false);
              setSelectedUser(null);
            }}
            isLoading={createUser.isPending || updateUser.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              {`Are you sure you want to delete user "${selectedUser?.nama}"? This action cannot be undone.`}
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
