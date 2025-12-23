import { MarkMessagesReadParams, Notification } from "@/types/new-message";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: ["notifications", userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json() as Promise<Notification[]>;
    },
    refetchInterval: 10 * 1000,
  });
}

export function useMarkMessagesRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, update }: MarkMessagesReadParams) => {
      const res = await fetch(`/api/messages`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, update }),
      });

      if (!res.ok) {
        throw new Error("Failed to mark messages as read");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}
