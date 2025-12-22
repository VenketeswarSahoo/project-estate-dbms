import { User } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useUsers(role?: string) {
  return useQuery({
    queryKey: ["users", role],
    queryFn: async () => {
      const query = role ? `?role=${role}` : "";
      const res = await fetch(`/api/users${query}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });
}

export function useUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<User> & { id?: string }) => {
      const url = id ? `/api/users/${id}` : "/api/users";
      const method = id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Operation failed");
      const user = await res.json();

      if (!id && ["AGENT", "EXECUTOR", "BENEFICIARY"].includes(user.role)) {
        fetch("/api/users/send-credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            role: user.role,
            password: data.password,
          }),
        }).catch((err) => console.error("Failed to send intro email:", err));
      }

      return user;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
