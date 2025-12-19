"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useItems } from "@/lib/hooks/useItems";
import { useMessages } from "@/lib/hooks/useMessages";
import { useUsers } from "@/lib/hooks/useUsers";
import { useAppStore } from "@/store/useAppStore";
import { Item, Message, User } from "@/types";
import { ArrowRightLeft, MessageSquare, Package, Users } from "lucide-react";

export function DashboardStats() {
  const { user } = useAppStore();

  const { data: items } = useItems();
  const { data: users } = useUsers();
  const { data: messages } = useMessages();

  if (!user) return null;

  const totalClients = users.filter((u: User) => u.role === "CLIENT").length;

  const myGenericMessages = messages.filter(
    (m: Message) => m.receiverId === user.id && !m.read
  );

  let myItems = items;
  if (user.role === "EXECUTOR") {
    const myClientIds = users
      .filter((u: User) => u.executorId === user.id)
      .map((u: User) => u.id);
    myItems = items.filter((i: Item) => myClientIds.includes(i.clientId));
  } else if (user.role === "BENEFICIARY") {
    const myClientIds = users
      .filter((u: User) => u.beneficiaryIds?.includes(user.id))
      .map((u: User) => u.id);
    myItems = items.filter((i: Item) => myClientIds.includes(i.clientId));
  }

  const lowStockItems = myItems.length;
  const pendingDistributions = myItems.filter(
    (i: Item) => i.action === "DISTRIBUTE"
  ).length;
  const itemsForSale = myItems.filter((i: Item) => i.action === "SALE").length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {(user.role === "ADMIN" ||
        user.role === "AGENT" ||
        user.role === "EXECUTOR") && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user.role === "EXECUTOR" ? "My Estates" : "Total Clients"}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.role === "EXECUTOR"
                ? users.filter((u: User) => u.executorId === user.id).length
                : totalClients}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{lowStockItems}</div>
          <p className="text-xs text-muted-foreground">In managed estates</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
          <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingDistributions}</div>
          <p className="text-xs text-muted-foreground">
            Items marked for Distribution
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{myGenericMessages.length}</div>
          <p className="text-xs text-muted-foreground">Inbox</p>
        </CardContent>
      </Card>
    </div>
  );
}
