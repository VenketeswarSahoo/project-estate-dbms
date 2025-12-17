"use client";

import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth";
import {
  Building,
  Building2,
  HeartHandshake,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  UserCheck,
  UserCog,
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
    mainMenuItems.push(
      {
        href: "/dashboard/agents",
        label: "Agents",
        icon: UserCog,
      },
      {
        href: "/dashboard/executors",
        label: "Executors",
        icon: UserCheck,
      },
      {
        href: "/dashboard/beneficiaries",
        label: "Beneficiaries",
        icon: HeartHandshake,
      },
      {
        href: "/dashboard/clients",
        label: "Clients",
        icon: Building2,
      }
    );
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
    const active = isActive(item.href);

    const navItem = (
      <Link
        key={item.href}
        href={item.href}
        onClick={handleNavigation}
        className="block"
      >
        <div
          className={cn(
            "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden",
            "group", // Added for hover effects
            collapsed ? "justify-center" : "justify-start",
            isSettings && "mt-2",
            active
              ? "text-primary-foreground shadow-lg shadow-primary/20"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
          style={
            active
              ? {
                  background:
                    "linear-gradient(to bottom, var(--primary) 0%, color-mix(in srgb, var(--primary) 90%, transparent) 50%, #B8860B 100%)",
                }
              : {}
          }
        >
          {/* Subtle top border effect */}
          {active && (
            <div className="absolute inset-0 border-t-[2px] border-white/50 rounded-lg scale-[0.98] pointer-events-none" />
          )}

          <Icon
            className={cn(
              "h-5 w-5 relative z-10 transition-transform duration-200",
              !collapsed && "mr-3",
              active && "text-white",
              !active && "group-hover:scale-110"
            )}
          />

          {!collapsed && (
            <span className="truncate relative z-10">{item.label}</span>
          )}

          {/* Subtle hover effect for inactive items */}
          {!active && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
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
    <div className="flex flex-col h-full border-r bg-background">
      {/* Header with subtle gradient */}
      <div className="relative overflow-hidden py-4 px-4 border-b">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        {!collapsed ? (
          <div className="flex items-center gap-2 relative z-10">
            <Building className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-primary">EstateDB</span>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full relative z-10">
            <Building className="h-6 w-6 text-primary" />
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-4 space-y-1">
        <nav className="space-y-1">
          {mainMenuItems.map((item) => renderNavItem(item))}
        </nav>
      </div>

      {/* Footer - Settings with gradient */}
      <div className="p-3 border-t bg-gradient-to-t from-muted/10 to-transparent">
        {renderNavItem(settingsItem, true)}
      </div>
    </div>
  );
}
