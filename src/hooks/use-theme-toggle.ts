import { createAnimation } from "@/lib/utils/createAnimation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";

export const useThemeToggle = () => {
  const variant = "circle";
  const start = "top-right";
  const blur = true;
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [isDark, setIsDark] = useState(false);

  // Sync isDark state with resolved theme after hydration
  useEffect(() => {
    setIsDark(resolvedTheme === "dark");
  }, [resolvedTheme]);

  const styleId = "theme-transition-styles";

  const updateStyles = useCallback((css: string, name: string) => {
    if (typeof window === "undefined") return;

    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = css;

    console.log("content updated");
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(!isDark);

    const animation = createAnimation(variant, start, blur);

    updateStyles(animation.css, animation.name);

    if (typeof window === "undefined") return;

    const switchTheme = () => {
      setTheme(theme === "light" ? "dark" : "light");
    };

    if (!document.startViewTransition) {
      switchTheme();
      return;
    }

    document.startViewTransition(switchTheme);
  }, [theme, setTheme, variant, start, blur, updateStyles, isDark, setIsDark]);

  const setCrazyLightTheme = useCallback(() => {
    setIsDark(false);

    const animation = createAnimation(variant, start, blur);

    updateStyles(animation.css, animation.name);

    if (typeof window === "undefined") return;

    const switchTheme = () => {
      setTheme("light");
    };

    if (!document.startViewTransition) {
      switchTheme();
      return;
    }

    document.startViewTransition(switchTheme);
  }, [setTheme, variant, start, blur, updateStyles, setIsDark]);

  const setCrazyDarkTheme = useCallback(() => {
    setIsDark(true);

    const animation = createAnimation(variant, start, blur);

    updateStyles(animation.css, animation.name);

    if (typeof window === "undefined") return;

    const switchTheme = () => {
      setTheme("dark");
    };

    if (!document.startViewTransition) {
      switchTheme();
      return;
    }

    document.startViewTransition(switchTheme);
  }, [setTheme, variant, start, blur, updateStyles, setIsDark]);

  return {
    isDark,
    setIsDark,
    toggleTheme,
    setCrazyLightTheme,
    setCrazyDarkTheme,
  };
};
