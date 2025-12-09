"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAppSidebar } from "@/hooks/use-app-sidebar";
import { useAuth } from "@/providers/auth";
import React, { useEffect } from "react";
import Header from "./Header";
import { AppSidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const { isMobileOpen, isDesktopCollapsed, closeMobile, toggleSidebar } =
    useAppSidebar();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:block transition-all duration-300 ${
          isDesktopCollapsed ? "w-16" : "w-64"
        }`}
      >
        <AppSidebar collapsed={isDesktopCollapsed} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={closeMobile}>
        <SheetContent side="left" className="p-0 w-64 sm:w-72">
          <AppSidebar onNavigate={closeMobile} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
