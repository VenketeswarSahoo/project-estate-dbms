import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Item } from "@/types";

// ✅ Fetch items (optionally by clientId)
export const useItems = (clientId?: string) => {
  return useQuery<Item[]>({
    queryKey: ["items", clientId],
    queryFn: async () => {
      const query = clientId ? `?clientId=${clientId}` : "";
      const res = await fetch(`/api/items${query}`);
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json();
    },
  });
};

// ✅ Add new item
export const useAddItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      itemData: Omit<Item, "id" | "createdAt" | "updatedAt">
    ) => {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });
      if (!res.ok) throw new Error("Failed to add item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
};

// ✅ Update item
export const useUpdateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Item>;
    }) => {
      const res = await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
};

// ✅ Delete item
export const useDeleteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete item");
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
};
