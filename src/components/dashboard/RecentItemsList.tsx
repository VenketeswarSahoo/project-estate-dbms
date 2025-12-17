"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useItems } from "@/lib/hooks/useItems";
import { useUsers } from "@/lib/hooks/useUsers";
import { useAuth } from "@/providers/auth";
import { Item, User } from "@/types";
import { formatDistanceToNow } from "date-fns";

export function RecentItemsList() {
  const { user } = useAuth();

  const { data: items = [], isLoading: isItemsLoading } = useItems();
  const { data: users = [], isLoading: isUsersLoading } = useUsers();

  if (!user) return null;

  // Filter Items based on Role (Same logic as stats)
  let myItems = items;
  if (user.role === "EXECUTOR") {
    const myUserIds = users
      .filter((c: User) => c.executorId === user.id)
      .map((c: User) => c.id);
    myItems = items.filter((i: Item) => myUserIds.includes(i.clientId));
  } else if (user.role === "BENEFICIARY") {
    const myUserIds = users
      .filter((c: User) => c.beneficiaryIds?.includes(user.id))
      .map((c: User) => c.id);
    myItems = items.filter((i: Item) => myUserIds.includes(i.clientId));
  }

  const recentItems = [...myItems]
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recent items found.
            </p>
          ) : (
            recentItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
              >
                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.uid}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className="text-[10px] h-5">
                    {item.action || "Active"}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(
                      new Date(item.updatedAt || item.createdAt),
                      { addSuffix: true }
                    )}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
