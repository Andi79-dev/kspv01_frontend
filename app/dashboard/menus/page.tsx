"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  useMenus,
  useMenusAll,
  useCreateMenu,
  useUpdateMenu,
  useDeleteMenu,
} from "@/hooks/usePermissions";
import { useAuthStore } from "@/store/authStore";
import { DataTable, createActionColumn } from "@/components/modules";
import { MenuForm } from "@/components/modules/menus/MenuForm";
import { Icon } from "@/components/layout/Icon";
import type { Menu } from "@/types";
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

// Extend Menu type to include parent for display
interface MenuWithParent extends Menu {
  parentMenu?: {
    nama_menu: string;
  };
}

export default function MenusPage() {
  const { canEdit, canDelete } = useAuthStore();

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  // Queries and mutations - paginated for table
  const { data: menusData, isLoading, refetch } = useMenus(page, pageSize);
  const { data: allMenus } = useMenusAll(); // For parent menu dropdown

  const createMenu = useCreateMenu();
  const updateMenu = useUpdateMenu();
  const deleteMenu = useDeleteMenu();

  const menus = menusData?.data || [];
  const paging = menusData?.paging;

  // Flatten menus for display (include parent name)
  const flatMenus: MenuWithParent[] = (menus || []).map((menu) => {
    const parent = allMenus?.find((m) => m.id === menu.parentId);
    return {
      ...menu,
      parentMenu: parent ? { nama_menu: parent.nama_menu } : undefined,
    };
  });

  // Define table columns
  const columns: ColumnDef<MenuWithParent>[] = [
    {
      accessorKey: "nama_menu",
      header: "Nama Menu",
    },
    {
      accessorKey: "icon",
      header: "Icon",
      cell: ({ row }) => {
        const icon = row.original.icon;
        return icon ? (
          <div className="flex items-center gap-2">
            <Icon name={icon} className="h-4 w-4" />
            <span className="text-muted-foreground text-xs">{icon}</span>
          </div>
        ) : null;
      },
    },
    {
      accessorKey: "url",
      header: "URL",
      cell: ({ row }) => {
        const url = row.original.url;
        return url ? (
          <span className="text-muted-foreground text-sm">{url}</span>
        ) : (
          <span className="text-muted-foreground text-sm italic">(Parent)</span>
        );
      },
    },
    {
      accessorKey: "order",
      header: "Order",
    },
    {
      accessorKey: "parentMenu",
      header: "Parent Menu",
      cell: ({ row }) => {
        const parent = row.original.parentMenu;
        return parent ? (
          <span className="text-sm">{parent.nama_menu}</span>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        );
      },
    },
  ];

  // Add action column if user has permissions
  if (canEdit(1) || canDelete(1)) {
    columns.push(
      createActionColumn<MenuWithParent>(
        canEdit(1) ? handleEdit : undefined,
        canDelete(1) ? handleDelete : undefined,
        canEdit(1),
        canDelete(1),
      ),
    );
  }

  // Handlers
  function handleEdit(row: MenuWithParent) {
    setSelectedMenu(row);
    setIsDialogOpen(true);
  }

  function handleDelete(row: MenuWithParent) {
    setSelectedMenu(row);
    setIsDeleteOpen(true);
  }

  async function handleSubmit(data: {
    nama_menu: string;
    icon?: string;
    url?: string | null;
    order: number;
    parentId?: number | null;
  }) {
    try {
      // Transform parentId - convert 0 to null
      const transformedData = {
        ...data,
        parentId: data.parentId === 0 ? null : data.parentId,
        url: data.url || null,
      };

      if (selectedMenu) {
        await updateMenu.mutateAsync({
          id: selectedMenu.id,
          menu: transformedData,
        });
        showSuccessToast("Menu updated successfully");
      } else {
        await createMenu.mutateAsync(transformedData);
        showSuccessToast("Menu created successfully");
      }

      setIsDialogOpen(false);
      setSelectedMenu(null);
      refetch();
    } catch (error) {
      handleApiError(error);
    }
  }

  async function handleDeleteConfirm() {
    if (selectedMenu) {
      try {
        await deleteMenu.mutateAsync(selectedMenu.id);
        showSuccessToast("Menu deleted successfully");
        setIsDeleteOpen(false);
        setSelectedMenu(null);
        refetch();
      } catch (error) {
        handleApiError(error);
      }
    }
  }

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1); // Reset to first page when page size changes
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menus</h1>
          <p className="text-muted-foreground">Manage menu structure</p>
        </div>
        {canEdit(1) && (
          <Button
            onClick={() => {
              setSelectedMenu(null);
              setIsDialogOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Menu
          </Button>
        )}
      </div>

      {/* Data Table with Pagination */}
      <DataTable<MenuWithParent, unknown>
        columns={columns}
        data={flatMenus}
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
              {selectedMenu ? "Edit Menu" : "Create Menu"}
            </DialogTitle>
            <DialogDescription>
              {selectedMenu
                ? "Update menu information below"
                : "Fill in the form to create a new menu"}
            </DialogDescription>
          </DialogHeader>
          <MenuForm
            menu={selectedMenu}
            menus={allMenus || []}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsDialogOpen(false);
              setSelectedMenu(null);
            }}
            isLoading={createMenu.isPending || updateMenu.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu</AlertDialogTitle>
            <AlertDialogDescription>
              {`Are you sure you want to delete menu "${selectedMenu?.nama_menu}"? This action cannot be undone.`}
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
