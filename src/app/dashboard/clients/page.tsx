"use client";

import { ClientTable } from "@/components/tables/ClientTable";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth";
import { useAppStore } from "@/store/store";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ClientsPage() {
  const { clients, users, deleteClient } = useAppStore();
  const { user } = useAuth();
  const router = useRouter();

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Access Denied. Only Admins can manage clients.
      </div>
    );
  }

  const handleDelete = (id: string) => {
    deleteClient(id);
    toast.success("Client deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
        <Button onClick={() => router.push("/dashboard/clients/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      <ClientTable clients={clients} users={users} onDelete={handleDelete} />
    </div>
  );
}
