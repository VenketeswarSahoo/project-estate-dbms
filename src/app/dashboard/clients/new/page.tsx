"use client";

import { ClientForm } from "@/components/forms/ClientForm";
import { Button } from "@/components/ui/button";
import { useUserMutation, useUsers } from "@/lib/hooks/useUsers";
import { useAppStore } from "@/store/useAppStore";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewClientPage() {
  const { user } = useAppStore();
  const router = useRouter();

  const { data: users = [], isLoading: isUsersLoading } = useUsers();
  const userMutation = useUserMutation();

  if (!user || user.role !== "ADMIN") {
    return <div>Access Denied</div>;
  }

  const handleSubmit = async (formData: any) => {
    await userMutation.mutateAsync(
      {
        ...formData,
        role: "CLIENT" as const,
      },
      {
        onSuccess: () => {
          toast.success("Client created successfully");
          router.push("/dashboard/clients");
        },
        onError: () => {
          toast.error("Failed to create client");
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto lg:mt-10">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Add New Client</h2>
        </div>
        <p className="text-muted-foreground">
          Create a new client entity to manage items and beneficiaries.
        </p>
      </div>

      <div className="p-6 border rounded-lg bg-card">
        <ClientForm
          users={users}
          onSubmit={handleSubmit}
          loading={userMutation.isPending}
        />
      </div>
    </div>
  );
}
