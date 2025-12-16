import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@/types";

export const useUsers = (role?: string) => {
  return useQuery<User[]>({
    queryKey: ["users", role],
    queryFn: async () => {
      const query = role ? `?role=${role}` : "";
      const res = await fetch(`/api/users${query}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });
};

export const useAddUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: Partial<User>) => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!res.ok) throw new Error("Failed to add user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
