"use client";

import { ClientForm } from "@/components/forms/ClientForm";
import { Button } from "@/components/ui/button";
import { useUserMutation, useUsers } from "@/lib/hooks/useUsers";
import { useAppStore } from "@/store/useAppStore";
import { Client } from "@/types";
import { ChevronLeft, Loader } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditClientPage() {
  const { user } = useAppStore();
  const router = useRouter();
  const params = useParams();

  const { data: users = [], isLoading: isUsersLoading } = useUsers();
  const userMutation = useUserMutation();

  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const found = users?.find(
      (c: any) => c.id === params.id && c.role === "CLIENT"
    );
    if (found) {
      setClient(found as Client);
    }
    setIsLoading(false);
  }, [params.id, users]);

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold">Access Denied</div>
      </div>
    );
  }

  const handleSubmit = async (formData: any) => {
    if (!client) return;

    await userMutation.mutateAsync(
      {
        id: client.id,
        ...formData,
        role: "CLIENT" as const,
      },
      {
        onSuccess: () => {
          toast.success("Client updated successfully");
          router.push("/dashboard/clients");
        },
        onError: () => {
          toast.error("Failed to update client");
        },
      }
    );
  };

  if (isLoading || isUsersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-lg font-semibold">Client not found</div>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/dashboard/clients")}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto lg:mt-10">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Edit Client</h2>
        </div>
        <p className="text-muted-foreground">Update client details.</p>
      </div>

      <div className="p-6 border rounded-lg bg-card">
        <ClientForm
          initialData={client}
          users={users}
          onSubmit={handleSubmit}
          loading={userMutation.isPending}
        />
      </div>
    </div>
  );
}
