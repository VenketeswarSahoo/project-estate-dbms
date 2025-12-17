import { Client, Item, Message, User } from "@/types";
import { jwtDecode } from "jwt-decode";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AppState {
  token: string | null;
  currentUser: CurrentUser | null;
  users: User[];
  items: Item[];
  messages: Message[];

  loading: {
    users: boolean;
    items: boolean;
    messages: boolean;
    auth: boolean;
    [key: string]: boolean;
  };

  fetchUsers: (role?: string) => Promise<void>;
  fetchItems: (clientId?: string) => Promise<void>;
  fetchMessages: (filters?: any) => Promise<void>;

  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;

  addItem: (
    item: Omit<Item, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  batchUpdateItems: (ids: string[], updates: Partial<Item>) => Promise<void>;

  addUser: (user: Partial<User>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  addClientHelper: (client: Partial<Client>) => Promise<void>;
  addMessage: (message: Omit<Message, "id">) => Promise<void>;
}

export type Role = "ADMIN" | "AGENT" | "EXECUTOR" | "BENEFICIARY" | "CLIENT";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      token: null,
      currentUser: null,
      users: [],
      items: [],
      messages: [],

      loading: {
        users: false,
        items: false,
        messages: false,
        auth: false,
      },

      // ------------------------
      // Auth
      // ------------------------
      login: async (email, password) => {
        set((state) => ({ loading: { ...state.loading, auth: true } }));
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();

          if (res.ok && data.success && data.token) {
            const decoded: CurrentUser = jwtDecode(data.token);
            set({ currentUser: decoded, token: data.token });
            return true;
          }

          console.error("Login failed:", data.error);
          return false;
        } catch (error) {
          console.error("Login error:", error);
          return false;
        } finally {
          set((state) => ({ loading: { ...state.loading, auth: false } }));
        }
      },

      logout: async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
          set({ currentUser: null, users: [], items: [], messages: [] });
          window.localStorage.clear();
          window.sessionStorage.clear();
        } catch (err) {
          console.error("Logout error:", err);
        }
      },

      // ------------------------
      // Fetch
      // ------------------------
      fetchUsers: async (role) => {
        set((state) => ({ loading: { ...state.loading, users: true } }));
        try {
          const query = role ? `?role=${role}` : "";
          const res = await fetch(`/api/users${query}`);
          if (res.ok) {
            const data = await res.json();
            set({ users: data });
          }
        } catch (err) {
          console.error("Failed to fetch users", err);
        } finally {
          set((state) => ({ loading: { ...state.loading, users: false } }));
        }
      },

      fetchItems: async (clientId) => {
        set((state) => ({ loading: { ...state.loading, items: true } }));
        try {
          const query = clientId ? `?clientId=${clientId}` : "";
          const res = await fetch(`/api/items${query}`);
          if (res.ok) {
            const data = await res.json();
            set({ items: data });
          }
        } catch (err) {
          console.error("Failed to fetch items", err);
        } finally {
          set((state) => ({ loading: { ...state.loading, items: false } }));
        }
      },

      fetchMessages: async (filters) => {
        set((state) => ({ loading: { ...state.loading, messages: true } }));
        try {
          const queryParams = new URLSearchParams(filters).toString();
          const query = queryParams ? `?${queryParams}` : "";
          const res = await fetch(`/api/messages${query}`);
          if (res.ok) {
            const data = await res.json();
            set({ messages: data });
          }
        } catch (err) {
          console.error("Failed to fetch messages", err);
        } finally {
          set((state) => ({ loading: { ...state.loading, messages: false } }));
        }
      },

      // ------------------------
      // Item CRUD
      // ------------------------
      addItem: async (itemData) => {
        set((state) => ({ loading: { ...state.loading, items: true } }));
        try {
          const res = await fetch("/api/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(itemData),
          });
          if (res.ok) {
            const newItem = await res.json();
            set((state) => ({ items: [newItem, ...state.items] }));
          }
        } catch (err) {
          console.error("Failed to add item", err);
        } finally {
          set((state) => ({ loading: { ...state.loading, items: false } }));
        }
      },

      updateItem: async (id, updates) => {
        set((state) => ({ loading: { ...state.loading, items: true } }));
        try {
          const res = await fetch(`/api/items/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });
          if (res.ok) {
            const updatedItem = await res.json();
            set((state) => ({
              items: state.items.map((i) => (i.id === id ? updatedItem : i)),
            }));
          }
        } catch (err) {
          console.error("Failed to update item", err);
        } finally {
          set((state) => ({ loading: { ...state.loading, items: false } }));
        }
      },

      deleteItem: async (id) => {
        set((state) => ({ loading: { ...state.loading, items: true } }));
        try {
          const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
          if (res.ok) {
            set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
          }
        } catch (err) {
          console.error("Failed to delete item", err);
        } finally {
          set((state) => ({ loading: { ...state.loading, items: false } }));
        }
      },

      batchUpdateItems: async (ids, updates) => {
        await Promise.all(ids.map((id) => get().updateItem(id, updates)));
      },

      // ------------------------
      // User CRUD
      // ------------------------
      addUser: async (userData) => {
        set((state) => ({ loading: { ...state.loading, users: true } }));
        try {
          const res = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          });
          if (res.ok) {
            const newUser = await res.json();
            set((state) => ({ users: [newUser, ...state.users] }));
          }
        } catch (err) {
          console.error("Failed to add user", err);
        } finally {
          set((state) => ({ loading: { ...state.loading, users: false } }));
        }
      },

      updateUser: async (id, updates) => {
        set((state) => ({ loading: { ...state.loading, users: true } }));
        try {
          const res = await fetch(`/api/users/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });
          if (res.ok) {
            const updatedUser = await res.json();
            set((state) => ({
              users: state.users.map((u) => (u.id === id ? updatedUser : u)),
            }));
          }
        } catch (err) {
          console.error("Failed to update user", err);
        } finally {
          set((state) => ({ loading: { ...state.loading, users: false } }));
        }
      },

      deleteUser: async (id) => {
        set((state) => ({ loading: { ...state.loading, users: true } }));
        try {
          const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
          if (res.ok) {
            set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
          }
        } catch (err) {
          console.error("Failed to delete user", err);
        } finally {
          set((state) => ({ loading: { ...state.loading, users: false } }));
        }
      },

      addClientHelper: async (clientData) => {
        const data = { ...clientData, role: "CLIENT" };
        return get().addUser(data as any);
      },

      // ------------------------
      // Messages
      // ------------------------
      addMessage: async (messageData) => {
        set((state) => ({ loading: { ...state.loading, messages: true } }));
        try {
          const res = await fetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(messageData),
          });
          if (res.ok) {
            const newMessage = await res.json();
            set((state) => ({ messages: [...state.messages, newMessage] }));
          }
        } catch (err) {
          console.error("Failed to add message", err);
        } finally {
          set((state) => ({ loading: { ...state.loading, messages: false } }));
        }
      },
    }),
    {
      name: "estate-dbms-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
