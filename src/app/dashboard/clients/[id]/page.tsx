"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store/store";
import { useAuth } from "@/providers/auth";
import { ClientForm } from "@/components/clients/ClientForm";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Client } from "@/types";

export default function EditClientPage() {
  const { clients, updateClient, users } = useAppStore();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    const found = clients.find((c) => c.id === params.id);
    if (found) {
      setClient(found);
    }
  }, [params.id, clients]);

  if (!user || user.role !== "ADMIN") {
    return <div>Access Denied</div>;
  }

  if (!client) return <div>Loading...</div>;

  const handleSubmit = (data: any) => {
    updateClient(client.id, data);
    toast.success("Client updated successfully");
    router.push("/dashboard/clients");
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Button>

          <h2 className="text-3xl font-bold tracking-tight">Edit Client</h2>
        </div>
        <p className="text-muted-foreground">Update client details.</p>
      </div>

      <div className="p-6 border rounded-lg bg-card">
        <ClientForm
          initialData={client}
          users={users}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
