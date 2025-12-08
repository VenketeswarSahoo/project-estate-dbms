"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/store";
import { useAuth } from "@/providers/auth";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

export function RecentMessagesList() {
  const { user } = useAuth();
  const { messages, items, users } = useAppStore();
  const router = useRouter();

  if (!user) return null;

  // Filter messages for current user
  const myMessages = messages.filter(
    (m) => m.senderId === user.id || m.receiverId === user.id
  );

  // Group by Item to get threads
  const threads = items
    .map((item) => {
      const itemMessages = myMessages.filter((m) => m.itemId === item.id);
      if (itemMessages.length === 0) return null;

      // Sort to find latest
      const latest = itemMessages.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];

      return {
        item,
        latestMessage: latest,
        otherUser:
          latest.senderId === user.id ? latest.receiverId : latest.senderId,
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        new Date(b!.latestMessage.timestamp).getTime() -
        new Date(a!.latestMessage.timestamp).getTime()
    )
    .slice(0, 5);

  const getUserName = (id: string) =>
    users.find((u) => u.id === id)?.name || "Unknown";

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Messages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {threads.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent messages.</p>
          ) : (
            threads.map((thread) => (
              <div
                key={thread!.item.id}
                className="flex flex-col gap-1 border-b last:border-0 pb-4 last:pb-0 cursor-pointer hover:bg-muted/10 rounded px-1 -mx-1"
                onClick={() =>
                  router.push(`/dashboard/messages/${thread!.item.id}`)
                }
              >
                <div className="flex justify-between items-start">
                  <div className="font-medium text-sm">{thread!.item.name}</div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(
                      new Date(thread!.latestMessage.timestamp)
                    )}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground line-clamp-1">
                  <span className="font-semibold text-foreground/80">
                    {getUserName(thread!.latestMessage.senderId)}:{" "}
                  </span>
                  {thread!.latestMessage.content}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
