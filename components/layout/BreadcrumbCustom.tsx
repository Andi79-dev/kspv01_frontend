"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAuthStore } from "@/store/authStore";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function BreadcrumbCustom() {
  const pathname = usePathname();
  const { menus } = useAuthStore();

  // Don't show breadcrumbs on home/login
  if (pathname === "/" || pathname === "/login") {
    return null;
  }

  // Split pathname into segments
  const segments = pathname.split("/").filter(Boolean);

  // Build breadcrumb items dynamically
  const buildBreadcrumbItems = () => {
    const items: { label: string; href: string; isLast: boolean }[] = [];
    let currentPath = "";

    segments.forEach((segment, index) => {
      // Skip if it's a numeric ID (dynamic route)
      if (/^\d+$/.test(segment)) {
        return;
      }

      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;

      // Try to find matching menu name from menus
      let label = formatSegment(segment);

      // Check if this segment matches any menu URL
      const matchingMenu = menus.find(
        (menu) => menu.url === currentPath || menu.url === `/${segment}`,
      );

      if (matchingMenu) {
        label = matchingMenu.nama_menu;
      }

      // Check submenus as well
      if (!matchingMenu) {
        for (const menu of menus) {
          const matchingSubmenu = menu.subMenus?.find(
            (sub) => sub.url === currentPath || sub.url === `/${segment}`,
          );
          if (matchingSubmenu) {
            label = matchingSubmenu.nama_menu;
            break;
          }
        }
      }

      items.push({ label, href: currentPath, isLast });
    });

    return items;
  };

  // Format segment to readable text
  const formatSegment = (segment: string): string => {
    const specialCases: Record<string, string> = {
      dashboard: "Dashboard",
      master: "Master",
      settings: "Settings",
      profile: "Profile",
      users: "Users",
      roles: "Roles",
      permissions: "Permissions",
      login: "Login",
      menus: "Menus",
    };

    if (specialCases[segment.toLowerCase()]) {
      return specialCases[segment.toLowerCase()];
    }

    // Handle kebab-case
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const breadcrumbItems = buildBreadcrumbItems();

  // Don't render if no items
  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home Link */}
        <BreadcrumbItem>
          <BreadcrumbLink
            href="/dashboard"
            className={cn("flex items-center gap-1", "hover:text-foreground")}
          >
            <Home className="h-4 w-4" />
            <span className="hidden md:inline lg:inline">Home</span>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Render each segment */}
        {breadcrumbItems.map((item) => (
          <React.Fragment key={item.href}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage className="font-medium">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default BreadcrumbCustom;
