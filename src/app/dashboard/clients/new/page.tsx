"use client";

import { ClientForm } from "@/components/forms/ClientForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth";
import { useAppStore } from "@/store/store";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export default function NewClientPage() {
  const { addClient, users } = useAppStore();
  const { user } = useAuth();
  const router = useRouter();

  if (!user || user.role !== "ADMIN") {
    return <div>Access Denied</div>;
  }

  const handleSubmit = (data: any) => {
    const newClient = {
      id: `client-${uuidv4()}`,
      ...data,
      createdAt: new Date().toISOString(),
      beneficiaryIds: [],
      savedBeneficiaries: [],
      savedDonationRecipients: [],
      savedActions: [],
    };
    addClient(newClient);
    toast.success("Client created successfully");
    router.push("/dashboard/clients");
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Add New Client</h2>
        </div>
        <p className="text-muted-foreground">
          Create a new client entity to manage items and beneficiaries.
        </p>
      </div>

      <div className="p-6 border rounded-lg bg-card">
        <ClientForm users={users} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
