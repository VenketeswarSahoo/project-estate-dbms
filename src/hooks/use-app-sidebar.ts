import { useSidebarStore } from "@/store/sidebar-store";
import { useMediaQuery } from "./use-media-query";

export function useAppSidebar() {
  const {
    isMobileOpen,
    isDesktopCollapsed,
    openMobile,
    closeMobile,
    toggleMobile,
    toggleDesktop,
    setIsDesktopCollapsed,
  } = useSidebarStore();

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const toggleSidebar = () => {
    if (isDesktop) {
      toggleDesktop();
    } else {
      toggleMobile();
    }
  };

  const closeSidebar = () => {
    if (!isDesktop) {
      closeMobile();
    }
  };

  return {
    isMobileOpen,
    isDesktopCollapsed,
    isDesktop,
    openMobile,
    closeMobile,
    toggleMobile,
    toggleDesktop,
    toggleSidebar,
    closeSidebar,
    setIsDesktopCollapsed,
  };
}
