"use client";

import { useThemeToggle } from "@/hooks/use-theme-toggle";
import { Moon, Sun } from "lucide-react";

export const ThemeToggleButton = () => {
  const { isDark, toggleTheme } = useThemeToggle();

  return (
    <button
      type="button"
      className={
        "size-10 cursor-pointer rounded-full p-0 transition-all duration-300 active:scale-95"
      }
      onClick={toggleTheme}
    >
      {isDark ? <Sun /> : <Moon />}
    </button>
  );
};
