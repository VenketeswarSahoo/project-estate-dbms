import { CurrentUser } from "@/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AppState {
  token: string | null;
  user: CurrentUser | null;
  sidebarOpen: boolean;

  setAuth: (token: string, user: CurrentUser) => void;
  clearAuth: () => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      sidebarOpen: false,

      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: "estate-dbms-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
