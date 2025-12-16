import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Message } from "@/types";

// ✅ Fetch messages (with optional filters)
export const useMessages = (filters?: Record<string, any>) => {
  const queryParams = filters ? new URLSearchParams(filters).toString() : "";
  const query = queryParams ? `?${queryParams}` : "";

  return useQuery<Message[]>({
    queryKey: ["messages", filters],
    queryFn: async () => {
      const res = await fetch(`/api/messages${query}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
  });
};

// ✅ Add new message
export const useAddMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageData: Omit<Message, "id">) => {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });
      if (!res.ok) throw new Error("Failed to add message");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};
