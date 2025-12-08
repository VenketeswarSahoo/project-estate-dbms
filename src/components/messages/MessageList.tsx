"use client";

import React from "react";
import { Message, Item, Client, User } from "@/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface MessageListProps {
  items: Item[];
  messages: Message[];
}

export function MessageList({ items, messages }: MessageListProps) {
  const router = useRouter();

  // Group messages by item (thread)
  const threads = items
    .map((item) => {
      const itemMessages = messages.filter((m) => m.itemId === item.id);
      if (itemMessages.length === 0) return null;

      const lastMessage = itemMessages.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];

      return {
        item,
        lastMessage,
        count: itemMessages.length,
        hasUnread: itemMessages.some((m) => !m.read),
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      return (
        new Date(b!.lastMessage.timestamp).getTime() -
        new Date(a!.lastMessage.timestamp).getTime()
      );
    });

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col">
        {threads.map((thread) => (
          <div
            key={thread!.item.id}
            onClick={() =>
              router.push(`/dashboard/messages/${thread!.item.id}`)
            }
            className={cn(
              "flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b p-4 cursor-pointer hover:bg-muted/50 transition-colors",
              thread!.hasUnread ? "bg-muted/20" : ""
            )}
          >
            {/* Avatar / Status Indicator */}
            <div className="flex items-center gap-3 w-full sm:w-auto sm:min-w-[200px]">
              {!thread!.hasUnread ? (
                <div className="h-3 w-3 rounded-full bg-blue-500 shrink-0" />
              ) : (
                <div className="h-3 w-3 rounded-full border border-muted-foreground shrink-0" />
              )}
              <div className="flex flex-col">
                <span className="font-semibold text-sm truncate">
                  {thread!.item.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {thread!.item.uid}
                </span>
              </div>
            </div>

            {/* Message Preview */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm truncate">
                  {thread!.lastMessage.content}
                </span>
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {thread!.count} messages
              </div>
            </div>

            {/* Timestamp */}
            <div className="text-xs text-muted-foreground whitespace-nowrap min-w-[80px] text-right">
              {formatDistanceToNow(new Date(thread!.lastMessage.timestamp), {
                addSuffix: true,
              })}
            </div>
          </div>
        ))}

        {threads.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No conversations found.
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
