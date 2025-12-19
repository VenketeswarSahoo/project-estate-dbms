import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { useAppStore } from "@/store/useAppStore";
import { CurrentUser } from "@/types";

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
}

export function useAuthQuery() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { setAuth, clearAuth } = useAppStore();
  const user = useAppStore((state) => state.user);
  const token = useAppStore((state) => state.token);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data: LoginResponse = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }

      if (!data.token) {
        throw new Error("No token received");
      }

      const decodedUser: CurrentUser = jwtDecode(data.token);
      setAuth(data.token, decodedUser);

      return decodedUser;
    },
    onSuccess: () => {
      toast.success("Welcome back!");
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid credentials");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      clearAuth();
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success("Logged out successfully");
      router.push("/");
    },
    onError: () => {
      toast.error("Logout failed");
    },
  });

  return {
    user,
    token,
    isAuthenticated: !!user,

    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,

    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
