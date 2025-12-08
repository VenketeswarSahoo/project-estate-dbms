"use client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  Users,
  Package,
  MessageSquare,
  ArrowRightLeft,
  Gift,
} from "lucide-react";
import { useAppStore } from "@/store/store";
import { useAuth } from "@/providers/auth";

export function SectionCards() {
  const { user } = useAuth();
  const { clients, items, messages } = useAppStore();

  if (!user) return null;

  // 1. Calculate Stats
  const totalClients = clients.length;

  // Filter messages
  const myGenericMessages = messages.filter(
    (m) => m.receiverId === user.id && !m.read
  );

  // Filter Items based on Role
  let myItems = items;
  if (user.role === "EXECUTOR") {
    const myClientIds = clients
      .filter((c) => c.executorId === user.id)
      .map((c) => c.id);
    myItems = items.filter((i) => myClientIds.includes(i.clientId));
  } else if (user.role === "BENEFICIARY") {
    // Items distributed to this beneficiary OR items in clients they are part of?
    // Usually beneficiaries only care about what they are receiving or what is in the estate.
    // Let's show items from their Estate for visibility, but highlight their distributions.
    const myClientIds = clients
      .filter((c) => c.beneficiaryIds.includes(user.id))
      .map((c) => c.id);
    myItems = items.filter((i) => myClientIds.includes(i.clientId));
  }

  const lowStockItems = myItems.length; // Just total items for now
  const pendingDistributions = myItems.filter(
    (i) => i.action === "DISTRIBUTE"
  ).length;
  const itemsForSale = myItems.filter((i) => i.action === "SALE").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {(user.role === "ADMIN" ||
        user.role === "AGENT" ||
        user.role === "EXECUTOR") && (
        <Card>
          <CardHeader>
            <CardDescription>
              {user.role === "EXECUTOR" ? "My Estates" : "Total Clients"}
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {user.role === "EXECUTOR"
                ? clients.filter((c) => c.executorId === user.id).length
                : totalClients}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <TrendingUp />
                +12.5%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Trending up this month <TrendingDown className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Visitors for the last 6 months
            </div>
          </CardFooter>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardDescription>Total Items</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {lowStockItems}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingDown />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Down 20% this period <TrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Acquisition needs attention
          </div>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Pending Actions</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {pendingDistributions}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong user retention <TrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">Engagement exceed targets</div>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Unread Messages</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {myGenericMessages.length}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              {myGenericMessages.length > 0 ? "+4.5%" : "No Messages"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Steady performance increase <TrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">Meets growth projections</div>
        </CardFooter>
      </Card>
    </div>
  );
}
