"use client";

import { ItemTable } from "@/components/tables/ItemTable";
import { useAuth } from "@/providers/auth";
import { useAppStore } from "@/store/store";

export default function ItemsPage() {
  const { items, clients, deleteItem } = useAppStore();
  const { user } = useAuth();

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
