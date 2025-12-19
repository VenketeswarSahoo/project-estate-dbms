"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAppSidebar } from "@/hooks/use-app-sidebar";
import { useAppStore } from "@/store/useAppStore";
import React, { useEffect } from "react";
import Header from "./Header";
import { AppSidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAppStore();

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
      <div
        className={`hidden md:block transition-all duration-300 ${
          isDesktopCollapsed ? "w-16" : "w-64"
        }`}
      >
        <AppSidebar collapsed={isDesktopCollapsed} />
      </div>

      <Sheet open={isMobileOpen} onOpenChange={closeMobile}>
        <SheetContent side="left" className="p-0 w-64 sm:w-72">
          <AppSidebar onNavigate={closeMobile} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
