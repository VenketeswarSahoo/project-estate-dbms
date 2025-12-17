// lib/hooks/useItems.ts
import { Item } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useItems(clientId?: string) {
  return useQuery({
    queryKey: ["items", clientId],
    queryFn: async () => {
      const query = clientId ? `?clientId=${clientId}` : "";
      const res = await fetch(`/api/items${query}`);
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json();
    },
  });
}

export function useItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Item> & { id?: string }) => {
      const url = id ? `/api/items/${id}` : "/api/items";
      const method = id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Operation failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}
