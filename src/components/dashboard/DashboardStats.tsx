"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Package,
  MessageSquare,
  ArrowRightLeft,
  Gift,
} from "lucide-react";
import { useAppStore } from "@/store/store";
import { useAuth } from "@/providers/auth";

export function DashboardStats() {
  const { user } = useAuth();
  const { users, items, messages } = useAppStore();

  if (!user) return null;

  // 1. Calculate Stats
  const totalClients = users.filter((u) => u.role === "CLIENT").length;

  // Filter messages
  const myGenericMessages = messages.filter(
    (m) => m.receiverId === user.id && !m.read
  );

  // Filter Items based on Role
  let myItems = items;
  if (user.role === "EXECUTOR") {
    const myClientIds = users
      .filter((u) => u.executorId === user.id)
      .map((u) => u.id);
    myItems = items.filter((i) => myClientIds.includes(i.clientId));
  } else if (user.role === "BENEFICIARY") {
    // Items distributed to this beneficiary OR items in clients they are part of?
    // Usually beneficiaries only care about what they are receiving or what is in the estate.
    // Let's show items from their Estate for visibility, but highlight their distributions.
    const myClientIds = users
      .filter((u) => u.beneficiaryIds?.includes(user.id))
      .map((u) => u.id);
    myItems = items.filter((i) => myClientIds.includes(i.clientId));
  }

  const lowStockItems = myItems.length; // Just total items for now
  const pendingDistributions = myItems.filter(
    (i) => i.action === "DISTRIBUTE"
  ).length;
  const itemsForSale = myItems.filter((i) => i.action === "SALE").length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Clients (Admin/Agent/Executor) */}
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
                ? users.filter((u) => u.executorId === user.id).length
                : totalClients}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Total Items */}
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

      {/* Distributions / Sales Stats */}
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

      {/* Unread Messages */}
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
