"use client";

import { Button } from "@/components/ui/button";
import { useAppSidebar } from "@/hooks/use-app-sidebar";
import { useAuthQuery } from "@/lib/hooks/useAuthQuery";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { useAppStore } from "@/store/useAppStore";
import { formatTimestamp } from "@/utility/formatTimestamp";
import {
  Bell,
  Loader,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { ScanDialog } from "../common/ScanDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ScrollArea } from "../ui/scroll-area";

const Header = () => {
  const user = useAppStore((state) => state.user);
  const { toggleSidebar, isDesktopCollapsed } = useAppSidebar();
  const {
    data: notifications = [],
    isLoading,
    refetch,
  } = useNotifications(user?.id);

  const { logout } = useAuthQuery();

  const { setTheme, theme } = useTheme();

  const router = useRouter();

  return (
    <header
      className={`flex items-center justify-between px-4 md:px-6 border-b ${
        isDesktopCollapsed ? "py-2.5" : "py-3"
      }`}
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          title={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isDesktopCollapsed ? (
            <Menu className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
        </Button>
        <div className="lg:block hidden">
          <ScanDialog />
        </div>
      </div>

      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative mr-2"
              title="Notifications"
              onClick={() => refetch()}
            >
              <Bell className="h-5 w-5" />
              {notifications.filter((n) => !n.isRead).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
                  {notifications.filter((n) => !n.isRead).length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Notifications
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Loading...
                  </span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No new notifications
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <DropdownMenuItem
                    key={n._id}
                    className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-muted transition-colors ${
                      n.isRead ? "opacity-50" : ""
                    }`}
                    onClick={() => router.push("/dashboard/messages")}
                  >
                    {/* Message Icon */}
                    <div
                      className={`flex-shrink-0 mt-0.5 ${
                        n.isRead ? "text-muted-foreground" : "text-primary"
                      }`}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium truncate`}>
                          {n.title}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        {formatTimestamp(n.createdAt)}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="gap-2 px-2 py-1 hover:bg-transparent relative"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/50 flex items-center justify-center text-white font-bold shadow-sm">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-background"></div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || `${user?.name.toLowerCase()}@estatedb.com`}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <div className="flex items-center">
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light Mode</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark Mode</span>
                </div>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
