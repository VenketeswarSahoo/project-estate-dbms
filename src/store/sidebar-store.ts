import { create } from "zustand";

interface SidebarStore {
  isMobileOpen: boolean;
  isDesktopCollapsed: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  toggleMobile: () => void;
  toggleDesktop: () => void;
  setIsDesktopCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isMobileOpen: false,
  isDesktopCollapsed: true,

  openMobile: () => set({ isMobileOpen: true }),
  closeMobile: () => set({ isMobileOpen: false }),
  toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),

  toggleDesktop: () =>
    set((state) => ({
      isDesktopCollapsed: !state.isDesktopCollapsed,
    })),

  setIsDesktopCollapsed: (collapsed) => set({ isDesktopCollapsed: collapsed }),
}));
