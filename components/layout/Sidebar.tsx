"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { Icon } from "./Icon";
import { menusApi, permissionsApi } from "@/lib/api";
import type { Menu } from "@/types";

// Shadcn UI Components
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Icons
import { PanelLeftClose, PanelLeft } from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const {
    sidebarOpen,
    setSidebarOpen,
    canView,
    setMenus,
    setPermissions,
    menus,
    roleId,
    isAuthenticated,
  } = useAuthStore();

  // Fetch menus and permissions on mount if authenticated
  const { isLoading } = useQuery({
    queryKey: ["menus-permissions"],
    queryFn: async () => {
      if (!isAuthenticated || !roleId) {
        return { menus: [], permissions: [] };
      }

      const [fetchedMenus, fetchedPermissions] = await Promise.all([
        menusApi.getAllNoPagination(),
        permissionsApi.getByRoleId(roleId),
      ]);

      setMenus(fetchedMenus);
      setPermissions(fetchedPermissions);

      return { menus: fetchedMenus, permissions: fetchedPermissions };
    },
    enabled: isAuthenticated && !!roleId,
    staleTime: 5 * 60 * 1000,
  });

  // Filter menus that have view permission
  const visibleMenus = menus.filter((menu) => canView(menu.id));

  // Sort menus by order
  const sortedMenus = [...visibleMenus].sort((a, b) => a.order - b.order);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-sidebar transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16",
        className,
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {sidebarOpen && (
          <span className="font-semibold text-sidebar-foreground">
            RBAC System
          </span>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-md p-1 hover:bg-sidebar-accent"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-5 w-5 text-sidebar-foreground" />
          ) : (
            <PanelLeft className="h-5 w-5 text-sidebar-foreground" />
          )}
        </button>
      </div>

      {/* Navigation with ScrollArea */}
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <nav className="flex flex-col gap-1 p-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : sortedMenus.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No menus available for your role
            </div>
          ) : (
            sortedMenus.map((menu) => (
              <MenuItem
                key={menu.id}
                menu={menu}
                pathname={pathname}
                sidebarOpen={sidebarOpen}
              />
            ))
          )}
        </nav>
      </ScrollArea>
    </aside>
  );
}

// Menu Item Component using Accordion
interface MenuItemProps {
  menu: Menu;
  pathname: string;
  sidebarOpen: boolean;
}

function MenuItem({ menu, pathname, sidebarOpen }: MenuItemProps) {
  const { canView } = useAuthStore();

  // Filter visible submenus
  const visibleSubMenus: Menu[] =
    menu.subMenus?.filter((sub: Menu) => canView(sub.id)) || [];

  const hasChildren = visibleSubMenus.length > 0;

  // Check if this menu or any submenu is active
  const isActive = menu.url ? pathname === menu.url : false;
  const isChildActive = visibleSubMenus.some(
    (sub: Menu) => sub.url && pathname === sub.url,
  );

  // Check if any child is expanded (active)
  const isExpanded =
    isChildActive ||
    visibleSubMenus.some(
      (sub: Menu) => sub.url && pathname.startsWith(sub.url || ""),
    );

  if (!sidebarOpen) {
    // Collapsed state - only show icons
    return (
      <Link
        href={menu.url || "#"}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
          isActive || isChildActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent",
        )}
        title={menu.nama_menu}
      >
        <Icon name={menu.icon} className="h-5 w-5" />
      </Link>
    );
  }

  // Expanded state with Accordion
  if (hasChildren) {
    return (
      <Accordion
        type="single"
        collapsible
        defaultValue={isExpanded ? `menu-${menu.id}` : undefined}
      >
        <AccordionItem value={`menu-${menu.id}`} className="border-b-0">
          <AccordionTrigger
            className={cn(
              "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:no-underline",
              "text-sidebar-foreground hover:bg-sidebar-accent",
              (isActive || isChildActive) && "bg-sidebar-accent",
            )}
          >
            <div className="flex items-center gap-3">
              <Icon name={menu.icon} className="h-5 w-5" />
              <span>{menu.nama_menu}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-1 pl-4">
              {visibleSubMenus
                .sort((a: Menu, b: Menu) => a.order - b.order)
                .map((subMenu: Menu) => {
                  const isSubActive = subMenu.url
                    ? pathname === subMenu.url
                    : false;

                  return (
                    <Link
                      key={subMenu.id}
                      href={subMenu.url || "#"}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                        isSubActive &&
                          "bg-sidebar-primary text-sidebar-primary-foreground",
                      )}
                    >
                      <Icon name={subMenu.icon} className="h-4 w-4" />
                      <span>{subMenu.nama_menu}</span>
                    </Link>
                  );
                })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  // Leaf menu (no children)
  return (
    <Link
      href={menu.url || "#"}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        "text-sidebar-foreground hover:bg-sidebar-accent",
        isActive && "bg-sidebar-primary text-sidebar-primary-foreground",
      )}
    >
      <Icon name={menu.icon} className="h-5 w-5" />
      <span>{menu.nama_menu}</span>
    </Link>
  );
}

// Mobile Sidebar Component
interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname();
  const { canView, menus, roleId, isAuthenticated, setMenus, setPermissions } =
    useAuthStore();

  // Fetch menus
  useQuery({
    queryKey: ["menus-permissions-mobile"],
    queryFn: async () => {
      if (!isAuthenticated || !roleId) {
        return { menus: [], permissions: [] };
      }

      const [fetchedMenus, fetchedPermissions] = await Promise.all([
        menusApi.getAllNoPagination(),
        permissionsApi.getByRoleId(roleId),
      ]);

      setMenus(fetchedMenus);
      setPermissions(fetchedPermissions);

      return { menus: fetchedMenus, permissions: fetchedPermissions };
    },
    enabled: isAuthenticated && !!roleId,
    staleTime: 5 * 60 * 1000,
  });

  const visibleMenus = menus.filter((menu) => canView(menu.id));
  const sortedMenus = [...visibleMenus].sort((a, b) => a.order - b.order);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sheet/Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <span className="font-semibold text-sidebar-foreground">
            RBAC System
          </span>
        </div>

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <nav className="flex flex-col gap-1 p-2">
            {sortedMenus.map((menu) => (
              <MenuItem
                key={menu.id}
                menu={menu}
                pathname={pathname}
                sidebarOpen={true}
              />
            ))}
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
}

export default Sidebar;
