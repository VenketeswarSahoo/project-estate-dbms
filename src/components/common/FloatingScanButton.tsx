"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import {
  Camera,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { MobileScanDialog } from "./mobile-scan-dialog";

export function FloatingScanButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAppStore();

  const isAdmin = user?.role === "ADMIN";

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/80 backdrop-blur-lg border-t pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16 px-2">
          <Button
            variant="ghost"
            className={cn(
              "flex flex-col items-center gap-1 h-auto py-2 px-1 hover:bg-transparent min-w-[64px]",
              pathname === "/dashboard"
                ? "text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => router.push("/dashboard")}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[10px] font-medium">Home</span>
          </Button>

          {isAdmin && (
            <Button
              variant="ghost"
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2 px-1 hover:bg-transparent min-w-[64px]",
                pathname === "/dashboard/items"
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
              onClick={() => router.push("/dashboard/items")}
            >
              <Package className="h-5 w-5" />
              <span className="text-[10px] font-medium">Items</span>
            </Button>
          )}

          <div className="relative -top-5">
            <Button
              size="icon"
              className="rounded-full w-14 h-14 shadow-lg bg-primary text-primary-foreground hover:scale-105 transition-transform duration-200 border-4 border-background"
              onClick={() => setOpen(true)}
            >
              <Camera className="h-6 w-6" />
            </Button>
          </div>

          {isAdmin && (
            <Button
              variant="ghost"
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2 px-1 hover:bg-transparent min-w-[64px]",
                pathname === "/dashboard/messages"
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
              onClick={() => router.push("/dashboard/messages")}
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-[10px] font-medium">Chat</span>
            </Button>
          )}

          <Button
            variant="ghost"
            className={cn(
              "flex flex-col items-center gap-1 h-auto py-2 px-1 hover:bg-transparent min-w-[64px]",
              pathname === "/dashboard/settings"
                ? "text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => router.push("/dashboard/settings")}
          >
            <Settings className="h-5 w-5" />
            <span className="text-[10px] font-medium">Settings</span>
          </Button>
        </div>
      </div>

      <MobileScanDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
