"use client";

import {
  LayoutDashboard,
  Database,
  Users,
  UserCircle,
  Settings,
  Menu,
  ChevronDown,
  ChevronRight,
  Home,
  Bell,
  Search,
  Shield,
  Key,
  FileText,
  Calendar,
  BarChart3,
  Package,
  ShoppingCart,
  DollarSign,
  CreditCard,
  Building2,
  UsersRound,
  UserPlus,
  UserMinus,
  ClipboardList,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  HelpCircle,
  ChevronLeft,
  ChevronUp,
  PanelLeftClose,
  PanelLeft,
  LucideIcon,
} from "lucide-react";

// Component map for icons
const iconComponents: Record<string, LucideIcon> = {
  LayoutDashboard,
  Database,
  Users,
  UserCircle,
  Settings,
  Menu,
  ChevronDown,
  ChevronRight,
  Home,
  Bell,
  Search,
  Shield,
  Key,
  FileText,
  Calendar,
  BarChart3,
  Package,
  ShoppingCart,
  DollarSign,
  CreditCard,
  Building2,
  UsersRound,
  UserPlus,
  UserMinus,
  ClipboardList,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  HelpCircle,
  ChevronLeft,
  ChevronUp,
  PanelLeftClose,
  PanelLeft,
};

// Map database icon names to component keys
// e.g., "DatabaseIcon" -> "Database", "UsersIcon" -> "Users"
const normalizeIconName = (name?: string): string => {
  if (!name) return "LayoutDashboard";
  // Remove "Icon" suffix if present (e.g., "DatabaseIcon" -> "Database")
  return name.replace(/Icon$/, "");
};

// Dynamic icon component
export function Icon({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  const normalizedName = normalizeIconName(name);
  const IconComponent = iconComponents[normalizedName] || LayoutDashboard;

  return <IconComponent className={className} />;
}

// Type for icon selector
export interface IconSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

// Icon selector for forms (placeholder)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function IconSelector(_props: IconSelectorProps) {
  // This is a placeholder - implement in forms if needed
  return null;
}

export default Icon;
