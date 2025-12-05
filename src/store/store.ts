import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Client, Item, Message } from "@/types";
import {
  MOCK_USERS,
  MOCK_CLIENTS,
  MOCK_ITEMS,
  MOCK_MESSAGES,
} from "../data/mock-data";

interface AppState {
  currentUser: User | null;
  users: User[];
  clients: Client[];
  items: Item[];
  messages: Message[];

  login: (email: string, password?: string) => boolean;
  logout: () => void;

  addItem: (item: Item) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;

  addMessage: (message: Message) => void;
  markMessageRead: (id: string) => void;

  addClientBeneficiary: (clientId: string, name: string) => void;
  addClientDonationRecipient: (clientId: string, name: string) => void;
  addClientAction: (clientId: string, action: string) => void;

  batchUpdateItems: (ids: string[], updates: Partial<Item>) => void;
  batchAddMessage: (messages: Message[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: MOCK_USERS,
      clients: MOCK_CLIENTS,
      items: MOCK_ITEMS,
      messages: MOCK_MESSAGES,

      login: (email, password) => {
        const user = get().users.find((u) => u.email === email);
        if (user) {
          if (password && user.password && user.password !== password) {
            return false;
          }
          set({ currentUser: user });
          return true;
        }
        return false;
      },
      logout: () => set({ currentUser: null }),

      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: new Date().toISOString() }
              : item
          ),
        })),
      deleteItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      markMessageRead: (id) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, read: true } : msg
          ),
        })),

      addClientBeneficiary: (clientId, name) =>
        set((state) => ({
          clients: state.clients.map((c) => {
            if (c.id === clientId) {
              const saved = c.savedBeneficiaries || [];
              if (!saved.includes(name)) {
                return { ...c, savedBeneficiaries: [...saved, name] };
              }
            }
            return c;
          }),
        })),

      addClientDonationRecipient: (clientId, name) =>
        set((state) => ({
          clients: state.clients.map((c) => {
            if (c.id === clientId) {
              const saved = c.savedDonationRecipients || [];
              if (!saved.includes(name)) {
                return { ...c, savedDonationRecipients: [...saved, name] };
              }
            }
            return c;
          }),
        })),

      addClientAction: (clientId, action) =>
        set((state) => ({
          clients: state.clients.map((c) => {
            if (c.id === clientId) {
              const saved = c.savedActions || [];
              if (!saved.includes(action)) {
                return { ...c, savedActions: [...saved, action] };
              }
            }
            return c;
          }),
        })),

      batchUpdateItems: (ids, updates) =>
        set((state) => ({
          items: state.items.map((item) =>
            ids.includes(item.id)
              ? { ...item, ...updates, updatedAt: new Date().toISOString() }
              : item
          ),
        })),

      batchAddMessage: (newMessages) =>
        set((state) => ({
          messages: [...state.messages, ...newMessages],
        })),
    }),
    {
      name: "estate-app-storage",
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users,
        clients: state.clients,
        items: state.items,
        messages: state.messages,
      }),
    }
  )
);
