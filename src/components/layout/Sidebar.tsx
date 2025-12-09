"use client";

import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth";
import {
  Building,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CustomTooltip } from "../ui/custom-sidebar-tooltip";

interface SidebarProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function AppSidebar({ collapsed = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const mainMenuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/items", label: "Items", icon: Package },
    { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  ];

  if (user.role === "ADMIN") {
    mainMenuItems.push({
      href: "/dashboard/clients",
      label: "Clients",
      icon: Users,
    });
  }

  const settingsItem = {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
  };

  const handleNavigation = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  const isActive = (href: string) => pathname === href;

  const renderNavItem = (
    item: (typeof mainMenuItems)[0],
    isSettings = false
  ) => {
    const Icon = item.icon;
    const navItem = (
      <Link
        key={item.href}
        href={item.href}
        onClick={handleNavigation}
        className="block"
      >
        <div
          className={cn(
            "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            isActive(item.href) ? "bg-primary text-primary-foreground" : "",
            collapsed ? "justify-center" : "justify-start",
            isSettings && "mt-2"
          )}
        >
          <Icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </div>
      </Link>
    );

    if (collapsed) {
      return (
        <CustomTooltip key={item.href} content={item.label} side="right">
          {navItem}
        </CustomTooltip>
      );
    }

    return navItem;
  };

  return (
    <div className="flex flex-col h-full border-r">
      {/* Header */}
      <div className="flex items-center justify-between py-4 px-4 border-b">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-primary">EstateDB</span>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <Building className="h-6 w-6 text-primary" />
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {mainMenuItems.map((item) => renderNavItem(item))}
        </nav>
      </div>

      {/* Footer - User info */}
      <div className="p-3 border-t">{renderNavItem(settingsItem, true)}</div>
    </div>
  );
}
