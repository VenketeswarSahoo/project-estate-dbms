// lib/hooks/useMessages.ts
import { Message } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useMessages(filters?: {
  senderId?: string;
  recipientId?: string;
  itemId?: string;
  clientId?: string;
}) {
  return useQuery({
    queryKey: ["messages", filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters?.senderId) queryParams.append("senderId", filters.senderId);
      if (filters?.recipientId)
        queryParams.append("recipientId", filters.recipientId);
      if (filters?.itemId) queryParams.append("itemId", filters.itemId);
      if (filters?.clientId) queryParams.append("clientId", filters.clientId);

      const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const res = await fetch(`/api/messages${query}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    refetchInterval: 10 * 1000,
  });
}

export function useMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Message> & { id?: string }) => {
      const url = id ? `/api/messages/${id}` : "/api/messages";
      const method = id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Operation failed");
      const message = await res.json();

      /* Notification logic moved to backend */

      return message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useBatchUpdateMessages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ids,
      updates,
    }: {
      ids: string[];
      updates: Partial<Message>;
    }) => {
      // You might need to implement a batch update endpoint
      // For now, we'll update one by one
      const promises = ids.map((id) =>
        fetch(`/api/messages/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        })
      );

      const results = await Promise.all(promises);
      const failed = results.some((res) => !res.ok);
      if (failed) throw new Error("Batch update failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useMessageConversation(
  senderId?: string,
  recipientId?: string,
  itemId?: string
) {
  return useQuery({
    queryKey: ["messages", "conversation", senderId, recipientId, itemId],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (senderId) queryParams.append("senderId", senderId);
      if (recipientId) queryParams.append("recipientId", recipientId);
      if (itemId) queryParams.append("itemId", itemId);

      const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const res = await fetch(`/api/messages/conversation${query}`);
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return res.json();
    },
    // Refetch messages every 5 seconds for real-time updates
    refetchInterval: 5000,
  });
}
