"use client";

import { Button } from "@/components/ui/button";
import { useAppSidebar } from "@/hooks/use-app-sidebar";
import { useAuthQuery } from "@/lib/hooks/useAuthQuery";
import { useAppStore } from "@/store/useAppStore";
import { LogOut, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { ScanDialog } from "../common/ScanDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";

const Header = () => {
  const user = useAppStore((state) => state.user);
  const { toggleSidebar, isDesktopCollapsed } = useAppSidebar();

  const { logout } = useAuthQuery();

  const { setTheme, theme } = useTheme();

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
          <div className="relative flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search items, users, messages..."
                className="pl-10 w-64 md:w-80"
              />
            </div>
            <ScanDialog />
          </div>
        </div>
      </div>

      <div className="flex items-center">
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
