"use client";

import { ItemTable } from "@/components/tables/ItemTable";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth";
import { useAppStore } from "@/store/store";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ItemsPage() {
  const { items, clients, deleteItem } = useAppStore();
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const canEdit = user.role === "ADMIN" || user.role === "AGENT";

  let visibleItems = items;
  let visibleClients = clients;

  if (user.role === "EXECUTOR") {
    const myClient = clients.find((c) => c.executorId === user.id);
    if (myClient) {
      visibleClients = [myClient];
      visibleItems = items.filter((i) => i.clientId === myClient.id);
    } else {
      visibleClients = [];
      visibleItems = [];
    }
  } else if (user.role === "BENEFICIARY") {
    const myClient = clients.find((c) => c.beneficiaryIds.includes(user.id));
    if (myClient) {
      visibleClients = [myClient];
      visibleItems = items.filter((i) => i.clientId === myClient.id);
    } else {
      visibleClients = [];
      visibleItems = [];
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Estate Items</h2>
        {canEdit && (
          <div className="lg:hidden block">
            <Button
              className="flex items-center gap-2"
              onClick={() => router.push("/dashboard/items/new")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        )}
      </div>
      <ItemTable
        items={visibleItems}
        clients={visibleClients}
        onDelete={deleteItem}
        canEdit={canEdit}
      />
    </div>
  );
}
